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

// 🕒 Bloquea la página hasta una fecha y hora local exacta
function blockPageUntil({ year, month, day, hour = 0, minute = 0, title, message }) {
  // Permitir acceso manual con ?unlock=1
  if (new URLSearchParams(location.search).get("unlock") === "1") return;

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
    <div class="panel">
      <h2>${title || "Abrimos pronto ⏳"}</h2>
      <p>${message || "Esta página se habilitará el"} 
      <p class="muted" style="margin-top:8px">
        Si ya es la hora y sigue este mensaje, recarga la página.
      </p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Formatea fecha y hora locales
  const fmtDate = new Intl.DateTimeFormat([], { weekday:"short", day:"2-digit", month:"short" });
  const fmtTime = new Intl.DateTimeFormat([], { hour:"2-digit", minute:"2-digit" });
  overlay.querySelector(".date").textContent = fmtDate.format(unlockAt);
  overlay.querySelector(".time").textContent = fmtTime.format(unlockAt);

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