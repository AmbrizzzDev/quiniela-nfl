function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function initials(n){ return n.split(/\s+/).map(w => w[0]).join('').slice(0,2).toUpperCase(); }
function teamLogo(name){ return TEAM_LOGOS?.[name] || null; }

function requireUserOrRedirect(){
  const name = sessionStorage.getItem("userName");
  const w = sessionStorage.getItem("week") || CURRENT_WEEK;
  if (!name){ window.location.replace("index.html"); return null; }
  return { fullName: name, week: Number(w) || CURRENT_WEEK };
}

function checkDeadlineAndMaybeBlock(){
  const now = new Date();
  if (now >= DEADLINE){
    document.body.innerHTML = `
      <div class="shell">
        <div class="closed-message card" style="padding:24px;text-align:center;margin:20px">
          <h1>Quiniela cerrada</h1>
          <p>Ya no se pueden registrar ni modificar picks.</p>
          <div style="margin-top:12px"><a class="btn secondary" href="index.html">Volver</a></div>
        </div>
      </div>`;
  }
}

function openOverlay(){ $("#overlay")?.classList.add("show"); }
function closeOverlay(){ $("#overlay")?.classList.remove("show"); }