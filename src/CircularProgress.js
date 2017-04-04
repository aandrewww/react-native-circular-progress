import React, { PropTypes } from 'react';
import { View, Text, Platform } from 'react-native';
import { Surface, Shape, Path, Group, Circle } from '../../react-native/Libraries/ART/ReactNativeART';
import MetricsPath from 'art/metrics/path';

export default class CircularProgress extends React.Component {

  circlePath(cx, cy, r, startDegree, endDegree) {

    let p = Path();
    if (Platform.OS === 'ios') {
      p.path.push(0, cx + r, cy);
      p.path.push(4, cx, cy, r, startDegree * Math.PI / 180, endDegree * Math.PI / 180, 1);
    } else {
      // For Android we have to resort to drawing low-level Path primitives, as ART does not support 
      // arbitrary circle segments. It also does not support strokeDash.
      // Furthermore, the ART implementation seems to be buggy/different than the iOS one.
      // MoveTo is not needed on Android 
      p.path.push(4, cx, cy, r, startDegree * Math.PI / 180, (startDegree - endDegree) * Math.PI / 180, 0);
    }
    return p;
  }

  circleFillPath(cx, cy, r, outsideRadis, angle) {
    let p = Path();

    const { x, y } = this.calcXYPosition(cx, cy, r, outsideRadis, angle);

    p.path.push(0, x + r, y);
    p.path.push(4, x, y, r, 0, 360 * Math.PI / 180, 1);

    return p;
  }

  calcXYPosition(cx, cy, r, outsideRadis, angle) {
    const x = cx + outsideRadis * Math.cos(angle * Math.PI / 180);
    const y = cy + outsideRadis * Math.sin(angle * Math.PI / 180);

    return {x, y};
  }

  extractFill(fill) {
    if (fill < 0.01) {
      return 0;
    } else if (fill > 100) {
      return 100;
    }

    return fill;
  }

  render() {
    const { size, width, tintColor, backgroundColor, style, rotation, linecap, children, withSmallCircle, smallCircleTextStyle } = this.props;

    const backgroundPath = this.circlePath(size / 2, size / 2, size / 2 - width / 2, 0, 360);

    const fill = this.extractFill(this.props.fill);
    const circlePath = this.circlePath(size / 2, size / 2, size / 2 - width / 2, 0, 360 * fill / 100);

    const scpWidth = 50;
    const smallCirclePath = this.circleFillPath((size / 2) - (scpWidth/4), (size / 2) - (scpWidth/4) , scpWidth / 2, size / 2 - width / 2, (360 * fill / 100) - rotation - 90);

    const { x, y } = this.calcXYPosition((size / 2) - (scpWidth/4), (size / 2) - (scpWidth/4) , scpWidth / 2, size / 2 - width / 2, (360 * fill / 100) - rotation - 90);

    return (
      <View style={style}>
        <Surface
          width={size+(scpWidth/2)+width}
          height={size+(scpWidth/2)+width}>

          <Group rotation={rotation-90} x={scpWidth/4+(width/2)} y={scpWidth/4+(width/2)} originX={size/2} originY={size/2}>
            <Shape d={backgroundPath}
                   stroke={backgroundColor}
                   opacity={0.1}
                   strokeWidth={width}/>
            <Shape d={circlePath}
                   stroke={tintColor}
                   strokeWidth={width}
                   strokeCap={linecap}/>
          </Group>
          {
            withSmallCircle && (
              <Shape fill={backgroundColor} d={smallCirclePath} x={scpWidth/2+(width/2)} y ={scpWidth/2+(width/2)} />
            )
          }
        </Surface>
        {
          children && children(fill)
        }
        {
          withSmallCircle && (
            <View style={{flexDirection: 'row', backgroundColor: 'transparent', position: 'absolute', top: y + (width/2), left: x + (width/2), width: scpWidth, height: scpWidth, textAlign: 'center', alignItems: 'center', justifyContent: 'center'}}>
              <Text style={[{color: tintColor, fontSize: 16}, smallCircleTextStyle]}>{Math.round(fill)}</Text>
              <Text style={{color: tintColor, fontSize: 10, marginTop: -3, marginLeft: 1}}>%</Text>
            </View>
          )
        }
      </View>
    )
  }
}

CircularProgress.propTypes = {
  style: View.propTypes.style,
  size: PropTypes.number.isRequired,
  fill: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  tintColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  rotation: PropTypes.number,
  linecap: PropTypes.string,
  children: PropTypes.func,
  withSmallCircle: PropTypes.bool,
  smallCircleTextStyle: View.propTypes.style
}

CircularProgress.defaultProps = {
  tintColor: '#0be2a5',
  backgroundColor: '#3d3d3d',
  rotation: 0,
  linecap: 'butt',
  withSmallCircle: false,
  smallCircleTextStyle: {}
}
