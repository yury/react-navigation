import React, { Component } from 'react';

import clamp from 'clamp';
import { Animated, StyleSheet, PanResponder, Platform, View, I18nManager } from 'react-native';

import Card from './Card';
import Header from './Header';
import NavigationActions from '../NavigationActions';
import addNavigationHelpers from '../addNavigationHelpers';
import SceneView from './SceneView';

var babelPluginFlowReactPropTypes_proptype_TransitionConfig = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_TransitionConfig || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_Style = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_Style || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_HeaderMode = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_HeaderMode || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationStackScreenOptions = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationStackScreenOptions || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationScreenDetails = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationScreenDetails || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationState = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationState || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationRouter = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationRouter || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationScene = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationScene || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationScreenProp = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationScreenProp || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationLayout = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationLayout || require('react').PropTypes.any;

var babelPluginFlowReactPropTypes_proptype_NavigationAction = require('../TypeDefinition').babelPluginFlowReactPropTypes_proptype_NavigationAction || require('react').PropTypes.any;

import TransitionConfigs from './TransitionConfigs';

const emptyFunction = () => {};

/**
 * The duration of the card animation in milliseconds.
 */
const ANIMATION_DURATION = 200;

/**
 * The gesture distance threshold to trigger the back behavior. For instance,
 * `1 / 3` means that moving greater than 1 / 3 of the width of the screen will
 * trigger a back action
 */
const POSITION_THRESHOLD = 1 / 3;

/**
 * The threshold (in pixels) to start the gesture action.
 */
const RESPOND_THRESHOLD = 12;

/**
 * The distance of touch start from the edge of the screen where the gesture will be recognized
 */
const GESTURE_RESPONSE_DISTANCE_HORIZONTAL = 35;
const GESTURE_RESPONSE_DISTANCE_VERTICAL = 135;

const animatedSubscribeValue = animatedValue => {
  if (!animatedValue.__isNative) {
    return;
  }
  if (Object.keys(animatedValue._listeners).length === 0) {
    animatedValue.addListener(emptyFunction);
  }
};

/**
 * The ratio between the gesture velocity and the animation velocity. This allows
 * the velocity of a swipe release to carry on into the new animation.
 *
 * TODO: Understand and compute this ratio rather than using an approximation
 */
const GESTURE_ANIMATED_VELOCITY_RATIO = -4;

class CardStack extends Component {
  /**
   * Used to identify the starting point of the position when the gesture starts, such that it can
   * be updated according to its relative position. This means that a card can effectively be
   * "caught"- If a gesture starts while a card is animating, the card does not jump into a
   * corresponding location for the touch.
   */
  _gestureStartValue = 0;

  // tracks if a touch is currently happening
  _isResponding = false;

  /**
   * immediateIndex is used to represent the expected index that we will be on after a
   * transition. To achieve a smooth animation when swiping back, the action to go back
   * doesn't actually fire until the transition completes. The immediateIndex is used during
   * the transition so that gestures can be handled correctly. This is a work-around for
   * cases when the user quickly swipes back several times.
   */
  _immediateIndex = null;

  _screenDetails = {};

  componentWillReceiveProps(props) {
    if (props.screenProps !== this.props.screenProps) {
      this._screenDetails = {};
    }
    props.scenes.forEach(newScene => {
      if (this._screenDetails[newScene.key] && this._screenDetails[newScene.key].state !== newScene.route) {
        this._screenDetails[newScene.key] = null;
      }
    });
  }

  _getScreenDetails = scene => {
    const { screenProps, navigation, router } = this.props;
    let screenDetails = this._screenDetails[scene.key];
    if (!screenDetails || screenDetails.state !== scene.route) {
      const screenNavigation = addNavigationHelpers({
        ...navigation,
        state: scene.route
      });
      screenDetails = {
        state: scene.route,
        navigation: screenNavigation,
        options: router.getScreenOptions(screenNavigation, screenProps)
      };
      this._screenDetails[scene.key] = screenDetails;
    }
    return screenDetails;
  };

  _renderHeader(scene, headerMode) {
    const { header } = this._getScreenDetails(scene).options;

    if (typeof header !== 'undefined' && typeof header !== 'function') {
      return header;
    }

    const renderHeader = header || (props => <Header {...props} />);

    // We need to explicitly exclude `mode` since Flow doesn't see
    // mode: headerMode override below and reports prop mismatch
    const { mode, ...passProps } = this.props;

    return renderHeader({
      ...passProps,
      scene,
      mode: headerMode,
      getScreenDetails: this._getScreenDetails
    });
  }

