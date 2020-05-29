import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const OrderQ = props => {
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
      .child("status")
      .set(status);
  };

  const completeBatch = batch_key => {
    database
      .ref(tempRest)
      .child("order_queue")
      .child(batch_key)
      .remove();

    delete orders[batch_key];
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
                onClick={() => completeBatch(batch_key)}
              >
                {" "}
                Finish Table Round{" "}
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
                            Category {item["category"]} Title {item["title"]}{" "}
                            Quantity {item["quantity"]} Notes {item["notes"]}
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
