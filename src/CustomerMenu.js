import React, { useState, useEffect } from "react";
import "./App.css";
import * as firebase from "firebase";

const MenuItem = props => {
  const [title, SetTitle] = useState("title");
  const [description, setDescription] = useState("description");
  const [price, setPrice] = useState("price");

  return (
    <div>
      <p>
        {" "}
        <strong> {props.title} </strong>{" "}
      </p>
      <p>{props.description} </p>
      <p>
        {" "}
        <strong> Price: </strong> {props.price}
      </p>
      <button onClick={() => props.sendToWaiter(props.title)}>
        {" "}
        Send to Waiter{" "}
      </button>
    </div>
  );
};

const CustomerMenu = props => {
  var database = firebase.database();
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);

  const sendToWaiter = title => {
    database.ref("orders").push(title);
  };

  useEffect(() => {
    var tempMenu = [...menu];
    database
      .ref("menu")
      .once("value")
      .then(function(snapshot) {
        for (var key in snapshot.val()) {
          var item = snapshot.val()[key];
          var tempItem = {
            id: key,
            title: item.title,
            description: item.description,
            price: item.price
          };
          tempMenu.push(tempItem);
        }
        return tempMenu;
      })
      .then(menu => setMenu(menu));
  }, []);

  return (
    <div>
      <ul>
        {menu.map(item => (
          <MenuItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            price={item.price}
            sendToWaiter={sendToWaiter}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomerMenu;