  // eslint-disable-next-line class-methods-use-this
  _animatedSubscribe(props) {
    // Hack to make this work with native driven animations. We add a single listener
    // so the JS value of the following animated values gets updated. We rely on
    // some Animated private APIs and not doing so would require using a bunch of
    // value listeners but we'd have to remove them to not leak and I'm not sure
    // when we'd do that with the current structure we have. `stopAnimation` callback
    // is also broken with native animated values that have no listeners so if we
    // want to remove this we have to fix this too.
    animatedSubscribeValue(props.layout.width);
    animatedSubscribeValue(props.layout.height);
    animatedSubscribeValue(props.position);
  }

  _reset(resetToIndex, velocity) {
    Animated.spring(this.props.position, {
      toValue: resetToIndex,
      duration: ANIMATION_DURATION,
      useNativeDriver: this.props.position.__isNative,
      velocity: velocity * GESTURE_ANIMATED_VELOCITY_RATIO,
      bounciness: 0
    }).start();
  }

  _goBack(backFromIndex, velocity) {
    const { navigation, position, scenes } = this.props;
    const toValue = Math.max(backFromIndex - 1, 0);

    // set temporary index for gesture handler to respect until the action is
    // dispatched at the end of the transition.
    this._immediateIndex = toValue;

    Animated.spring(position, {
      toValue,
      duration: ANIMATION_DURATION,
      useNativeDriver: position.__isNative,
      velocity: velocity * GESTURE_ANIMATED_VELOCITY_RATIO,
      bounciness: 0
    }).start(() => {
      this._immediateIndex = null;
      const backFromScene = scenes.find(s => s.index === toValue + 1);
      if (!this._isResponding && backFromScene) {
        navigation.dispatch(NavigationActions.back({ key: backFromScene.route.key }));
      }
    });
  }

  render() {
    let floatingHeader = null;
    const headerMode = this._getHeaderMode();
    if (headerMode === 'float') {
      floatingHeader = this._renderHeader(this.props.scene, headerMode);
    }
    const { navigation, position, scene, mode, scenes } = this.props;
    const { index } = navigation.state;
    const responder = PanResponder.create({
      onPanResponderTerminate: () => {
        this._isResponding = false;
        this._reset(index, 0);
      },
      onPanResponderGrant: () => {
        position.stopAnimation(value => {
          this._isResponding = true;
          this._gestureStartValue = value;
        });
      },
      onMoveShouldSetPanResponder: (event, gesture) => {
        const layout = this.props.layout;
        if (index !== scene.index) {
          return false;
        }
        const isVertical = mode === 'modal';
        const immediateIndex = this._immediateIndex == null ? index : this._immediateIndex;
        const currentDragDistance = gesture[isVertical ? 'dy' : 'dx'];
        const currentDragPosition = event.nativeEvent[isVertical ? 'pageY' : 'pageX'];
        const axisLength = isVertical ? layout.height.__getValue() : layout.width.__getValue();
        const axisHasBeenMeasured = !!axisLength;

        // Measure the distance from the touch to the edge of the screen
        const screenEdgeDistance = currentDragPosition - currentDragDistance;
        // Compare to the gesture distance relavant to card or modal
        const gestureResponseDistance = isVertical ? GESTURE_RESPONSE_DISTANCE_VERTICAL : GESTURE_RESPONSE_DISTANCE_HORIZONTAL;
        // GESTURE_RESPONSE_DISTANCE is about 30 or 35. Or 135 for modals
        if (screenEdgeDistance > gestureResponseDistance) {
          // Reject touches that started in the middle of the screen
          return false;
        }

        const hasDraggedEnough = Math.abs(currentDragDistance) > RESPOND_THRESHOLD;

        const isOnFirstCard = immediateIndex === 0;
        const shouldSetResponder = hasDraggedEnough && axisHasBeenMeasured && !isOnFirstCard;
        return shouldSetResponder;
      },
      onPanResponderMove: (event, gesture) => {
        // Handle the moving touches for our granted responder
        const layout = this.props.layout;
        const isVertical = mode === 'modal';
        const startValue = this._gestureStartValue;
        const axis = isVertical ? 'dy' : 'dx';
        const distance = isVertical ? layout.height.__getValue() : layout.width.__getValue();
        const currentValue = I18nManager.isRTL && axis === 'dx' ? startValue + gesture[axis] / distance : startValue - gesture[axis] / distance;
        const value = clamp(index - 1, currentValue, index);
        position.setValue(value);
      },
      onPanResponderTerminationRequest: () =>
      // Returning false will prevent other views from becoming responder while
      // the navigation view is the responder (mid-gesture)
      false,
      onPanResponderRelease: (event, gesture) => {
        if (!this._isResponding) {
          return;
        }
        this._isResponding = false;
        const isVertical = mode === 'modal';
        const velocity = gesture[isVertical ? 'vy' : 'vx'];
        const immediateIndex = this._immediateIndex == null ? index : this._immediateIndex;

        // To asyncronously get the current animated value, we need to run stopAnimation:
        position.stopAnimation(value => {
          // If the speed of the gesture release is significant, use that as the indication
          // of intent
          if (velocity < -0.5) {
            this._reset(immediateIndex, velocity);
            return;
          }
          if (velocity > 0.5) {
            this._goBack(immediateIndex, velocity);
            return;
          }

          // Then filter based on the distance the screen was moved. Over a third of the way swiped,
          // and the back will happen.
          if (value <= index - POSITION_THRESHOLD) {
            this._goBack(immediateIndex, velocity);
          } else {
            this._reset(immediateIndex, velocity);
          }
        });
      }
    });

    const { options } = this._getScreenDetails(scene);
    const gesturesEnabled = typeof options.gesturesEnabled === 'boolean' ? options.gesturesEnabled : Platform.OS === 'ios';

    const handlers = gesturesEnabled ? responder.panHandlers : {};

    return <View {...handlers} style={styles.container}>
        <View style={styles.scenes}>
          {scenes.map(s => this._renderCard(s))}
        </View>
        {floatingHeader}
      </View>;
  }

