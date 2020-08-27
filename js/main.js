/**
 * @method createAnimation
 */
const createAnimation = function() {
  const demoAnimation = document.querySelector(".animation");
  const newAnimation = demoAnimation.cloneNode(true);
  const $frame = _getFrameElement(newAnimation);
  const selectedAnimation = document.getElementById("animationPicker").value;
  const selectedAnimationLabel = this.config.animations.list[selectedAnimation].label;
  const selectedAnimationPath = this.config.animations.basePath + this.config.animations.list[selectedAnimation].path;

  newAnimation.querySelector(".animation_label").textContent = selectedAnimationLabel;
  $frame.src = selectedAnimationPath + ".png";

  _initAnimation($frame);

  document.getElementById("animationsContainer").appendChild(newAnimation);
};

/**
 * @method play
 * @param {HTMLButtonElement} target
 */
const play = function(target) {
  const $animationContainer = target.parentElement.parentElement.querySelector(".animationContainer");
  const $animation = _getFrameElement($animationContainer);

  if ($animation) {
    $animation.animation.playbackRate = 1;
    $animation.animation.play();

    $animationContainer.parentElement.querySelector(".controls .btn-play").disabled = true;
    $animationContainer.parentElement.querySelector(".controls .btn-reverse").disabled = false;
    $animationContainer.parentElement.querySelector(".controls .btn-pause").disabled = false;
    $animationContainer.parentElement.querySelector(".controls .btn-stop").disabled = false;
  }
};

/**
 * @method reverse
 * @param {HTMLButtonElement} target
 */
const reverse = function(target) {
  const $animationContainer = target.parentElement.parentElement.querySelector(".animationContainer");
  const $animation = _getFrameElement($animationContainer);

  if ($animation) {
    $animation.animation.reverse();

    $animationContainer.parentElement.querySelector(".controls .btn-play").disabled = false;
    $animationContainer.parentElement.querySelector(".controls .btn-reverse").disabled = true;
    $animationContainer.parentElement.querySelector(".controls .btn-pause").disabled = false;
    $animationContainer.parentElement.querySelector(".controls .btn-stop").disabled = false;
  }
};

/**
 * @method pause
 * @param {HTMLButtonElement} target
 */
const pause = function(target) {
  const $animationContainer = target.parentElement.parentElement.querySelector(".animationContainer");
  const $animation = _getFrameElement($animationContainer);

  if ($animation) {
    $animation.animation.pause();

    $animationContainer.parentElement.querySelector(".controls .btn-play").disabled = false;
    $animationContainer.parentElement.querySelector(".controls .btn-reverse").disabled = false;
    $animationContainer.parentElement.querySelector(".controls .btn-pause").disabled = true;
    $animationContainer.parentElement.querySelector(".controls .btn-stop").disabled = true;
  }
};

/**
 * @method stop
 * @param {HTMLButtonElement} target
 */
const stop = function(target) {
  const $animationContainer = target.parentElement.parentElement.querySelector(".animationContainer");
  const $animation = _getFrameElement($animationContainer);

  $animation && $animation.animation.finish();
};

/**
 * Callback Method
 * @method _onDomReady
 * @returns {Promise<void>}
 * @private
 */
const _onDomReady = async function() {
  const animation1 = document.querySelector(".animationContainer");

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
  const animations = document.querySelector(".animationContainer");

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
  return $element.querySelector(".animationFrame");
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
    iterations: 1000,
    delay: 0,
    easing: `steps(${keyFrames.length}, jump-none)`
  };
  const animationDefinition = new KeyframeEffect($frame, keyFrames, animationConfig);

  $frame.animation = new Animation(animationDefinition);

  $frame.animation.onfinish = e => {
    const $animation = e.target.effect.target.parentElement.parentElement;

    $animation.querySelector(".controls .btn-play").disabled = false;
    $animation.querySelector(".controls .btn-reverse").disabled = false;
    $animation.querySelector(".controls .btn-pause").disabled = true;
    $animation.querySelector(".controls .btn-stop").disabled = true;
  }

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
