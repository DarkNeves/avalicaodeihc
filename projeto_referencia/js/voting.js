import { onLanguageChange, t } from "./i18n.js";

const SITE_NAMES = {
  govbr: "GOV.BR",
  mercadolivre: "Mercado Livre",
  equipe: "Site da equipe",
};

const DEVICE_KEY = "accessibilityVotingDeviceId";
const VOTED_SESSIONS_KEY = "accessibilityVotedSessions";
const ADMIN_PATH = "/admisrael98839";

const defaultControl = {
  sessionId: "apresentacao-01",
  voteStatus: "closed",
  resultsVisible: false,
  lighthouseVisible: false,
};

const emptyCounts = () => Object.fromEntries(Object.keys(SITE_NAMES).map((id) => [id, 0]));
const emptySummary = () => ({ total: 0, best: emptyCounts(), worst: emptyCounts() });

const elements = {
  form: document.querySelector("#vote-form"),
  notice: document.querySelector("#vote-notice"),
  statusLabel: document.querySelector("#vote-status-label"),
  statusDot: document.querySelector("#status-dot"),
  counter: document.querySelector("#vote-counter"),
  feedback: document.querySelector("#form-feedback"),
  classResults: document.querySelector("#resultado-turma"),
  bestResults: document.querySelector("#best-results"),
  worstResults: document.querySelector("#worst-results"),
  locked: document.querySelector("#resultados-bloqueados"),
  official: document.querySelector("#conteudo-oficial"),
  adminMount: document.querySelector("#admin-mount"),
  toastRegion: document.querySelector("#toast-region"),
};

const state = {
  firebase: null,
  control: { ...defaultControl },
  votes: [],
  summary: emptySummary(),
  isAdmin: normalizePath(location.pathname) === ADMIN_PATH,
  unavailable: false,
  submitting: false,
  votesUnsubscribe: null,
  summaryUnsubscribe: null,
  controlUnsubscribe: null,
  officialAnimated: false,
};

let officialScoreObserver = null;
let officialScoreScheduled = false;

function normalizePath(pathname) {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized;
}

function pluralizeVotes(total) {
  return t(total === 1 ? "__vote_one" : "__vote_many", { count: total });
}

function siteName(id) {
  return t(SITE_NAMES[id] ?? id);
}

