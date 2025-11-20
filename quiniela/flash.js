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
    id: "q1-qb-int",
    text: "¿Qué quarterback (QB) será más interceptado?",
    blockable: true,
    type: "select",
    options: [
    { id: "B. Purdy",       label: "Brock Purdy (49ers)", kickoff: null },
    { id: "C. Williams",    label: "Caleb Williams (Bears)", kickoff: null },
    { id: "J. Burrow",      label: "Joe Burrow (Bengals)", kickoff: null },
    { id: "J. Allen",       label: "Josh Allen (Bills)", kickoff: null },
    { id: "S. Sanders",     label: "Shedeur Sanders (Browns)", kickoff: null },
    { id: "B. Mayfield",    label: "Baker Mayfield (Buccaneers)", kickoff: null },
    { id: "J. Brissett",    label: "Jacoby Brissett (Cardinals)", kickoff: null },
    { id: "P. Mahomes",     label: "Patrick Mahomes (Chiefs)", kickoff: null },
    { id: "D. Jones",       label: "Daniel Jones (Colts)", kickoff: null },
    { id: "D. Prescott",    label: "Dak Prescott (Cowboys)", kickoff: null },
    { id: "J. Hurts",       label: "Jalen Hurts (Eagles)", kickoff: null },
    { id: "K. Cousins",     label: "Kirk Cousins (Falcons)", kickoff: null },
    { id: "J. Dart",        label: "Jaxson Dart (Giants)", kickoff: null },
    { id: "T. Lawrence",    label: "Trevor Lawrence (Jaguars)", kickoff: null },
    { id: "T. Taylor",      label: "Tyrod Taylor (Jets)", kickoff: null },
    { id: "J. Goff",        label: "Jared Goff (Lions)", kickoff: null },
    { id: "J. Love",        label: "Jordan Love (Packers)", kickoff: null },
    { id: "B. Young",       label: "Bryce Young (Panthers)", kickoff: null },
    { id: "D. Maye",        label: "Drake Maye (Patriots)", kickoff: null },
    { id: "G. Smith",       label: "Geno Smith (Raiders)", kickoff: null },
    { id: "M. Stafford",    label: "Matthew Stafford (Rams)", kickoff: null },
    { id: "L. Jackson",     label: "Lamar Jackson (Ravens)", kickoff: null },
    { id: "T. Shough",      label: "Tyler Shough (Saints)", kickoff: null },
    { id: "S. Darnold",     label: "Sam Darnold (Seahawks)", kickoff: null },
    { id: "M. Rudolph",     label: "Mason Rudolph (Steelers)", kickoff: null },
    { id: "D. Mills",       label: "Davis Mills (Texans)", kickoff: null },
    { id: "C. Ward",        label: "Cam Ward (Titans)", kickoff: null },
    { id: "J. McCarthy",    label: "J.J. McCarthy (Vikings)", kickoff: null },
    ]
  },
  {
    id: "q2-safety",
    text: "¿Habrá algún safety?",
    blockable: false,
    type: "select",
    options: [
      { id: "Sí", label: "Sí", kickoff: null },
      { id: "No", label: "No", kickoff: null }
    ]
  },
  {
    id: "q3-qb-sacks",
    text: "¿A cual quarterback (QB) se le harán más sacks?",
    blockable: true,
    type: "select",
    options: [
      { id: "B. Purdy",       label: "Brock Purdy (49ers)", kickoff: null },
      { id: "C. Williams",    label: "Caleb Williams (Bears)", kickoff: null },
      { id: "J. Burrow",      label: "Joe Burrow (Bengals)", kickoff: null },
      { id: "J. Allen",       label: "Josh Allen (Bills)", kickoff: null },
      { id: "S. Sanders",     label: "Shedeur Sanders (Browns)", kickoff: null },
      { id: "B. Mayfield",    label: "Baker Mayfield (Buccaneers)", kickoff: null },
      { id: "J. Brissett",    label: "Jacoby Brissett (Cardinals)", kickoff: null },
      { id: "P. Mahomes",     label: "Patrick Mahomes (Chiefs)", kickoff: null },
      { id: "D. Jones",       label: "Daniel Jones (Colts)", kickoff: null },
      { id: "D. Prescott",    label: "Dak Prescott (Cowboys)", kickoff: null },
      { id: "J. Hurts",       label: "Jalen Hurts (Eagles)", kickoff: null },
      { id: "K. Cousins",     label: "Kirk Cousins (Falcons)", kickoff: null },
      { id: "J. Dart",        label: "Jaxson Dart (Giants)", kickoff: null },
      { id: "T. Lawrence",    label: "Trevor Lawrence (Jaguars)", kickoff: null },
      { id: "T. Taylor",      label: "Tyrod Taylor (Jets)", kickoff: null },
      { id: "J. Goff",        label: "Jared Goff (Lions)", kickoff: null },
      { id: "J. Love",        label: "Jordan Love (Packers)", kickoff: null },
      { id: "B. Young",       label: "Bryce Young (Panthers)", kickoff: null },
      { id: "D. Maye",        label: "Drake Maye (Patriots)", kickoff: null },
      { id: "G. Smith",       label: "Geno Smith (Raiders)", kickoff: null },
      { id: "M. Stafford",    label: "Matthew Stafford (Rams)", kickoff: null },
      { id: "L. Jackson",     label: "Lamar Jackson (Ravens)", kickoff: null },
      { id: "T. Shough",      label: "Tyler Shough (Saints)", kickoff: null },
      { id: "S. Darnold",     label: "Sam Darnold (Seahawks)", kickoff: null },
      { id: "M. Rudolph",     label: "Mason Rudolph (Steelers)", kickoff: null },
      { id: "D. Mills",       label: "Davis Mills (Texans)", kickoff: null },
      { id: "C. Ward",        label: "Cam Ward (Titans)", kickoff: null },
      { id: "J. McCarthy",    label: "J.J. McCarthy (Vikings)", kickoff: null },
    ]
  },
  {
    id: "q4-team-flags",
    text: "¿Cual equipo tendra más castigos?",
    blockable: true,
    type: "select",
    options: [
      { id: "49ers", label: "San Francisco 49ers", kickoff: null },
      { id: "Bears", label: "Chicago Bears", kickoff: null },
      { id: "Bengals", label: "Cincinnati Bengals", kickoff: null },
      { id: "Bills", label: "Buffalo Bills", kickoff: null },
      { id: "Browns", label: "Cleveland Browns", kickoff: null },
      { id: "Buccaneers", label: "Tampa Bay Buccaneers", kickoff: null },
      { id: "Cardinals", label: "Arizona Cardinals", kickoff: null },
      { id: "Cowboys", label: "Kansas City Chiefs", kickoff: null },
      { id: "Colts", label: "Indianapolis Colts", kickoff: null },
      { id: "Dallas", label: "Dallas Cowboys", kickoff: null },
      { id: "Eagles", label: "Philadelphia Eagles", kickoff: null },
      { id: "Falcons", label: "Atlanta Falcons", kickoff: null },
      { id: "Giants", label: "New York Giants", kickoff: null },
      { id: "Jaguars", label: "Jacksonville Jaguars", kickoff: null },
      { id: "Jets", label: "New York Jets", kickoff: null },
      { id: "Lions", label: "Detroit Lions", kickoff: null },
      { id: "Packers", label: "Green Bay Packers", kickoff: null },
      { id: "Panthers", label: "Carolina Panthers", kickoff: null },
      { id: "Patriots", label: "New England Patriots", kickoff: null },
      { id: "Raiders", label: "Las Vegas Raiders", kickoff: null },
      { id: "Rams", label: "Los Angeles Rams", kickoff: null },
      { id: "Ravens", label: "Baltimore Ravens", kickoff: null },
      { id: "Saints", label: "New Orleans Saints", kickoff: null },
      { id: "Seahawks", label: "Seattle Seahawks", kickoff: null },
      { id: "Steelers", label: "Pittsburgh Steelers", kickoff: null },
      { id: "Texans", label: "Houston Texans", kickoff: null },
      { id: "Titans", label: "Tennessee Titans", kickoff: null },
      { id: "Vikings", label: "Minnesota Vikings", kickoff: null }
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
    // 1) (Opcional) Guardar en Firestore — ya lo tenías
    await flashUserDoc(fullName).set({
      fullName,
      week: CURRENT_WEEK,
      answers: flashAnswers,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // 2) 🔥 IMPORTANTE: Enviar a Google Sheets (Web App)
    fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // no esperamos respuesta, solo disparamos
      body: JSON.stringify({
        secret: SHARED_SECRET,
        fullName,
        week: CURRENT_WEEK,
        answers: flashAnswers
      })
    });

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

$("#gototable").addEventListener("click", ()=>{
  window.location.href = "tablapicks.html";
});