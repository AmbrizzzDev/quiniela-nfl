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

/**
 * Bloquea toda la página hasta hoy a las HH:MM (hora local).
 * Muestra un overlay y deshabilita interacción. Se levanta solo al llegar la hora.
 * Pasar {hour:15, minute:0, title?, message?}
 */
function blockPageUntilToday({ hour=17, minute=0, title, message } = {}){
  // bypass para pruebas: ?unlock=1
  const params = new URLSearchParams(location.search);
  if (params.get("unlock") === "090875127967129875492381719874") return;

  const now = new Date();
  const unlockAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);

  // Si ya pasó, no bloquees
  if (now >= unlockAt) return;

  // Crea overlay
  const overlay = document.createElement("div");
  overlay.className = "site-blocker show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
  <div class="panel">
    <h2>${title || "Abrimos más tarde ⏳"}</h2>
    <p>${message || "Esta página se habilitará a las"} <span class="time"></span> de hoy.</p>
    <p style="margin-top:8px" class="muted">Si ves este mensaje después de la hora, intenta recargar.</p>
  </div>
`;
  document.body.appendChild(overlay);

  // Muestra hora destino formateada
  const fmt = new Intl.DateTimeFormat([], { hour:'2-digit', minute:'2-digit' });
  overlay.querySelector(".time").textContent = fmt.format(unlockAt);

  // Evitar scroll/interacción detrás
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  // Timer para levantar el bloqueo en cuanto llegue la hora
  const tick = () => {
    if (Date.now() >= unlockAt.getTime()){
      overlay.classList.remove("show");
      overlay.remove();
      document.documentElement.style.overflow = prevOverflow || "";
      clearInterval(int);
    }
  };
  const int = setInterval(tick, 1000);
}