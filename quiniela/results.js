// results.js – Tabla de resultados + jugada especial + flash
// Requiere EVENT_ID, CURRENT_WEEK y FIREBASE_CONFIG / firebaseConfig

const SCOREBOARD_BASE_URL =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";

// --- Admin por URL ---
const RESULTS_ADMIN_PARAM  = "admin";        // ?admin=...
const RESULTS_ADMIN_VALUE  = "787326495108273501";

function isResultsAdminFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const val = params.get(RESULTS_ADMIN_PARAM);
  return val && val === RESULTS_ADMIN_VALUE;
}

// Preguntas flash que se mostrarán en el panel y en la tabla
const FLASH_ADMIN_QUESTIONS = [
  { id: "q1",          label: "🛡️ 4 & down" },
  { id: "q2",          label: "⛔ Equipo Eliminado" },
  { id: "q3",          label: "➕ Equipo +40 Puntos" },
  { id: "q4",          label: "➖ FG Fallado -40yds" }
];

document.addEventListener("DOMContentLoaded", async () => {
  const root = document.getElementById("resultsRoot");
  try {
    await safeInit();
    await loadResultsPage();
  } catch (err) {
    showFatalError(root, err);
  }
});

function showFatalError(root, err) {
  console.error("❌ Error en resultados:", err);
  if (!root) return;
  root.innerHTML = `
    <div class="infocard sheen">
      <p class="err">No se pudieron cargar los resultados.</p>
      <p class="muted" style="margin-top:4px;font-size:13px">
        Detalle técnico: ${String((err && err.message) || err)}
      </p>
    </div>
  `;
}

// ================== Firebase init ==================

async function safeInit() {
  if (typeof firebase === "undefined") {
    throw new Error("Firebase no está cargado.");
  }

  if (!firebase.apps.length) {
    const cfg =
      (typeof FIREBASE_CONFIG !== "undefined" && FIREBASE_CONFIG) ||
      (typeof firebaseConfig !== "undefined" && firebaseConfig);
    if (!cfg) throw new Error("No encontré FIREBASE_CONFIG / firebaseConfig.");
    firebase.initializeApp(cfg);
  }

  if (!window.db) {
    window.db = firebase.firestore();
  }

  if (typeof CURRENT_WEEK !== "undefined") {
    const lbl = document.getElementById("weekLabel");
    if (lbl) lbl.textContent = CURRENT_WEEK;
  }
}

// ================== Helpers de normalización ==================

