// src/dashboard/server.js
// Dashboard HTTP + WebSocket server
// Letakkan file ini di: src/dashboard/server.js

import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

const PORT = process.env.DASHBOARD_PORT || 3000;

// ─── Static files (dashboard HTML) ───
app.use(express.static(path.join(__dirname, "public")));

// ─── In-memory log buffer (simpan 500 log terakhir) ───
const LOG_BUFFER_SIZE = 500;
const logBuffer = [];

// ─── Broadcast ke semua client WebSocket ───
function broadcast(data) {
  const payload = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      // OPEN
      client.send(payload);
    }
  });
}

// ─── Fungsi ini dipanggil dari Logger kamu ───
// level: 'INFO' | 'WARN' | 'ERROR' | 'CMD' | 'OK'
// src:   nama modul (contoh: 'commands', 'gateway', 'mc-news')
// msg:   pesan log
function emitLog(level, src, msg) {
  const entry = {
    type: "log",
    level,
    src,
    msg,
    time: new Date().toISOString(),
  };

  // Simpan ke buffer
  logBuffer.push(entry);
  if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift();

  // Kirim ke semua browser yang terbuka
  broadcast(entry);
}

// ─── Emit stats (opsional, panggil setiap beberapa detik) ───
function emitStats(stats) {
  broadcast({ type: "stats", ...stats });
}

// ─── WebSocket: kirim log history saat client konek ───
wss.on("connection", (ws) => {
  console.log("[Dashboard] Browser connected");

  // Kirim semua log yang sudah ada
  ws.send(JSON.stringify({ type: "history", logs: logBuffer }));

  ws.on("close", () => {
    console.log("[Dashboard] Browser disconnected");
  });

  // Handle perintah dari dashboard (contoh: clear logs)
  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.action === "clear") {
        logBuffer.length = 0;
        broadcast({ type: "clear" });
      }
    } catch (_) {}
  });
});

// ─── Start server ───
function startDashboard() {
  httpServer.listen(PORT, () => {
    console.log(`[Dashboard] Running at http://localhost:${PORT}`);
  });
}

export { startDashboard, emitLog, emitStats };