function sanitizeName(value) {
  return value.replace(/\s+/g, " ").trim().slice(0, 40);
}

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = globalThis.crypto?.randomUUID?.() ?? `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function getVotedSessions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(VOTED_SESSIONS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function hasVoted(sessionId) {
  return Boolean(sessionId) && getVotedSessions().includes(sessionId);
}

function markAsVoted(sessionId) {
  const sessions = new Set(getVotedSessions());
  sessions.add(sessionId);
  localStorage.setItem(VOTED_SESSIONS_KEY, JSON.stringify([...sessions].slice(-20)));
}

function toast(message, type = "info") {
  const item = document.createElement("div");
  item.className = `toast${type === "error" ? " error" : ""}`;
  item.textContent = message;
  elements.toastRegion.append(item);
  window.setTimeout(() => item.remove(), 5000);
}

function setNotice(message, isError = false) {
  elements.notice.hidden = false;
  elements.notice.classList.toggle("error", isError);
  elements.notice.textContent = message;
}

function setFormEnabled(enabled) {
  elements.form.querySelectorAll("input, button").forEach((control) => {
    control.disabled = !enabled || state.submitting;
  });
}

function updateStatusPresentation() {
  const { voteStatus } = state.control;
  elements.statusDot.className = "status-dot";

  if (state.unavailable) {
    elements.statusLabel.textContent = t("Dinâmica indisponível");
    elements.statusDot.classList.add("closed");
    return;
  }

  const labels = {
    closed: "Votação fechada",
    open: "Votação aberta",
    ended: "Votação encerrada",
  };
  elements.statusLabel.textContent = t(labels[voteStatus] ?? "Aguardando configuração");
  elements.statusDot.classList.add(voteStatus === "open" ? "open" : voteStatus === "ended" ? "ended" : "closed");
  elements.statusDot.classList.toggle("is-live", voteStatus === "open");
}

function updateVotingForm() {
  const { sessionId, voteStatus } = state.control;
  const voted = hasVoted(sessionId);
  elements.form.hidden = true;

  if (state.unavailable) {
    setNotice(t("Dinâmica temporariamente indisponível. O restante da apresentação continua acessível."), true);
    return;
  }

  if (!sessionId) {
    setNotice(t("A sessão ainda não foi preparada. Aguarde o apresentador."));
    return;
  }

  if (voted) {
    setNotice(t("Palpite registrado! Aguarde a revelação dos resultados."));
    return;
  }

  if (voteStatus === "open") {
    elements.notice.hidden = true;
    elements.form.hidden = false;
    setFormEnabled(true);
    return;
  }

  if (voteStatus === "ended") {
    setNotice(t("A votação foi encerrada."));
    return;
  }

  setNotice(t("A votação ainda não foi liberada. Aguarde o apresentador."));
}

function renderBars(container, field) {
  container.replaceChildren();
  const total = state.summary.total;
  const counts = field === "bestSite" ? state.summary.best : state.summary.worst;

  Object.entries(SITE_NAMES).forEach(([id, nameSource]) => {
    const name = siteName(id);
    const count = counts[id];
    const percentage = total ? Math.round((count / total) * 100) : 0;
    const row = document.createElement("div");
    row.className = "bar-row";

    const label = document.createElement("strong");
    label.textContent = name;
    const output = document.createElement("output");
    output.textContent = `${percentage}%`;
    output.setAttribute("aria-label", t("__percent_votes", { percentage, percent: percentage, votes: pluralizeVotes(count) }));
    const track = document.createElement("div");
    track.className = "bar-track";
    track.setAttribute("role", "img");
    track.setAttribute("aria-label", t("__site_percent_votes", { site: name, percent: percentage, votes: pluralizeVotes(count) }));
    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.setProperty("--bar-width", `${percentage}%`);
    track.append(fill);
    const meta = document.createElement("p");
    meta.className = "bar-meta";
    meta.textContent = pluralizeVotes(count);
    row.append(label, output, track, meta);
    container.append(row);
  });
}

function animateOfficialScores() {
  if (state.officialAnimated || officialScoreScheduled) return;
  const scores = [...document.querySelectorAll("#revelacao .animated-score[data-final-score]")];
  if (!scores.length) return;

  const revealImmediately = () => {
    scores.forEach((element) => {
      element.querySelector(".score-visual").textContent = element.dataset.finalScore;
      element.classList.add("is-revealed");
    });
    state.officialAnimated = true;
  };

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealImmediately();
    return;
  }

  const beginCount = () => {
    const start = performance.now();
    const duration = 1100;
    scores.forEach((element) => {
      element.classList.add("is-counting");
      element.querySelector(".score-visual").textContent = "0";
    });
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      scores.forEach((element) => {
        const target = Number(element.dataset.finalScore);
        element.querySelector(".score-visual").textContent = String(Math.round(target * eased));
      });
      if (progress < 1) requestAnimationFrame(step);
      else {
        scores.forEach((element) => element.classList.add("is-revealed"));
        state.officialAnimated = true;
      }
    };
    requestAnimationFrame(step);
  };

  const section = document.querySelector("#revelacao");
  const schedule = () => {
    if (officialScoreScheduled) return;
    officialScoreScheduled = true;
    if (matchMedia("(max-width: 860px)").matches) {
      window.setTimeout(beginCount, 1000);
      return;
    }
    beginCount();
  };

  if (!("IntersectionObserver" in window)) {
    schedule();
    return;
  }
  if (officialScoreObserver) return;
  officialScoreObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    officialScoreObserver.disconnect();
    schedule();
  }, { threshold: matchMedia("(max-width: 860px)").matches ? .35 : .15 });
  officialScoreObserver.observe(section);
}

function updateRevealSections() {
  const showClassResults = Boolean(state.control.resultsVisible);
  const showOfficial = state.unavailable || Boolean(state.control.lighthouseVisible);
  elements.classResults.hidden = !showClassResults;
  elements.locked.hidden = showOfficial;
  elements.official.hidden = !showOfficial;

  if (showClassResults) {
    renderBars(elements.bestResults, "bestSite");
    renderBars(elements.worstResults, "worstSite");
  }
  if (showOfficial) requestAnimationFrame(animateOfficialScores);
}

function updateAdminPanel() {
  const panel = elements.adminMount.querySelector(".admin-panel");
  if (!panel) return;

  const { voteStatus, resultsVisible, lighthouseVisible } = state.control;
  const statusDot = panel.querySelector("[data-admin-status-dot]");
  statusDot.className = "status-dot";
  statusDot.classList.add(state.unavailable ? "closed" : voteStatus === "open" ? "open" : voteStatus === "ended" ? "ended" : "closed");
  statusDot.classList.toggle("is-live", !state.unavailable && voteStatus === "open");
  panel.querySelector("[data-admin-status]").textContent = state.unavailable
    ? t("Firebase não configurado")
    : voteStatus === "open" ? t("Votação aberta") : voteStatus === "ended" ? t("Votação encerrada") : t("Votação fechada");
  panel.querySelector("[data-admin-count]").textContent = pluralizeVotes(state.summary.total);
  panel.querySelector("[data-admin-session]").textContent = state.control.sessionId || "-";

  const action = (name) => panel.querySelector(`[data-admin-action="${name}"]`);
  action("open").disabled = state.unavailable || voteStatus !== "closed";
  action("end").disabled = state.unavailable || voteStatus !== "open";
  action("results").disabled = state.unavailable || voteStatus !== "ended" || resultsVisible;
  action("lighthouse").disabled = state.unavailable || !resultsVisible || lighthouseVisible;
  action("new").disabled = state.unavailable || voteStatus === "open";
}

function updateInterface() {
  elements.counter.textContent = pluralizeVotes(state.summary.total);
  updateStatusPresentation();
  updateVotingForm();
  updateRevealSections();
  updateAdminPanel();
}

async function submitVote(event) {
  event.preventDefault();
  elements.feedback.textContent = "";

  if (state.control.voteStatus !== "open") {
    elements.feedback.textContent = t("A votação foi encerrada enquanto você preenchia o formulário.");
    updateVotingForm();
    return;
  }

  const formData = new FormData(elements.form);
  const name = sanitizeName(String(formData.get("name") ?? ""));
  const bestSite = String(formData.get("bestSite") ?? "");
  const worstSite = String(formData.get("worstSite") ?? "");

  if (!name) {
    elements.feedback.textContent = t("Informe seu nome para registrar o palpite.");
    document.querySelector("#participant-name").focus();
    return;
  }
  if (!Object.hasOwn(SITE_NAMES, bestSite) || !Object.hasOwn(SITE_NAMES, worstSite)) {
    elements.feedback.textContent = t("Escolha o site com a melhor e com a pior acessibilidade.");
    return;
  }
  if (bestSite === worstSite) {
    elements.feedback.textContent = t("O mesmo site não pode ser escolhido como melhor e pior.");
    return;
  }

  state.submitting = true;
  setFormEnabled(false);
  const submitButton = elements.form.querySelector("button[type='submit']");
  submitButton.textContent = t("Registrando…");

  try {
    const { db, doc, setDoc, serverTimestamp } = state.firebase;
    const deviceId = getDeviceId();
    const voteReference = doc(db, "sessions", state.control.sessionId, "votes", deviceId);
    await setDoc(voteReference, { name, bestSite, worstSite, createdAt: serverTimestamp() });
    markAsVoted(state.control.sessionId);
    elements.form.reset();
    toast(t("Palpite registrado com sucesso!"));
  } catch (error) {
    const duplicate = error.message === "duplicate-vote" || error.code === "permission-denied" && hasVoted(state.control.sessionId);
    if (duplicate) {
      elements.feedback.textContent = t("Este dispositivo já registrou um voto nesta sessão.");
    } else if (!navigator.onLine) {
      elements.feedback.textContent = t("Sem conexão. Reconecte-se e tente novamente.");
    } else if (error.code === "permission-denied") {
      elements.feedback.textContent = t("O voto não foi aceito. A votação pode ter sido encerrada.");
    } else {
      console.error("Erro ao registrar voto:", error);
      elements.feedback.textContent = t("Não foi possível registrar o voto. Tente novamente.");
    }
  } finally {
    state.submitting = false;
    submitButton.textContent = t("Enviar meu palpite");
    updateInterface();
  }
}

function subscribeToVotes(sessionId) {
  state.votesUnsubscribe?.();
  state.votes = [];
  state.summary = emptySummary();
  if (!sessionId) return;

  const { db, collection, onSnapshot } = state.firebase;
  const votesReference = collection(db, "sessions", sessionId, "votes");
  state.votesUnsubscribe = onSnapshot(votesReference, (snapshot) => {
    state.votes = snapshot.docs.map((vote) => vote.data());
    state.summary = summarizeVotes(state.votes);
    updateInterface();
    publishSummary(sessionId, state.summary);
  }, (error) => {
    console.error("Erro ao acompanhar votos:", error);
    toast(t("A contagem ao vivo foi interrompida. Verifique a conexão."), "error");
  });
}

function summarizeVotes(votes) {
  const summary = emptySummary();
  summary.total = votes.length;
  votes.forEach((vote) => {
    if (Object.hasOwn(summary.best, vote.bestSite)) summary.best[vote.bestSite] += 1;
    if (Object.hasOwn(summary.worst, vote.worstSite)) summary.worst[vote.worstSite] += 1;
  });
  return summary;
}

async function publishSummary(sessionId, summary) {
  const { db, doc, setDoc, serverTimestamp } = state.firebase;
  try {
    await setDoc(doc(db, "sessions", sessionId, "public", "summary"), {
      ...summary,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Erro ao publicar o resumo da votação:", error);
    toast(t("A contagem ao vivo foi interrompida. Verifique a conexão."), "error");
  }
}

function subscribeToSummary(sessionId) {
  state.summaryUnsubscribe?.();
  state.summary = emptySummary();
  if (!sessionId) return;

  const { db, doc, onSnapshot } = state.firebase;
  const summaryReference = doc(db, "sessions", sessionId, "public", "summary");
  state.summaryUnsubscribe = onSnapshot(summaryReference, (snapshot) => {
    state.summary = snapshot.exists() ? { ...emptySummary(), ...snapshot.data() } : emptySummary();
    updateInterface();
  }, (error) => {
    console.error("Erro ao acompanhar o resumo da votação:", error);
    state.summary = emptySummary();
    updateInterface();
  });
}

async function writeControl(patch) {
  const { db, doc, updateDoc, serverTimestamp } = state.firebase;
  try {
    await updateDoc(doc(db, "presentation", "control"), { ...patch, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error("Erro ao atualizar a apresentação:", error);
    toast(t("Não foi possível atualizar a dinâmica."), "error");
  }
}

function buildAdminPanel() {
  if (!state.isAdmin) return;
  const section = document.createElement("section");
  section.className = "admin-panel";
  section.setAttribute("aria-labelledby", "admin-title");
  section.innerHTML = `
    <header><div><p class="eyebrow">Somente no modo apresentador</p><h3 id="admin-title">Controle da dinâmica</h3></div><button class="button button-admin admin-signout" type="button" data-admin-signout>Sair</button></header>
    <div class="admin-stats">
      <div><small>Status</small><strong class="admin-status"><span class="status-dot closed" data-admin-status-dot aria-hidden="true"></span><span data-admin-status>Carregando…</span></strong></div>
      <div><small>Contagem</small><strong data-admin-count>0 votos</strong></div>
      <div><small>Sessão atual</small><strong data-admin-session>-</strong></div>
    </div>
    <div class="admin-actions">
      <button class="button button-admin" type="button" data-admin-action="open">Abrir votação</button>
      <button class="button button-admin" type="button" data-admin-action="end">Encerrar votação</button>
      <button class="button button-admin" type="button" data-admin-action="results">Revelar resultado da turma</button>
      <button class="button button-admin" type="button" data-admin-action="lighthouse">Revelar resultado do Lighthouse</button>
      <button class="button button-danger" type="button" data-admin-action="new">Nova sessão</button>
    </div>
    <div class="confirm-box" data-confirm-box hidden>
      <strong>Tem certeza que deseja iniciar uma nova sessão?</strong>
      <p>Os votos atuais serão preservados no banco, mas deixarão de ser considerados nesta apresentação.</p>
      <div class="admin-actions"><button class="button button-danger" type="button" data-confirm-new>Sim, iniciar nova sessão</button><button class="button button-admin" type="button" data-cancel-new>Cancelar</button></div>
    </div>`;
  elements.adminMount.append(section);

  section.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    const action = button.dataset.adminAction;
    if (action === "open") await writeControl({ voteStatus: "open", resultsVisible: false, lighthouseVisible: false });
    if (action === "end") await writeControl({ voteStatus: "ended" });
    if (action === "results") await writeControl({ resultsVisible: true });
    if (action === "lighthouse") await writeControl({ lighthouseVisible: true });
    if (action === "new") section.querySelector("[data-confirm-box]").hidden = false;
    if (button.hasAttribute("data-cancel-new")) section.querySelector("[data-confirm-box]").hidden = true;
    if (button.hasAttribute("data-confirm-new")) {
      const id = `sessao-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 6)}`;
      section.querySelector("[data-confirm-box]").hidden = true;
      await writeControl({ sessionId: id, voteStatus: "closed", resultsVisible: false, lighthouseVisible: false });
      toast(t("Nova sessão criada. Abra a votação quando estiver pronto."));
    }
  });
}

async function ensureControlDocument() {
  const { db, doc, getDoc, setDoc, serverTimestamp } = state.firebase;
  const reference = doc(db, "presentation", "control");
  const snapshot = await getDoc(reference);
  if (!snapshot.exists()) await setDoc(reference, { ...defaultControl, updatedAt: serverTimestamp() });
}

function subscribeToControl() {
  const { db, doc, onSnapshot } = state.firebase;
  const reference = doc(db, "presentation", "control");
  state.controlUnsubscribe = onSnapshot(reference, (snapshot) => {
    if (!snapshot.exists()) {
      state.control = { ...defaultControl, sessionId: "" };
      updateInterface();
      return;
    }
    const previousSession = state.control.sessionId;
    state.control = { ...defaultControl, ...snapshot.data() };
    const sessionChanged = state.control.sessionId !== previousSession;
    const subscriptionMissing = state.isAdmin ? !state.votesUnsubscribe : !state.summaryUnsubscribe;
    if (sessionChanged || subscriptionMissing) {
      if (state.isAdmin) subscribeToVotes(state.control.sessionId);
      else subscribeToSummary(state.control.sessionId);
    }
    updateInterface();
  }, (error) => {
    console.error("Erro ao acompanhar o controle da apresentação:", error);
    state.unavailable = true;
    updateInterface();
  });
}

export async function setupVoting(firebase) {
  state.firebase = firebase;
  buildAdminPanel();
  elements.form.addEventListener("submit", submitVote);

  window.addEventListener("offline", () => toast(t("Você está sem conexão. A sincronização foi pausada."), "error"));
  window.addEventListener("online", () => toast(t("Conexão restabelecida. A sincronização será retomada.")));
  onLanguageChange(updateInterface);

  if (!firebase) {
    state.unavailable = true;
    console.info("Firebase ainda não configurado. Preencha FIREBASE_CONFIG em js/firebase-config.js.");
    updateInterface();
    return;
  }

  try {
    if (state.isAdmin) await ensureControlDocument();
    subscribeToControl();
  } catch (error) {
    console.error("Falha ao preparar a dinâmica:", error);
    state.unavailable = true;
    updateInterface();
  }
}
