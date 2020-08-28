const animationComponent = `
<section class="animation">
  <div class="animation-bg pixelart"></div>
  <div class="animation-label"></div>
  <div class="animation-container">
    <img class="animation-frame pixelart" src="" alt=""/>
  </div>
  <div class="animation-controls">
    <div class="message"></div>
    <button class="btn-play material-icons" onclick="play(this)" disabled></button>
    <button class="btn-loop material-icons" onclick="loop(this)" disabled></button>
    <button class="btn-reverse material-icons flip" onclick="reverse(this)"></button>
    <button class="btn-pause material-icons" onclick="pause(this)" disabled></button>
    <button class="btn-stop material-icons" onclick="stop(this)" disabled></button>
  </div>
</section>
`;

/**
 * @method initActionsList
 */
const initActionsList = function() {
  const animations = this.config.animations;
  const $characterPicker = this.document.getElementById("characterPicker");
  const $actionPicker = this.document.getElementById("actionPicker");
  const character = $characterPicker.value;
  let i, action, $option;

  // clear options
  for (i = $actionPicker.options.length - 1; i > -1; i--) {
    $actionPicker.remove(i);
  }

  // re-populate
  for (action in animations.list[character].actions) {
    if (!animations.list[character].actions.hasOwnProperty(action)) continue;

    $option = document.createElement("option");
    $option.value = action;
    $option.text = animations.list[character].actions[action].label;

    $actionPicker.add($option);
  }
};

/**
 * @method createAnimation
 */
const createAnimation = function() {
  const newAnimation = document.createElement('div');
  newAnimation.innerHTML = animationComponent.trim();

  const $frame = _getFrameElement(newAnimation);
  const $characterPicker = document.getElementById("characterPicker");
  const $actionPicker = document.getElementById("actionPicker");
  const selectedAnimation = this.config.animations.list[$characterPicker.value].actions[$actionPicker.value];
  const selectedAnimationLabel = this.config.animations.list[$characterPicker.value].label + " " +
    this.config.animations.list[$characterPicker.value].actions[$actionPicker.value].label;
  const selectedAnimationPath = this.config.animations.basePath + selectedAnimation.path;

  newAnimation.querySelector(".animation-label").textContent = selectedAnimationLabel;
  $frame.alt = selectedAnimationLabel;
  $frame.src = selectedAnimationPath + ".png";

  _initAnimation($frame).then(function() {
    console.log(`animation "${selectedAnimationLabel}" ready`)
    this.querySelector(".animation-controls .btn-play").disabled = false;
    this.querySelector(".animation-controls .btn-reverse").disabled = false;
    this.querySelector(".animation-controls .btn-loop").disabled = false;
    this.querySelector(".animation-controls .btn-pause").disabled = true;
    this.querySelector(".animation-controls .btn-stop").disabled = true;
  }.bind(newAnimation.firstChild));

  document.getElementById("animationsContainer").appendChild(newAnimation.firstChild);
};

/**
 * @method play
 * @param {HTMLButtonElement} target
 */
const play = function(target) {
  const animationContainer = target.parentElement.parentElement.querySelector(".animation-container");
  const $animation = _getFrameElement(animationContainer);
  const $bg = $animation.parentElement.parentElement.querySelector(".animation-bg");

  if ($animation) {
    $animation.animation.loop = false;
    $animation.animation.playbackRate = 1;
    $animation.animation.play();
    $bg.animation.play();

    animationContainer.parentElement.querySelector(".animation-controls .btn-play").disabled = true;
    animationContainer.parentElement.querySelector(".animation-controls .btn-reverse").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-pause").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-stop").disabled = false;
  }
};

/**
 * @method play
 * @param {HTMLButtonElement} target
 */
const loop = function(target) {
  const animationContainer = target.parentElement.parentElement.querySelector(".animation-container");
  const $animation = _getFrameElement(animationContainer);
  const $bg = $animation.parentElement.parentElement.querySelector(".animation-bg");

  if ($animation) {
    $animation.animation.loop = true;
    $animation.animation.play();
    $bg.animation.play();

    animationContainer.parentElement.querySelector(".animation-controls .btn-play").disabled = true;
    animationContainer.parentElement.querySelector(".animation-controls .btn-reverse").disabled = true;
    animationContainer.parentElement.querySelector(".animation-controls .btn-pause").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-stop").disabled = false;
  }
};

