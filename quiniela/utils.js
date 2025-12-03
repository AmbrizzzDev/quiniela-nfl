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
  if (window.SKIP_GLOBAL_GATE) return;
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

//* Bloqueo de pagina
function blockPageUntil({ year, month, day, hour = 0, minute = 0, title, message }) {
  // Permitir acceso manual
  if (new URLSearchParams(location.search).get("unlock") === "09712B4HJ234Ggjhgda38GHJD2") return;

  // Construye fecha local
  const unlockAt = new Date(year, month - 1, day, hour, minute, 0, 0);

  // Si ya pasó, no bloquees
  if (Date.now() >= unlockAt.getTime()) return;

  // Crea overlay
  const overlay = document.createElement("div");
  overlay.className = "site-blocker show";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML = `
  <div class="gate-panel">
    <div class="gate-header">
      <svg viewBox="0 0 24 24" aria-hidden="true" class="gate-icon">
        <path d="M12 2a7 7 0 0 1 7 7v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1V9a7 7 0 0 1 7-7zm0 2a5 5 0 0 0-5 5v2h10V9a5 5 0 0 0-5-5zM4 13v7h16v-7H4z"/>
      </svg>
      <h2 class="gate-title">${title || "Bloqueado temporalmente"}</h2>
      <p class="gate-sub">
        ${message || "Disponible el"}
      </p>
    </div>

    <div class="gate-actions">
      <a id="backToIndex" class="gate-btn" href="index.html" role="button">
        Volver al inicio
      </a>
    </div>

    <p class="gate-note">Si ya es la hora y ves este mensaje, refresca la página.</p>
  </div>
`;
  document.body.appendChild(overlay);

  // Formatea fecha y hora locales
  const fmtDate = new Intl.DateTimeFormat([], { weekday:"short", day:"2-digit", month:"short" });
  const fmtTime = new Intl.DateTimeFormat([], { hour:"2-digit", minute:"2-digit" });
  overlay.querySelector(".date").textContent = fmtDate.format(unlockAt);
  overlay.querySelector(".time").textContent = fmtTime.format(unlockAt);

  const back = overlay.querySelector("#backToIndex");
  back.addEventListener("click", (e) => {
    e.preventDefault();
    const path = location.pathname || "";
    if (/\/index\.html?$|\/$/.test(path)) { location.reload(); return; }
    location.replace(new URL("index.html", location.href).href);
  });

  // Bloquea scroll
  const prevOverflow = document.documentElement.style.overflow;
  document.documentElement.style.overflow = "hidden";

  // Quita overlay cuando llegue la hora
  const int = setInterval(() => {
    if (Date.now() >= unlockAt.getTime()) {
      clearInterval(int);
      overlay.remove();
      document.documentElement.style.overflow = prevOverflow || "";
    }
  }, 1000);
}