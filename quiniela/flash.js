checkDeadlineAndMaybeBlock();

const u = requireUserOrRedirect();
if (!u) throw new Error("No user");
const fullName = u.fullName;


$("#userName").textContent = fullName;
$("#weekLabel").textContent = `Semana ${CURRENT_WEEK}`;

// --- Kickoff helpers & edit-deadline logic ---
function _parseKickoff(v){
  if (!v) return null;
  const t = new Date(v).getTime();
  return Number.isFinite(t) ? t : null;
}


const FLASH_QUESTIONS = [
  {
    id: "q1-qb",
    text: "¿Qué quarterback lanzará más yardas esta semana?",
    blockable: true,
    type: "select",
    options: [
      { id: "jones", label: "Mac Jones (49ers)", kickoff: "2025-11-09T15:25:00" },
      { id: "williams", label: "Caleb Williams (Bears)", kickoff: "2025-11-09T12:00:00" },
      { id: "allen", label: "Josh Allen (Bills)", kickoff: "2025-11-09T12:00:00" },
      { id: "nix", label: "Bo Nix (Broncos)", kickoff: "2025-11-06T19:15:00" },
      { id: "gabriel", label: "Dillon Gabriel (Browns)", kickoff: "2025-11-09T12:00:00" },
      { id: "mayfield", label: "Baker Mayfield (Buccaneers)", kickoff: "2025-11-09T12:00:00" },
      { id: "murray", label: "Kyler Murray (Cardinals)", kickoff: "2025-11-09T15:05:00" },
      { id: "herbert", label: "Justin Herbert (Chargers)", kickoff: "2025-11-09T19:20:00" },
      { id: "daniel-jones", label: "Daniel Jones (Colts)", kickoff: "2025-11-09T08:30:00" },
      { id: "daniels", label: "Jayden Daniels (Commanders)", kickoff: "2025-11-09T15:25:00" },
      { id: "tagovailoa", label: "Tua Tagovailoa (Dolphins)", kickoff: "2025-11-09T12:00:00" },
      { id: "hurts", label: "Jalen Hurts (Eagles)", kickoff: "2025-11-10T19:25:00" },
      { id: "penix", label: "Michael Penix Jr. (Falcons)", kickoff: "2025-11-09T08:30:00" },
      { id: "dart", label: "Jaxson Dart (Giants)", kickoff: "2025-11-09T12:00:00" },
      { id: "lawrence", label: "Trevor Lawrence (Jaguars)", kickoff: "2025-11-09T12:00:00" },
      { id: "fields", label: "Justin Fields (Jets)", kickoff: "2025-11-09T12:00:00" },
      { id: "goff", label: "Jared Goff (Lions)", kickoff: "2025-11-09T15:25:00" },
      { id: "love", label: "Jordan Love (Packers)", kickoff: "2025-11-10T19:25:00" },
      { id: "young", label: "Bryce Young (Panthers)", kickoff: "2025-11-09T12:00:00" },
      { id: "maye", label: "Drake Maye (Patriots)", kickoff: "2025-11-09T12:00:00" },
      { id: "smith", label: "Geno Smith (Raiders)", kickoff: "2025-11-06T19:15:00" },
      { id: "stafford", label: "Matthew Stafford (Rams)", kickoff: "2025-11-09T15:25:00" },
      { id: "jackson", label: "Lamar Jackson (Ravens)", kickoff: "2025-11-09T12:00:00" },
      { id: "rattler", label: "Spencer Rattler (Saints)", kickoff: "2025-11-09T12:00:00" },
      { id: "darnold", label: "Sam Darnold (Seahawks)", kickoff: "2025-11-09T15:05:00" },
      { id: "rodgers", label: "Aaron Rodgers (Steelers)", kickoff: "2025-11-09T19:20:00" },
      { id: "stroud", label: "C.J. Stroud (Texans)", kickoff: "2025-11-09T12:00:00" },
      { id: "wentz", label: "Carson Wentz (Vikings)", kickoff: "2025-11-09T12:00:00" }
    ]
  },
  {
    id: "q2-ot",
    text: "¿Habrá algún partido que se vaya a tiempo extra?",
    blockable: false,
    type: "select",
    options: [
      { id: "si", label: "Sí", kickoff: "2025-11-06T19:15:00" },
      { id: "no", label: "No", kickoff: "2025-11-06T19:15:00" }
    ]
  },
  {
    id: "q3-team-points",
    text: "¿Qué equipo anotará más puntos en toda la jornada?",
    blockable: true,
    type: "select",
    options: [
      { id: "49ers", label: "San Francisco 49ers", kickoff: "2025-11-09T15:25:00" },
      { id: "bears", label: "Chicago Bears", kickoff: "2025-11-09T12:00:00" },
      { id: "bills", label: "Buffalo Bills", kickoff: "2025-11-09T12:00:00" },
      { id: "broncos", label: "Denver Broncos", kickoff: "2025-11-06T19:15:00" },
      { id: "browns", label: "Cleveland Browns", kickoff: "2025-11-09T12:00:00" },
      { id: "buccaneers", label: "Tampa Bay Buccaneers", kickoff: "2025-11-09T12:00:00" },
      { id: "cardinals", label: "Arizona Cardinals", kickoff: "2025-11-09T15:05:00" },
      { id: "chargers", label: "Los Angeles Chargers", kickoff: "2025-11-09T19:20:00" },
      { id: "colts", label: "Indianapolis Colts", kickoff: "2025-11-09T08:30:00" },
      { id: "commanders", label: "Washington Commanders", kickoff: "2025-11-09T15:25:00" },
      { id: "dolphins", label: "Miami Dolphins", kickoff: "2025-11-09T12:00:00" },
      { id: "eagles", label: "Philadelphia Eagles", kickoff: "2025-11-10T19:25:00" },
      { id: "falcons", label: "Atlanta Falcons", kickoff: "2025-11-09T08:30:00" },
      { id: "giants", label: "New York Giants", kickoff: "2025-11-09T12:00:00" },
      { id: "jaguars", label: "Jacksonville Jaguars", kickoff: "2025-11-09T12:00:00" },
      { id: "jets", label: "New York Jets", kickoff: "2025-11-09T12:00:00" },
      { id: "lions", label: "Detroit Lions", kickoff: "2025-11-09T15:25:00" },
      { id: "packers", label: "Green Bay Packers", kickoff: "2025-11-10T19:25:00" },
      { id: "panthers", label: "Carolina Panthers", kickoff: "2025-11-09T12:00:00" },
      { id: "patriots", label: "New England Patriots", kickoff: "2025-11-09T12:00:00" },
      { id: "raiders", label: "Las Vegas Raiders", kickoff: "2025-11-06T19:15:00" },
      { id: "rams", label: "Los Angeles Rams", kickoff: "2025-11-09T15:25:00" },
      { id: "ravens", label: "Baltimore Ravens", kickoff: "2025-11-09T12:00:00" },
      { id: "saints", label: "New Orleans Saints", kickoff: "2025-11-09T12:00:00" },
      { id: "seahawks", label: "Seattle Seahawks", kickoff: "2025-11-09T15:05:00" },
      { id: "steelers", label: "Pittsburgh Steelers", kickoff: "2025-11-09T19:20:00" },
      { id: "texans", label: "Houston Texans", kickoff: "2025-11-09T12:00:00" },
      { id: "vikings", label: "Minnesota Vikings", kickoff: "2025-11-09T12:00:00" }
    ]
  },
  {
    id: "q4-rb",
    text: "¿Qué corredor tendrá más yardas terrestres esta semana?",
    blockable: true,
    type: "select",
    options: [
      { id: "mccaffrey", label: "Christian McCaffrey (49ers)", kickoff: "2025-11-09T15:25:00" },
      { id: "swift", label: "D'Andre Swift (Bears)", kickoff: "2025-11-09T12:00:00" },
      { id: "cook", label: "James Cook III (Bills)", kickoff: "2025-11-09T12:00:00" },
      { id: "dobbins", label: "J.K. Dobbins (Broncos)", kickoff: "2025-11-06T19:15:00" },
      { id: "judkins", label: "Quinshon Judkins (Browns)", kickoff: "2025-11-09T12:00:00" },
      { id: "white", label: "Rachaad White (Buccaneers)", kickoff: "2025-11-09T12:00:00" },
      { id: "emari", label: "Emari Demercado (Cardinals)", kickoff: "2025-11-09T15:05:00" },
      { id: "hampton", label: "Omarion Hampton (Chargers)", kickoff: "2025-11-09T19:20:00" },
      { id: "taylor", label: "Jonathan Taylor (Colts)", kickoff: "2025-11-09T08:30:00" },
      { id: "croskey-merritt", label: "Jacory Croskey-Merritt (Commanders)", kickoff: "2025-11-09T15:25:00" },
      { id: "achane", label: "De'Von Achane (Dolphins)", kickoff: "2025-11-09T12:00:00" },
      { id: "barkley", label: "Saquon Barkley (Eagles)", kickoff: "2025-11-10T19:25:00" },
      { id: "robinson", label: "Bijan Robinson (Falcons)", kickoff: "2025-11-09T08:30:00" },
      { id: "singletary", label: "Devin Singletary (Giants)", kickoff: "2025-11-09T12:00:00" },
      { id: "etienne", label: "Travis Etienne Jr. (Jaguars)", kickoff: "2025-11-09T12:00:00" },
      { id: "hall", label: "Breece Hall (Jets)", kickoff: "2025-11-09T12:00:00" },
      { id: "gibbs", label: "Jahmyr Gibbs (Lions)", kickoff: "2025-11-09T15:25:00" },
      { id: "jacobs", label: "Josh Jacobs (Packers)", kickoff: "2025-11-10T19:25:00" },
      { id: "dowdle", label: "Rico Dowdle (Panthers)", kickoff: "2025-11-09T12:00:00" },
      { id: "henderson", label: "Treveyon Henderson (Patriots)", kickoff: "2025-11-09T12:00:00" },
      { id: "jeanty", label: "Ashton Jeanty (Raiders)", kickoff: "2025-11-06T19:15:00" },
      { id: "williams", label: "Kyren Williams (Rams)", kickoff: "2025-11-09T15:25:00" },
      { id: "henry", label: "Derrick Henry (Ravens)", kickoff: "2025-11-09T12:00:00" },
      { id: "kamara", label: "Alvin Kamara (Saints)", kickoff: "2025-11-09T12:00:00" },
      { id: "walker", label: "Kenneth Walker III (Seahawks)", kickoff: "2025-11-09T15:05:00" },
      { id: "warren", label: "Jaylen Warren (Steelers)", kickoff: "2025-11-09T19:20:00" },
      { id: "chubb", label: "Nick Chubb (Texans)", kickoff: "2025-11-09T12:00:00" },
      { id: "jones", label: "Aaron Jones SR. (Vikings)", kickoff: "2025-11-09T12:00:00" },
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
    // (deadline badge removed)
    container.appendChild(card);

    const sel = card.querySelector(`#sel-${q.id}`);
    const oth = card.querySelector(`#oth-${q.id}`);
    const lockInfo = card.querySelector(`#lock-${q.id}`);
    const err = card.querySelector(`#err-${q.id}`);


    sel.onchange = async () => {
      err.style.display = "none";
      const optId = sel.value;

      // Prevent changing once your selected game's kickoff has started (per-option lock)
      const prevAns = flashAnswers[q.id];
      if (prevAns?.optionId){
        const prevOpt = (q.options || []).find(o => o.id === prevAns.optionId);
        const prevKick = _parseKickoff(prevOpt?.kickoff);
        if (prevKick && Date.now() >= prevKick){
          err.textContent = "No puedes editar: el partido de tu selección ya comenzó.";
          err.style.display = "block";
          sel.value = prevAns.optionId; // revert to previous
          return;
        }
      }

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
      // If during interaction the selected kickoff is reached, freeze this question
      setTimeout(() => {
        const current = (q.options || []).find(o => o.id === (flashAnswers[q.id]?.optionId));
        const lockAt = _parseKickoff(current?.kickoff);
        if (lockAt && Date.now() >= lockAt){
          sel.disabled = true;
          if (oth) oth.disabled = true;
        }
      }, 0);
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
        // Freeze if the saved selection's kickoff already passed
        if (sel && ans?.optionId){
          const prevOpt = (q.options || []).find(o => o.id === ans.optionId);
          const prevKick = _parseKickoff(prevOpt?.kickoff);
          if (prevKick && Date.now() >= prevKick){
            sel.disabled = true;
            if (oth) oth.disabled = true;
            const errEl = document.getElementById(`err-${q.id}`);
            if (errEl){
              errEl.textContent = "Esta pregunta ya no se puede editar: tu selección ya empezó.";
              errEl.style.display = "block";
            }
          }
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