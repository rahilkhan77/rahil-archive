const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dest = path.join(root, "public", "rahil-khan.jpg");
const src = path.join(__dirname, "rahil-khan.jpg.b64");
const b64 = fs.readFileSync(src, "utf8").replace(/\s/g, "");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, Buffer.from(b64, "base64"));
