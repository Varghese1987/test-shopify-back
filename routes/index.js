var express = require("express");
const { generateNonce, verifyOAuth } = require("../helpers");
const { verifyRequest } = require("@shopify/koa-shopify-auth");
const { Shopify, ApiVersion } = require("@shopify/shopify-api");
const Shop = require("../models/shop");
const ShopifyConstruct = require("shopify-node-api");
var router = express.Router();

router.get("/", async (req, res) => {
  res.send("WELCOME");
});

/* GET home page. */
router.post("/shopify", async (req, res) => {
  // res.send("WELCOME");
  console.log("hit index page");

  console.log(req.body);

  // console.log("request--->", req);

  // const query = Object.keys(req.query)
  //   .map((key) => `${key}=${req.query[key]}`)
  //   .join("&");
  if (req.query.shop) {
    Shop.findOne(
      { shopify_domain: req.body.shop, isActive: true },
      (err, shop) => {
        if (!shop) {
          return res.redirect(`/install/?${query}`);
        }
        if (verifyOAuth(req.query)) {
          res.send("Success");
        }
      }
    );
  } else {
    res.send("Welcome to your example app");
  }
});
router.get("/install", function (req, res, next) {
  console.log("ran install logic cors enabled");

  const shopName = req.query.shop;
  const nonce = generateNonce();
  const query = Shop.findOne({ shopify_domain: shopName }).exec();
  const scope = "read_products,write_products,read_customers,write_customers";
  const client_id = "2bc45a03eb8a0103e992a0350f024312";
  const redirect_uri = `${process.env.SHOPIFY_API_URI}/callback`;

  const redirectURI = `https://${shopName}/admin/oauth/authorize?client_id=${client_id}&scope=${scope}&redirect_uri=${redirect_uri}&state=${nonce}`;

  query.then((response) => {
    let save;
    const shop = response;
    if (!shop) {
      save = new Shop({ shopify_domain: shopName, nonce }).save();
    } else {
      shop.shopify_domain = shopName;
      shop.nonce = nonce;
      save = shop.save();
    }
    return save.then(() => res.redirect(redirectURI));
  });
});

router.get("/callback", (req, res) => {
  const params = req.query;
  const query = Shop.findOne({ shopify_domain: params.shop }).exec();
  query.then((result) => {
    const shop = result;
    const shopAPI = new ShopifyConstruct({
      shop: params.shop,
      shopify_api_key: process.env.SHOPIFY_API_KEY,
      shopify_shared_secret: process.env.SHOPIFY_API_SECRET,
      nonce: shop.nonce,
    });
    shopAPI.exchange_temporary_token(params, (error, data) => {
      if (error) {
        console.log("error--->", error);
        res.send(error);
      }
      console.log("data--->", data);
      shop.accessToken = data.access_token;
      shop.isActive = true;
      shop.save((saveError) => {
        if (saveError) {
          console.log("Cannot save shop: ", saveError);
          res.send(error);
        } else {
          res.redirect(
            `https://${shop.shopify_domain}/admin/apps/test-app-3566`
          );
        }
      });
    });
  });
});

module.exports = router;