function gameKey(id) {
  return String(id || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function normTeam(s) {
  return String(s || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]/g, "");
}

function normName(s) {
  return String(s || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normStr(s) {
  return String(s || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "");
}

// ================== Firestore: picks ==================

async function fetchPlayersFromFirestore() {
  if (typeof EVENT_ID === "undefined" || typeof CURRENT_WEEK === "undefined") {
    throw new Error("EVENT_ID o CURRENT_WEEK no definidos.");
  }

  const players = [];
  const labelByKey = {};
  const orderKeys = [];
  const seenOrderKeys = new Set();

  const colPath = `events/${EVENT_ID}/weeks/${CURRENT_WEEK}/picks`;
  console.log("📂 Colección de picks:", colPath);

  const snap = await db.collection(colPath).get();
  const foundDocs = [];

  if (snap.empty) {
    console.warn("⚠️ No hay documentos de picks en Firestore.");
    return { players: [], games: [] };
  }

  let firstDocId = null;

  snap.forEach((doc) => {
    foundDocs.push(doc.id);
    const data = doc.data() || {};

    const fullName =
      (data.fullName && String(data.fullName).trim()) || doc.id;

    const picksArr = Array.isArray(data.picks)
      ? data.picks
      : Array.isArray(data.games)
      ? data.games
      : [];

    const picksByKey = {};
    const specialPick = data.specialPick || null;

    if (!firstDocId) firstDocId = doc.id;

    picksArr.forEach((p) => {
      if (!p || !p.id) return;

      const rawId = String(p.id).trim();
      const key = gameKey(rawId);

      const choice =
        p.winner || p.pick || p.team || p.choice || p.value || "";

      if (!key) return;

      picksByKey[key] = choice;

      if (!labelByKey[key]) {
        labelByKey[key] = rawId;
      }

      if (doc.id === firstDocId && !seenOrderKeys.has(key)) {
        seenOrderKeys.add(key);
        orderKeys.push(key);
      }
    });

    players.push({
      id: doc.id,
      name: fullName,
      picks: picksByKey,
      specialPick: specialPick || null,
      flashAnswers: {}
    });
  });

  let games = orderKeys
    .map((k) => {
      const label = labelByKey[k];
      if (!label) return null;
      return { key: k, label };
    })
    .filter(Boolean);

  if (!games.length) {
    games = Object.keys(labelByKey)
      .map((k) => ({ key: k, label: labelByKey[k] }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }

  console.log("👥 Docs de picks encontrados:", foundDocs);
  console.log("📊 Juegos (en orden del primer doc):", games);
  console.log("📋 Players:", players);

  return { players, games };
}

// ================== Firestore: flash (flashpicks / flash) ==================

async function fetchFlashAnswersForPlayers(players) {
  if (!players || !players.length) return;

  const byNormName = {};
  players.forEach((p) => {
    byNormName[normName(p.name)] = p;
  });

  const base = `events/${EVENT_ID}/weeks/${CURRENT_WEEK}`;
  const candidatePaths = [
    `${base}/flashpicks`,
    `${base}/flashPicks`,
    `${base}/flash` // por si tu colección se llama "flash"
  ];

  let usedPath = null;
  for (const path of candidatePaths) {
    try {
      const snap = await db.collection(path).get();
      if (!snap.empty) {
        console.log("📂 Usando colección de flash:", path);
        usedPath = path;
        snap.forEach((doc) => {
          const data = doc.data() || {};
          const nm = normName(data.fullName || doc.id);
          const p = byNormName[nm];
          if (!p) return;
          p.flashAnswers = data.answers || {};
        });
        break;
      }
    } catch (e) {
      console.warn("No se pudo leer", path, e);
    }
  }

  if (!usedPath) {
    console.warn("⚠️ No se encontraron respuestas flash en ninguna colección.");
  } else {
    console.log("✅ Flash answers sincronizadas con players.");
  }
}

// ================== Firestore: meta extra ==================

async function fetchExtrasMeta() {
  const docPath = `events/${EVENT_ID}/weeks/${CURRENT_WEEK}/resultsExtras/meta`;
  const docRef = db.doc(docPath);
  const snap = await docRef.get();
  if (!snap.exists) {
    return {
      specialWinners: {},
      specialLosers: {},
      flashResults: {}
    };
  }
  const data = snap.data() || {};
  return {
    specialWinners: data.specialWinners || {},
    specialLosers: data.specialLosers || {},
    flashResults: data.flashResults || {}
  };
}

async function saveExtrasMetaFromPanel(players) {
  // 🔹 Jugada especial
  const specialWinners = {};
  const specialLosers  = {};

  // Ganadores jugada especial
  document
    .querySelectorAll('[data-role="special-chip-win"].admin-chip-active')
    .forEach((btn) => {
      const pid = btn.dataset.playerId;
      if (pid) specialWinners[pid] = true;
    });

  // Perdedores jugada especial
  document
    .querySelectorAll('[data-role="special-chip-lose"].admin-chip-active')
    .forEach((btn) => {
      const pid = btn.dataset.playerId;
      if (pid) specialLosers[pid] = true;
    });

  // 🔹 Flash
  const flashResults = {};

  FLASH_ADMIN_QUESTIONS.forEach((q) => {
    const winners   = {};
    const losers    = {};
    const overrides = {};

    // Ganadores flash
    document
      .querySelectorAll(
        `[data-role="flash-chip-win"][data-q="${q.id}"].admin-chip-active`
      )
      .forEach((btn) => {
        const pid = btn.dataset.playerId;
        if (pid) winners[pid] = true;
      });

    // Perdedores flash
    document
      .querySelectorAll(
        `[data-role="flash-chip-lose"][data-q="${q.id}"].admin-chip-active`
      )
      .forEach((btn) => {
        const pid = btn.dataset.playerId;
        if (pid) losers[pid] = true;
      });

    // Textos personalizados
    players.forEach((p) => {
      const input = document.getElementById(
        `flash-ovr-${q.id}-${slug(p.id)}`
      );
      if (!input) return;
      const v = (input.value || "").trim();
      if (v) overrides[p.id] = v;
    });

    flashResults[q.id] = { winners, losers, overrides };
  });

  const docPath = `events/${EVENT_ID}/weeks/${CURRENT_WEEK}/resultsExtras/meta`;
  const docRef  = db.doc(docPath);

  await docRef.set(
    {
      specialWinners,
      specialLosers,
      flashResults
    },
    { merge: true }
  );

  const msg = document.getElementById("admin-extras-msg");
  if (msg) {
    msg.textContent =
      "Guardado ✅ (recarga la página para ver los cambios en la tabla)";
    msg.style.display = "block";
  }
}

// ================== ESPN scoreboard ==================

async function fetchEventsFromEspn() {
  console.log("🏈 Llamando scoreboard ESPN...");

  // Construimos la URL con la semana actual de app-config (si existe)
  let url = SCOREBOARD_BASE_URL;
  if (typeof CURRENT_WEEK !== "undefined") {
    url += `?week=${CURRENT_WEEK}`;
  }

  let resp;
  try {
    resp = await fetch(url);
  } catch (e) {
    console.warn(
      "⚠️ No se pudo llamar ESPN (posible CORS). Continuamos sin colores.",
      e
    );
    return [];
  }

  if (!resp.ok) {
    console.warn("⚠️ Respuesta no OK de ESPN:", resp.status);
    return [];
  }

  const data = await resp.json();

  // ✅ Verificamos que la semana de ESPN coincide con CURRENT_WEEK
  const apiWeek = data && data.week && data.week.number;
  if (
    typeof CURRENT_WEEK !== "undefined" &&
    apiWeek != null &&
    Number(apiWeek) !== Number(CURRENT_WEEK)
  ) {
    console.warn(
      `⚠️ La semana del scoreboard ESPN (${apiWeek}) no coincide con CURRENT_WEEK (${CURRENT_WEEK}). No se pintarán ganadores.`
    );
    // Devolvemos lista vacía → no habrá colores ni puntos automáticos,
    // solo se verán los picks en gris.
    return [];
  }

  const events = [];

  (data.events || []).forEach((ev) => {
    const comp = ev.competitions && ev.competitions[0];
    if (!comp) return;
    const competitors = comp.competitors || [];
    const away = competitors.find((c) => c.homeAway === "away");
    const home = competitors.find((c) => c.homeAway === "home");
    const winnerComp = competitors.find((c) => c.winner === true);
    if (!away || !home || !winnerComp) return;

    events.push({
      eventId: ev.id,
      awayShort: away.team.shortDisplayName || away.team.displayName,
      awayFull: away.team.displayName,
      awayAbbr: away.team.abbreviation,
      homeShort: home.team.shortDisplayName || home.team.displayName,
      homeFull: home.team.displayName,
      homeAbbr: home.team.abbreviation,
      winner: {
        teamName:
          winnerComp.team.shortDisplayName || winnerComp.team.displayName,
        abbrev: winnerComp.team.abbreviation,
        fullName: winnerComp.team.displayName,
      },
    });
  });

  console.log("✅ Eventos con winner en ESPN:", events);
  return events;
}

function matchGameLabelToEvent(label, events) {
  if (!label || !events || !events.length) return null;

  const clean = s => String(s).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  // split permisivo
  const parts = label.split(/vs|VS|Vs|\s+v\s+/i);
  if (parts.length < 2) return null;

  const left = clean(parts[0]);
  const right = clean(parts[1]);

  let best = null;
  let bestScore = 0;

  for (const ev of events) {
    const away = clean(ev.awayShort) || clean(ev.awayAbbr) || clean(ev.awayFull);
    const home = clean(ev.homeShort) || clean(ev.homeAbbr) || clean(ev.homeFull);

    let score = 0;

    if (left === away) score += 3;
    if (right === home) score += 3;

    // permitir matching cruzado por si el label está invertido
    if (left === home) score += 1;
    if (right === away) score += 1;

    if (score > bestScore) {
      best = ev;
      bestScore = score;
    }
  }

  if (!best) {
    console.warn("⚠ No match para:", label);
    return null;
  }

  return best;
}

// ================== Panel admin ==================

function renderExtrasAdmin(extrasMeta, players) {
  const root = document.getElementById("resultsRoot");
  if (!root) return;

  const card = document.createElement("div");
  card.className = "infocard sheen";
  card.style.marginBottom = "12px";

  const specialWinners = (extrasMeta && extrasMeta.specialWinners) || {};
  const specialLosers  = (extrasMeta && extrasMeta.specialLosers)  || {};
  const flashResults   = (extrasMeta && extrasMeta.flashResults)   || {};

  const flashSectionsHtml = FLASH_ADMIN_QUESTIONS.map((q) => {
    const cfg = flashResults[q.id] || {};
    const winners   = cfg.winners   || {};
    const losers    = cfg.losers    || {};
    const overrides = cfg.overrides || {};

    const rows = players.map((p) => {
      const ans = p.flashAnswers && p.flashAnswers[q.id];
      let baseText = "";
      if (ans && ans.optionId) {
        if (ans.optionId === "otro" && ans.otherText) {
          baseText = `Otro: ${ans.otherText}`;
        } else {
          baseText = ans.optionId;
        }
      }
      const value      = overrides[p.id] || baseText || "";
      const activeWin  = !!winners[p.id];
      const activeLose = !!losers[p.id];

      return `
        <tr>
          <td>${p.name}</td>
          <td style="text-align:center;">
            <button
              type="button"
              class="admin-chip ${activeWin ? "admin-chip-active admin-chip-win-active" : ""}"
              data-role="flash-chip-win"
              data-q="${q.id}"
              data-player-id="${p.id}"
            >
              ✔
            </button>
          </td>
          <td style="text-align:center;">
            <button
              type="button"
              class="admin-chip ${activeLose ? "admin-chip-active admin-chip-lose-active" : ""}"
              data-role="flash-chip-lose"
              data-q="${q.id}"
              data-player-id="${p.id}"
            >
              ✖
            </button>
          </td>
          <td>
            <input
              id="flash-ovr-${q.id}-${slug(p.id)}"
              type="text"
              value="${value.replace(/"/g, "&quot;")}"
              placeholder="${baseText ? baseText : ""}"
              style="width:100%;max-width:220px;padding:2px 6px;border-radius:6px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.2);color:#fff;font-size:12px;"
            >
          </td>
        </tr>
      `;
    }).join("");

    return `
      <div style="margin-top:10px;">
        <div style="font-weight:600;margin-bottom:4px;">${q.label}</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding-bottom:2px;">Jugador</th>
              <th style="text-align:center;padding-bottom:2px;">Ganador</th>
              <th style="text-align:center;padding-bottom:2px;">Perdedor</th>
              <th style="text-align:left;padding-bottom:2px;">Texto a mostrar</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }).join("");

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;margin-left:60px;">
      <div>
        <strong>Panel de resultados extra</strong>
        <div class="muted" style="font-size:12px;">Jugada especial (+1) y Flash (+0.5 c/u).</div>
      </div>

      <button id="admin-panel-toggle" 
        style="margin-right:60px;padding:4px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(20,22,34,.9);color:#e4e9f7;font-size:12px;cursor:pointer;">
        Mostrar panel
      </button>
    </div>

    <div id="admin-extras-body" style="margin-left:60px;margin-top:8px;font-size:13px; display:none;">

      <div style="margin-bottom:10px;">
        <div style="font-weight:600;margin-bottom:4px;margin-bottom:4px;">
          Jugada especial – marca ganadores (+1) y perdedores:
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;padding-bottom:2px;">Jugador</th>
              <th style="text-align:center;padding-bottom:2px;">Ganador</th>
              <th style="text-align:center;padding-bottom:2px;">Perdedor</th>
            </tr>
          </thead>
          <tbody>
            ${players.map((p) => {
              const isWin  = !!specialWinners[p.id];
              const isLose = !!specialLosers[p.id];
              return `
                <tr>
                  <td>${p.name}</td>
                  <td style="text-align:center;">
                    <button
                      type="button"
                      class="admin-chip ${isWin ? "admin-chip-active admin-chip-win-active" : ""}"
                      data-role="special-chip-win"
                      data-player-id="${p.id}"
                    >
                      ✔
                    </button>
                  </td>
                  <td style="text-align:center;">
                    <button
                      type="button"
                      class="admin-chip ${isLose ? "admin-chip-active admin-chip-lose-active" : ""}"
                      data-role="special-chip-lose"
                      data-player-id="${p.id}"
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <hr style="border:none;border-top:1px solid rgba(255,255,255,.15);margin:8px 0;">

      <div>
        <div style="font-weight:600;margin-bottom:4px;">Preguntas Flash – marca ganadores, perdedores y cambia texto:</div>
        ${flashSectionsHtml}
      </div>

      <div style="margin-top:10px;display:flex;align-items:center;gap:10px;">
        <button id="save-admin-extras" style="padding:5px 14px;border-radius:999px;border:none;background:#3b82f6;color:#fff;font-weight:600;cursor:pointer;font-size:13px;">
          Guardar resultados extra
        </button>
        <span id="admin-extras-msg" class="muted" style="font-size:12px;display:none;"></span>
      </div>
    </div>
  `;

  root.prepend(card);

  attachAdminChipHandlers(card);

  const saveBtn = document.getElementById("save-admin-extras");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = "Guardando...";
      try {
        await saveExtrasMetaFromPanel(players);
      } catch (e) {
        console.error(e);
        const msg = document.getElementById("admin-extras-msg");
        if (msg) {
          msg.textContent = "Error al guardar 😥";
          msg.style.display = "block";
        }
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Guardar resultados extra";
      }
    });
  }

  const toggle = document.getElementById("admin-panel-toggle");
  const body = document.getElementById("admin-extras-body");
  toggle.addEventListener("click", () => {
    if (body.style.display === "none") {
      body.style.display = "block";
      toggle.textContent = "Ocultar panel";
    } else {
      body.style.display = "none";
      toggle.textContent = "Mostrar panel";
    }
  });
}

function attachAdminChipHandlers(card) {
  // --- JUGADA ESPECIAL ---

  card.querySelectorAll('[data-role="special-chip-win"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.playerId;
      const other = card.querySelector(
        `[data-role="special-chip-lose"][data-player-id="${pid}"]`
      );

      const active = !btn.classList.contains("admin-chip-win-active");
      btn.classList.toggle("admin-chip-active", active);
      btn.classList.toggle("admin-chip-win-active", active);

      if (other) {
        other.classList.remove("admin-chip-active", "admin-chip-lose-active");
      }
    });
  });

  card.querySelectorAll('[data-role="special-chip-lose"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.playerId;
      const other = card.querySelector(
        `[data-role="special-chip-win"][data-player-id="${pid}"]`
      );

      const active = !btn.classList.contains("admin-chip-lose-active");
      btn.classList.toggle("admin-chip-active", active);
      btn.classList.toggle("admin-chip-lose-active", active);

      if (other) {
        other.classList.remove("admin-chip-active", "admin-chip-win-active");
      }
    });
  });

  // --- FLASH ---

  card.querySelectorAll('[data-role="flash-chip-win"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.playerId;
      const qid = btn.dataset.q;
      const other = card.querySelector(
        `[data-role="flash-chip-lose"][data-q="${qid}"][data-player-id="${pid}"]`
      );

      const active = !btn.classList.contains("admin-chip-win-active");
      btn.classList.toggle("admin-chip-active", active);
      btn.classList.toggle("admin-chip-win-active", active);

      if (other) {
        other.classList.remove("admin-chip-active", "admin-chip-lose-active");
      }
    });
  });

  card.querySelectorAll('[data-role="flash-chip-lose"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.playerId;
      const qid = btn.dataset.q;
      const other = card.querySelector(
        `[data-role="flash-chip-win"][data-q="${qid}"][data-player-id="${pid}"]`
      );

      const active = !btn.classList.contains("admin-chip-lose-active");
      btn.classList.toggle("admin-chip-active", active);
      btn.classList.toggle("admin-chip-lose-active", active);

      if (other) {
        other.classList.remove("admin-chip-active", "admin-chip-win-active");
      }
    });
  });
}

// ================== Descargar tabla como PNG ==================

function setupPngButton() {
  const btn = document.getElementById("btnDownloadPng");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (typeof html2canvas === "undefined") {
      alert("No se pudo cargar html2canvas.");
      return;
    }

    const target = document.querySelector(".table");

    btn.disabled = true;
    const originalText = btn.textContent;
    btn.textContent = "Generando PNG...";

    try {
      const canvas = await html2canvas(target, {
        scale: 2,
        backgroundColor: "#020617" // fondo oscuro para que no quede transparente feo
      });

      const link = document.createElement("a");
      const week =
        typeof ACTIVE_WEEK !== "undefined"
          ? ACTIVE_WEEK
          : typeof CURRENT_WEEK !== "undefined"
          ? CURRENT_WEEK
          : "";
      link.download = `quiniela_semana_${week || "X"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Error generando PNG:", e);
      alert("No se pudo generar la imagen 😥");
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// ================== Orquestador ==================

async function loadResultsPage() {
  const root = document.getElementById("resultsRoot");

  const { players, games } = await fetchPlayersFromFirestore();

  if (!players.length) {
    root.innerHTML = `
      <div class="infocard sheen">
        <p class="muted">Aún no hay picks guardados.</p>
      </div>`;
    return;
  }

  if (!games.length) {
    root.innerHTML = `
      <div class="infocard sheen">
        <p class="muted">No se encontraron partidos en los picks.</p>
      </div>`;
    return;
  }

  await fetchFlashAnswersForPlayers(players);
  const extrasMeta = await fetchExtrasMeta();

  root.innerHTML = ""; // limpiar "Cargando..."

  // panel admin
  if (isResultsAdminFromUrl()) {
    renderExtrasAdmin(extrasMeta, players);
  }

  // ESPN winners
  const events = await fetchEventsFromEspn();
  const winnersByKey = {};

  if (events.length) {
    games.forEach((g) => {
      const ev = matchGameLabelToEvent(g.label, events);
      if (ev) winnersByKey[g.key] = ev.winner;
    });
  }

  const table = buildResultsTable(players, games, winnersByKey, extrasMeta);
  root.appendChild(table);
  setupPngButton(); 
}

// ================== Construcción de la tabla ==================

function buildResultsTable(players, games, winnersByKey, extrasMeta) {
  const sortedPlayers = players.slice(); // mismo orden de Firestore

  const pointsByPlayerId = {};
  sortedPlayers.forEach((p) => (pointsByPlayerId[p.id] = 0));

  const wrapper = document.createElement("div");
  wrapper.className = "table sheen";

  const table = document.createElement("table");

  if (sortedPlayers.length === 1) {
    table.classList.add("single-player-table");
  }

  // --- header ---
  const thead = document.createElement("thead");
  const hRow = document.createElement("tr");

  // Columna de la izquierda
  const thName = document.createElement("th");
  thName.textContent = "Jugadores";
  hRow.appendChild(thName);

  // Una sola columna por jugador: nombre + # dentro
  sortedPlayers.forEach((p, idx) => {
    const th = document.createElement("th");
    th.innerHTML = `
      <div class="player-header">
        <span class="player-name">${p.name}</span>
        <span class="player-rank">#${idx + 1}</span>
      </div>
    `;
    hRow.appendChild(th);
  });

  thead.appendChild(hRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  // --- fila puntos ---
  const rowPts = document.createElement("tr");
  const tdTitle = document.createElement("td");
  tdTitle.textContent = "Partidos / Puntos totales";
  tdTitle.style.fontWeight = "700";
  rowPts.appendChild(tdTitle);

  sortedPlayers.forEach((p) => {
    const td = document.createElement("td");
    td.id = `pts-${slug(p.id)}`;
    td.textContent = "0";
    td.className = "points-cell";
    rowPts.appendChild(td);
  });
  tbody.appendChild(rowPts);

  // --- picks normales ---
  games.forEach((g) => {
    const tr = document.createElement("tr");

    const tdGame = document.createElement("td");
    tdGame.textContent = g.label;
    tdGame.className = "game-label-cell";
    tr.appendChild(tdGame);

    const winner = winnersByKey[g.key] || null;

    sortedPlayers.forEach((p) => {
      const pick = p.picks[g.key] || "";
      const td = document.createElement("td");

      if (!pick) {
        td.textContent = "-";
        td.classList.add("cell-empty");
      } else if (!winner) {
        td.textContent = pick;
        td.classList.add("cell-has-pick");
      } else {
        const ok = sameTeam(pick, winner);
        td.textContent = pick;
        if (ok) {
          td.classList.add("cell-win");
          pointsByPlayerId[p.id] += 1;
        } else {
          td.classList.add("cell-lose");
        }
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // --- fila vacía entre picks y jugada especial ---
{
  const emptyRow = document.createElement("tr");
  const td = document.createElement("td");
  td.textContent = ""; 
  td.classList.add("cell-empty");
  emptyRow.appendChild(td);

  sortedPlayers.forEach(() => {
    const td2 = document.createElement("td");
    td2.textContent = "";
    td2.classList.add("cell-empty");
    emptyRow.appendChild(td2);
  });

  tbody.appendChild(emptyRow);
}

  // --- jugada especial (+1) ---
  const specialWinners =
  (extrasMeta && extrasMeta.specialWinners) || {};
  const specialLosers =
  (extrasMeta && extrasMeta.specialLosers) || {};

  const trSpec = document.createElement("tr");
  const tdSpec = document.createElement("td");
  tdSpec.textContent = "Jugada especial";
  tdSpec.className = "game-label-cell";
  trSpec.appendChild(tdSpec);

  sortedPlayers.forEach((p) => {
    const td = document.createElement("td");
    const sp = p.specialPick;

    if (!sp) {
  td.textContent = "-";
  td.classList.add("cell-empty");
} else {
  const text = `${sp.winner || ""} ${sp.range || ""}`.trim() || "(sin dato)";
  td.textContent = text;

  if (specialWinners[p.id]) {
    td.classList.add("cell-win");
    pointsByPlayerId[p.id] += 1;
  } else if (specialLosers[p.id]) {
    td.classList.add("cell-lose");
  } else {
    td.classList.add("cell-has-pick");
  }
}

    trSpec.appendChild(td);
  });

  tbody.appendChild(trSpec);

  // --- flash (+0.5) ---
  const flashResults = (extrasMeta && extrasMeta.flashResults) || {};

  FLASH_ADMIN_QUESTIONS.forEach((q) => {
    const cfg = flashResults[q.id] || {};
const winners = cfg.winners || {};
const losers = cfg.losers || {};
const overrides = cfg.overrides || {};

    const tr = document.createElement("tr");
    const tdQ = document.createElement("td");
    tdQ.textContent = q.label;
    tdQ.className = "game-label-cell";
    tr.appendChild(tdQ);

    sortedPlayers.forEach((p) => {
      const td = document.createElement("td");
      const ans = p.flashAnswers && p.flashAnswers[q.id];

      let baseText = "";
      if (ans && ans.optionId) {
        if (ans.optionId === "otro" && ans.otherText) {
          baseText = `Otro: ${ans.otherText}`;
        } else {
          baseText = ans.optionId;
        }
      }

      const text = overrides[p.id] || baseText || "-";
      td.textContent = text;

      if (!ans || !ans.optionId) {
  td.classList.add("cell-empty");
} else if (winners[p.id]) {
  td.classList.add("cell-win");
  pointsByPlayerId[p.id] += 0.5;
} else if (losers[p.id]) {
  td.classList.add("cell-lose");
} else {
  td.classList.add("cell-has-pick");
}

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // --- actualizar puntos + líder ---
  let maxPoints = 0;
  Object.values(pointsByPlayerId).forEach((v) => {
    if (v > maxPoints) maxPoints = v;
  });

  sortedPlayers.forEach((p) => {
    const td = tbody.querySelector(`#pts-${slug(p.id)}`);
    if (!td) return;
    td.textContent = String(pointsByPlayerId[p.id]);
    if (pointsByPlayerId[p.id] === maxPoints && maxPoints > 0) {
      td.classList.add("points-leader");
    }
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
}

// ================== Comparar equipo ==================

function sameTeam(pickName, espnWinner) {
  if (!pickName || !espnWinner) return false;
  const p = normTeam(pickName);
  const wn = normTeam(espnWinner.teamName);
  const wa = normTeam(espnWinner.abbrev);
  const wf = normTeam(espnWinner.fullName);

  return p === wn || p === wa || p === wf || wf.includes(p);
}