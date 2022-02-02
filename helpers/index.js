const crypto = require("crypto");

const generateNonce = (bits = 64) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

  for (let i = 0; i < bits; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * bits));
  }
  return text;
};

const verifyOAuth = (query) => {
  if (!query.hmac) {
    return false;
  }
  const hmac = query.hmac;
  const sharedSecret = process.env.SHOPIFY_API_SECRET;
  delete query.hmac;
  const sortedQuery = Object.keys(query)
    .map((key) => `${key}=${Array(query[key]).join(",")}`)
    .sort()
    .join("&");
  const signature = crypto
    .createHmac("sha256", sharedSecret)
    .update(sortedQuery)
    .digest("hex");
  if (signature === hmac) {
    return true;
  }

  return false;
};

module.exports = { generateNonce, verifyOAuth };
