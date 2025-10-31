const CURRENT_WEEK = 9;
const WEEK_LABEL = `Semana ${CURRENT_WEEK}`;
const GAMES = [
  { id: "Ravens vs Dolphins", away: "Ravens", home: "Dolphins" },
  { id: "Bears vs Bengals", away: "Bears", home: "Bengals" },
  { id: "Vikings vs Lions", away: "Vikings",  home: "Lions" },
  { id: "Panthers vs Packers", away: "Panthers", home: "Packers" },
  { id: "Chargers vs Titans", away: "Chargers",     home: "Titans" },
  { id: "Falcons vs Patriots", away: "Falcons",  home: "Patriots" },
  { id: "49ers vs Giants", away: "49ers",    home: "Giants" },
  { id: "Colts vs Steelers", away: "Colts",     home: "Steelers" },
  { id: "Broncos vs Texans", away: "Broncos",     home: "Texans" },
  { id: "Jaguars vs Raiders", away: "Jaguars",     home: "Raiders" },
  { id: "Saints vs Rams", away: "Saints",     home: "Rams" },
  { id: "Chiefs vs Bills", away: "Chiefs",     home: "Bills" },
  { id: "Seahwaks vs Commanders", away: "Seahawks",     home: "Commanders" },
  { id: "Cardinals vs Cowboys", away: "Cardinals",     home: "Cowboys" },
];

const TEAM_LOGOS = {
  "Cowboys":"https://a.espncdn.com/i/teamlogos/nfl/500/dal.png",
  "Giants":"https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png",
  "Eagles":"https://a.espncdn.com/i/teamlogos/nfl/500/phi.png",
  "Commanders":"https://a.espncdn.com/i/teamlogos/nfl/500/wsh.png",
  "Chiefs":"https://a.espncdn.com/i/teamlogos/nfl/500/kc.png",
  "Broncos":"https://a.espncdn.com/i/teamlogos/nfl/500/den.png",
  "Dolphins":"https://a.espncdn.com/i/teamlogos/nfl/500/mia.png",
  "Jets":"https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png",
  "49ers":"https://a.espncdn.com/i/teamlogos/nfl/500/sf.png",
  "Seahawks":"https://a.espncdn.com/i/teamlogos/nfl/500/sea.png",
  "Bengals":"https://a.espncdn.com/i/teamlogos/nfl/500/cin.png",
  "Steelers":"https://a.espncdn.com/i/teamlogos/nfl/500/pit.png",
  "Bills":"https://a.espncdn.com/i/teamlogos/nfl/500/buf.png",
  "Patriots":"https://a.espncdn.com/i/teamlogos/nfl/500/ne.png",
  "Rams":"https://a.espncdn.com/i/teamlogos/nfl/500/lar.png",
  "Cardinals":"https://a.espncdn.com/i/teamlogos/nfl/500/ari.png",
  "Falcons":"https://a.espncdn.com/i/teamlogos/nfl/500/atl.png",
  "Browns":"https://a.espncdn.com/i/teamlogos/nfl/500/cle.png",
  "Lions":"https://a.espncdn.com/i/teamlogos/nfl/500/det.png",
  "Panthers":"https://a.espncdn.com/i/teamlogos/nfl/500/car.png",
  "Chargers":"https://a.espncdn.com/i/teamlogos/nfl/500/lac.png",
  "Buccaneers":"https://a.espncdn.com/i/teamlogos/nfl/500/tb.png",
  "Saints":"https://a.espncdn.com/i/teamlogos/nfl/500/no.png",
  "Vikings":"https://a.espncdn.com/i/teamlogos/nfl/500/min.png",
  "Titans":"https://a.espncdn.com/i/teamlogos/nfl/500/ten.png",
  "Colts":"https://a.espncdn.com/i/teamlogos/nfl/500/ind.png",
  "Jaguars":"https://a.espncdn.com/i/teamlogos/nfl/500/jax.png",
  "Ravens":"https://a.espncdn.com/i/teamlogos/nfl/500/bal.png",
  "Bears":"https://a.espncdn.com/i/teamlogos/nfl/500/chi.png",
  "Raiders":"https://a.espncdn.com/i/teamlogos/nfl/500/lv.png",
  "Packers":"https://a.espncdn.com/i/teamlogos/nfl/500/gb.png",
  "Texans":"https://a.espncdn.com/i/teamlogos/nfl/500/hou.png",
  "Broncos":"https://a.espncdn.com/i/teamlogos/nfl/500/den.png"
};


function teamLogo(name){ return TEAM_LOGOS[name] || null; }
const initials = n => n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();

