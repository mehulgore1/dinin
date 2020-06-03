import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./App.css";
import * as firebase from "firebase";
import MenuItem from "./MenuItem";
import LoginForm from "./LoginForm";
import WaiterRequest from "./WaiterRequest";
import { useAlert } from "react-alert";
import useIsMounted from "react-is-mounted-hook";

const CustomerMenu = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [totalStages, setTotalStages] = useState(4);
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [table, setTable] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [seat, setSeat] = useState(0);
  const [stage, setStage] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [currentBatch, setCurrentBatch] = useState(1);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const isMounted = useIsMounted();
  const [seatTaken, setSeatTaken] = useState(false);
  const [stageNames, setStageNames] = useState({});

  const { match } = props;
  const tempRest = match.params.restaurant;

  const history = useHistory();

  const sendToTable = (item_id, title, notes, category, quantity, price) => {
    const id = item_id;
    var item = {
      title: title,
      notes: notes,
      category: category,
      quantity: quantity,
      status: "Pending",
      ordered: false,
      price: price
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
      .child(id)
      .update(item);
    alert.success("Success! Order items from Table Dashboard");
  };

  const handleNextStageClick = () => {
    var nextStage = parseInt(stage, 10) + 1;
    routeToStage(nextStage);
  };

  const handlePrevStageClick = () => {
    var prevStage = parseInt(stage, 10) - 1;
    if (prevStage < 1) {
      prevStage = 1;
    }
    routeToStage(prevStage);
  };

  const routeToStage = stage => {
    const path = generatePath(match.path, {
      restaurant: restaurant,
      table: table,
      seat: seat,
      stage: stage
    });
    history.replace(path);
  };

  useEffect(() => {
    if (userId != null) {
      database
        .ref("users")
        .child(userId)
        .child("name")
        .once("value")
        .then(function(snapshot) {
          return snapshot.val();
        })
        .then(name => {
          setUserName(name);
          database
            .ref(match.params.restaurant)
            .child("tables")
            .child(match.params.table)
            .child("users")
            .child(userId)
            .update({
              name: name,
              seat: props.match.params.seat,
              water_ordered: false
            });
        });
    }
  }, [userId]);

  useEffect(() => {
    setStage(match.params.stage);
  }, [props.location]);

  useEffect(() => {
    if (isMounted) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log("user signed in ");
          setSignedIn(true);
          setUserId(user.uid);
        } else {
          console.log("user NOT signed in ");
          setSignedIn(false);
          database
            .ref(tempRest)
            .child("tables")
            .child(match.params.table)
            .child("users")
            .once("value")
            .then(function(snapshot) {
              var userMap = snapshot.val();
              for (var user_id in userMap) {
                if (match.params.seat == userMap[user_id]["seat"]) {
                  setSeatTaken(true);
                  window.alert("Someone is sitting here! Scan another seat");
                }
              }
            });
        }
      });
    }
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
                  if (category == "stage_name") {
                    var temp = stageNames;
                    temp[stage] = snapshot.val()[stage]["stage_name"];
                    setStageNames(temp);
                    continue;
                  }
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
              console.log(stageNames);
              console.log(finalMenu);
              console.log(snapshot.val().slice(1));
              return finalMenu;
            })
            .then(menu => {
              setMenu(menu);
              setIsValid(true);
              setTotalStages(Object.keys(menu).length);
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

  const handleSignOut = () => {
    // remove user from table
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("users")
      .child(userId)
      .remove();
    firebase.auth().signOut();
  };

  return (
    <div>
      <div className="container mt-3 mb-5">
        {!signedIn ? (
          <LoginForm seatTaken={seatTaken} match={match} />
        ) : (
          <Fragment>
            <div className="d-flex justify-content-center">
              <button onClick={handleSignOut} className="btn btn-danger btn-lg">
                {" "}
                Sign Out{" "}
              </button>
            </div>
            {isValid ? (
              <Fragment>
                <WaiterRequest match={match} />
                <div className="d-flex align-items-center justify-content-center">
                  <h2>
                    Seat {seat}: {userName}
                  </h2>
                </div>
                <div className="d-flex justify-content-center">
                  <a href={"/" + tempRest + "/menu/" + table}>
                    <button className="btn btn-dark btn-lg">
                      Table Dashboard
                    </button>
                  </a>
                </div>

                <div className="hs  ">
                  {Object.keys(stageNames).map(thisStage => {
                    var buttonClass =
                      thisStage == stage ? "btn-dark" : "btn-outline-dark";
                    return (
                      <button
                        onClick={() => routeToStage(thisStage)}
                        className={"btn item " + buttonClass}
                      >
                        {stageNames[thisStage]}
                      </button>
                    );
                  })}
                </div>

                <Fragment>
                  {Object.keys(menu[stage] || {}).map((category, i) => {
                    return (
                      <Fragment key={category}>
                        <h1> {category} </h1>
                        {menu[stage][category].map(item => (
                          <ul key={item.id} className="pl-0">
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
              </Fragment>
            ) : (
              <h1>
                {" "}
                Whoops! You've reached an invalid URL. Try a different link!{" "}
              </h1>
            )}
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default CustomerMenu;
