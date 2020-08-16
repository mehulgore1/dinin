// check dev environment
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// setup
const express = require("express");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");
const firebaseApp = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://dinin-2f0b9.firebaseio.com"
});
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const app = express();
const router = express.Router();
const port = process.env.PORT || 5000;
const database = firebaseApp.database();
const stripe = require("stripe")(stripeSecretKey);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "client", "build")));

//routes
app.get("/api/pay", (req, res) => {
  res.json("Hello World AYYYYYY");
});

app.post("/api/dashboard-link", async (req, res) => {
  var stripe_id = req.body.stripe_id;
  const link = await stripe.accounts.createLoginLink(stripe_id);
  res.send({ link });
});

app.post("/api/checkout-session", async (req, res) => {
  var line_items = req.body.data.line_items;
  var stripe_id = req.body.data.stripe_id;
  const checkoutSession = await stripe.checkout.sessions.create(
    {
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: `${req.headers.origin}/session_id/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`
    },
    { stripeAccount: stripe_id }
  );

  console.log(checkoutSession);
  res.send({ checkoutSession });
});

app.get("/session_id/:id", async function response(req, res) {
  const { id } = req.params;

  const checkoutSession = await stripe.checkout.sessions.retrieve(id, {
    expand: ["customer", "setup_intent.payment_method"]
  });

  res.send({ checkoutSession });
});

app.post("/api/create-standard-account", async (req, res) => {
  console.log(req.body.name);
  const account = await stripe.accounts.create(req.body.data);
  saveAccountId(account.id, req.body.name);
  const accountLinks = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: "http://localhost:3000/manager/menu/0",
    return_url: "http://localhost:3000/manager/menu/0",
    type: "account_onboarding"
  });
  res.send({ accountLinks });
});

// app.post("/api/get-account-link", async (req, res) => {
//   var id = req.body.stripe_id;
//   const accountLinks = await stripe.accountLinks.create({
//     account: id,
//     refresh_url: "http://localhost:3000/manager/menu/0",
//     return_url: "http://localhost:3000/manager/menu/0",
//     type: "account_onboarding"
//   });
//   console.log(accountLinks);
//   res.send({ accountLinks });
// });

app.post("/api/retrieve-connect-account", async (req, res) => {
  var id = req.body.stripeId;
  const account = await stripe.accounts.retrieve(id);
  res.send({ account });
});

app.get("/api/manager/connect/oauth", async (req, res) => {
  const { code, state } = req.query;

  // Send the authorization code to Stripe's API.
  stripe.oauth
    .token({
      grant_type: "authorization_code",
      code
    })
    .then(
      async response => {
        // Render some HTML or redirect to a different page.
        return res.status(200).json({ account });
      },
      err => {
        if (err.type === "StripeInvalidGrantError") {
          return res
            .status(400)
            .json({ error: "Invalid authorization code: " + code });
        } else {
          return res.status(500).json({ error: "An unknown error occurred." });
        }
      }
    );
});

const saveAccountId = (id, rest) => {
  // Save the connected account ID from the response to your database.
  database
    .ref("restaurants")
    .child(rest)
    .update({
      stripe_connect_id: id
    });
};

//serve react if no endpoints hit
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// listener
app.listen(port, () => {
  console.log("server running on 5000");
});
