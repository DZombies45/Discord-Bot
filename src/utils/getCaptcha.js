const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");

//GlobalFonts.registerFromPath('/system/fonts/Roboto-Regular.ttf', 'Roboto'); // Atur sesuai sistemmu

module.exports = (width = 450, height = 150, length = 5) => {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Generate random text
  const chars =
    "QWERTYUIASDFGHJKZXCVBNMLOP7894561230qwertyuizxcvbnmlopasdfghjk";
  const text = Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
  const fontSize = height * 0.5;
  const font = "Roboto";
  // Background
  ctx.fillStyle = "#060B00";
  ctx.fillRect(0, 0, width, height);
  ctx.textBaseline = "middle";

  // Buat Decoy
  const decoyText = Array.from(
    { length: length + Math.floor((width * height) / 10000) },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");

  ctx.font = `${fontSize}px ${font}`;
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = "#646566";
  for (const element of decoyText) {
    const angle = randomRange(-1, 1);

    ctx.save();
    ctx.rotate(angle);
    ctx.fillText(
      element,
      randomRange(30, width - 30) || 0,
      randomRange(fontSize, height - fontSize) || 0,
    );
    ctx.restore();
  }

  // Tulis huruf satu per satu
  ctx.font = `${fontSize}px ${font}`;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const angle = randomRange(-0.9, 0.9); //(Math.random() - 0.9) * 0.9; // rotasi -20~+20 derajat

    ctx.save();
    ctx.translate(
      (width / (length + 1)) * (i + 1),
      height / 2 + randomRange(-fontSize / 2, fontSize / 2),
    );
    ctx.rotate(angle);
    ctx.fillStyle = `rgba(${randomRange(100, 225)},0,0,1)`;
    ctx.fillText(char, -fontSize / 4, 0);
    ctx.restore();
  }

  // Tambah noise garis
  for (let i = 0; i < 10; i++) {
    ctx.lineWidth = randomRange(2, 5);
    ctx.strokeStyle = `rgba(${randomRange(0, 100)},${randomRange(0, 225)},${randomRange(0, 255)},${randomRange(0.5, 1)})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // kirim buffer
  const buffer = canvas.toBuffer("image/png");
  return { buffer, text };
};

function randomRange(from, to) {
  return from + Math.random() * to;
}
