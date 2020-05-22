import React, { useState, useEffect } from "react";
import * as firebase from "firebase";

const Order = props => {
  return (
    <div>
      <strong> Item </strong>
      {props.title}
      <strong> Notes </strong> {props.notes}
      <button onClick={() => props.completeOrder(props.id)}> Done </button>
    </div>
  );
};

const OrderQ = props => {
  var database = firebase.database();
  const [orders, setOrders] = useState([]);

  const completeOrder = id => {
    database
      .ref("orders")
      .child(id)
      .remove();
    setOrders(orders.filter(item => item.id !== id));
  };

  useEffect(() => {
    database.ref("orders").on("value", function(snapshot) {
      var tempOrders = [...orders];
      for (var key in snapshot.val()) {
        var thisOrder = snapshot.val()[key];
        var tempOrder = {
          id: key,
          title: thisOrder.title,
          notes: thisOrder.notes
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
      {orders.map(order => (
        <Order
          key={order.id}
          id={order.id}
          title={order.title}
          notes={order.notes}
          completeOrder={completeOrder}
        />
      ))}
    </>
  );
};

export default OrderQ;
