checkDeadlineAndMaybeBlock();

const u = requireUserOrRedirect();
if (!u) throw new Error("No user");
const fullName = u.fullName;

$("#userName").textContent = fullName;
$("#weekLabel").textContent = `Semana ${CURRENT_WEEK}`;

const picks = new Map();
let specialGame = null, specialWinner = null, specialRange = null;

const gamesEl = $("#games");
const doneEl = $("#done");
const totalEl = $("#total");
const barEl = $("#bar");

function updateProgress(){
  const done = picks.size;
  const total = GAMES.length;
  doneEl.textContent = done;
  totalEl.textContent = total;
  barEl.style.width = (100 * done / Math.max(1,total)) + "%";
  $("#save").disabled = done !== total;
  $("#err2").classList.remove("show");
}

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

  const bA = document.createElement("button"); bA.className="chip"; bA.textContent = g.away; bA.setAttribute("aria-pressed","false");
  const bT = document.createElement("button"); bT.className="chip"; bT.textContent = "Empate"; bT.setAttribute("aria-pressed","false");
  const bH = document.createElement("button"); bH.className="chip"; bH.textContent = g.home; bH.setAttribute("aria-pressed","false");

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

  pick.append(bA, bT, bH);
  wrap.append(teams, pick);
  return wrap;
}

function renderGames(){
  gamesEl.innerHTML = "";
  GAMES.forEach(g=>gamesEl.appendChild(gameItem(g)));
  updateProgress();
}
renderGames();

// Jugada especial
function renderSpecialPick() {
  const sel = $("#specialGame");
  const winnerContainer = $("#specialWinner");
  const rangeContainer = $("#specialRange");

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

  winnerLabel.style.display = "none";
  winnerContainer.style.display = "none";
  rangeLabel.style.display = "none";
  rangeContainer.style.display = "none";

  sel.innerHTML = `<option value="">Selecciona un partido</option>`;
  GAMES.forEach(g => sel.innerHTML += `<option value="${g.id}">${g.away} vs ${g.home}</option>`);

  sel.onchange = () => {
    specialGame = sel.value;
    specialWinner = null;
    specialRange = null;
    winnerContainer.innerHTML = "";
    if (!specialGame) {
      winnerLabel.style.display = "none";
      winnerContainer.style.display = "none";
      rangeLabel.style.display = "none";
      rangeContainer.style.display = "none";
      return;
    }
    const game = GAMES.find(g => g.id === specialGame);
    if (!game) return;

    const awayBtn = document.createElement("button");
    awayBtn.className = "chip";
    awayBtn.textContent = game.away;
    awayBtn.onclick = () => selectSpecialWinner(game.away, awayBtn);

    const homeBtn = document.createElement("button");
    homeBtn.className = "chip";
    homeBtn.textContent = game.home;
    homeBtn.onclick = () => selectSpecialWinner(game.home, homeBtn);

    winnerContainer.append(awayBtn, homeBtn);
    winnerLabel.style.display = "block";
    winnerContainer.style.display = "grid";
  };

  function selectSpecialWinner(team, btn) {
    specialWinner = team;
    document.querySelectorAll("#specialWinner .chip").forEach(b => b.dataset.active = false);
    btn.dataset.active = true;
    rangeLabel.style.display = "block";
    rangeContainer.style.display = "grid";
  }

  rangeContainer.querySelectorAll(".chip").forEach(btn => {
    btn.onclick = () => {
      specialRange = btn.dataset.range;
      rangeContainer.querySelectorAll(".chip").forEach(b => b.dataset.active = false);
      btn.dataset.active = true;
    };
  });
}
renderSpecialPick();

// Cargar guardado
(async function loadExisting(){
  try{
    const snap = await picksDoc(fullName).get();
    if (snap.exists){
      const data = snap.data();
      (data.picks || []).forEach(p => {
        const g = GAMES.find(x => x.id === p.id);
        if (!g) return;
        const side = p.winner === g.away ? "away" :
                     p.winner === g.home ? "home" : "tie";
        picks.set(g.id, side);
      });
      if (data.specialPick){
        specialGame = data.specialPick.game || null;
        specialWinner = data.specialPick.winner || null;
        specialRange = data.specialPick.range || null;
        if (specialGame){
          $("#specialGame").value = specialGame;
          $("#specialGame").dispatchEvent(new Event("change"));
          // Marca winner & range
          $$("#specialWinner .chip").forEach(b => {
            if (b.textContent === specialWinner) b.dataset.active = true;
          });
          $$("#specialRange .chip").forEach(b => {
            if (b.dataset.range === (specialRange||"")) b.dataset.active = true;
          });
        }
      }
      // pinta botones de cada juego
      $$("#games .game").forEach(el => {
        const id = el.dataset.id;
        const side = picks.get(id);
        if (!side) return;
        const chips = el.querySelectorAll(".chip");
        chips[0].dataset.active = side==="away";
        chips[1].dataset.active = side==="tie";
        chips[2].dataset.active = side==="home";
      });
      updateProgress();
    }
  }catch(e){ console.warn(e); }
})();

// Guardar
$("#save").addEventListener("click", async ()=>{
  if (picks.size !== GAMES.length){
    $("#err2").classList.add("show");
    return;
  }
  const entry = {
    fullName,
    week: CURRENT_WEEK,
    picks: GAMES.map(g=>{
      const side = picks.get(g.id);
      return {
        id: g.id,
        winner: side==="away" ? g.away : side==="home" ? g.home : "Empate"
      };
    }),
    specialPick: {
      game: specialGame,
      winner: specialWinner,
      range: specialRange
    },
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  try{
    await picksDoc(fullName).set(entry, { merge: true });
    // Opcional sync
    fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({
      secret: SHARED_SECRET,
      fullName: entry.fullName,
      week: entry.week,
      picks: entry.picks,
      specialPick: entry.specialPick
    })});
    openOverlay();
  }catch(e){
    alert("No se pudo guardar. Intenta de nuevo.");
  }
});

$("#editPicks").addEventListener("click", ()=> closeOverlay());
// Cerrar al tocar fuera de la hoja y con Escape
document.getElementById("overlay")?.addEventListener("click", (e)=>{
  if (e.target.id === "overlay") closeOverlay();
});
window.addEventListener("keydown", (e)=>{ if (e.key === "Escape") closeOverlay(); });
$("#reset").addEventListener("click", ()=>{ picks.clear(); renderGames(); });