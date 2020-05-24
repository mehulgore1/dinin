import React, { useState, useEffect } from "react";
import "./App.css";
import * as firebase from "firebase";
import { notStrictEqual } from "assert";
import { cloneWithoutLoc } from "@babel/types";

const MenuItem = props => {
  const [notes, setNotes] = useState("");

  return (
    <div>
      <p>
        <strong> {props.title} </strong>
      </p>
      <p>{props.description} </p>
      <p>
        <strong> Price: </strong> {props.price}
      </p>
      <input
        type="text"
        value={notes}
        placeholder="notes"
        onChange={e => setNotes(e.target.value)}
      />
      <button onClick={() => props.sendToWaiter(props.title, notes)}>
        Send to Waiter
      </button>
    </div>
  );
};

const CustomerMenu = props => {
  var database = firebase.database();
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [table, setTable] = useState("");
  const [isValid, setIsValid] = useState(true);
  const { match } = props;
  const tempRest = match.params.restaurant;

  const sendToWaiter = (title, notes) => {
    var temp = {
      title: title,
      notes: notes,
      table: table
    };
    database
      .ref(tempRest)
      .child("orders")
      .push(temp);
  };

  useEffect(() => {
    setRestaurant(tempRest);
    setTable(match.params.table);
    var tempMenu = [...menu];

    database
      .ref(tempRest)
      .once("value")
      .then(function(snapshot) {
        return snapshot.exists();
      })
      .then(valid => {
        if (valid) {
          database
            .ref(tempRest)
            .child("menu")
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
              console.log(tempMenu);
              return tempMenu;
            })
            .then(menu => {
              setMenu(menu);
              setIsValid(true);
            });
        } else {
          setIsValid(false);
        }
      })
      .catch(error => setIsValid(false));
  }, []);

  return (
    <div>
      {isValid ? (
        <>
          <h1> Welcome to {restaurant}</h1>
          <h1> You are at table {table} </h1>
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
        </>
      ) : (
        <h1> Whoops! You've reached an invalid URL. Try a different link! </h1>
      )}
    </div>
  );
};

export default CustomerMenu;
