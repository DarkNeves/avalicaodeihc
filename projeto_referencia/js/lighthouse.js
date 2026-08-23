import { LINKS } from "./config.js?v=4";
import { onLanguageChange, t } from "./i18n.js";

const DATA_URL = "/data/lighthouse-results.json";

function updateAnimatedScoreLabels() {
  document.querySelectorAll(".animated-score[data-final-score]").forEach((element) => {
    element.querySelector(".score-accessible").textContent = t("__final_score", { score: element.dataset.finalScore });
  });
}

onLanguageChange(updateAnimatedScoreLabels);

export async function loadLighthouseData() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`Falha ao carregar os dados do Lighthouse (${response.status}).`);
  const data = await response.json();

  document.querySelectorAll("[data-score-site][data-score-metric]").forEach((element) => {
    const site = data.sites[element.dataset.scoreSite];
    const score = site?.scores?.[element.dataset.scoreMetric];
    if (!Number.isFinite(score)) return;
    if (element.classList.contains("animated-score")) {
      element.dataset.finalScore = String(score);
      element.querySelector(".score-visual").textContent = "-";
      element.querySelector(".score-accessible").textContent = t("__final_score", { score });
    } else {
      element.textContent = String(score);
    }
  });

  return data;
}

export function renderExternalLinks() {
  const mount = document.querySelector("#external-links");
  if (!mount) return;
  mount.replaceChildren();

  const entries = [
    { key: "driveReports", label: "Acessar pasta no Google Drive" },
    { key: "githubRepository", label: "Ver código no GitHub" },
  ];

  entries.forEach(({ key, label }) => {
    const url = LINKS[key].trim();
    if (url) {
      const link = document.createElement("a");
      link.className = "button button-secondary";
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `${t(label)} ↗`;
      mount.append(link);
      return;
    }

    const pending = document.createElement("span");
    pending.className = "link-pending";
    pending.textContent = t("__link_pending", { label: t(label) });
    mount.append(pending);
  });
}
