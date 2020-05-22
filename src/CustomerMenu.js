import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
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
      <button> Send to Waiter </button>
    </div>
  );
};

const CustomerMenu = props => {
  var database = firebase.database();
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);

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
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomerMenu;
