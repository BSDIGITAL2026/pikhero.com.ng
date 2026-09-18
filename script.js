```javascript
const SUPABASE_URL = "https://bfxiiedvmapxqjiqcqxe.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmxlIiwicmVmIjoiYmZ4aWllZHZtYXB4cWppcWNxeGUiLCJpYXQiOjE3ODk1OTA3OTUsImV4cCI6MjEwNTE2Njc5NX0.aluufG0sHi9iJg9luBLUl6oA4L6Zp11EKHrR_qNIplY";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// ==============================
// AUTO DATE
// ==============================

function updateDate() {
  const dateElement = document.getElementById("auto-date");

  if (!dateElement) return;

  const today = new Date();

  dateElement.textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}


// ==============================
// ESCAPE HTML
// ==============================

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==============================
// SHARE PREDICTION
// ==============================

function shareTip(match, tip, odd) {
  const text =
    "⚽ PikHero Prediction\n\n" +
    "🏟️ " + match + "\n" +
    "🎯 Tip: " + tip + "\n" +
    "📈 Odd: " + odd + "\n\n" +
    "Smart Picks. Better Decisions.\n" +
    "https://pikhero.com.ng";

  const url =
    "https://wa.me/?text=" +
    encodeURIComponent(text);

  window.open(url, "_blank");
}


// ==============================
// SHARE WEBSITE
// ==============================

function shareSite() {
  const text =
    "⚽ PikHero - Smart Picks. Better Decisions.\n\n" +
    "Check out PikHero for data-driven football predictions and daily football tips.\n\n" +
    "https://pikhero.com.ng";

  const url =
    "https://wa.me/?text=" +
    encodeURIComponent(text);

  window.open(url, "_blank");
}


// ==============================
// LOAD PREDICTIONS
// ==============================

async function loadPredictions() {
  const card = document.getElementById("tips-card");

  if (!card) return;

  try {
    const {
      data,
      error
    } = await supabaseClient
      .from("predictions")
      .select("*")
      .eq("published", true)
      .order("prediction_date", {
        ascending: false
      })
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("Prediction error:", error);

      card.innerHTML = `
        <div class="error">
          ❌ Unable to load predictions.
        </div>
      `;

      return;
    }

    if (!data || data.length === 0) {
      card.innerHTML = `
        <div class="loading">
          ⚽ No predictions available yet.
        </div>
      `;

      return;
    }

    let html = `
      <h3>🔥 Today's Predictions</h3>
    `;

    let accumulator = 1;
    let validOdds = 0;

    data.forEach((prediction) => {
      const match =
        prediction.match ||
        prediction.fixture ||
        "Unknown Match";

      const tip =
        prediction.tip ||
        prediction.prediction ||
        "N/A";

      const odd = Number(
        prediction.odd ||
        prediction.odds ||
        0
      );

      const chance =
        prediction.chance ||
        prediction.confidence ||
        "N/A";

      if (odd > 0) {
        accumulator *= odd;
        validOdds++;
      }

      const safeMatch = escapeHTML(match);
      const safeTip = escapeHTML(tip);

      html += `
        <div
          style="
            padding:15px;
            margin:10px 0;
            background:#0a0f1e;
            border-radius:12px;
            border-left:3px solid #00d084;
          "
        >

          <div
            style="
              font-weight:bold;
              font-size:16px;
              margin-bottom:10px;
            "
          >
            ${safeMatch}
          </div>

          <div style="margin-bottom:8px;">

            <span class="badge">
              ${safeTip}
            </span>

            ${
              odd > 0
                ? `<span class="odd">${odd.toFixed(2)}</span>`
                : ""
            }

          </div>

          <div
            style="
              color:#aaa;
              font-size:13px;
              margin-top:10px;
            "
          >
            Confidence:
            <strong style="color:#00d084;">
              ${escapeHTML(chance)}
            </strong>
          </div>

          <div class="share">

            <button
              type="button"
              onclick="shareTip(
                ${JSON.stringify(String(match))},
                ${JSON.stringify(String(tip))},
                ${JSON.stringify(odd > 0 ? odd.toFixed(2) : "N/A")}
              )"
            >
              📤 Share Prediction
            </button>

          </div>

        </div>
      `;
    });

    if (validOdds > 0) {
      html += `
        <div
          style="
            margin-top:15px;
            padding:15px;
            background:#1e2a4a;
            border-radius:12px;
            text-align:center;
          "
        >

          <div
            style="
              color:#aaa;
              font-size:13px;
              margin-bottom:5px;
            "
          >
            📊 Accumulated Odds
          </div>

          <div
            style="
              color:#00d084;
              font-size:24px;
              font-weight:bold;
            "
          >
            ${accumulator.toFixed(2)}
          </div>

        </div>
      `;
    }

    card.innerHTML = html;

  } catch (error) {
    console.error("Prediction loading error:", error);

    card.innerHTML = `
      <div class="error">
        ❌ Unable to load predictions.
      </div>
    `;
  }
}


// ==============================
// LOAD RESULTS
// ==============================

async function loadResults() {
  const card = document.getElementById("results-card");

  if (!card) return;

  try {
    const {
      data,
      error
    } = await supabaseClient
      .from("results")
      .select("*")
      .order("result_date", {
        ascending: false
      })
      .order("created_at", {
        ascending: false
      });

    if (error) {
      console.error("Results error:", error);

      card.innerHTML = `
        <div class="error">
          ❌ Unable to load results.
        </div>
      `;

      return;
    }

    if (!data || data.length === 0) {
      card.innerHTML = `
        <div class="loading">
          📊 No results available yet.
        </div>
      `;

      return;
    }

    let html = `
      <h3>📊 Recent Results</h3>
    `;

    data.forEach((result) => {
      const match =
        result.match ||
        result.fixture ||
        "Unknown Match";

      const tip =
        result.tip ||
        result.prediction ||
        "N/A";

      const status =
        result.status ||
        result.result ||
        "Pending";

      const normalizedStatus =
        String(status).toLowerCase();

      let statusClass = "";

      if (
        normalizedStatus === "win" ||
        normalizedStatus === "won"
      ) {
        statusClass = "win";
      }

      if (
        normalizedStatus === "loss" ||
        normalizedStatus === "lost"
      ) {
        statusClass = "loss";
      }

      html += `
        <div
          style="
            padding:15px;
            margin:10px 0;
            background:#0a0f1e;
            border-radius:12px;
          "
        >

          <div
            style="
              font-weight:bold;
              margin-bottom:8px;
            "
          >
            ${escapeHTML(match)}
          </div>

          <div
            style="
              color:#aaa;
              margin-bottom:6px;
            "
          >
            Tip:
            <strong>
              ${escapeHTML(tip)}
            </strong>
          </div>

          <div
            class="${statusClass}"
            style="font-weight:bold;"
          >
            ${escapeHTML(status)}
          </div>

        </div>
      `;
    });

    card.innerHTML = html;

  } catch (error) {
    console.error("Results loading error:", error);

    card.innerHTML = `
      <div class="error">
        ❌ Unable to load results.
      </div>
    `;
  }
}


// ==============================
// LOAD TRACK RECORD
// ==============================

async function loadTrackRecord() {
  const card = document.getElementById("track-record-card");

  if (!card) return;

  try {
    const {
      data,
      error
    } = await supabaseClient
      .from("pikhero_track_record")
      .select("*");

    if (error) {
      console.error("Track Record error:", error);

      card.innerHTML = `
        <div class="error">
          ❌ Unable to load track record.
        </div>
      `;

      return;
    }

    const record = data && data.length > 0
      ? data[0]
      : {
          total_picks: 0,
          wins: 0,
          losses: 0,
          voids: 0,
          win_rate: 0,
          pass_count: 0,
          watch_count: 0
        };

    const totalPicks = Number(record.total_picks || 0);
    const wins = Number(record.wins || 0);
    const losses = Number(record.losses || 0);
    const voids = Number(record.voids || 0);
    const winRate = Number(record.win_rate || 0);
    const passCount = Number(record.pass_count || 0);
    const watchCount = Number(record.watch_count || 0);

    card.innerHTML = `
      <h3>📊 PikHero Track Record</h3>

      <div
        style="
          display:grid;
          grid-template-columns:repeat(2, 1fr);
          gap:10px;
          margin-top:15px;
        "
      >

        <div
          style="
            background:#0a0f1e;
            padding:15px;
            border-radius:12px;
            text-align:center;
          "
        >
          <div style="color:#aaa;font-size:12px;">
            Total Picks
          </div>

          <div
            style="
              color:#00d084;
              font-size:25px;
              font-weight:bold;
              margin-top:5px;
            "
          >
            ${totalPicks}
          </div>
        </div>

        <div
          style="
            background:#0a0f1e;
            padding:15px;
            border-radius:12px;
            text-align:center;
          "
        >
          <div style="color:#aaa;font-size:12px;">
            Win Rate
          </div>

          <div
            style="
              color:#00d084;
              font-size:25px;
              font-weight:bold;
              margin-top:5px;
            "
          >
            ${winRate.toFixed(2)}%
          </div>
        </div>

        <div
          style="
            background:#0a0f1e;
            padding:15px;
            border-radius:12px;
            text-align:center;
          "
        >
          <div style="color:#aaa;font-size:12px;">
            Wins
          </div>

          <div
            class="win"
            style="
              font-size:25px;
              font-weight:bold;
              margin-top:5px;
            "
          >
            ${wins}
          </div>
        </div>

        <div
          style="
            background:#0a0f1e;
            padding:15px;
            border-radius:12px;
            text-align:center;
          "
        >
          <div style="color:#aaa;font-size:12px;">
            Losses
          </div>

          <div
            class="loss"
            style="
              font-size:25px;
              font-weight:bold;
              margin-top:5px;
            "
          >
            ${losses}
          </div>
        </div>

        <div
          style="
            background:#0a0f1e;
            padding:15px;
            border-radius:12px;
            text-align:center;
          "
        >
          <div style="color:#aaa;font-size:12px;">
            PASS
          </div>

          <div
            style="
              color:#00d084;
              font-size:22px;
              font-weight:bold;
              margin-top:5px;
            "
          >
            ${passCount}
          </div>
        </div>

        <div
          style="
            background:#0a0f1e;
            padding:15px;
            border-radius:12px;
            text-align:center;
          "
        >
          <div style="color:#aaa;font-size:12px;">
            WATCH
          </div>

          <div
            style="
              color:#ffd700;
              font-size:22px;
              font-weight:bold;
              margin-top:5px;
            "
          >
            ${watchCount}
          </div>
        </div>

      </div>

      ${
        voids > 0
          ? `
            <div
              style="
                text-align:center;
                color:#aaa;
                font-size:12px;
                margin-top:15px;
              "
            >
              VOID: ${voids}
            </div>
          `
          : ""
      }

      <div
        style="
          text-align:center;
          color:#666;
          font-size:11px;
          margin-top:15px;
        "
      >
        Based on recorded PikHero predictions.
      </div>
    `;

  } catch (error) {
    console.error("Track Record loading error:", error);

    card.innerHTML = `
      <div class="error">
        ❌ Unable to load track record.
      </div>
    `;
  }
}


// ==============================
// LOAD WEBSITE
// ==============================

async function loadSite() {
  updateDate();

  await Promise.all([
    loadPredictions(),
    loadResults(),
    loadTrackRecord()
  ]);
}


// ==============================
// START
// ==============================

document.addEventListener(
  "DOMContentLoaded",
  loadSite
);
```
