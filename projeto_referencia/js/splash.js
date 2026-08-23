const SPLASH_TOTAL_DURATION = 1000;
const SPLASH_FADE_DURATION = 400;
const REDUCED_MOTION_TOTAL_DURATION = 50;
const REDUCED_MOTION_FADE_DURATION = 10;

export function setupSplashScreen() {
  const root = document.documentElement;
  const splash = document.querySelector("#splash-screen");
  const video = splash?.querySelector("video");
  if (!splash) {
    root.classList.remove("splash-active");
    return;
  }

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const totalDuration = reducedMotion ? REDUCED_MOTION_TOTAL_DURATION : SPLASH_TOTAL_DURATION;
  const fadeDuration = reducedMotion ? REDUCED_MOTION_FADE_DURATION : SPLASH_FADE_DURATION;
  const visibleDuration = totalDuration - fadeDuration;

  if (reducedMotion) {
    video?.pause();
  } else {
    video?.play().catch(() => {});
  }

  window.setTimeout(() => {
    splash.classList.add("is-leaving");
    root.classList.remove("splash-active");

    window.setTimeout(() => {
      video?.pause();
      splash.remove();
    }, fadeDuration);
  }, visibleDuration);
}
