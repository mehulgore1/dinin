import React, { useState, useEffect } from "react";
import * as firebase from "firebase";

const Order = props => {
  return (
    <div>
      {props.title}
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
        var tempOrder = {
          id: key,
          title: snapshot.val()[key]
        };
        tempOrders.push(tempOrder);
      }
      console.log(tempOrders);
      setOrders(tempOrders);
    });

    database.ref("orders").on("child_added", function(snapshot, irr) {
      var tempOrders = [...orders];
      var tempOrder = {
        id: snapshot.key,
        title: snapshot.val()
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
          completeOrder={completeOrder}
        />
      ))}
    </>
  );
};

export default OrderQ;