const picks = new Map();
const entries = [];
let fullName = "";
let lastSavedEntry = null;

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const gamesEl = $("#games");
const doneEl = $("#done");
const totalEl = $("#total");
const barEl = $("#bar");
const weekLabelEl = $("#weekLabel");
const greetingEl = $("#greeting");

function updateProgress(){
  const done = picks.size;
  const total = GAMES.length;
  doneEl.textContent = done;
  totalEl.textContent = total;
  barEl.style.width = (100 * done / Math.max(1,total)) + "%";
  $("#save").disabled = done !== total;
  $("#err2").classList.remove("show");
}

const DEADLINE = new Date("2025-10-30T18:35:00"); // fecha y hora límite

function checkDeadline(){
  const now = new Date();
  if(now >= DEADLINE){
    // Bloquea toda la app
    document.querySelector("#step1").innerHTML = `
    <div class="closed-message">
      <h1>Quiniela cerrada</h1>
      <p>Ya no se pueden registrar ni modificar picks.</p>
    </div>`;
    document.querySelector("#step2").remove();
  }
}

checkDeadline();

function gameItem(g){
  const wrap = document.createElement("div");
  wrap.className = "game";
  wrap.dataset.id = g.id;

  const teams = document.createElement("div");
  teams.className = "teams";
  const away = document.createElement("div");
  away.className = "team";
  away.innerHTML = `${teamLogo(g.away) ? `<img class="logo-img" src="${teamLogo(g.away)}" alt="${g.away} logo" loading="lazy">` : `<div class="logo">${initials(g.away)}</div>`}<div class="name">${g.away}</div>`;
  const mid  = document.createElement("div");
  mid.className="vs"; mid.textContent="VS";
  const home = document.createElement("div");
  home.className = "team";
  home.innerHTML = `<div class="name">${g.home}</div>${teamLogo(g.home) ? `<img class="logo-img" src="${teamLogo(g.home)}" alt="${g.home} logo" loading="lazy">` : `<div class="logo">${initials(g.home)}</div>`}`;
  teams.append(away, mid, home);

  const pick = document.createElement("div"); 
  pick.className = "pick";


  const bA = document.createElement("button"); 
  bA.className="chip"; 
  bA.textContent = g.away; 
  bA.setAttribute("aria-pressed","false");

  const bT = document.createElement("button"); 
  bT.className="chip"; 
  bT.textContent = "Empate"; 
  bT.setAttribute("aria-pressed","false");

  const bH = document.createElement("button"); 
  bH.className="chip"; 
  bH.textContent = g.home; 
  bH.setAttribute("aria-pressed","false");

  function select(side){
    picks.set(g.id, side);
    bA.dataset.active = side==="away";
    bT.dataset.active = side==="tie";
    bH.dataset.active = side==="home";
    bA.setAttribute("aria-pressed", side==="away");
    bT.setAttribute("aria-pressed", side==="tie");
    bH.setAttribute("aria-pressed", side==="home");
    updateProgress();
  }

  bA.addEventListener("click", ()=>select("away"));
  bT.addEventListener("click", ()=>select("tie"));
  bH.addEventListener("click", ()=>select("home"));

  if (picks.has(g.id)) {
    const side = picks.get(g.id);
    bA.dataset.active = side==="away";
    bT.dataset.active = side==="tie";
    bH.dataset.active = side==="home";
    bA.setAttribute("aria-pressed", side==="away");
    bT.setAttribute("aria-pressed", side==="tie");
    bH.setAttribute("aria-pressed", side==="home");
  }

  pick.append(bA, bT, bH);
  wrap.append(teams, pick);
  return wrap;
}

// ---- 🎯 JUGADA ESPECIAL ---- //
let specialGame = null;
let specialWinner = null;
let specialRange = null;

