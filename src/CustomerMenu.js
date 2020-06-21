import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./App.css";
import * as firebase from "firebase";
import MenuItem from "./MenuItem";
import LoginForm from "./LoginForm";
import WaiterRequest from "./WaiterRequest";
import { useAlert } from "react-alert";
import TableDone from "./TableDone";
import SignOutButton from "./SignOutButton";

const CustomerMenu = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [totalStages, setTotalStages] = useState(4);
  const [menu, setMenu] = useState(null);
  const [restaurant, setRestaurant] = useState("");
  const [table, setTable] = useState("");
  const [seat, setSeat] = useState(0);
  const [signedIn, setSignedIn] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [seatTaken, setSeatTaken] = useState(false);
  const [stageNames, setStageNames] = useState({});
  const [tableDone, setTableDone] = useState(false);
  const [cartSize, setCartSize] = useState(0);

  const [stageNum, setStageNum] = useState(0);
  const [stageDesc, setStageDesc] = useState("");
  const [stageName, setStageName] = useState("");

  const [loaded, setLoaded] = useState(false);

  const { match } = props;
  const params = match.params;
  const thisRest = params.restaurant;

  const history = useHistory();

  useEffect(() => {
    if (userId != null) {
      initTableDone();
    }
  }, [userId]);

  useEffect(() => {
    if (!tableDone && userId != null) {
      addUserToSeat();
    }
  }, [tableDone, userId]);

  useEffect(() => {
    setStageNum(params.stage);
  }, [props.location]);

  useEffect(() => {
    if (menu != null && menu[stageNum] != null) {
      setStageName(menu[stageNum]["stage_name"]);
      setStageDesc(menu[stageNum]["stage_desc"]);
    }
  }, [menu, stageNum]);

  useEffect(() => {
    initMenu();
    initSignedInState();
    setRestaurant(thisRest);
    setTable(params.table);
    setSeat(params.seat);
    initBatch();
  }, []);

  useEffect(() => {
    if (currentBatch != null) {
      initCartSize();
    }
  }, [currentBatch]);

  const initCartSize = () => {
    database
      .ref(thisRest)
      .child("tables")
      .child(params.table)
      .child("batches")
      .child(currentBatch)
      .on("value", function(snapshot) {
        const val = snapshot.val();
        if (
          val &&
          val["seat_data"] &&
          val["seat_data"][params.seat] &&
          val["seat_data"][params.seat]["items"]
        ) {
          var items = val["seat_data"][params.seat]["items"];
          var size = 0;
          for (var key in items) {
            size += parseInt(items[key]["quantity"], 10);
          }
          setCartSize(size);
        }
      });
  };

  const initTableDone = () => {
    database
      .ref(thisRest)
      .child("tables")
      .child(params.table)
      .on("value", function(snapshot) {
        if (snapshot.hasChild("past_users")) {
          database
            .ref(thisRest)
            .child("tables")
            .child(params.table)
            .child("past_users")
            .on("value", function(snapshot) {
              setTableDone(snapshot.hasChild(userId));
            });
        } else {
          // previously unseen table, set to false
          setTableDone(false);
        }
      });
  };

  const sendToTable = (item_id, title, notes, category, quantity, price) => {
    const id = item_id;
    var item = {
      title: title,
      notes: notes,
      category: category,
      quantity: quantity,
      status: "Order Sent",
      ordered: false,
      price: price
    };
    database
      .ref(thisRest)
      .child("tables")
      .child(table)
      .child("batches")
      .child(currentBatch)
      .child("seat_data")
      .child(seat)
      .child("items")
      .push(item);
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

  const addUserToSeat = () => {
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
          .ref(thisRest)
          .child("tables")
          .child(params.table)
          .child("users")
          .child(userId)
          .update({
            name: name,
            seat: params.seat,
            water_ordered: false
          });
      });
  };

  const initSignedInState = () => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setSignedIn(true);
        setUserId(user.uid);
      } else {
        console.log("user NOT signed in ");
        setSignedIn(false);
        database
          .ref(thisRest)
          .child("tables")
          .child(params.table)
          .child("users")
          .once("value")
          .then(function(snapshot) {
            var userMap = snapshot.val();
            for (var user_id in userMap) {
              if (params.seat == userMap[user_id]["seat"]) {
                setSeatTaken(true);
                window.alert("Someone is sitting here! Scan another seat");
              }
            }
          });
      }
    });
  };

  const initMenu = () => {
    var finalMenu = {};
    database
      .ref(thisRest)
      .once("value")
      .then(function(snapshot) {
        return snapshot.exists();
      })
      .then(valid => {
        if (valid) {
          database
            .ref(thisRest)
            .child("menu")
            .once("value")
            .then(function(snapshot) {
              var tempMenu = snapshot.val();
              for (var stage in tempMenu) {
                // get stage names for menu
                var temp = stageNames;
                temp[stage] = tempMenu[stage]["stage_name"];
                setStageNames(temp);
              }
              setMenu(tempMenu);
              setTotalStages(Object.keys(tempMenu).length);
              setLoaded(true);
            });
        }
      })
      .catch(error => console.log(error));
  };

  const initBatch = () => {
    database
      .ref(thisRest)
      .child("tables")
      .child(params.table)
      .child("batches")
      .on("value", function(snapshot) {
        if (!snapshot.exists()) {
          // create first batch key
          var batch_key = database
            .ref(thisRest)
            .child("tables")
            .child(params.table)
            .child("batches")
            .push("").key;
          setCurrentBatch(batch_key);
        } else {
          // get last batch key
          database
            .ref(thisRest)
            .child("tables")
            .child(params.table)
            .child("batches")
            .limitToLast(1)
            .on("value", function(snapshot) {
              snapshot.forEach(function(child) {
                setCurrentBatch(child.key);
              });
            });
        }
      });
  };

  return (
    <div>
      {loaded ? (
        <div className="container mt-3 mb-5">
          {!signedIn ? (
            <LoginForm seatTaken={seatTaken} match={match} />
          ) : (
            <Fragment>
              {tableDone ? (
                <TableDone />
              ) : (
                <Fragment>
                  <div className="fixed-top white-bg mb-1">
                    <WaiterRequest match={match} />
                    <div className="hs mb-3 mt-3">
                      {Object.keys(stageNames).map(thisStage => {
                        var buttonClass =
                          thisStage == stageNum
                            ? "btn-dark"
                            : "btn-outline-dark";
                        return (
                          <button
                            key={thisStage}
                            onClick={() => routeToStage(thisStage)}
                            className={"btn item " + buttonClass}
                          >
                            {stageNames[thisStage]}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ paddingTop: "130px" }}>
                    <h1> {stageName} </h1>
                    <p> {stageDesc} </p>
                    {Object.keys(menu[stageNum]["items"]).map(item_key => {
                      var item = menu[stageNum]["items"][item_key];
                      return (
                        <ul key={item_key} className="pl-0">
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
                      );
                    })}
                    <SignOutButton
                      userId={userId}
                      restaurant={thisRest}
                      table={params.table}
                    />
                  </div>
                  <div className="fixed-bottom mb-4 d-flex justify-content-center">
                    <a href={"/" + thisRest + "/menu/" + table}>
                      <button className="btn btn-dark btn-lg">
                        View Cart{" "}
                        {cartSize != 0 ? (
                          <span className="badge badge-success">
                            {" "}
                            {cartSize}{" "}
                          </span>
                        ) : null}
                      </button>
                    </a>
                  </div>
                </Fragment>
              )}
            </Fragment>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default CustomerMenu;
