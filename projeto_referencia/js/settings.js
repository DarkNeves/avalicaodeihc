import { onLanguageChange, t } from "./i18n.js?v=5";

const STORAGE_KEY = "farolAccessibilitySettings";
const PANEL_TRANSITION_DURATION = 340;
const TEXT_SIZES = ["small", "default", "large", "larger"];
const TEXT_LABEL_SOURCES = {
  small: "Reduzido - 90%",
  default: "Padrão - 100%",
  large: "Ampliado - 112%",
  larger: "Ampliado - 125%",
};

const defaults = {
  textSize: "default",
  theme: "light",
  enhancedContrast: false,
  highContrast: false,
  textSpacing: false,
  highlightLinks: false,
  smoothScroll: true,
};

const root = document.documentElement;
const mobileViewport = matchMedia("(max-width: 860px)");
let settings = loadSettings();
let previousFocus = null;
let panelClosingTimer = 0;
let lockedScrollPosition = null;
let lockedBodyStyles = null;

function lockMobilePageScroll() {
  if (!mobileViewport.matches || lockedScrollPosition !== null) return;
  const body = document.body;
  lockedScrollPosition = window.scrollY;
  lockedBodyStyles = {
    position: body.style.position,
    top: body.style.top,
    right: body.style.right,
    left: body.style.left,
    width: body.style.width,
    overflow: body.style.overflow,
  };
  window.siteLenis?.stop?.();
  body.classList.add("settings-mobile-open");
  Object.assign(body.style, {
    position: "fixed",
    top: `-${lockedScrollPosition}px`,
    right: "0",
    left: "0",
    width: "100%",
    overflow: "hidden",
  });
}

function unlockMobilePageScroll() {
  if (lockedScrollPosition === null) return;
  const body = document.body;
  const scrollPosition = lockedScrollPosition;
  const savedStyles = lockedBodyStyles;
  lockedScrollPosition = null;
  lockedBodyStyles = null;
  body.classList.remove("settings-mobile-open");
  Object.assign(body.style, savedStyles);

  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, scrollPosition);
  window.siteLenis?.resize?.();
  window.siteLenis?.scrollTo?.(scrollPosition, { immediate: true, force: true });
  window.siteLenis?.start?.();
  requestAnimationFrame(() => { root.style.scrollBehavior = previousScrollBehavior; });
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      ...defaults,
      ...saved,
      textSize: TEXT_SIZES.includes(saved.textSize) ? saved.textSize : defaults.textSize,
      theme: ["light", "dark"].includes(saved.theme) ? saved.theme : defaults.theme,
      smoothScroll: typeof saved.smoothScroll === "boolean" ? saved.smoothScroll : defaults.smoothScroll,
    };
  } catch {
    return { ...defaults };
  }
}

function persistSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Não foi possível salvar as preferências de acessibilidade.", error);
  }
}

function setBooleanDataset(name, enabled) {
  if (enabled) root.dataset[name] = "true";
  else delete root.dataset[name];
}

function applySettings() {
  root.dataset.textSize = settings.textSize;
  root.dataset.theme = settings.theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", settings.theme === "dark" ? "#0f1612" : "#176b3a");
  if (settings.enhancedContrast) root.dataset.contrast = "enhanced";
  else delete root.dataset.contrast;
  setBooleanDataset("highContrast", settings.highContrast);
  setBooleanDataset("textSpacing", settings.textSpacing);
  setBooleanDataset("highlightLinks", settings.highlightLinks);
  root.dataset.smoothScroll = String(settings.smoothScroll);
  window.dispatchEvent(new CustomEvent("farol:smooth-scroll-change", { detail: { enabled: settings.smoothScroll } }));
  updateThemeButton();
}

function textLabel(size) {
  return t(TEXT_LABEL_SOURCES[size]);
}

function updateThemeButton() {
  const button = document.querySelector("#theme-toggle");
  if (!button) return;
  const dark = settings.theme === "dark";
  button.setAttribute("aria-pressed", String(dark));
  button.setAttribute("aria-label", t(dark ? "Ativar tema claro" : "Ativar tema escuro"));
  button.dataset.nextTheme = dark ? "light" : "dark";
}

function announce(message) {
  const region = document.querySelector("#settings-announcement");
  if (!region) return;
  region.textContent = "";
  requestAnimationFrame(() => { region.textContent = message; });
}

function syncControls() {
  const index = TEXT_SIZES.indexOf(settings.textSize);
  const status = document.querySelector("#text-size-status");
  status.textContent = textLabel(settings.textSize);
  document.querySelector("#text-decrease").disabled = index === 0;
  document.querySelector("#text-increase").disabled = index === TEXT_SIZES.length - 1;
  document.querySelector("#text-reset").disabled = settings.textSize === "default";
  document.querySelector("#enhanced-contrast").checked = settings.enhancedContrast;
  document.querySelector("#high-contrast").checked = settings.highContrast;
  document.querySelector("#text-spacing").checked = settings.textSpacing;
  document.querySelector("#highlight-links").checked = settings.highlightLinks;
  document.querySelector("#smooth-scroll").checked = settings.smoothScroll;
}