function renderSpecialPick() {
  const sel = document.querySelector("#specialGame");
  const winnerContainer = document.querySelector("#specialWinner");
  const rangeContainer = document.querySelector("#specialRange");
  const rangeBtns = rangeContainer.querySelectorAll(".chip");

  // Crea o reutiliza labels informativos
  let winnerLabel = document.querySelector("#specialWinnerLabel");
  if (!winnerLabel) {
    winnerLabel = document.createElement("div");
    winnerLabel.id = "specialWinnerLabel";
    winnerLabel.className = "sp-label";
    winnerLabel.textContent = "Elige un ganador";
    winnerContainer.parentNode.insertBefore(winnerLabel, winnerContainer);
  }

  let rangeLabel = document.querySelector("#specialRangeLabel");
  if (!rangeLabel) {
    rangeLabel = document.createElement("div");
    rangeLabel.id = "specialRangeLabel";
    rangeLabel.className = "sp-label";
    rangeLabel.textContent = "Elige la diferencia de puntos";
    rangeContainer.parentNode.insertBefore(rangeLabel, rangeContainer);
  }

  // Ocultar al inicio
  winnerLabel.style.display = "none";
  winnerContainer.style.display = "none";
  rangeLabel.style.display = "none";
  rangeContainer.style.display = "none";

  // Llenar selector de partidos
  sel.innerHTML = `<option value="">Selecciona un partido</option>`;
  GAMES.forEach(g => {
    sel.innerHTML += `<option value="${g.id}">${g.away} vs ${g.home}</option>`;
  });

  // Cuando seleccionan un partido
  sel.addEventListener("change", () => {
    specialGame = sel.value;
    specialWinner = null;
    specialRange = null;
    winnerContainer.innerHTML = "";

    // Si no eligió nada, ocultar todo
    if (!specialGame) {
      winnerLabel.style.display = "none";
      winnerContainer.style.display = "none";
      rangeLabel.style.display = "none";
      rangeContainer.style.display = "none";
      return;
    }

    // Buscar los equipos del partido elegido
    const game = GAMES.find(g => g.id === specialGame);
    if (!game) return;

    // Crear los botones de ganador
    const awayBtn = document.createElement("button");
    awayBtn.className = "chip";
    awayBtn.textContent = game.away;
    awayBtn.onclick = () => selectSpecialWinner(game.away, awayBtn);

    const homeBtn = document.createElement("button");
    homeBtn.className = "chip";
    homeBtn.textContent = game.home;
    homeBtn.onclick = () => selectSpecialWinner(game.home, homeBtn);

    winnerContainer.append(awayBtn, homeBtn);

    // Mostrar label y botones de ganador
    winnerLabel.style.display = "block";
    winnerContainer.style.display = "grid";

    // Ocultar rango hasta que elijan ganador
    rangeLabel.style.display = "none";
    rangeContainer.style.display = "none";
  });

  // Cuando elige ganador, mostrar rangos
  function selectSpecialWinner(team, btn) {
    specialWinner = team;
    document.querySelectorAll("#specialWinner .chip").forEach(b => b.dataset.active = false);
    btn.dataset.active = true;

    // Mostrar label + rangos
    rangeLabel.style.display = "block";
    rangeContainer.style.display = "grid";
  }

  // Guardar función global
  window.selectSpecialWinner = selectSpecialWinner;

  // Selección de rango
  rangeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      specialRange = btn.dataset.range;
      rangeBtns.forEach(b => b.dataset.active = false);
      btn.dataset.active = true;
    });
  });

  
  // Cuando elige ganador, mostrar rangos
  function selectSpecialWinner(team, btn) {
    specialWinner = team;
    document.querySelectorAll("#specialWinner .chip").forEach(b => b.dataset.active = false);
    btn.dataset.active = true;
    rangeContainer.style.display = "grid"; // mostrar los rangos
  }

  // Guardar función global
  window.selectSpecialWinner = selectSpecialWinner;

  // Selección de rango
  rangeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      specialRange = btn.dataset.range;
      rangeBtns.forEach(b => b.dataset.active = false);
      btn.dataset.active = true;
    });
  });
}

document.addEventListener("change", e => {
  if (e.target.id === "specialGame") specialGame = e.target.value;
});

document.querySelectorAll("#rangeSelect .chip").forEach(btn => {
  btn.addEventListener("click", () => {
    specialRange = btn.dataset.range;
    document.querySelectorAll("#rangeSelect .chip").forEach(b => b.dataset.active = false);
    btn.dataset.active = true;
  });
});


$("#startBtn").addEventListener("click", async ()=>{
  const nombre = $("#nombre").value.trim();
  let inicial = $("#inicial").value.trim();
  const ok = nombre.length >= 2 && /^[a-z]$/i.test(inicial);
  if(!ok){ $("#err1").classList.add("show"); return; }
  $("#err1").classList.remove("show");
  inicial = inicial.toUpperCase();
  fullName = `${nombre} ${inicial}.`;

  picks.clear();
  try {
    const cloud = await loadFromCloud(fullName, CURRENT_WEEK);
    if (cloud && Array.isArray(cloud.picks)) {
      for (const g of GAMES) {
        const found = cloud.picks.find(p => p.id === g.id);
        if (!found) continue;
        const side =
          found.winner === g.away ? "away" :
          found.winner === g.home ? "home" : "tie";
        picks.set(g.id, side);
      }
    
      // --- carga jugada especial si existe ---
      if (cloud.specialPick) {
        specialGame = cloud.specialPick.game || null;
        specialWinner = cloud.specialPick.winner || null;
        specialRange = cloud.specialPick.range || null;
      } else {
        specialGame = null;
        specialWinner = null;
        specialRange = null;
      }
    
      greetingEl.textContent = `Hola, ${fullName}`;
    }else {
      greetingEl.textContent = `Hola, ${fullName}`;
    }
  } catch {
    greetingEl.textContent = `Hola, ${fullName}`;
  }

  $("#step1").classList.remove("active");
  $("#step2").classList.add("active");
  renderGames();
  renderSpecialPick();
});

