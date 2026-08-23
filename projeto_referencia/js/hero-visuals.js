const metrics = `
  <div class="hero-metric"><span>3</span><small>aplicativos analisados</small></div>
  <div class="hero-metric metric-second"><span>3</span><small>propostas de solução</small></div>`;

export const HeroMobileScanner = `
  <div class="hero-mobile-component" data-hero-component="mobile-scanner">
    <div class="mobile-scan-mark">
      <span class="beam beam-one"></span><span class="beam beam-two"></span>
      <div class="mobile-device">
        <div class="scan-screen">
          <span class="interface-line line-wide"></span>
          <span class="interface-line line-short"></span>
          <span class="scan-target" aria-hidden="true">✓</span>
          <span class="interface-line line-bottom"></span>
          <span class="scan-line"></span>
        </div>
      </div>
    </div>
    ${metrics}
  </div>`;

export function mountHeroVisual() {
  const container = document.querySelector("[data-hero-visual]");
  if (!container) return;
  container.innerHTML = HeroMobileScanner;
}
