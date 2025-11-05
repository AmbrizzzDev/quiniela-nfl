checkDeadlineAndMaybeBlock();

const u = requireUserOrRedirect();
if (!u) throw new Error("No user");
const fullName = u.fullName;

$("#userName").textContent = fullName;
$("#weekLabel").textContent = `Semana ${CURRENT_WEEK}`;

// ⚡ Configura tus preguntas aquí.
// Usa blockable: true/false por PREGUNTA.
// - true: se bloquea a nivel global (nadie más puede elegir la misma opción).
// - false: no hay bloqueo (ideal para Sí/No, conteos, etc.)
const FLASH_QUESTIONS = [
  {
    id: "q1-qb",
    text: "¿Qué quarterback lanzará más yardas esta semana?",
    blockable: true,   // <<— bloqueable
    type: "select",
    options: [
      { id: "jackson", label: "Lamar Jackson (Ravens)", kickoff: null },
      { id: "darnold", label: "Sam Darnold (Seahawks)", kickoff: null },
      { id: "maye", label: "Drake Maye (Patriots)", kickoff: null },
      { id: "love", label: "Jordan Love (Packers)", kickoff: null },
      { id: "jones", label: "Daniel Jones (Colts)", kickoff: null },
      { id: "herbert", label: "Justin Herbert (Chargers)", kickoff: null },
      { id: "hurts", label: "Jalen Hurts (Eagles)", kickoff: null },
      { id: "stafford", label: "Matthew Stafford (Rams)", kickoff: null },
      { id: "allen", label: "Josh Allen (Bills)", kickoff: null },
      { id: "stroud", label: "C.J. Stroud (Texans)", kickoff: null },
      { id: "goff", label: "Jared Goff (Lions)", kickoff: null },
      { id: "jones", label: "Mac Jones (49ers)", kickoff: null },
      { id: "mayfield", label: "Baker Mayfield (Buccaneers)", kickoff: null },
      { id: "dart", label: "Jaxson Dart (Giants)", kickoff: null },
      { id: "nix", label: "Bo Nix (Broncos)", kickoff: null },
      { id: "penix", label: "Michael Penix Jr. (Falcons)", kickoff: null },
      { id: "williams", label: "Caleb Williams (Bears)", kickoff: null },
      { id: "rodgers", label: "Aaron Rodgers (Steelers)", kickoff: null },
      { id: "daniels", label: "Jayden Daniels (Commanders)", kickoff: null },
      { id: "rattler", label: "Spencer Rattler (Saints)", kickoff: null },
      { id: "young", label: "Bryce Young (Panthers)", kickoff: null },
      { id: "murray", label: "Kyler Murray (Cardinals)", kickoff: null },
      { id: "lawrence", label: "Trevor Lawrence (Jaguars)", kickoff: null },
      { id: "tagovailoa", label: "Tua Tagovailoa (Dolphins)", kickoff: null },
      { id: "wentz", label: "Carson Wentz (Vikings)", kickoff: null },
      { id: "smith", label: "Geno Smith (Raiders)", kickoff: null },
      { id: "fields", label: "Justin Fields (Jets)", kickoff: null },
      { id: "gabriel", label: "Dillon Gabriel (Browns)", kickoff: null },
    ]
  },
  {
    id: "q2-ot",
    text: "¿Habrá algún partido que se vaya a tiempo extra?",
    blockable: false,  // <<— NO bloqueable (Sí/No)
    type: "select",
    options: [
      { id: "si", label: "Sí", kickoff: null },
      { id: "no", label: "No", kickoff: null }
    ]
  },
  {
    id: "q3-team-points",
    text: "¿Qué equipo anotará más puntos en toda la jornada?",
    blockable: true,
    type: "select",
    options: [
      { id: "bills", label: "Buffalo Bills", kickoff: null },
      { id: "colts", label: "Indianapolis Colts", kickoff: null },
      { id: "bears", label: "Chicago Bears", kickoff: null },
      { id: "chargers", label: "Los Angeles Chargers", kickoff: null },
      { id: "rams", label: "Los Angeles Rams", kickoff: null },
      { id: "packers", label: "Green Bay Packers", kickoff: null },
      { id: "seahawks", label: "Seattle Seahawks", kickoff: null },
      { id: "49ers", label: "San Francisco 49ers", kickoff: null },
      { id: "lions", label: "Detroit Lions", kickoff: null },
      { id: "patriots", label: "New England Patriots", kickoff: null },
      { id: "broncos", label: "Denver Broncos", kickoff: null },
      { id: "jaguars", label: "Jacksonville Jaguars", kickoff: null },
      { id: "falcons", label: "Atlanta Falcons", kickoff: null },
      { id: "commanders", label: "Washington Commanders", kickoff: null },
      { id: "buccaneers", label: "Tampa Bay Buccaneers", kickoff: null },
      { id: "giants", label: "New York Giants", kickoff: null },
      { id: "texans", label: "Houston Texans", kickoff: null },
      { id: "ravens", label: "Baltimore Ravens", kickoff: null },
      { id: "cardinals", label: "Arizona Cardinals", kickoff: null },
      { id: "panthers", label: "Carolina Panthers", kickoff: null },
      { id: "eagles", label: "Philadelphia Eagles", kickoff: null },
      { id: "jets", label: "New York Jets", kickoff: null },
      { id: "vikings", label: "Minnesota Vikings", kickoff: null },
      { id: "dolphins", label: "Miami Dolphins", kickoff: null },
      { id: "steelers", label: "Pittsburgh Steelers", kickoff: null },
      { id: "saints", label: "New Orleans Saints", kickoff: null },
      { id: "raiders", label: "Las Vegas Raiders", kickoff: null },
      { id: "browns", label: "Cleveland Browns", kickoff: null },
    ]
  },
  {
    id: "q4-team-most-points",
    text: "¿Qué corredor tendrá más yardas terrestres esta semana?",
    blockable: true,
    type: "select",
    options: [
      { id: "taylor", label: "Jonathan Taylor (Colts)", kickoff: null },
      { id: "cook", label: "James Cook III (Bills)", kickoff: null },
      { id: "dowdle", label: "Rico Dowdle (Panthers)", kickoff: null },
      { id: "williams", label: "Javonte Williams (Cowboys)", kickoff: null },
      { id: "dobbins", label: "J.K. Dobbins (Broncos)", kickoff: null },
      { id: "henry", label: "Derrick Henry (Ravens)", kickoff: null },
      { id: "achane", label: "De'Von Achane (Dolphins)", kickoff: null },
      { id: "etienne", label: "Travis Etienne Jr. (Jaguars)", kickoff: null },
      { id: "mccaffrey", label: "Christian McCaffrey (49ers)", kickoff: null },
      { id: "robinson", label: "Bijan Robinson (Falcons)", kickoff: null },
      { id: "williams", label: "Kyren Williams (Rams)", kickoff: null },
      { id: "hall", label: "Breece Hall (Jets)", kickoff: null },
      { id: "gibbs", label: "Jahmyr Gibbs (Lions)", kickoff: null },
      { id: "jacobs", label: "Josh Jacobs (Packers)", kickoff: null },
      { id: "barkley", label: "Saquon Barkley (Eagles)", kickoff: null },
      { id: "jeanty", label: "Ashton Jeanty (Raiders)", kickoff: null },
      { id: "judkins", label: "Quinshon Judkins (Browns)", kickoff: null },
      { id: "pollard", label: "Tony Pollard (Titans)", kickoff: null },
      { id: "walker", label: "Kenneth Walker III (Seahawks)", kickoff: null },
      { id: "swift", label: "D'Andre Swift (Bears)", kickoff: null },
      { id: "croskey-merritt", label: "Jacory Croskey-Merritt (Commanders)", kickoff: null },
      { id: "brown", label: "Chase Brown (Bengals)", kickoff: null },
      { id: "singletary", label: "Devin Singletary (Giants)", kickoff: null },
      { id: "warren", label: "Jaylen Warren (Steelers)", kickoff: null },
      { id: "montgomery", label: "David Montgomery (Lions)", kickoff: null },
      { id: "kamara", label: "Alvin Kamara (Saints)", kickoff: null },
      { id: "chubb", label: "Nick Chubb (Texans)", kickoff: null },
      { id: "hampton", label: "Omarion Hampton (Chargers)", kickoff: null },
      { id: "white", label: "Rachaad White (Buccaneers)", kickoff: null },
      { id: "henderson", label: "Treveyon Henderson (Patriots)", kickoff: null },
      { id: "emari", label: "Emari Demercado (Cardinals)", kickoff: null },
    ]
  }
];