function renderGames(){
  weekLabelEl.textContent = WEEK_LABEL;
  gamesEl.innerHTML = "";
  GAMES.forEach(g=>gamesEl.appendChild(gameItem(g)));
  updateProgress();
}

$("#startBtn").addEventListener("click", ()=>{
  const nombre = $("#nombre").value.trim();
  let inicial = $("#inicial").value.trim();
  const ok = nombre.length >= 2 && /^[a-z]$/i.test(inicial);
  if(!ok){ $("#err1").classList.add("show"); return; }
  $("#err1").classList.remove("show");
  inicial = inicial.toUpperCase();
  fullName = `${nombre} ${inicial}.`;
  greetingEl.textContent = `Hola, ${fullName}`;
  $("#step1").classList.remove("active");
  $("#step2").classList.add("active");
  renderGames();
  renderSpecialPick();
});

$("#reset").addEventListener("click", ()=>{ picks.clear(); renderGames(); });

const overlay = $("#overlay");
const confMsg = $("#confMsg");

function openSheet(){ overlay.classList.add("show"); }
function closeSheet(){ overlay.classList.remove("show"); }

$("#save").addEventListener("click", ()=>{
  if(picks.size !== GAMES.length){ 
    $("#err2").classList.add("show"); 
    return; 
  }

  confMsg.textContent = `${fullName} tus selecciones fueron registradas. ¡Suerte!`;

  lastSavedEntry = {
  fullName,
  week: CURRENT_WEEK,
  picks: GAMES.map(g => {
  const side = picks.get(g.id);
  return {
    id: g.id,
    winner: side === "away" ? g.away : side === "home" ? g.home : "Empate"
  };
  }),
  specialPick: {
  game: specialGame,
  winner: specialWinner,
  range: specialRange
}
};

saveToCloud(lastSavedEntry).catch(console.error);
syncToSheet(lastSavedEntry);

openSheet();
playSaveAnim();
});

const normName = s => String(s || '').trim().toUpperCase();

async function saveToCloud(entry){
  const docId = normName(entry.fullName);
  const ref = db.doc(`events/${EVENT_ID}/weeks/${entry.week}/picks/${docId}`);
  await ref.set({
    fullName: entry.fullName,
    week: entry.week,
    picks: entry.picks,
    specialPick: entry.specialPick || null, 
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

async function loadFromCloud(fullName, week){
  const docId = normName(fullName);
  const ref = db.doc(`events/${EVENT_ID}/weeks/${week}/picks/${docId}`);
  const snap = await ref.get();
  return snap.exists ? snap.data() : null;
}

function playSaveAnim(){
  const svg = document.querySelector('.check');
  if(!svg) return;
  svg.classList.remove('play');
  void svg.offsetWidth;
  svg.classList.add('play');
}

overlay.addEventListener("click", (e)=>{ if(e.target===overlay) closeSheet(); });

$("#addAnother").addEventListener("click", ()=>{
  if (lastSavedEntry) entries.push(lastSavedEntry);
  picks.clear(); $("#nombre").value=""; $("#inicial").value=""; fullName="";
  $("#step2").classList.remove("active");
  $("#step1").classList.add("active");
  closeSheet();
});

$("#editPicks").addEventListener("click", ()=>{ closeSheet();});

["#nombre","#inicial"].forEach(sel=>{
  $(sel).addEventListener("keydown", e=>{ if(e.key==="Enter") $("#startBtn").click(); });
});


const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzjHg0Ug-UwgO7IwgK0MIqHNu367W8gaVlN2DSgZ-vvMD8a7G4FNckOFY6iBXdAogPO/exec';
const SHARED_SECRET = 'quiniela-picks';

async function syncToSheet(entry){
  const payload = {
    secret: SHARED_SECRET,
    fullName: entry.fullName,
    week: entry.week,           
    picks: entry.picks,
    specialPick: entry.specialPick || null      
  };
  try {
    await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',        
      body: JSON.stringify(payload)
    });
  } catch (e) {
    console.warn('Sync Sheets falló:', e);
  }
}