var createError = require("http-errors");
var dotenv = require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const { Shopify, ApiVersion } = require("@shopify/shopify-api");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const { default: shopifyAuth } = require("@shopify/koa-shopify-auth");
const session = require("koa-session");

const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY;
const SHOPIFY_SECRET = process.env.SHOPIFY_SECRET;

var app = express();

// app.keys = [SHOPIFY_SECRET];

// app
//   // sets up secure session data on each request
//   .use(session(app))

//   // sets up shopify auth
//   .use(
//     shopifyAuth({
//       apiKey: SHOPIFY_API_KEY,
//       secret: SHOPIFY_SECRET,
//       scopes: ["write_orders, write_products"],
//       afterAuth(ctx) {
//         const { shop, accessToken } = ctx.session;
//         console.log("We did it!", accessToken);
//         ctx.redirect("/");
//       },
//     })
//   )
//   .use((ctx) => {
//     ctx.body = "🎉";
//   });

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
