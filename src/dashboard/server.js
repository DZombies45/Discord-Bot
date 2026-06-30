// src/dashboard/server.js
// Dashboard HTTP + WebSocket server
// Letakkan file ini di: src/dashboard/server.js

import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.SERVER_PORT || 3000;
const DASHBOARD_TOKEN = process.env.DASHBOARD_TOKEN || "";

if (!DASHBOARD_TOKEN) {
  console.warn(
    "[Dashboard] PERINGATAN: DASHBOARD_TOKEN tidak diset di .env — dashboard berjalan TANPA autentikasi. " +
      "Siapa pun yang tahu URL/port ini bisa melihat log bot dan menghapusnya. " +
      "Tambahkan DASHBOARD_TOKEN=<string-acak-panjang> di .env untuk mengamankan dashboard.",
  );
}

// ─── Perbandingan token yang tahan timing attack ───
function tokenMatches(provided) {
  if (!DASHBOARD_TOKEN) return true; // auth dimatikan
  if (!provided) return false;
  const a = Buffer.from(String(provided));
  const b = Buffer.from(DASHBOARD_TOKEN);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ─── Static files (dashboard HTML) ───
app.use(express.static(path.join(__dirname, "public")));

// ─── Endpoint kecil agar front-end bisa tahu apakah auth diperlukan ───
app.get("/api/auth-required", (req, res) => {
  res.json({ required: Boolean(DASHBOARD_TOKEN) });
});

// ─── Upgrade HTTP -> WebSocket manual, supaya bisa cek token dulu ───
httpServer.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!tokenMatches(token)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

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
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[Dashboard] Running at http://0.0.0.0:${PORT}`);
  });
}

export { startDashboard, emitLog, emitStats };
