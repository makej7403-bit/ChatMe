// server/payments.js
const express = require("express");
const router = express.Router();

// MOCK payment system
router.post("/subscribe", async (req, res) => {
  res.json({
    status: "success",
    message: "User subscribed (mock). Enable Stripe later.",
  });
});

router.post("/status", async (req, res) => {
  res.json({
    premium: true,
    expires: "2099-12-31",
  });
});

module.exports = router;
