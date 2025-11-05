// app-config.js — seguro aunque no exista firebase en la página

// Config del evento (no depende de Firebase)
const EVENT_ID   = "quiniela-2025";
const CURRENT_WEEK = 10;
const DEADLINE   = new Date("2025-11-06T19:16:00");

// Solo si la página cargó Firebase SDK, inicializamos:
(function initFirebaseSafely(){
  if (typeof window === "undefined") return;
  if (!("firebase" in window)) {
    // En páginas como index.html NO necesitamos Firestore.
    // Deja db como null y listo.
    window.db = null;
    return;
  }
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

// Helpers de path (solo funcionan cuando db existe)
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

// (Opcional) Google Sheets
const WEB_APP_URL   = 'https://script.google.com/macros/s/AKfycbz2wM5MZNizXIt-A_q_bU9TQC7f16Qo4kMyTH1W6lutRrezJni7dXZGaGxH31OqJ6J-/exec';
const SHARED_SECRET = 'quiniela-picks';