import React, { useState, useEffect } from "react";
import "./App.css";
import * as firebase from "firebase";
import * as firebaseui from "firebaseui";
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
        Send to Kitchen
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
  const [seat, setSeat] = useState(0);
  const [signedIn, setSignedIn] = useState(true);
  const { match } = props;
  const tempRest = match.params.restaurant;

  const ui =
    firebaseui.auth.AuthUI.getInstance() ||
    new firebaseui.auth.AuthUI(firebase.auth());

  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        console.log(authResult.user.uid);
        console.log(authResult.user.phoneNumber);
        database
          .ref("users")
          .child(authResult.user.uid)
          .child("phone_number")
          .set(authResult.user.phoneNumber);
        setSignedIn(true);
        return true;
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: "popup",
    signInOptions: [firebase.auth.PhoneAuthProvider.PROVIDER_ID]
  };

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
    ui.start("#firebaseui-auth-container", uiConfig);
    setRestaurant(tempRest);
    setTable(match.params.table);
    setSeat(match.params.seat);
    var finalMenu = {};

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
              for (var category in snapshot.val()) {
                if (!(category in finalMenu)) {
                  finalMenu[category] = [];
                }
                var categoryItems = snapshot.val()[category];
                for (var key in categoryItems) {
                  var item = categoryItems[key];
                  var tempItem = {
                    id: key,
                    title: item.title,
                    description: item.description,
                    price: item.price
                  };
                  finalMenu[category].push(tempItem);
                }
              }
              console.log(finalMenu);
              return finalMenu;
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
    <>
      {!signedIn ? (
        <div id="firebaseui-auth-container"></div>
      ) : (
        <>
          {isValid ? (
            <>
              <h1> Welcome to {restaurant}</h1>
              <h1>
                You are at table {table} seat {seat}
              </h1>
              {Object.keys(menu).map((key, i) => {
                return (
                  <>
                    <h1> {key} </h1>
                    {menu[key].map(item => (
                      <ul>
                        <MenuItem
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          description={item.description}
                          price={item.price}
                          sendToWaiter={sendToWaiter}
                          //deleteMenuItem={deleteMenuItem}
                        />
                      </ul>
                    ))}
                  </>
                );
              })}
            </>
          ) : (
            <h1>
              {" "}
              Whoops! You've reached an invalid URL. Try a different link!{" "}
            </h1>
          )}
        </>
      )}
    </>
  );
};

export default CustomerMenu;
