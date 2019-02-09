import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
  PanResponder,
  Animated,
  Alert,
  Text,
} from 'react-native';
import { GestureHandler, ImageManipulator, Svg } from 'expo';
import { Header as RNHeader } from 'react-navigation';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const CROP_CONSTS = (() => {
  const circleWidth = 250;
  const circleHeight = 250;
  return {
    circle: {
      CROP_TYPE: 'circle',
      CROP_SIZE_W: circleWidth,
      CROP_SIZE_H: circleHeight,
      CROP_TOP:
        (screenHeight - RNHeader.HEIGHT) / 2 -
        circleHeight / 2 -
        RNHeader.HEIGHT,
      CROP_LEFT: screenWidth / 2 - circleWidth / 2,
    },
  };
})();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.1)',
  },
  save: {
    marginRight: 30,
  },
  cropAreaForDebug: {
    position: 'absolute',
    backgroundColor: 'rgba(1,0,0,0.9)',
  },
  svg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: screenWidth,
    height: screenHeight,
  },
});

const HeaderButton = ({ onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ marginRight: 30 }}>
    <Text style={{ color: '#0070ff', fontSize: 18 }}>Crop</Text>
  </TouchableOpacity>
);

export default class CroppingScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    headerTitle: navigation.state.params.titleText,
    headerRight: (
      <HeaderButton onPress={navigation.state.params.onPressHeaderRight} />
    ),
  });

  onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: this.pinchScale } }],
    { useNativeDriver: true },
  );

  cropArea = null;

  baseScale = new Animated.Value(1);

  pinchScale = new Animated.Value(1);

  panResponder = null;

  scale = Animated.multiply(this.baseScale, this.pinchScale);

  lastScale = 1;

  startScale = 1;

  state = {
    image: null,
    dtp: 1.0,
    displayWidth: 0,
    displayHeight: 0,
    imageLeft: 0,
    imageTop: 0,
    dragStartX: 0,
    dragStartY: 0,
  };

  constructor(props) {
    super(props);
    this.cropArea = CROP_CONSTS.circle;
    this.props.navigation.setParams({
      onPressHeaderRight: () => {
        this.onSubmit();
      },
    });
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: evt => {
        return evt.nativeEvent.touches.length === 1;
      },
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: evt => {
        return evt.nativeEvent.touches.length === 1;
      },
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderGrant: () => {
        const { imageLeft, imageTop } = this.state;
        this.setState({
          dragStartX: imageLeft,
          dragStartY: imageTop,
        });
        return true;
      },
      onPanResponderMove: (_, gestureState) => {
        const { dragStartX, dragStartY } = this.state;
        this.setState({
          imageLeft: dragStartX + gestureState.dx,
          imageTop: dragStartY + gestureState.dy,
        });
        this.calcCropArea();
        return true;
      },
      onPanResponderTerminationRequest: () => true,
      onShouldBlockNativeResponder: () => false,
    });
  }

  componentDidMount() {
    const { image } = this.props.navigation.state.params;
    const dtp = image.width / screenWidth;
    this.setState({
      image,
      dtp,
      displayWidth: screenWidth,
      displayHeight: image.height / dtp,
      imageLeft: 0,
      imageTop:
        (screenHeight - RNHeader.HEIGHT) / 2 -
        image.height / dtp / 2 -
        RNHeader.HEIGHT,
    });
  }

  async onSubmit() {
    const { image } = this.state;
    const { x, y, toX, toY } = this.calcCropArea();
    if (x < 0 || y < 0 || image.width < toX || image.height < toY) {
      Alert.alert('The image must be in the frame !');
      return;
    }
    const croppedImage = await ImageManipulator.manipulateAsync(
      image.uri,
      [
        {
          crop: {
            originX: x,
            originY: y,
            width: toX - x,
            height: toY - y,
          },
        },
      ],
      { format: 'jpg', compress: 0.8 },
    );
    this.props.navigation.push('Result', {
      croppedImage,
    });
  }

  calcCropArea() {
    const {
      imageLeft,
      imageTop,
      dtp,
      displayWidth,
      displayHeight,
    } = this.state;
    const { CROP_SIZE_W, CROP_SIZE_H, CROP_TOP, CROP_LEFT } = this.cropArea;
    const scale = this.lastScale;
    const xTransformed = scale * displayWidth - displayWidth;
    const xAfterScale = (imageLeft - xTransformed / 2 - CROP_LEFT) * -1 * dtp;
    const x = xAfterScale / scale;
    const yTransformed = scale * displayHeight - displayHeight;
    const yAfterScale = (imageTop - yTransformed / 2 - CROP_TOP) * -1 * dtp;
    const y = yAfterScale / scale;
    const toX = x + (CROP_SIZE_W * dtp) / scale;
    const toY = y + (CROP_SIZE_H * dtp) / scale;
    return {
      x,
      y,
      toX,
      toY,
    };
  }

  render() {
    const {
      image,
      displayWidth,
      displayHeight,
      imageLeft,
      imageTop,
    } = this.state;
    const {
      CROP_TYPE,
      CROP_SIZE_W,
      CROP_SIZE_H,
      CROP_TOP,
      CROP_LEFT,
    } = this.cropArea;
    if (image == null) {
      return <View />;
    }
    return (
      <GestureHandler.PinchGestureHandler
        onGestureEvent={event => {
          this.lastScale = this.startScale * event.nativeEvent.scale;
          this.baseScale.setValue(this.lastScale);
          this.pinchScale.setValue(1);
        }}
        onHandlerStateChange={event => {
          if (event.nativeEvent.oldState === GestureHandler.State.BEGAN) {
            this.startScale = this.lastScale;
          }
          return true;
        }}
      >
        <View style={styles.container} {...this.panResponder.panHandlers}>
          <View>
            <Animated.Image
              source={{ uri: image.uri }}
              style={[
                styles.image,
                {
                  width: displayWidth,
                  height: displayHeight,
                  left: imageLeft,
                  top: imageTop,
                  transform: [{ scale: this.scale }],
                },
              ]}
            />
          </View>
          {CROP_TYPE === 'circle' && (
            <Svg height={screenHeight} width={screenWidth} style={styles.svg}>
              <Svg.Path
                d={`M0,0 H${screenWidth} V${screenHeight} H0z M${CROP_LEFT},${CROP_TOP +
                  CROP_SIZE_H / 2} A${CROP_SIZE_W / 2},${CROP_SIZE_H /
                  2} 0 0 0 ${CROP_LEFT + CROP_SIZE_W},${CROP_TOP +
                  CROP_SIZE_H / 2} M${CROP_LEFT + CROP_SIZE_W},${CROP_TOP +
                  CROP_SIZE_H / 2} A${CROP_SIZE_W / 2},${CROP_SIZE_H /
                  2} 0 0 0 ${CROP_LEFT},${CROP_TOP + CROP_SIZE_H / 2}`}
                fill="rgba(0,0,0,0.8)"
              />
            </Svg>
          )}
        </View>
      </GestureHandler.PinchGestureHandler>
    );
  }
}
