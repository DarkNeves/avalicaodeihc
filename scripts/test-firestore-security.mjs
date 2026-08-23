import assert from "node:assert/strict";

const projectId = process.env.GCLOUD_PROJECT || "farol-da-acessibilidade";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST;
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

if (!firestoreHost || !authHost) {
  throw new Error("Execute este teste com os emuladores do Firestore e Authentication.");
}

const documentsBase = `http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents`;
const commitUrl = `http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents:commit`;

const fields = {
  string: (stringValue) => ({ stringValue }),
  bool: (booleanValue) => ({ booleanValue }),
  int: (integerValue) => ({ integerValue: String(integerValue) }),
  map: (mapFields) => ({ mapValue: { fields: mapFields } }),
};

async function signUp(email) {
  const response = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=emulator`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Test-only-strong-password-123!", returnSecureToken: true }),
  });
  assert.equal(response.status, 200, `Falha ao criar usuário de teste: ${await response.text()}`);
  return response.json();
}

function authorization(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getDocument(path, token) {
  return fetch(`${documentsBase}/${path}`, { headers: authorization(token) });
}

async function listDocuments(path, token) {
  return fetch(`${documentsBase}/${path}`, { headers: authorization(token) });
}

async function commit(path, documentFields, token, serverTimestampField, exists) {
  const write = {
    update: {
      name: `projects/${projectId}/databases/(default)/documents/${path}`,
      fields: documentFields,
    },
  };
  if (serverTimestampField) {
    write.updateTransforms = [{ fieldPath: serverTimestampField, setToServerValue: "REQUEST_TIME" }];
  }
  if (typeof exists === "boolean") write.currentDocument = { exists };

  return fetch(commitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authorization(token) },
    body: JSON.stringify({ writes: [write] }),
  });
}

function controlFields(voteStatus) {
  return {
    sessionId: fields.string("security-session"),
    voteStatus: fields.string(voteStatus),
    resultsVisible: fields.bool(voteStatus === "ended"),
    lighthouseVisible: fields.bool(false),
  };
}

function summaryFields(total = 1) {
  return {
    total: fields.int(total),
    best: fields.map({ govbr: fields.int(total), mercadolivre: fields.int(0), equipe: fields.int(0) }),
    worst: fields.map({ govbr: fields.int(0), mercadolivre: fields.int(total), equipe: fields.int(0) }),
  };
}

function expectAllowed(response, label) {
  assert.ok(response.ok, `${label}: esperado permitido, recebido HTTP ${response.status}`);
}

function expectDenied(response, label) {
  assert.equal(response.status, 403, `${label}: esperado HTTP 403, recebido ${response.status}`);
}

const admin = await signUp("admin-test@example.com");
const regular = await signUp("regular-test@example.com");

expectAllowed(await commit(`admins/${admin.localId}`, { active: fields.bool(true) }, "owner", null, false), "seed ACL admin");
expectAllowed(await commit("presentation/control", controlFields("open"), "owner", "updatedAt", false), "seed controle");

expectAllowed(await getDocument("presentation/control"), "público lê estado da apresentação");
expectDenied(await commit("presentation/control", controlFields("ended"), null, "updatedAt", true), "público altera controle");

const votePath = "sessions/security-session/votes/device-1234567890abcdef";
const voteFields = {
  name: fields.string("Participante"),
  bestSite: fields.string("govbr"),
  worstSite: fields.string("mercadolivre"),
};
expectAllowed(await commit(votePath, voteFields, null, "createdAt", false), "público vota durante sessão aberta");
expectDenied(await getDocument(votePath), "público lê voto individual");
expectDenied(await listDocuments("sessions/security-session/votes"), "público lista votos");
expectDenied(await getDocument(votePath, regular.idToken), "usuário comum lê voto");
expectDenied(await commit("presentation/control", controlFields("ended"), regular.idToken, "updatedAt", true), "usuário comum altera controle");

expectAllowed(await getDocument(`admins/${admin.localId}`, admin.idToken), "admin lê sua autorização");
expectAllowed(await getDocument(votePath, admin.idToken), "admin lê voto");
expectAllowed(await listDocuments("sessions/security-session/votes", admin.idToken), "admin lista votos");
expectAllowed(await commit("presentation/control", controlFields("ended"), admin.idToken, "updatedAt", true), "admin encerra votação");
expectDenied(await commit(votePath, { ...voteFields, name: fields.string("Alterado") }, admin.idToken, "createdAt", true), "admin altera voto imutável");
expectDenied(await commit(`admins/${regular.localId}`, { active: fields.bool(true) }, admin.idToken, null, false), "cliente concede privilégio admin");

const summaryPath = "sessions/security-session/public/summary";
expectAllowed(await commit(summaryPath, summaryFields(), admin.idToken, "updatedAt", false), "admin publica resumo anônimo");
expectAllowed(await getDocument(summaryPath), "público lê resumo anônimo");
expectDenied(await commit(summaryPath, summaryFields(2), regular.idToken, "updatedAt", true), "usuário comum altera resumo");

const invalidSummary = summaryFields(2);
invalidSummary.best = fields.map({ govbr: fields.int(1), mercadolivre: fields.int(0), equipe: fields.int(0) });
expectDenied(await commit(summaryPath, invalidSummary, admin.idToken, "updatedAt", true), "admin envia resumo inconsistente");

console.log("Security Rules: 16 cenários aprovados.");
