'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _extends=Object.assign||function(target){for(var i=1;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(Object.prototype.hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;};var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};}();

var _react=require('react');var _react2=_interopRequireDefault(_react);
var _reactNative=require('react-native');

var _Transitioner=require('./Transitioner');var _Transitioner2=_interopRequireDefault(_Transitioner);
var _Card=require('./Card');var _Card2=_interopRequireDefault(_Card);
var _CardStackStyleInterpolator=require('./CardStackStyleInterpolator');var _CardStackStyleInterpolator2=_interopRequireDefault(_CardStackStyleInterpolator);
var _Header=require('./Header');var _Header2=_interopRequireDefault(_Header);
var _PropTypes=require('../PropTypes');var _PropTypes2=_interopRequireDefault(_PropTypes);
var _NavigationActions=require('../NavigationActions');var _NavigationActions2=_interopRequireDefault(_NavigationActions);
var _addNavigationHelpers=require('../addNavigationHelpers');var _addNavigationHelpers2=_interopRequireDefault(_addNavigationHelpers);
var _SceneView=require('./SceneView');var _SceneView2=_interopRequireDefault(_SceneView);

var _clamp=require('clamp');var _clamp2=_interopRequireDefault(_clamp);
















var _TransitionConfigs=require('./TransitionConfigs');var _TransitionConfigs2=_interopRequireDefault(_TransitionConfigs);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self,call){if(!self){throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call&&(typeof call==="object"||typeof call==="function")?call:self;}function _inherits(subClass,superClass){if(typeof superClass!=="function"&&superClass!==null){throw new TypeError("Super expression must either be null or a function, not "+typeof superClass);}subClass.prototype=Object.create(superClass&&superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__=superClass;}

var emptyFunction=function emptyFunction(){};

var NativeAnimatedModule=_reactNative.NativeModules&&
_reactNative.NativeModules.NativeAnimatedModule;




























var ANIMATION_DURATION=200;






var POSITION_THRESHOLD=1/3;




var RESPOND_THRESHOLD=12;




var GESTURE_RESPONSE_DISTANCE=35;








var GESTURE_ANIMATED_VELOCITY_RATIO=-4;var


CardStack=function(_Component){_inherits(CardStack,_Component);function CardStack(){var _ref;var _temp,_this,_ret;_classCallCheck(this,CardStack);for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}return _ret=(_temp=(_this=_possibleConstructorReturn(this,(_ref=CardStack.__proto__||Object.getPrototypeOf(CardStack)).call.apply(_ref,[this].concat(args))),_this),_this.


_childNavigationProps=

{},_this.







_gestureStartValue=0,_this.


_isResponding=false,_this.








_immediateIndex=null,_this.



























































































_configureTransition=function(

transitionProps,

prevTransitionProps)
{
var isModal=_this.props.mode==='modal';


var transitionSpec=_extends({},
_this._getTransitionConfig(
transitionProps,
prevTransitionProps).
transitionSpec);

if(
!!NativeAnimatedModule&&

_CardStackStyleInterpolator2.default.canUseNativeDriver(isModal))
{

transitionSpec.useNativeDriver=true;
}
return transitionSpec;
},_this.









































































































































































































































































































_getChildNavigation=function(
scene)
{
var navigation=_this._childNavigationProps[scene.key];
if(!navigation||navigation.state!==scene.route){
navigation=_this._childNavigationProps[
scene.key]=
(0,_addNavigationHelpers2.default)(_extends({},
_this.props.navigation,{
state:scene.route}));

}
return navigation;
},_temp),_possibleConstructorReturn(_this,_ret);}_createClass(CardStack,[{key:'componentWillMount',value:function componentWillMount(){this._render=this._render.bind(this);this._renderScene=this._renderScene.bind(this);}},{key:'render',value:function render(){return _react2.default.createElement(_Transitioner2.default,{configureTransition:this._configureTransition,navigation:this.props.navigation,render:this._render,style:this.props.style,onTransitionStart:this.props.onTransitionStart,onTransitionEnd:this.props.onTransitionEnd});}},{key:'_renderHeader',value:function _renderHeader(transitionProps,headerMode){var _this2=this;var headerConfig=this.props.router.getScreenConfig(transitionProps.navigation,'header')||{};return _react2.default.createElement(this.props.headerComponent,_extends({},transitionProps,{router:this.props.router,style:headerConfig.style,mode:headerMode,onNavigateBack:function onNavigateBack(){return _this2.props.navigation.goBack(null);},renderLeftComponent:function renderLeftComponent(props){var header=_this2.props.router.getScreenConfig(props.navigation,'header')||{};return header.left;},renderRightComponent:function renderRightComponent(props){var header=_this2.props.router.getScreenConfig(props.navigation,'header')||{};return header.right;},renderTitleComponent:function renderTitleComponent(props){var header=_this2.props.router.getScreenConfig(props.navigation,'header')||{};if(typeof header.title==='string'){return undefined;}return header.title;}}));}},{key:'_animatedSubscribe',value:function _animatedSubscribe(props){this._animatedSubscribeValue(props.layout.width);this._animatedSubscribeValue(props.layout.height);this._animatedSubscribeValue(props.position);}},{key:'_animatedSubscribeValue',value:function _animatedSubscribeValue(animatedValue){if(!animatedValue.__isNative){return;}if(Object.keys(animatedValue._listeners).length===0){animatedValue.addListener(emptyFunction);}}},{key:'_reset',value:function _reset(position,resetToIndex,velocity){_reactNative.Animated.timing(position,{toValue:resetToIndex,duration:ANIMATION_DURATION,useNativeDriver:position.__isNative,velocity:velocity*GESTURE_ANIMATED_VELOCITY_RATIO,bounciness:0}).start();}},{key:'_goBack',value:function _goBack(props,velocity){var _this3=this;var toValue=Math.ceil(props.navigationState.index-1,0);this._immediateIndex=toValue;_reactNative.Animated.timing(props.position,{toValue:toValue,duration:ANIMATION_DURATION,useNativeDriver:props.position.__isNative,velocity:velocity*GESTURE_ANIMATED_VELOCITY_RATIO,bounciness:0}).start(function(_ref2){var finished=_ref2.finished;_this3._immediateIndex=null;if(!_this3._isResponding){_this3.props.navigation.dispatch(_NavigationActions2.default.back({key:props.scene.route.key}));}});}},{key:'_render',value:function _render(props){var _this4=this;var floatingHeader=null;var headerMode=this._getHeaderMode();if(headerMode==='float'){floatingHeader=this._renderHeader(props,headerMode);}var responder=_reactNative.PanResponder.create({onPanResponderTerminate:function onPanResponderTerminate(){_this4._isResponding=false;_this4._reset(props.position,props.navigation.state.index,0);},onPanResponderGrant:function onPanResponderGrant(){props.position.stopAnimation(function(value){_this4._isResponding=true;_this4._gestureStartValue=value;});},onMoveShouldSetPanResponder:function onMoveShouldSetPanResponder(event,gesture){if(props.navigationState.index!==props.scene.index){return false;}var layout=props.layout;var isVertical=false;var index=props.navigationState.index;var immediateIndex=_this4._immediateIndex==null?index:_this4._immediateIndex;var currentDragDistance=gesture[isVertical?'dy':'dx'];var currentDragPosition=event.nativeEvent[isVertical?'pageY':'pageX'];var axisLength=isVertical?layout.height.__getValue():layout.width.__getValue();var axisHasBeenMeasured=!!axisLength;var screenEdgeDistance=currentDragPosition-currentDragDistance;if(screenEdgeDistance>GESTURE_RESPONSE_DISTANCE){return false;}var hasDraggedEnough=Math.abs(currentDragDistance)>RESPOND_THRESHOLD;var isOnFirstCard=immediateIndex===0;var shouldSetResponder=hasDraggedEnough&&axisHasBeenMeasured&&!isOnFirstCard;return shouldSetResponder;},onPanResponderMove:function onPanResponderMove(event,gesture){var layout=props.layout;var isVertical=false;var startValue=_this4._gestureStartValue;var axis=isVertical?'dy':'dx';var index=props.navigationState.index;var distance=isVertical?layout.height.__getValue():layout.width.__getValue();var currentValue=_reactNative.I18nManager.isRTL&&axis==='dx'?startValue+gesture[axis]/distance:startValue-gesture[axis]/distance;var value=(0,_clamp2.default)(index-1,currentValue,index);props.position.setValue(value);},onPanResponderTerminationRequest:function onPanResponderTerminationRequest(event,gesture){return false;},onPanResponderRelease:function onPanResponderRelease(event,gesture){if(!_this4._isResponding){return;}_this4._isResponding=false;var isVertical=false;var axis=isVertical?'dy':'dx';var velocity=gesture[isVertical?'vy':'vx'];var index=props.navigationState.index;props.position.stopAnimation(function(value){if(velocity<-0.5){_this4._reset(props.position,index,velocity);return;}if(velocity>0.5){_this4._goBack(props,velocity);return;}if(value<=index-POSITION_THRESHOLD){_this4._goBack(props,velocity);}else{_this4._reset(props.position,index,velocity);}});}});var gesturesEnabled=this.props.mode==='card'&&_reactNative.Platform.OS==='ios';var handlers=gesturesEnabled?responder.panHandlers:{};return _react2.default.createElement(_reactNative.View,_extends({},handlers,{style:styles.container}),_react2.default.createElement(_reactNative.View,{style:styles.scenes},props.scenes.map(function(scene){return _this4._renderScene(_extends({},props,{scene:scene,navigation:_this4._getChildNavigation(scene)}));})),floatingHeader);}},{key:'_getHeaderMode',value:function _getHeaderMode(){if(this.props.headerMode){return this.props.headerMode;}if(_reactNative.Platform.OS==='android'||this.props.mode==='modal'){return'screen';}return'float';}},{key:'_getTransitionConfig',value:function _getTransitionConfig(transitionProps,prevTransitionProps){var defaultConfig=_TransitionConfigs2.default.defaultTransitionConfig(transitionProps,prevTransitionProps,this.props.mode==='modal');if(this.props.transitionConfig){return _extends({},defaultConfig,this.props.transitionConfig());}return defaultConfig;}},{key:'_renderInnerCard',value:function _renderInnerCard(SceneComponent,props){var header=this.props.router.getScreenConfig(props.navigation,'header');var headerMode=this._getHeaderMode();if(headerMode==='screen'){var isHeaderHidden=header&&header.visible===false;var maybeHeader=isHeaderHidden?null:this._renderHeader(props,headerMode);return _react2.default.createElement(_reactNative.View,{style:styles.container},_react2.default.createElement(_reactNative.View,{style:{flex:1}},_react2.default.createElement(_SceneView2.default,{screenProps:this.props.screenProps,navigation:props.navigation,component:SceneComponent})),maybeHeader);}return _react2.default.createElement(_SceneView2.default,{screenProps:this.props.screenProps,navigation:props.navigation,component:SceneComponent});}},{key:'_renderScene',value:function _renderScene(

props){var _this5=this;
var isModal=this.props.mode==='modal';var _getTransitionConfig2=


this._getTransitionConfig(),screenInterpolator=_getTransitionConfig2.screenInterpolator;
var style=screenInterpolator&&screenInterpolator(props);

var panHandlers=null;

var cardStackConfig=this.props.router.getScreenConfig(
props.navigation,
'cardStack')||
{};

var SceneComponent=this.props.router.getComponentForRouteName(
props.scene.route.routeName);


return(
_react2.default.createElement(_Card2.default,_extends({},
props,{
key:'card_'+props.scene.key,
panHandlers:null,
renderScene:function renderScene(sceneProps){return(
_this5._renderInnerCard(SceneComponent,sceneProps));},
style:[style,this.props.cardStyle]})));


}}]);return CardStack;}(_react.Component);CardStack.Card=_Card2.default;CardStack.Header=_Header2.default;CardStack.propTypes={cardStyle:_react.PropTypes.any,headerMode:_react.PropTypes.oneOf(['float','screen','none']),headerComponent:_react.PropTypes.func,mode:_react.PropTypes.oneOf(['card','modal']),gestureResponseDistance:_react.PropTypes.number,transitionConfig:_react.PropTypes.func,navigation:_react.PropTypes.shape({state:_PropTypes2.default.navigationState.isRequired,dispatch:_react.PropTypes.func.isRequired}).isRequired,style:_reactNative.View.propTypes.style};CardStack.defaultProps={mode:'card',headerComponent:_Header2.default};


var styles=_reactNative.StyleSheet.create({
container:{
flex:1,




flexDirection:'column-reverse'},

scenes:{
flex:1}});exports.default=



CardStack;