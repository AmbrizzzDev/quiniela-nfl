//! Conexion a la base de datos de Firebase
const EVENT_ID   = "quiniela-2025";
const CURRENT_WEEK = 12;
const DEADLINE   = new Date("2025-11-20T19:16:00");

// Solo si la página cargó Firebase SDK, inicializamos:
(function initFirebaseSafely(){
  if (typeof window === "undefined") return;
  if (!("firebase" in window)) {
    window.db = null;
    return;
  }
  //* Configuracion de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyA3jb-tEWLui0dapNhjRHiLIbVT-i9YtII",
    authDomain: "quiniela-picks.firebaseapp.com",
    projectId: "quiniela-picks",
    storageBucket: "quiniela-picks.firebasestorage.app",
    messagingSenderId: "150833467380",
    appId: "1:150833467380:web:c32373eaa6bb5805dd33a1"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
})();

function normName(s){ return String(s || '').trim().toUpperCase(); }
function picksDoc(fullName, week = CURRENT_WEEK){
  if (!window.db) throw new Error("Firestore no disponible en esta página.");
  return db.doc(`events/${EVENT_ID}/weeks/${week}/picks/${normName(fullName)}`);
}
function flashUserDoc(fullName, week = CURRENT_WEEK){
  if (!window.db) throw new Error("Firestore no disponible en esta página.");
  return db.doc(`events/${EVENT_ID}/weeks/${week}/flashPicks/${normName(fullName)}`);
}
function flashLockDoc(qId, optId, week = CURRENT_WEEK){
  if (!window.db) throw new Error("Firestore no disponible en esta página.");
  return db.doc(`events/${EVENT_ID}/weeks/${week}/flashLocks/${qId}/options/${optId}`);
}

//! Conexion al script de Google Apps Script
const WEB_APP_URL   = 'https://script.google.com/macros/s/AKfycbwkcOOvxchu6ZdLI77OfVI_3e7q-5KrR9sZoIl_ur_rrFnL2qUEf3SzR9jtWyUMXQk0/exec';
const SHARED_SECRET = 'quiniela-picks';