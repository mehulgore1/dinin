import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./App.css";
import * as firebase from "firebase";
import * as firebaseui from "firebaseui";
import WaiterRequest from "./WaiterRequest";

const MenuItem = props => {
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = event => {
    setQuantity(event.target.value);
  };

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
      <label>
        Quantity
        <select value={quantity} onChange={handleQuantityChange}>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </label>
      <button
        onClick={() =>
          props.sendToWaiter(props.title, notes, props.category, quantity)
        }
      >
        Add to Table
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
  const [stage, setStage] = useState(0);
  const [signedIn, setSignedIn] = useState(true);
  const { match } = props;
  const tempRest = match.params.restaurant;

  const ui =
    firebaseui.auth.AuthUI.getInstance() ||
    new firebaseui.auth.AuthUI(firebase.auth());

  const history = useHistory();

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

  const sendToWaiter = (title, notes, category, quantity) => {
    var item = {
      title: title,
      notes: notes,
      category: category,
      quantity: quantity,
      status: ""
    };
    database
      .ref(tempRest)
      .child("tables")
      .child(table)
      .child("seats")
      .child(seat)
      .child("items")
      .push(item);
  };

  const handleNextStageClick = () => {
    var nextStage = parseInt(stage, 10) + 1;
    const path = generatePath(match.path, {
      restaurant: restaurant,
      table: table,
      seat: seat,
      stage: nextStage
    });
    history.replace(path);
  };

  useEffect(() => {
    setStage(match.params.stage);
  }, [props.location]);

  useEffect(() => {
    // firebase.auth().onAuthStateChanged(function(user) {
    //   if (user) {
    //     console.log("user signed in ");
    //   } else {
    //     console.log("user NOT signed in ");
    //   }
    // });
    //ui.start("#firebaseui-auth-container", uiConfig);
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
              for (var stage in snapshot.val()) {
                if (!(stage in finalMenu)) {
                  finalMenu[stage] = {};
                }
                for (var category in snapshot.val()[stage]) {
                  if (!(category in finalMenu[stage])) {
                    finalMenu[stage][category] = [];
                  }
                  var categoryItems = snapshot.val()[stage][category];
                  for (var key in categoryItems) {
                    var item = categoryItems[key];
                    var tempItem = {
                      id: key,
                      title: item.title,
                      description: item.description,
                      price: item.price,
                      category: item.category
                    };
                    finalMenu[stage][category].push(tempItem);
                  }
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
              <button>
                <a href={"/menu/" + tempRest + "/" + table}>
                  Go to Table Dashboard
                </a>
              </button>
              <>
                {Object.keys(menu[stage] || {}).map((category, i) => {
                  return (
                    <Fragment key={category}>
                      <h1> {category} </h1>
                      {menu[stage][category].map(item => (
                        <ul key={item.id}>
                          <MenuItem
                            key={item.id}
                            id={item.id}
                            title={item.title}
                            description={item.description}
                            price={item.price}
                            sendToWaiter={sendToWaiter}
                            category={item.category}
                            //deleteMenuItem={deleteMenuItem}
                          />
                        </ul>
                      ))}
                    </Fragment>
                  );
                })}
              </>
              {stage <= 3 ? (
                <button onClick={handleNextStageClick}> Next Stage </button>
              ) : null}
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