let flashAnswers = {}; // { [qId]: { optionId, otherText? } }

function renderFlashForm(){
  const container = $("#flashForm");
  container.innerHTML = "";

  FLASH_QUESTIONS.forEach(q => {
    const card = document.createElement("div");
    card.className = "flash-q";
    card.innerHTML = `
      <div class="flash-row">
        <label>${q.text}</label>
        <span class="flash-help">${q.blockable ? "Bloqueable globalmente." : "No bloqueable."}</span>
      </div>
      <div class="flash-row ${q.type==='select' ? 'inline' : ''}">
        <select class="flash-input" id="sel-${q.id}" aria-label="${q.text}">
          <option value="">Selecciona...</option>
          ${q.options.map(o => `<option value="${o.id}">${o.label}</option>`).join("")}
        </select>
        ${q.options.some(o=>o.allowOther) ? `<input type="text" class="flash-input" id="oth-${q.id}" placeholder="Especifica el jugador/equipo" style="display:none">` : ``}
      </div>
      <div class="flash-lock" id="lock-${q.id}" style="${q.blockable ? '' : 'display:none'}"></div>
      <span class="err" id="err-${q.id}" style="display:none"></span>
    `;
    container.appendChild(card);

    const sel = card.querySelector(`#sel-${q.id}`);
    const oth = card.querySelector(`#oth-${q.id}`);
    const lockInfo = card.querySelector(`#lock-${q.id}`);
    const err = card.querySelector(`#err-${q.id}`);

    sel.onchange = async () => {
      err.style.display = "none";
      const optId = sel.value;

      // Mostrar/ocultar input Otro
      if (oth) {
        oth.style.display = optId === "otro" ? "block" : "none";
        if (optId !== "otro") oth.value = "";
      }

      if (!optId) {
        // si era bloqueable y tenías lock, lo soltamos
        if (q.blockable) await releaseFlashLock(q.id);
        flashAnswers[q.id] = undefined;
        if (lockInfo) lockInfo.textContent = "";
        return;
      }

      // Kickoff opcional por opción
      const opt = (q.options || []).find(o => o.id === optId);
      if (opt?.kickoff) {
        const now = Date.now();
        const ko = new Date(opt.kickoff).getTime();
        if (Number.isFinite(ko) && now >= ko) {
          err.textContent = "Esa opción ya inició su juego. Elige otra.";
          err.style.display = "block";
          sel.value = "";
          return;
        }
      }

      // Si es bloqueable, intentamos tomar lock
      if (q.blockable) {
        try{
          await takeFlashLockTransaction(q.id, optId);
          if (lockInfo) lockInfo.textContent = `Reservada por: ${fullName}`;
        }catch(e){
          err.textContent = e.message || "Opción no disponible.";
          err.style.display = "block";
          sel.value = "";
          return;
        }
      }

      // Guarda elección local
      flashAnswers[q.id] = { optionId: optId };
      if (optId === "otro" && oth) {
        flashAnswers[q.id].otherText = (oth.value || "").trim();
      }
    };
  });

  // Pre-carga (si existían respuestas)
  (async function preload(){
    try{
      const snap = await flashUserDoc(fullName).get();
      if (!snap.exists) return;
      flashAnswers = snap.data().answers || {};
      FLASH_QUESTIONS.forEach(q=>{
        const ans = flashAnswers[q.id];
        if (!ans) return;
        const sel = document.getElementById(`sel-${q.id}`);
        const oth = document.getElementById(`oth-${q.id}`);
        if (sel) sel.value = ans.optionId || "";
        if (oth && ans.optionId==="otro"){
          oth.style.display = "block";
          oth.value = ans.otherText || "";
        }
      });
    }catch(e){ console.warn(e); }
  })();

  // Cargar estado de bloqueos (solo si hay bloqueables)
  refreshLocksBadges();
}

