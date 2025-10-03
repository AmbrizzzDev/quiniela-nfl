const CURRENT_WEEK = 5;
const WEEK_LABEL = `Semana ${CURRENT_WEEK}`;
const GAMES = [
  { id: "49ers vs Rams", away: "49ers", home: "Rams" },
  { id: "Vikings vs Browns", away: "Vikings",  home: "Browns" },
  { id: "Raiders vs Colts", away: "Raiders",  home: "Colts" },
  { id: "Giants vs Saints", away: "Giants",home: "Saints" },
  { id: "Cowboys vs Jets", away: "Cowboys",   home: "Jets" },
  { id: "Broncos vs Eagles", away: "Broncos",  home: "Eagles" },
  { id: "Dolphins vs Panthers", away: "Dolphins",    home: "Panthers" },
  { id: "Texans vs Ravens", away: "Texans",     home: "Ravens" },
  { id: "Titans vs Cardinals", away: "Titans",     home: "Cardinals" },
  { id: "Buccaneers vs Seahawks", away: "Buccaneers",     home: "Seahawks" },
  { id: "Lions vs Bengals", away: "Lions",     home: "Bengals" },
  { id: "Commanders vs Chargers", away: "Commanders",     home: "Chargers" },
  { id: "Patriots vs Bills", away: "Patriots",     home: "Bills" },
  { id: "Chiefs vs Jaguars", away: "Chiefs",     home: "Jaguars" },
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

const DEADLINE = new Date("2025-10-02T18:45:00"); // fecha y hora límite

function checkDeadline(){
  const now = new Date();
  if(now >= DEADLINE){
    // Bloquea toda la app
    document.querySelector("#step1").innerHTML = `
    <div class="closed-message">
      <h1>Quiniela cerrada</h1>
      <p>Ya no se pueden registrar ni modificar picks.</p>
    </div>`;
    document.querySelector("#step2").remove(); // opcional: quita el paso 2
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
      greetingEl.textContent = `Hola, ${fullName}`;
    } else {
      greetingEl.textContent = `Hola, ${fullName}`;
    }
  } catch {
    greetingEl.textContent = `Hola, ${fullName}`;
  }

  $("#step1").classList.remove("active");
  $("#step2").classList.add("active");
  renderGames();
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
})
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


const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwcJvKSP1o00zGGI9-HBDuyoF8y_ev0QSFnE8j_YNV5XVILfkPzp-fPaB_4fwhceR9N/exec';
const SHARED_SECRET = 'quiniela-picks';

async function syncToSheet(entry){
  const payload = {
    secret: SHARED_SECRET,
    fullName: entry.fullName,
    week: entry.week,           
    picks: entry.picks          
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