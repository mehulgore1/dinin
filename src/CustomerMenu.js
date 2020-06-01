import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./App.css";
import * as firebase from "firebase";
import MenuItem from "./MenuItem";
import LoginForm from "./LoginForm";
import SignOutButton from "./SignOutButton";
import { useAlert } from "react-alert";

const CustomerMenu = props => {
  const alert = useAlert();
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

  const sendToTable = (title, notes, category, quantity) => {
    var item = {
      title: title,
      notes: notes,
      category: category,
      quantity: quantity,
      status: "Pending",
      ordered: false
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

    alert.success("Item Added!");
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

  const handlePrevStageClick = () => {
    var nextStage = parseInt(stage, 10) - 1;
    if (nextStage < 1) {
      nextStage = 1;
    }
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
    <Fragment>
      {!signedIn ? (
        <LoginForm setSignedInTrue={setSignedInTrue} match={match} />
      ) : (
        <Fragment>
          <SignOutButton setSignedInFalse={setSignedInFalse} />
          {isValid ? (
            <Fragment>
              <div className="d-flex justify-content-center">
                <h1>
                  {" "}
                  {restaurant} Seat {seat}
                </h1>
              </div>
              <a href={"/" + tempRest + "/menu/" + table}>
                <button className="btn btn-primary btn-block">
                  Go to Table Dashboard
                </button>
              </a>

              <Fragment>
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
                            sendToTable={sendToTable}
                            category={item.category}
                            match={match}
                            //deleteMenuItem={deleteMenuItem}
                          />
                        </ul>
                      ))}
                    </Fragment>
                  );
                })}
              </Fragment>
              {stage == 1 ? (
                <div className="d-flex justify-content-around">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleNextStageClick}
                  >
                    {" "}
                    Next Section{" "}
                  </button>
                </div>
              ) : null}

              {stage > 1 && stage < 4 ? (
                <div className="d-flex justify-content-around">
                  <button
                    className="btn btn-primary"
                    onClick={handlePrevStageClick}
                  >
                    {" "}
                    Previous Section{" "}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleNextStageClick}
                  >
                    {" "}
                    Next Section{" "}
                  </button>
                </div>
              ) : null}

              {stage == 4 ? (
                <div className="d-flex justify-content-around">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handlePrevStageClick}
                  >
                    Previous Section
                  </button>
                </div>
              ) : null}
            </Fragment>
          ) : (
            <h1>
              {" "}
              Whoops! You've reached an invalid URL. Try a different link!{" "}
            </h1>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

export default CustomerMenu;
