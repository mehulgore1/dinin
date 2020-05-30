import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useAlert } from "react-alert";

const OrderQ = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const { match } = props;
  const tempRest = match.params.restaurant;

  const sendStatus = (table, batch, seat_num, item_key, status) => {
    database
      .ref(tempRest)
      .child("tables")
      .child(table)
      .child("batches")
      .child(batch)
      .child("seat_data")
      .child(seat_num)
      .child("items")
      .child(item_key)
      .update({ status: status });

    alert.show("Table Notified");
  };

  const removeBatchOrder = batch_key => {
    database
      .ref(tempRest)
      .child("order_queue")
      .child(batch_key)
      .remove();

    delete orders[batch_key];
  };

  const completeBatch = (table, batch_key) => {
    for (var seat in orders[batch_key]["seat_data"]) {
      for (var item_key in orders[batch_key]["seat_data"][seat]["items"]) {
        database
          .ref(tempRest)
          .child("tables")
          .child(table)
          .child("batches")
          .child(batch_key)
          .child("seat_data")
          .child(seat)
          .child("items")
          .child(item_key)
          .update({ status: "Order Submitted" });
      }
    }

    alert.show("Table Notified. Click Finish Order to Remove");
  };

  useEffect(() => {
    setRestaurant(tempRest);
    database
      .ref(tempRest)
      .child("order_queue")
      .on("value", function(snapshot) {
        console.log(snapshot.val());
        setOrders(snapshot.val());
      });
  }, []);

  return (
    <>
      <h1> Orders for {restaurant} </h1>
      {Object.keys(orders || {}).map((batch_key, index) => {
        return (
          <Fragment key={batch_key}>
            <h2>
              {" "}
              Table {orders[batch_key]["table"]}{" "}
              <button
                className="btn btn-danger"
                onClick={() => removeBatchOrder(batch_key)}
              >
                {" "}
                Finish Order{" "}
              </button>
              <button
                className="btn btn-success"
                onClick={() =>
                  completeBatch(orders[batch_key]["table"], batch_key)
                }
              >
                Complete All
              </button>
            </h2>
            {Object.keys(orders[batch_key]["seat_data"] || {}).map(
              (seat, i) => {
                var items = orders[batch_key]["seat_data"][seat]["items"];
                return (
                  <Fragment key={seat}>
                    <h3>Seat {seat}</h3>
                    {Object.keys(items || {}).map((key, i) => {
                      var item = items[key];
                      return (
                        <Fragment key={key}>
                          <p>
                            {" "}
                            {item["category"]} -- {item["quantity"]},{" "}
                            {item["title"]} -- {item["notes"]}
                            <button
                              className="btn btn-success"
                              onClick={() =>
                                sendStatus(
                                  orders[batch_key]["table"],
                                  batch_key,
                                  seat,
                                  key,
                                  "Order Submitted"
                                )
                              }
                            >
                              {" "}
                              Complete{" "}
                            </button>
                            <button
                              className="btn btn-warning"
                              onClick={() =>
                                sendStatus(
                                  orders[batch_key]["table"],
                                  batch_key,
                                  seat,
                                  key,
                                  "Issue, Waiter Coming"
                                )
                              }
                            >
                              {" "}
                              Waiter coming{" "}
                            </button>
                          </p>
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              }
            )}
          </Fragment>
        );
      })}
    </>
  );
};

export default OrderQ;
