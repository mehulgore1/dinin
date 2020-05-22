import React, { useState, useEffect } from "react";
import "./App.css";
import * as firebase from "firebase";
import { notStrictEqual } from "assert";

const MenuItem = props => {
  const [notes, setNotes] = useState("");

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
      <input
        type="text"
        value={notes}
        placeholder="notes"
        onChange={e => setNotes(e.target.value)}
      />
      <button onClick={() => props.sendToWaiter(props.title, notes)}>
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

  const sendToWaiter = (title, notes) => {
    var temp = {
      title: title,
      notes: notes
    };
    console.log(temp);
    database.ref("orders").push(temp);
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
