export const requestAnimationFrame = (window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  // @ts-ignore
  window.mozRequestAnimationFrame ||
  // @ts-ignore
  window.oRequestAnimationFrame ||
  // @ts-ignore
  window.msRequestAnimationFrame ||
  (cb => {
    window.setTimeout(cb, 1000 / 60);
  }));