renderFlashForm();

async function refreshLocksBadges(){
  // Si no hay ninguna bloqueable, salimos
  if (!FLASH_QUESTIONS.some(q => q.blockable)) return;

  for (const q of FLASH_QUESTIONS.filter(x=>x.blockable)) {
    const span = document.getElementById(`lock-${q.id}`);
    if (!span) continue;
    try{
      const colRef = db.collection(`events/${EVENT_ID}/weeks/${CURRENT_WEEK}/flashLocks/${q.id}/options`);
      const snap = await colRef.get();
      const taken = [];
      snap.forEach(d => {
        const data = d.data();
        taken.push({ optId: d.id, by: data.selectedByName || data.selectedBy });
      });
      span.textContent = taken.length
        ? "Bloqueadas: " + taken.map(t => t.optId).join(", ")
        : "Sin bloqueos por ahora.";
    }catch(e){ span.textContent = ""; }
  }
}

async function takeFlashLockTransaction(qId, optId){
  const docRef = flashLockDoc(qId, optId);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    if (snap.exists) {
      const data = snap.data();
      if (normName(data.selectedBy) !== normName(fullName)) {
        throw new Error(`Bloqueado por ${data.selectedByName || data.selectedBy}.`);
      }
      return;
    }
    tx.set(docRef, {
      selectedBy: normName(fullName),
      selectedByName: fullName,
      selectedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  });

  // Si cambió de opción en la misma pregunta, libera la anterior
  const prev = flashAnswers[qId]?.optionId;
  if (prev && prev !== optId) await releaseFlashLock(qId, prev);
}

