import { Logger } from "../../util.js";
import express from "express";

export default async (client) => {
  const app = express();
  const port = process.env.PORT || 3000;

  app.get("/", (req, res) => {
    const isBotReady = client.isReady();
    const uptimeSeconds = Math.floor((client.uptime || 0) / 1000);
    const uptimeMinutes = Math.floor(uptimeSeconds / 60);
    const uptimeHours = Math.floor(uptimeMinutes / 60);
    const uptimeDisplay =
      uptimeHours > 0
        ? `${uptimeHours}j ${uptimeMinutes % 60}m ${uptimeSeconds % 60}d`
        : uptimeMinutes > 0
          ? `${uptimeMinutes}m ${uptimeSeconds % 60}d`
          : `${uptimeSeconds}d`;

    const wsStatusMap = {
      0: { label: "READY", color: "#00ff88" },
      1: { label: "CONNECTING", color: "#ffaa00" },
      2: { label: "RECONNECTING", color: "#ffaa00" },
      3: { label: "IDLE", color: "#888" },
      4: { label: "NEARLY", color: "#ffaa00" },
      5: { label: "DISCONNECTED", color: "#ff4455" },
      6: { label: "WAITING_FOR_GUILDS", color: "#ffaa00" },
      7: { label: "IDENTIFYING", color: "#ffaa00" },
      8: { label: "RESUMING", color: "#ffaa00" },
    };
    const wsInfo = wsStatusMap[client.ws.status] || {
      label: `STATUS_${client.ws.status}`,
      color: "#888",
    };
    const botTag = client.user ? client.user.tag : "Tidak diketahui";
    const guildCount = client.guilds ? client.guilds.cache.size : 0;
    const ping = client.ws.ping ?? "-";

    res.send(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="refresh" content="5"/>
  <title>Discord Bot Monitor</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0c10;
      --panel: #0f1218;
      --border: #1e2430;
      --accent: ${isBotReady ? "#00ff88" : "#ffaa00"};
      --accent-dim: ${isBotReady ? "#00ff8822" : "#ffaa0022"};
      --text: #c8d0df;
      --muted: #4a5568;
      --label: #7a8899;
      --mono: 'Share Tech Mono', monospace;
      --display: 'Syne', sans-serif;
    }

    html, body {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: var(--mono);
    }

    body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background-image:
        radial-gradient(ellipse 60% 50% at 50% 0%, ${isBotReady ? "#00ff8808" : "#ffaa0008"} 0%, transparent 70%),
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 39px,
          #ffffff04 39px,
          #ffffff04 40px
        ),
        repeating-linear-gradient(
          90deg,
          transparent,
          transparent 39px,
          #ffffff03 39px,
          #ffffff03 40px
        );
    }

    .card {
      width: 100%;
      max-width: 560px;
      border: 1px solid var(--border);
      border-top: 2px solid var(--accent);
      background: var(--panel);
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 0 40px ${isBotReady ? "#00ff8812" : "#ffaa0012"}, 0 20px 60px #00000080;
      animation: fadeIn 0.4s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .card-header {
      padding: 20px 24px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .dot-wrap {
      display: flex;
      gap: 6px;
    }

    .dot {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: var(--muted);
    }

    .dot.active {
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .header-title {
      font-family: var(--display);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--label);
    }

    .header-tag {
      margin-left: auto;
      font-size: 11px;
      color: var(--muted);
    }

    .status-hero {
      padding: 28px 24px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid var(--border);
    }

    .status-icon {
      font-size: 36px;
      line-height: 1;
    }

    .status-label {
      font-family: var(--display);
      font-size: 26px;
      font-weight: 800;
      color: var(--accent);
      line-height: 1;
      text-shadow: 0 0 20px var(--accent);
      letter-spacing: -0.01em;
    }

    .status-sub {
      font-size: 12px;
      color: var(--label);
      margin-top: 5px;
    }

    .badge {
      margin-left: auto;
      padding: 4px 10px;
      background: var(--accent-dim);
      border: 1px solid var(--accent);
      border-radius: 2px;
      font-size: 11px;
      color: var(--accent);
      font-weight: 700;
      letter-spacing: 0.1em;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }

    .metric {
      padding: 16px 24px;
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .metric:nth-child(even) {
      border-right: none;
    }

    .metric-label {
      font-size: 10px;
      color: var(--muted);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }

    .metric-value {
      font-size: 18px;
      color: var(--text);
      font-weight: normal;
    }

    .metric-value.accent { color: var(--accent); }

    .ws-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: ${wsInfo.color};
    }

    .ws-pill::before {
      content: '';
      display: inline-block;
      width: 7px; height: 7px;
      border-radius: 50%;
      background: ${wsInfo.color};
      box-shadow: 0 0 6px ${wsInfo.color};
    }

    .footer {
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: var(--muted);
    }

    .refresh-bar {
      height: 2px;
      background: var(--border);
      position: relative;
      overflow: hidden;
    }

    .refresh-bar::after {
      content: '';
      position: absolute;
      left: -100%;
      top: 0;
      height: 100%;
      width: 100%;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      animation: sweep 5s linear infinite;
    }

    @keyframes sweep {
      from { left: -100%; }
      to { left: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="card-header">
      <div class="dot-wrap">
        <div class="dot ${isBotReady ? "active" : ""}"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
      <span class="header-title">Discord Bot Monitor</span>
      <span class="header-tag">auto-refresh / 5s</span>
    </div>

    <div class="status-hero">
      <div class="status-icon">${isBotReady ? "🟢" : "🟡"}</div>
      <div>
        <div class="status-label">${isBotReady ? "ONLINE" : "CONNECTING"}</div>
        <div class="status-sub">${isBotReady ? "Bot aktif dan siap menerima perintah" : "Bot sedang menyambungkan ke Discord..."}</div>
      </div>
      <div class="badge">${isBotReady ? "READY" : "WAIT"}</div>
    </div>

    <div class="grid">
      <div class="metric">
        <div class="metric-label">Bot Tag</div>
        <div class="metric-value" style="font-size:14px;">${botTag}</div>
      </div>
      <div class="metric">
        <div class="metric-label">Uptime</div>
        <div class="metric-value accent">${uptimeDisplay}</div>
      </div>
      <div class="metric">
        <div class="metric-label">WS Status</div>
        <div class="metric-value">
          <span class="ws-pill">${wsInfo.label}</span>
        </div>
      </div>
      <div class="metric">
        <div class="metric-label">Ping</div>
        <div class="metric-value accent">${ping}<span style="font-size:12px;color:var(--label)"> ms</span></div>
      </div>
      <div class="metric" style="grid-column: 1 / -1; border-right: none;">
        <div class="metric-label">Server Terhubung</div>
        <div class="metric-value accent">${guildCount}<span style="font-size:13px;color:var(--label)"> guild</span></div>
      </div>
    </div>

    <div class="refresh-bar"></div>

    <div class="footer">
      <span>⟳ Diperbarui: ${new Date().toLocaleTimeString("id-ID")}</span>
      <span>localhost:${port}</span>
    </div>
  </div>
</body>
</html>`);
  });

  app
    .listen(port, () => {
      Logger.log(
        `Web Server (Ping Check) berjalan di http://localhost:${port}`,
      );
      Logger.log(`Buka URL tersebut di browser Anda untuk cek status bot.`);
    })
    .on("error", (err) => {
      Logger.error("Gagal memulai Web Server:", err.message);
    });
};
