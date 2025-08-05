const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
let urls = {}; 
app.post("/shorturls", (req, res) => {
  const { url, validity = 30, shortcode } = req.body;
  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL format." });
  }
  const code = shortcode || nanoid(6);
  if (urls[code]) {
    return res.status(400).json({ error: "Shortcode already in use." });
  }
  const expiryDate = new Date(Date.now() + validity * 60 * 1000);
  urls[code] = {
    originalUrl: url,
    expiry: expiryDate.toISOString(),
    clicks: [],
  };
  res.status(201).json({
    shortLink: `http://localhost:5000/${code}`,
    expiry: expiryDate.toISOString(),
  });
});
app.get("/:code", (req, res) => {
  const data = urls[req.params.code];
  if (!data) return res.status(404).send("URL not found");

  const now = new Date();
  if (new Date(data.expiry) < now) return res.status(410).send("Link expired");
  data.clicks.push({
    timestamp: new Date().toISOString(),
    source: req.get("Referrer") || "Direct",
  });

  res.redirect(data.originalUrl);
});
app.get("/shorturls/stats", (req, res) => {
  const stats = Object.entries(urls).map(([code, data]) => ({
    code,
    shortLink: `http://localhost:5000/${code}`,
    ...data,
  }));
  res.json(stats);
});
app.get("/", (req, res) => {
  res.send("✅ Backend is up and running!");
});

app.listen(PORT, () =>
  console.log(`✅ Backend running at http://localhost:${PORT}`)
);
