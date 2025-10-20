import { Logger } from "../../util.js";
import express from "express";

export default async (client) => {
  // Konfigurasi Web Server
  const app = express();
  const port = process.env.PORT || 3000; // Gunakan port dari environment (untuk hosting) atau default 3000

  // ----------------------------------------------------
  // Membuat endpoint 'ping' yang akan Anda cek di browser
  // ----------------------------------------------------
  app.get("/", (req, res) => {
    // Cek status Discord Client
    const isBotReady = client.isReady();

    // Informasi yang akan ditampilkan
    let statusText = isBotReady
      ? "✅ BOT ONLINE dan SIAP"
      : "⚠️ BOT BERJALAN, tapi belum siap (connecting)";
    let statusColor = isBotReady ? "green" : "orange";

    // Kirim respons HTML sederhana
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Status Bot Discord</title>
            <meta http-equiv="refresh" content="5"> 
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
                .status-box { 
                    padding: 20px; 
                    border: 2px solid ${statusColor}; 
                    display: inline-block;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="status-box">
                <h1>Status: <span style="color: ${statusColor};">${statusText}</span></h1>
                <p>Uptime: ${Math.floor(client.uptime / 1000 / 60)} menit</p>
                <p>Status Client: ${client.ws.status}</p>
                <p>Terakhir diperbarui: ${new Date().toLocaleTimeString()}</p>
                <p><small>Halaman ini akan refresh otomatis setiap 5 detik.</small></p>
            </div>
        </body>
        </html>
    `);
  });

  // ----------------------------------------------------
  // Memulai Web Server setelah bot siap
  // ----------------------------------------------------

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
