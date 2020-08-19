import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import axios from "axios";
import { useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const Receipt = props => {
  var stripePublishKey =
    "pk_test_51H9McFKtxt3kvNhb3JFchFPW2D3DSus5ZqWQyWRSi7pxFPKLgh10xui8vi62tE6VSzKcwKhzkPo4CD8EYxrvU9SO00L2aKTYsE";
  var stripe = useStripe();
  const database = firebase.database();
  const [items, setItems] = useState({});
  const [userId, setUserId] = useState(null);
  const [phone, setPhone] = useState(null);
  const [lineItems, setLineItems] = useState({});
  const [itemSubTotal, setItemSubtotal] = useState(0);
  const [stripeId, setStripeId] = useState(null);
  const { match } = props;
  const thisRest = match.params.restaurant;
  const thisTable = match.params.table;

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setUserId(user.uid);
      } else {
        console.log("user NOT signed in ");
      }
    });
  }, []);

  useEffect(() => {
    if (userId != null) {
      database
        .ref("restaurants")
        .child(thisRest)
        .child("tables")
        .child(thisTable)
        .child("users")
        .child(userId)
        .child("items")
        .on("value", function(snapshot) {
          var data = snapshot.val();
          if (data != null) {
            setItems(data);
          }
        });
      database
        .ref("users")
        .child(userId)
        .once("value")
        .then(snapshot => {
          if (snapshot.child("phone_number").exists()) {
            var fullPhone = String(snapshot.val().phone_number);
            setPhone(fullPhone.substring(2));
          }
        });
      database
        .ref("restaurants")
        .child(thisRest)
        .once("value")
        .then(snapshot => {
          setStripeId(snapshot.val().stripe_connect_id);
        });
    }
  }, [userId]);

  useEffect(() => {
    if (Object.keys(items).length !== 0) {
      calcItemSubTotal();
      constructLineItems();
    }
  }, [items]);

  useEffect(() => {
    if (stripeId != null) {
      resolveStripeObj();
    }
  }, [stripeId]);

  async function resolveStripeObj() {
    stripe = await loadStripe(stripePublishKey, stripeId);
  }

  const constructLineItems = () => {
    var tempList = [];
    for (var key in items) {
      var quantity = Number(items[key].quantity);
      var price = Number(items[key].price) * quantity * 100;
      var title = items[key].title;
      var tempObj = {
        price_data: {
          currency: "usd",
          product_data: {
            name: title
          },
          unit_amount: price
        },
        quantity: 1
      };
      tempList.push(tempObj);
    }
    setLineItems(tempList);
  };

  const handlePayment = () => {
    console.log("payment process initiated");
    var data = {
      line_items: lineItems,
      stripe_id: stripeId
    };
    axios.post("/api/checkout-session", { data }).then(res => {
      var checkoutSession = res.data.checkoutSession;
      stripe
        .redirectToCheckout({
          sessionId: checkoutSession.id
        })
        .then(result => {
          console.log(result);
        });
    });
  };

  const calcItemSubTotal = () => {
    var total = 0;
    for (var key in items) {
      var quantity = Number(items[key].quantity);
      total += Number(items[key].price) * quantity;
    }
    setItemSubtotal(total);
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center mt-3">
        <a href={"/" + thisRest + "/menu/" + thisTable}>
          <button className="btn btn-dark btn-lg">Go to Table Dashboard</button>
        </a>
      </div>
      <div className="d-flex justify-content-center">
        <h1> Receipt </h1>{" "}
      </div>
      {Object.keys(items || {}).map((key, i) => {
        var item = items[key];
        return (
          <Fragment key={key}>
            <div className="d-flex justify-content-between">
              <div className="ml-3">
                {" "}
                <h2> {item.quantity} </h2>
              </div>
              <div>
                <div>
                  {" "}
                  <h2>{item.title}</h2>
                </div>
                <div>
                  {" "}
                  <h2> {item.notes}</h2>
                </div>
              </div>
              <div className="mr-3">
                {" "}
                <h2> ${Number(item.price) * Number(item.quantity)} </h2>
              </div>
            </div>
          </Fragment>
        );
      })}

      <h1> Subtotal {itemSubTotal} </h1>

      <button
        className="btn btn-success btn-block"
        onClick={() => handlePayment()}
      >
        Finish and Pay
      </button>
    </Fragment>
  );
};

export default Receipt;
