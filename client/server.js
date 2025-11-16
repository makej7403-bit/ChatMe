// client/server.js
const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the dist build folder
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

// Send index.html for all routes (SPA mode)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
