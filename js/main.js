/**
 * @method createAnimation
 */
const createAnimation = function() {
  const demoAnimation = document.getElementsByClassName("animation")[0];
  const newAnimation = demoAnimation.cloneNode(true);
  const $frame = _getFrameElement(newAnimation);
  const selectedAnimation = document.getElementById("animationPicker").value;
  const selectedAnimationLabel = this.config.animations.list[selectedAnimation].label;
  const selectedAnimationPath = this.config.animations.basePath + this.config.animations.list[selectedAnimation].path;

  newAnimation.getElementsByClassName("animation_label")[0].textContent = selectedAnimationLabel;
  $frame.src = selectedAnimationPath + ".png";

  _initAnimation($frame);

  document.getElementById("animationsContainer").appendChild(newAnimation);
};

/**
 * @method play
 * @param {HTMLButtonElement} target
 */
const play = function(target) {
  const $animationContainer = target.parentElement.parentElement.getElementsByClassName('animationContainer')[0];
  const $animation = _getFrameElement($animationContainer);

  if ($animation) {
    $animation.animation.playbackRate = 1;
    $animation.animation.play();
  }
};

/**
 * @method reverse
 * @param {HTMLButtonElement} target
 */
const reverse = function(target) {
  const $animationContainer = target.parentElement.parentElement.getElementsByClassName('animationContainer')[0];
  const $animation = _getFrameElement($animationContainer);

  $animation && $animation.animation.reverse();
};

/**
 * @method pause
 * @param {HTMLButtonElement} target
 */
const pause = function(target) {
  const $animationContainer = target.parentElement.parentElement.getElementsByClassName('animationContainer')[0];
  const $animation = _getFrameElement($animationContainer);

  $animation && $animation.animation.pause();
};

/**
 * Callback Method
 * @method _onDomReady
 * @returns {Promise<void>}
 * @private
 */
const _onDomReady = async function() {
  const animation1 = document.getElementsByClassName("animationContainer")[0];

  this.config = await _getConfig();
  _initAnimationList();
  await _initAnimation(_getFrameElement(animation1));
};

/**
 * Callback Method
 * @method _onResize
 * @returns {Promise<void>}
 * @private
 */
const _onResize = async function() {
  const animations = document.getElementsByClassName('animationContainer');

  for (let animation of animations) {
    await _calculateBounds(animation);
  }
};

/**
 * @method _getConfig
 * @returns {Promise<any>}
 * @private
 */
const _getConfig = async function() {
  const data = await fetch("../config.json");

  return await data.json();
};

/**
 * @method _getSpritesheet
 * @param {HTMLImageElement} $frame
 * @returns {Promise<any>}
 * @private
 */
const _getSpritesheet = async function($frame) {
  const src = $frame.src;
  const data = await fetch(src.replace(".png", ".json"));

  return await data.json();
};

/**
 * @method _getKeyFrames
 * @param $frame
 * @returns {Promise<[]>}
 * @private
 */
const _getKeyFrames = async function($frame) {
  if (!$frame.atlas) {
    $frame.atlas = await _getSpritesheet($frame);
  }

  const sourceSize = $frame.atlas.meta.size;
  const result = [];

  for (const frame of $frame.atlas.frames) {
    result.push({
      transform: `translate3d(-${frame.frame.x / sourceSize.w * 100}%, -${frame.frame.y / sourceSize.h * 100}%, 0)`
    });
  }

  return result;
};

/**
 * @method _getFrameElement
 * @param $element
 * @returns {HTMLElement}
 * @private
 */
const _getFrameElement = function($element) {
  return $element.getElementsByClassName("animationFrame")[0];
};

/**
 * Populates animationPicker Dropdown with available animations (declared in config.json)
 * @method _initAnimationList
 * @private
 */
const _initAnimationList = function() {
  const animations = this.config.animations;
  const $select = this.document.getElementById("animationPicker");
  let animation, $option;

  for (animation in animations.list) {
    $option = document.createElement("option");
    $option.value = animation;
    $option.text = animations.list[animation].label;

    $select.add($option);
  }
};

/**
 * Initialises an animation on an HTMLImageElement
 * @method _initAnimation
 * @param {HTMLImageElement} $frame
 * @returns {Promise<void>}
 * @private
 */
const _initAnimation = async function($frame) {
  const keyFrames = await _getKeyFrames($frame);
  const animationConfig = {
    duration: 500,
    iterations: Infinity,
    delay: 0,
    easing: `steps(${keyFrames.length}, jump-none)`
  };
  const animationDefinition = new KeyframeEffect($frame, keyFrames, animationConfig);

  $frame.animation = new Animation(animationDefinition);

  await _calculateBounds($frame.parentElement);
};

/**
 * Resize animation frame to fit in the animation container
 * @method _calculateBounds
 * @param {HTMLElement} element
 * @returns {Promise<void>}
 * @private
 */
const _calculateBounds = async function(element) {
  const $frame = _getFrameElement(element);

  if (!$frame || !$frame.atlas) return;

  // DEV Note: this step is optional.
  // Technically the size of the animation container should be set via css and it can be whatever we want
  // but ensure it's ratio is the same as the animation frame to avoid weird stretching / squeezing effect.
  element.style.width = `${$frame.atlas.frames[0].sourceSize.w / 2}px`;
  element.style.height = `${$frame.atlas.frames[0].sourceSize.h / 2}px`;

  const source = $frame.atlas.frames[0].sourceSize;
  const bounds = element.getBoundingClientRect();
  const scaleX = bounds.width / source.w;
  const scaleY = bounds.height / source.h;

  $frame.width = $frame.atlas.meta.size.w * scaleX;
  $frame.height = $frame.atlas.meta.size.h * scaleY;
};

window.addEventListener('DOMContentLoaded', _onDomReady);
window.addEventListener('resize', _onResize);
