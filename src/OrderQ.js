import React, { useState, useEffect, Fragment } from "react";
import * as firebase from "firebase";

const Order = props => {
  return (
    <div>
      <strong> Item </strong>
      {props.title}
      <strong> Notes </strong> {props.notes}
      <strong> Table </strong> {props.table}
      <button onClick={() => props.completeOrder(props.id)}> Done </button>
    </div>
  );
};

const OrderQ = props => {
  var database = firebase.database();
  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const { match } = props;
  const tempRest = match.params.restaurant;

  const completeOrder = id => {};

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
            <h2> Table {orders[batch_key]["table"]} </h2>
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