function updateSetting(key, value, message) {
  settings[key] = value;
  applySettings();
  persistSettings();
  syncControls();
  announce(message);
}

function changeTextSize(direction) {
  const current = TEXT_SIZES.indexOf(settings.textSize);
  const next = Math.max(0, Math.min(TEXT_SIZES.length - 1, current + direction));
  updateSetting("textSize", TEXT_SIZES[next], t("__text_size", { label: textLabel(TEXT_SIZES[next]) }));
}

function openPanel() {
  const panel = document.querySelector("#settings-panel");
  const triggers = [...document.querySelectorAll("[data-settings-trigger]")];
  window.clearTimeout(panelClosingTimer);
  previousFocus = document.activeElement;
  panel.hidden = false;
  document.querySelector(".site-header").classList.add("settings-expanded");
  triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "true"));
  document.querySelector(".site-nav").classList.remove("open");
  document.querySelector(".botao-menu").setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  lockMobilePageScroll();
  syncControls();
  void panel.offsetHeight;
  panel.classList.add("is-open");
  if (!mobileViewport.matches) document.querySelector("#close-settings").focus({ preventScroll: true });
}

function closePanel({ restoreFocus = true, immediate = false } = {}) {
  const panel = document.querySelector("#settings-panel");
  const triggers = [...document.querySelectorAll("[data-settings-trigger]")];
  if (panel.hidden) return;
  window.clearTimeout(panelClosingTimer);
  panelClosingTimer = 0;
  panel.classList.remove("is-open");
  triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
  const finishClosing = () => {
    panel.hidden = true;
    document.querySelector(".site-header").classList.remove("settings-expanded");
    unlockMobilePageScroll();
  };
  if (immediate || matchMedia("(prefers-reduced-motion: reduce)").matches) finishClosing();
  else panelClosingTimer = window.setTimeout(finishClosing, PANEL_TRANSITION_DURATION);

  if (!restoreFocus) return;
  const fallback = triggers.find((trigger) => trigger.getClientRects().length) ?? document.querySelector("#menu-toggle");
  const focusTarget = previousFocus instanceof HTMLElement && previousFocus.matches("a, button, input, select, textarea, [tabindex]:not([tabindex='-1'])") && previousFocus.getClientRects().length
    ? previousFocus
    : fallback;
  focusTarget.focus();
}

export function closeAccessibilitySettings(options = {}) {
  closePanel(options);
}

export function setupAccessibilitySettings() {
  applySettings();

  const panel = document.querySelector("#settings-panel");
  const triggers = [...document.querySelectorAll("[data-settings-trigger]")];
  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (trigger.getAttribute("aria-expanded") === "true") closePanel();
      else openPanel();
    });
  });
  document.querySelector("#close-settings").addEventListener("click", () => closePanel());
  document.querySelector("#apply-settings").addEventListener("click", () => closePanel());
  document.querySelector("#theme-toggle").addEventListener("click", () => {
    const nextTheme = settings.theme === "dark" ? "light" : "dark";
    updateSetting("theme", nextTheme, t(nextTheme === "dark" ? "Tema escuro ativado." : "Tema claro ativado."));
  });
  document.querySelector("#text-decrease").addEventListener("click", () => changeTextSize(-1));
  document.querySelector("#text-increase").addEventListener("click", () => changeTextSize(1));
  document.querySelector("#text-reset").addEventListener("click", () => updateSetting("textSize", "default", t("Tamanho do texto restaurado para 100%.")));

  const toggles = [
    ["#enhanced-contrast", "enhancedContrast", "Contraste reforçado"],
    ["#high-contrast", "highContrast", "Alto contraste"],
    ["#text-spacing", "textSpacing", "Maior espaçamento de texto"],
    ["#highlight-links", "highlightLinks", "Destaque de links"],
    ["#smooth-scroll", "smoothScroll", "Scroll suave"],
  ];
  toggles.forEach(([selector, key, label]) => {
    document.querySelector(selector).addEventListener("change", (event) => {
      updateSetting(key, event.target.checked, t("__setting_state", { label: t(label), state: t(event.target.checked ? "ativado" : "desativado") }));
    });
  });

  document.querySelector("#restore-settings").addEventListener("click", () => {
    settings = { ...defaults };
    applySettings();
    persistSettings();
    syncControls();
    announce(t("Todas as configurações foram restauradas para o padrão."));
  });

  onLanguageChange(() => {
    syncControls();
    updateThemeButton();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && triggers.some((trigger) => trigger.getAttribute("aria-expanded") === "true")) {
      event.preventDefault();
      closePanel();
    }
  });

  mobileViewport.addEventListener("change", (event) => {
    if (panel.hidden) return;
    if (event.matches) lockMobilePageScroll();
    else unlockMobilePageScroll();
  });
}
