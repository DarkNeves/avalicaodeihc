// A configuração do projeto foi removida do código versionado.
export const FIREBASE_CONFIG = {};

const SDK_VERSION = "12.16.0";
const REQUIRED_CONFIG_FIELDS = ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"];

export const isFirebaseConfigured = () =>
  REQUIRED_CONFIG_FIELDS.every((field) => typeof FIREBASE_CONFIG[field] === "string" && FIREBASE_CONFIG[field].trim());

export async function connectFirebase({ includeAuth = false } = {}) {
  if (!isFirebaseConfigured()) return null;

  try {
    const [appModule, firestoreModule, authModule] = await Promise.all([
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-app.js`),
      import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-firestore.js`),
      includeAuth ? import(`https://www.gstatic.com/firebasejs/${SDK_VERSION}/firebase-auth.js`) : null,
    ]);
    const app = appModule.initializeApp(FIREBASE_CONFIG);
    const db = firestoreModule.getFirestore(app);
    const auth = authModule ? authModule.getAuth(app) : null;
    return { app, auth, authApi: authModule, db, ...firestoreModule };
  } catch (error) {
    console.error("Não foi possível iniciar o Firebase.", error);
    return null;
  }
}
