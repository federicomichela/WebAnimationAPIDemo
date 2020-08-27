const AnimationStates = {
  Running: "running",
  Finished: "finished",
  Paused: "paused",
  Idle: "idle"
};

const onDomReady = function() {
  const animation1 = document.getElementsByClassName("animationContainer")[0];

  initAnimation(getFrameElement(animation1));
  clonesInvasion(10);
  onResize();
};

const onResize = function() {
  const animations = document.getElementsByClassName('animationContainer');

  for (let animation of animations) {
    calculateBounds(animation);
  }
};

const play = function(target) {
  const $animationContainer = target.parentElement.parentElement.getElementsByClassName('animationContainer')[0];
  const $animation = getFrameElement($animationContainer);

  if ($animation) {
    $animation.animation.playbackRate = 1;
    $animation.animation.play();
  }
};

const reverse = function(target) {
  const $animationContainer = target.parentElement.parentElement.getElementsByClassName('animationContainer')[0];
  const $animation = getFrameElement($animationContainer);

  $animation && $animation.animation.reverse();
};

const pause = function(target) {
  const $animationContainer = target.parentElement.parentElement.getElementsByClassName('animationContainer')[0];
  const $animation = getFrameElement($animationContainer);

  $animation && $animation.animation.pause();
};

const getSpritesheet = async function() {
  const data = await fetch('../img/sprites/CuteGirl/idle.json');

  return await data.json();
};

const getKeyFrames = async function() {
  const spritesheet = await getSpritesheet();
  const sourceSize = spritesheet.meta.size;
  const result = [];

  for (const frame of spritesheet.frames) {
    result.push({
      transform: `translate3d(-${frame.frame.x / sourceSize.w * 100}%, -${frame.frame.y / sourceSize.h * 100}%, 0)`
    });
  }

  return result;
};

const initAnimation = async function(target) {
  const keyFrames = await getKeyFrames();
  const animationConfig = {
    duration: 500,
    iterations: Infinity,
    delay: 0,
    easing: `steps(${keyFrames.length}, jump-none)`
  };
  const animationDefinition = new KeyframeEffect(target, keyFrames, animationConfig);

  target.animation = new Animation(animationDefinition);
};

const getFrameElement = function($element) {
  return $element.getElementsByClassName("animationFrame")[0];
};

const clonesInvasion = function(clonesNum) {
  const animation1 = document.getElementsByClassName("animation")[0];
  let clone;

  for (let i = 0; i < clonesNum; i++) {
    clone = animation1.cloneNode(true);
    initAnimation(getFrameElement(clone));

    document.getElementById("animationsContainer").appendChild(clone);
  }
};

const calculateBounds = async function(element) {
  const animationFrame = getFrameElement(element);

  if (!animationFrame) return;

  const spritesheet = await getSpritesheet();
  const source = spritesheet.frames[0].sourceSize;
  const bounds = element.getBoundingClientRect();
  const scaleX = bounds.width / source.w;
  const scaleY = bounds.height / source.h;

  animationFrame.width = spritesheet.meta.size.w * scaleX;
  animationFrame.height = spritesheet.meta.size.h * scaleY;
};

window.addEventListener('DOMContentLoaded', onDomReady);
window.addEventListener('resize', onResize);
