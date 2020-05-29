import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./App.css";
import * as firebase from "firebase";
import MenuItem from "./MenuItem";
import LoginForm from "./LoginForm";
import SignOutButton from "./SignOutButton";

const CustomerMenu = props => {
  var database = firebase.database();
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [table, setTable] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [seat, setSeat] = useState(0);
  const [stage, setStage] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(1);

  const { match } = props;
  const tempRest = match.params.restaurant;

  const history = useHistory();

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
      .child("batches")
      .child(currentBatch)
      .child("seat_data")
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
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setSignedIn(true);
      } else {
        console.log("user NOT signed in ");
      }
    });
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

    database
      .ref(tempRest)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .on("value", function(snapshot) {
        if (!snapshot.exists()) {
          // create first batch key
          var batch_key = database
            .ref(tempRest)
            .child("tables")
            .child(match.params.table)
            .child("batches")
            .push("").key;
          setCurrentBatch(batch_key);
        } else {
          // get last batch key
          database
            .ref(tempRest)
            .child("tables")
            .child(match.params.table)
            .child("batches")
            .limitToLast(1)
            .on("value", function(snapshot) {
              snapshot.forEach(function(child) {
                setCurrentBatch(child.key);
              });
            });
        }
      });
  }, []);

  const setSignedInTrue = () => {
    setSignedIn(true);
  };

  const setSignedInFalse = () => {
    setSignedIn(false);
  };

  return (
    <>
      {!signedIn ? (
        <LoginForm setSignedInTrue={setSignedInTrue} />
      ) : (
        <Fragment>
          <SignOutButton setSignedInFalse={setSignedInFalse} />
          {isValid ? (
            <>
              <h1> Welcome to {restaurant}</h1>
              <h1>
                You are at table {table} seat {seat}
              </h1>

              <a href={"/menu/" + tempRest + "/" + table}>
                <button className="btn btn-primary btn-block">
                  Go to Table Dashboard
                </button>
              </a>

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
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleNextStageClick}
                >
                  {" "}
                  Next Stage{" "}
                </button>
              ) : null}
            </>
          ) : (
            <h1>
              {" "}
              Whoops! You've reached an invalid URL. Try a different link!{" "}
            </h1>
          )}
        </Fragment>
      )}
    </>
  );
};

export default CustomerMenu;
