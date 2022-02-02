var express = require("express");
var router = express.Router();
const nonce = require("nonce")();

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = "write_products";
const forwardingAddress =
  "https://11d8-2409-4072-510-ad4a-753f-85f5-3ff8-cc39.ngrok.io";

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/shopify", (req, res) => {
  const shop = req.query.shop;
  console.log("request-query--->", req.query);
  if (shop) {
    const state = nonce();
    const redirectUri = `${forwardingAddress}/shopify/callback`;
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;
    res.redirect(installUrl);
    res.send("Success");
  } else {
    res.send("Fail");
  }
});

module.exports = router;