/**
 * @method reverse
 * @param {HTMLButtonElement} target
 */
const reverse = function(target) {
  const animationContainer = target.parentElement.parentElement.querySelector(".animation-container");
  const $animation = _getFrameElement(animationContainer);
  const $bg = $animation.parentElement.parentElement.querySelector(".animation-bg");

  if ($animation) {
    $animation.animation.loop = false;
    $animation.animation.playbackRate = -1;
    $animation.animation.play();
    $bg.animation.playState !== "running" && $bg.animation.play();

    animationContainer.parentElement.querySelector(".animation-controls .btn-play").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-reverse").disabled = true;
    animationContainer.parentElement.querySelector(".animation-controls .btn-pause").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-stop").disabled = false;
  }
};

/**
 * @method pause
 * @param {HTMLButtonElement} target
 */
const pause = function(target) {
  const animationContainer = target.parentElement.parentElement.querySelector(".animation-container");
  const $animation = _getFrameElement(animationContainer);
  const $bg = $animation.parentElement.parentElement.querySelector(".animation-bg");

  if ($animation) {
    $animation.animation.pause();
    $bg.animation.pause();

    animationContainer.parentElement.querySelector(".animation-controls .btn-play").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-reverse").disabled = false;
    animationContainer.parentElement.querySelector(".animation-controls .btn-pause").disabled = true;
    animationContainer.parentElement.querySelector(".animation-controls .btn-stop").disabled = true;
  }
};

/**
 * @method stop
 * @param {HTMLButtonElement} target
 */
const stop = function(target) {
  const animationContainer = target.parentElement.parentElement.querySelector(".animation-container");
  const $animation = _getFrameElement(animationContainer);
  const $bg = $animation.parentElement.parentElement.querySelector(".animation-bg");

  if ($animation) {
    $animation.animation.loop = false;
    $animation.animation.finish();
    $bg.animation.pause();
  }
};

/**
 * Callback Method
 * @method _onDomReady
 * @returns {Promise<void>}
 * @private
 */
const _onDomReady = async function() {
  this.config = await _getConfig();

  _initCharacterList();
};

/**
 * Callback Method
 * @method _onResize
 * @returns {Promise<void>}
 * @private
 */
const _onResize = async function() {
  const animations = document.querySelectorAll(".animation-container");

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
 * @returns {HTMLImageElement}
 * @private
 */
const _getFrameElement = function($element) {
  return $element.querySelector(".animation-frame");
};

/**
 * Populates animationPicker Dropdown with available animations (declared in config.json)
 * @method _initCharacterList
 * @private
 */
const _initCharacterList = function() {
  const animations = this.config.animations;
  const $characterPicker = this.document.getElementById("characterPicker");
  let character, $option;

  for (character in animations.list) {
    if (!animations.list.hasOwnProperty(character)) continue;

    $option = document.createElement("option");
    $option.value = character;
    $option.text = animations.list[character].label;

    $characterPicker.add($option);
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
  const $bg = $frame.parentElement.parentElement.querySelector(".animation-bg");
  const keyFrames = await _getKeyFrames($frame);
  const bgAnimationKeyFrames = [
    { backgroundPositionX: '-1000px' }
  ]
  const animationConfig = {
    duration: 500,
    iterations: 1,
    delay: 0,
    easing: `steps(${keyFrames.length}, jump-none)`
  };
  const bgAnimationConfig = {
    duration: 20000,
    iterations: Infinity,
  };
  const animationDefinition = new KeyframeEffect($frame, keyFrames, animationConfig);
  const bgAnimationDefinition = new KeyframeEffect($bg, bgAnimationKeyFrames, bgAnimationConfig);

  $frame.animation = new Animation(animationDefinition);
  $bg.animation = new Animation(bgAnimationDefinition);

  $frame.animation.onfinish = e => {
    const $animation = e.target.effect.target.parentElement.parentElement;

    $animation.querySelector(".animation-bg").animation.pause();

    if ($frame.animation.loop) {
      $animation.querySelector(".animation-controls .btn-loop").click();
    } else {
      $animation.querySelector(".animation-controls .btn-play").disabled = false;
      $animation.querySelector(".animation-controls .btn-reverse").disabled = false;
      $animation.querySelector(".animation-controls .btn-pause").disabled = true;
      $animation.querySelector(".animation-controls .btn-stop").disabled = true;
    }
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
