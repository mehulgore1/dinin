// check dev environment
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// setup
const express = require("express");
const cors = require("cors");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

const app = express();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(stripeSecretKey);

app.use(cors());
app.use(express.json());

//routes
app.get("/api/pay", (req, res) => {
  res.json("Hello World AYYYYYY");
});

app.post("/api/create-customer", async (req, res) => {
  var phone = req.body.user.phone;
  var email = req.body.user.email;
  try {
    // Create a new customer object
    const customer = await stripe.customers.create({
      phone,
      email
    });

    // Create a CheckoutSession to set up our payment methods recurring usage
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "setup",
      customer: customer.id,
      success_url: `${req.headers.origin}/session_id/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/`
    });

    res.send({ customer, checkoutSession });
  } catch (error) {
    res.status(400).send({ error });
  }
});

app.get("/session_id/:id", async function response(req, res) {
  const { id } = req.params;

  const checkoutSession = await stripe.checkout.sessions.retrieve(id, {
    expand: ["customer", "setup_intent.payment_method"]
  });

  res.send({ checkoutSession });
});

// listener
app.listen(port, () => {
  console.log("server running on 5000");
});