  _getHeaderMode() {
    if (this.props.headerMode) {
      return this.props.headerMode;
    }
    if (Platform.OS === 'android' || this.props.mode === 'modal') {
      return 'screen';
    }
    return 'float';
  }

  _renderInnerScene(SceneComponent, scene) {
    const { navigation } = this._getScreenDetails(scene);
    const { screenProps } = this.props;
    const headerMode = this._getHeaderMode();
    if (headerMode === 'screen') {
      return <View style={styles.container}>
          <View style={{ flex: 1 }}>
            <SceneView screenProps={screenProps} navigation={navigation} component={SceneComponent} />
          </View>
          {this._renderHeader(scene, headerMode)}
        </View>;
    }
    return <SceneView screenProps={this.props.screenProps} navigation={navigation} component={SceneComponent} />;
  }

  _renderCard = scene => {
    const isModal = this.props.mode === 'modal';

    /* $FlowFixMe */
    const { screenInterpolator } = TransitionConfigs.getTransitionConfig(this.props.transitionConfig, {}, {}, isModal);
    const style = screenInterpolator && screenInterpolator({ ...this.props, scene });

    const SceneComponent = this.props.router.getComponentForRouteName(scene.route.routeName);

    return <Card {...this.props} key={`card_${scene.key}`} style={[style, this.props.cardStyle]} scene={scene}>
        {this._renderInnerScene(SceneComponent, scene)}
      </Card>;
  };
}

CardStack.propTypes = {
  screenProps: require('prop-types').shape({}),
  headerMode: babelPluginFlowReactPropTypes_proptype_HeaderMode,
  headerComponent: require('prop-types').any,
  mode: require('prop-types').oneOf(['card', 'modal']).isRequired,
  navigation: babelPluginFlowReactPropTypes_proptype_NavigationScreenProp,
  router: babelPluginFlowReactPropTypes_proptype_NavigationRouter,
  cardStyle: babelPluginFlowReactPropTypes_proptype_Style,
  onTransitionStart: require('prop-types').func,
  onTransitionEnd: require('prop-types').func,
  style: require('prop-types').any,
  transitionConfig: require('prop-types').func,
  layout: babelPluginFlowReactPropTypes_proptype_NavigationLayout,
  navigation: babelPluginFlowReactPropTypes_proptype_NavigationScreenProp,
  position: require('prop-types').any.isRequired,
  progress: require('prop-types').any.isRequired,
  scenes: require('prop-types').arrayOf(babelPluginFlowReactPropTypes_proptype_NavigationScene).isRequired,
  scene: babelPluginFlowReactPropTypes_proptype_NavigationScene,
  index: require('prop-types').number.isRequired
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Header is physically rendered after scenes so that Header won't be
    // covered by the shadows of the scenes.
    // That said, we'd have use `flexDirection: 'column-reverse'` to move
    // Header above the scenes.
    flexDirection: 'column-reverse'
  },
  scenes: {
    flex: 1
  }
});

export default CardStack;