async function releaseFlashLock(qId, optId){
  const current = optId || flashAnswers[qId]?.optionId;
  if (!current) return;
  const docRef = flashLockDoc(qId, current);
  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(docRef);
      if (!snap.exists) return;
      const data = snap.data();
      if (normName(data.selectedBy) === normName(fullName)) tx.delete(docRef);
    });
  } catch {}
}

// Guardar
$("#saveFlash").addEventListener("click", async ()=>{
  const msg = $("#flashMsg");
  msg.classList.remove("show");
  msg.style.display = "none";

  // Validación simple
  for (const q of FLASH_QUESTIONS) {
    const ans = flashAnswers[q.id];
    if (!ans || !ans.optionId) {
      msg.textContent = "Te falta contestar alguna pregunta.";
      msg.classList.add("show"); msg.style.display = "block"; return;
    }
    if (ans.optionId === "otro" && !(ans.otherText || "").trim()) {
      msg.textContent = "Especifica el jugador/equipo en la opción 'Otro'.";
      msg.classList.add("show"); msg.style.display = "block"; return;
    }
  }

  try{
    await flashUserDoc(fullName).set({
      fullName,
      week: CURRENT_WEEK,
      answers: flashAnswers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    // Feedback
    msg.style.display = "none";
    const btn = $("#saveFlash");
    btn.textContent = "¡Guardado!";
    setTimeout(()=>btn.textContent="Guardar encuesta", 1200);
  }catch(e){
    msg.textContent = "No se pudo guardar. Intenta de nuevo.";
    msg.classList.add("show"); msg.style.display = "block";
  }
});

// Limpiar
$("#resetFlash").addEventListener("click", async ()=>{
  // Libera locks de las bloqueables que tengan respuesta
  for (const q of FLASH_QUESTIONS){
    if (!q.blockable) continue;
    if (flashAnswers[q.id]?.optionId) await releaseFlashLock(q.id, flashAnswers[q.id].optionId);
  }
  flashAnswers = {};
  renderFlashForm();
});