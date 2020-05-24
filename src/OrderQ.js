import React, { useState, useEffect } from "react";
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

  const completeOrder = id => {
    database
      .ref("orders")
      .child(id)
      .remove();
    setOrders(orders.filter(item => item.id !== id));
  };

  useEffect(() => {
    setRestaurant(match.params.restaurant);
    database.ref("orders").on("value", function(snapshot) {
      var tempOrders = [...orders];
      for (var key in snapshot.val()) {
        var thisOrder = snapshot.val()[key];
        var tempOrder = {
          id: key,
          title: thisOrder.title,
          notes: thisOrder.notes,
          table: thisOrder.table
        };
        tempOrders.push(tempOrder);
      }
      setOrders(tempOrders);
    });

    database.ref("orders").on("child_added", function(snapshot, irr) {
      var tempOrders = [...orders];
      var thisOrder = snapshot.val();
      var tempOrder = {
        id: snapshot.key,
        title: thisOrder.title,
        notes: thisOrder.notes
      };
      tempOrders.push(tempOrder);
      setOrders(tempOrders);
    });
  }, []);

  return (
    <>
      <h1> Orders for {restaurant} </h1>
      {orders.map(order => (
        <Order
          key={order.id}
          id={order.id}
          title={order.title}
          notes={order.notes}
          completeOrder={completeOrder}
          table={order.table}
        />
      ))}
    </>
  );
};

export default OrderQ;
