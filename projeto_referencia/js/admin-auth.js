const ADMIN_PATH = "/admisrael98839";

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

export function isAdminRoute() {
  return normalizePath(location.pathname) === ADMIN_PATH;
}

export async function setupAdminAccess(firebase, onAuthorized) {
  if (!isAdminRoute()) return;

  const root = document.documentElement;
  const gate = document.querySelector("#admin-access");
  const loading = gate.querySelector("[data-admin-loading]");
  const login = gate.querySelector("[data-admin-login]");
  const denied = gate.querySelector("[data-admin-denied]");
  const feedback = gate.querySelector("[data-admin-login-feedback]");
  const submit = login.querySelector("button[type='submit']");
  let authorized = false;
  let authResolved = false;

  const lockPage = () => {
    root.classList.add("admin-route", "admin-auth-pending");
    gate.hidden = false;
  };

  const showOnly = (element) => {
    loading.hidden = element !== loading;
    login.hidden = element !== login;
    denied.hidden = element !== denied;
  };

  const showLogin = () => {
    lockPage();
    showOnly(login);
    feedback.textContent = "";
    login.querySelector("#admin-email").focus();
  };

  const showDenied = () => {
    lockPage();
    showOnly(denied);
    denied.querySelector("[data-admin-signout]").focus();
  };

  const showLoading = () => {
    lockPage();
    showOnly(loading);
  };

  const revealAdmin = async () => {
    if (authorized) return;
    authorized = true;
    await onAuthorized();
    gate.hidden = true;
    root.classList.remove("admin-route", "admin-auth-pending");
  };

  lockPage();
  showOnly(loading);

  if (!firebase?.auth || !firebase?.authApi) {
    feedback.textContent = "Serviço de autenticação indisponível.";
    showOnly(login);
    return;
  }

  const { auth, authApi, db, doc, getDoc } = firebase;
  const { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword, signOut } = authApi;

  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.error("Não foi possível preparar a sessão administrativa:", error);
  }

  login.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.textContent = "";
    submit.disabled = true;
    submit.textContent = "Entrando…";

    const email = login.elements.email.value.trim();
    const password = login.elements.password.value;

    try {
      showLoading();
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      showOnly(login);
      feedback.textContent = "E-mail ou senha incorretos.";
      login.elements.password.focus();
    } finally {
      login.elements.password.value = "";
      submit.disabled = false;
      submit.textContent = "Entrar";
    }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-signout]");
    if (!button) return;
    button.disabled = true;
    showLoading();
    try {
      await signOut(auth);
    } finally {
      location.replace(ADMIN_PATH);
    }
  });

  const authTimeout = window.setTimeout(() => {
    if (!authResolved) showLogin();
  }, 3000);

  onAuthStateChanged(auth, async (user) => {
    authResolved = true;
    window.clearTimeout(authTimeout);
    if (!user) {
      authorized = false;
      showLogin();
      return;
    }

    showLoading();
    try {
      const adminSnapshot = await getDoc(doc(db, "admins", user.uid));
      if (!adminSnapshot.exists() || adminSnapshot.data().active !== true) {
        showDenied();
        return;
      }
      await revealAdmin();
    } catch (error) {
      if (error?.code !== "permission-denied") console.error("Falha ao validar autorização administrativa:", error);
      showDenied();
    }
  }, (error) => {
    authResolved = true;
    window.clearTimeout(authTimeout);
    console.error("Falha ao verificar a sessão administrativa:", error);
    feedback.textContent = "Serviço de autenticação indisponível.";
    showOnly(login);
  });
}
