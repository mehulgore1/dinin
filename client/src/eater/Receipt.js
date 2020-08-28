import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import axios from "axios";
import { useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Modal } from "react-bootstrap";
import $ from "jquery";

const Receipt = props => {
  var stripePublishKey =
    "pk_test_51H9McFKtxt3kvNhb3JFchFPW2D3DSus5ZqWQyWRSi7pxFPKLgh10xui8vi62tE6VSzKcwKhzkPo4CD8EYxrvU9SO00L2aKTYsE";
  var stripe = useStripe();
  const database = firebase.database();
  const tax = 0.085;

  const [items, setItems] = useState({});
  const [userId, setUserId] = useState(null);
  const [phone, setPhone] = useState(null);
  const [lineItems, setLineItems] = useState({});
  const [itemSubTotal, setItemSubtotal] = useState(0);
  const [stripeId, setStripeId] = useState(null);
  const [tip, setTip] = useState(0);
  const [displayTax, setDisplayTax] = useState();
  const [total, setTotal] = useState(0);
  const [modalShow, setModalShow] = useState(false);

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
    $(".btn-group > .btn").click(function() {
      $(this)
        .addClass("active")
        .siblings()
        .removeClass("active");
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

  useEffect(() => {
    if (itemSubTotal > 0) {
      var raw = Number(itemSubTotal * tax);
      setDisplayTax(raw.toFixed(2));
    }
  }, [itemSubTotal]);

  useEffect(() => {
    if (displayTax != null && displayTax > 0) {
      var displayTaxNum = Number(displayTax);
      var tipNum = Number(tip);
      var itemSubTotalNum = Number(itemSubTotal);
      var raw = displayTaxNum + tipNum + itemSubTotalNum;
      setTotal(raw.toFixed(2));
      constructLineItems();
    }
  }, [displayTax, tip]);

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
    var tipNum = tip * 100;
    var taxNum = Number(displayTax) * 100;
    var tipObj = {
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tip"
        },
        unit_amount: tipNum
      },
      quantity: 1
    };
    var taxObj = {
      price_data: {
        currency: "usd",
        product_data: {
          name: "Tax"
        },
        unit_amount: taxNum
      },
      quantity: 1
    };
    tempList.push(taxObj);
    tempList.push(tipObj);
    setLineItems(tempList);
  };

  const handlePayment = () => {
    if (tip == 0) {
      console.log(tip);
      alert("Please Enter a Tip Amount");
      return;
    }
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

  const setTipPercent = percent => {
    var decimal = percent / 100;
    var subAndTax = Number(itemSubTotal) + Number(displayTax);
    var rawTip = decimal * subAndTax;
    var shownTip = rawTip.toFixed(2);
    setTip(shownTip);
  };

  const showPrice = (price, quantity) => {
    var priceWithQuantity = Number(price) * Number(quantity);
    return priceWithQuantity.toFixed(2);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-center mt-3">
        <a href={"/" + thisRest + "/menu/" + thisTable}>
          <button className="btn btn-dark btn-lg">View Cart</button>
        </a>
      </div>
      <div className="d-flex justify-content-center mt-3 mb-3">
        <h1> Your Check </h1>{" "}
      </div>
      {Object.keys(items || {}).map((key, i) => {
        var item = items[key];
        return (
          <Fragment key={key}>
            <div className="d-flex justify-content-between">
              <div>
                {" "}
                <h4>
                  {" "}
                  <span className="badge badge-dark">{item.quantity}</span>{" "}
                </h4>
              </div>
              <div>
                <div className="ml-3">
                  {" "}
                  <h4>{item.title}</h4>
                </div>
                <div>
                  {" "}
                  <h2> {item.notes}</h2>
                </div>
              </div>
              <div>
                {" "}
                <h4>
                  {" "}
                  <span className="badge badge-warning">
                    {showPrice(item.price, item.quantity)}
                  </span>{" "}
                </h4>
              </div>
            </div>
          </Fragment>
        );
      })}
      <hr />
      <div className="d-flex justify-content-between mt-3">
        <h3> Subtotal </h3>
        <h3>{Number(itemSubTotal).toFixed(2)} </h3>
      </div>
      <div className="d-flex justify-content-between mt-1">
        <h3> Tax </h3>
        <h3> {displayTax} </h3>
      </div>
      <hr />
      <div className="d-flex justify-content-between mt-1">
        <h3> Charged </h3>
        <h3>
          {" "}
          {displayTax != null && itemSubTotal != null
            ? Number(Number(displayTax) + Number(itemSubTotal)).toFixed(2)
            : 0}{" "}
        </h3>
      </div>
      <div className="d-flex justify-content-between mt-1">
        <h3> Tip </h3>
        <h3> {Number(tip).toFixed(2)} </h3>
      </div>
      <div className="d-flex justify-content-center mt-1">
        <div className="btn-group" style={{ width: "100%" }}>
          <button
            onClick={() => setTipPercent(18)}
            type="button"
            className="btn btn-outline-dark px-3"
            style={{ width: "20%" }}
          >
            18%
          </button>
          <button
            onClick={() => setTipPercent(20)}
            type="button"
            className="btn btn-outline-dark px-3"
            style={{ width: "20%" }}
          >
            20%
          </button>
          <button
            onClick={() => setTipPercent(25)}
            type="button"
            className="btn btn-outline-dark px-3"
            style={{ width: "20%" }}
          >
            25%
          </button>
          <button
            onClick={() => setTipPercent(30)}
            type="button"
            className="btn btn-outline-dark px-3"
            style={{ width: "20%" }}
          >
            30%
          </button>
          <button
            onClick={() => {
              setTip(0);
              setModalShow(true);
            }}
            type="button"
            className="btn btn-outline-dark px-3"
            style={{ width: "20%" }}
          >
            Other
          </button>
        </div>
      </div>
      <div
        onClick={e => e.stopPropagation()}
        className="d-flex justify-content-around"
      >
        <TipModal
          onHide={() => setModalShow(false)}
          setModalShow={setModalShow}
          show={modalShow}
          tip={tip}
          setCustomTip={setTip}
        />
      </div>
      <div className="d-flex justify-content-between mt-3">
        <h1>
          {" "}
          <strong> Total </strong>{" "}
        </h1>
        <h1>
          {" "}
          <span className="badge badge-success">{total}</span>{" "}
        </h1>
      </div>
      <div className="d-flex justify-content-center mt-3">
        <button
          className="btn btn-dark btn-lg btn-block"
          onClick={() => handlePayment()}
        >
          Finish and Pay
        </button>
      </div>
    </div>
  );
};

const TipModal = props => {
  const setValidatedTip = value => {
    if (value.match(/^\d*\.?\d*$/)) {
      props.setCustomTip(value);
    } else {
      props.setCustomTip(0);
    }
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Enter Custom Tip
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-around">
          <input
            className="form-control mx-3"
            type="text"
            value={props.tip}
            placeholder="Enter Tip Amt"
            onChange={e => setValidatedTip(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={() => props.setModalShow(false)}
          >
            {" "}
            Save{" "}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default Receipt;
