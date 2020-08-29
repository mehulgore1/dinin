import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./../App.css";
import * as firebase from "firebase";
import MenuItem from "./MenuItem";
import LoginForm from "./LoginForm";
import WaiterRequest from "./WaiterRequest";
import { useAlert } from "react-alert";
import TableDone from "./TableDone";
import SignOutButton from "./SignOutButton";
import TopBarMenu from "../TopBarMenu";

const CustomerMenu = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [totalStages, setTotalStages] = useState(4);
  const [signedIn, setSignedIn] = useState(true);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [stageNames, setStageNames] = useState({});
  const [tableDone, setTableDone] = useState(false);
  const [cartSize, setCartSize] = useState(0);
  const [tableUsers, setTableUsers] = useState({});
  const [isValidMenu, setIsValidMenu] = useState(false);

  const [menu, setMenu] = useState(null);
  const [currSeat, setCurrSeat] = useState(null);

  const [stageNum, setStageNum] = useState(0);
  const [stageDesc, setStageDesc] = useState("");
  const [stageName, setStageName] = useState("");

  const [loaded, setLoaded] = useState(false);

  const { match } = props;
  const params = match.params;
  const restName = params.restaurant;
  const table = params.table;

  const history = useHistory();

  useEffect(() => {
    if (userId != null) {
      initTableDone();
      initTableUsers();
    }
  }, [userId]);

  useEffect(() => {
    if (!tableDone && userId != null) {
      initSeatNum();
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
    initBatch();
  }, []);

  useEffect(() => {
    if (currentBatch != null && currSeat != null) {
      addUserToSeat();
      initCartSize();
    }
  }, [currentBatch, currSeat]);

  useEffect(() => {
    setIsValidMenu(
      currSeat != null &&
        menu != null &&
        menu[stageNum] != null &&
        menu[stageNum]["items"] != null &&
        menu[stageNum]["items"] != "null"
    );
  }, [currSeat, menu]);

  const initSeatNum = () => {
    database
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .child("users")
      .child(userId)
      .once("value")
      .then(snapshot => {
        setCurrSeat(snapshot.val().seat);
      });
  };

  const initTableUsers = () => {
    database
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .child("users")
      .on("value", function(snapshot) {
        var users = snapshot.val();
        var tempSplitSeats = {};
        for (var id in users) {
          var name = users[id]["name"];
          var seat = users[id]["seat"];
          tempSplitSeats[seat] = {};
          tempSplitSeats[seat]["taken"] = false;
          tempSplitSeats[seat]["name"] = name;
          tempSplitSeats[seat]["user_id"] = id;
        }
        setTableUsers(tempSplitSeats);
      });
  };

  const initCartSize = () => {
    database
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .child("batches")
      .child(currentBatch)
      .on("value", function(snapshot) {
        const val = snapshot.val();
        if (
          val &&
          val["seat_data"] &&
          val["seat_data"][currSeat] &&
          val["seat_data"][currSeat]["items"]
        ) {
          var items = val["seat_data"][currSeat]["items"];
          var size = 0;
          for (var key in items) {
            size += Number(items[key]["quantity"]);
          }
          setCartSize(Math.ceil(size));
        }
      });
  };

  const initTableDone = () => {
    database
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .on("value", function(snapshot) {
        if (snapshot.hasChild("past_users")) {
          database
            .ref("restaurants")
            .child(restName)
            .child("tables")
            .child(table)
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

  const sendToTable = (
    thisSeat,
    item_id,
    title,
    notes,
    category,
    quantity,
    price,
    splitSeats
  ) => {
    const id = item_id;
    if (splitSeats != null) {
      // handle splitting items
      var splitCount = 0;
      for (var seat in splitSeats) {
        // find number of splitting people
        if (splitSeats[seat]["taken"]) {
          splitCount++;
        }
      }
      var fraction = Number((quantity / splitCount).toFixed(2));
      var item = {
        title: title,
        notes: notes,
        category: category,
        quantity: fraction,
        status: "Order Sent",
        ordered: false,
        price: price
      };
      item.split = splitSeats;
      // push current user first and get key
      var key = database
        .ref("restaurants")
        .child(restName)
        .child("tables")
        .child(table)
        .child("batches")
        .child(currentBatch)
        .child("seat_data")
        .child(thisSeat)
        .child("items")
        .push(item).key;
      for (var currSeat in splitSeats) {
        database
          .ref("restaurants")
          .child(restName)
          .child("tables")
          .child(table)
          .child("batches")
          .child(currentBatch)
          .child("seat_data")
          .child(currSeat)
          .child("items")
          .child(key)
          .update(item);
      }
    } else {
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
        .ref("restaurants")
        .child(restName)
        .child("tables")
        .child(table)
        .child("batches")
        .child(currentBatch)
        .child("seat_data")
        .child(thisSeat)
        .child("items")
        .push(item);
    }
  };

  const routeToStage = stage => {
    const path = generatePath(match.path, {
      restaurant: restName,
      table: table,
      seat: currSeat,
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
          .ref("restaurants")
          .child(restName)
          .child("tables")
          .child(table)
          .child("users")
          .child(userId)
          .update({
            name: name,
            seat: currSeat,
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
      }
    });
  };

  const initMenu = () => {
    database
      .ref("restaurants")
      .child(restName)
      .once("value")
      .then(function(snapshot) {
        return snapshot.exists();
      })
      .then(valid => {
        if (valid) {
          database
            .ref("restaurants")
            .child(restName)
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
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .child("batches")
      .on("value", function(snapshot) {
        if (!snapshot.exists()) {
          // create first batch key
          var batch_key = database
            .ref("restaurants")
            .child(restName)
            .child("tables")
            .child(table)
            .child("batches")
            .push("").key;
          setCurrentBatch(batch_key);
        } else {
          // get last batch key
          database
            .ref("restaurants")
            .child(restName)
            .child("tables")
            .child(table)
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
            <LoginForm match={match} />
          ) : (
            <Fragment>
              {tableDone ? (
                <TableDone />
              ) : (
                <Fragment>
                  <div className="fixed-top white-bg mb-1">
                    <WaiterRequest match={match} />
                    <TopBarMenu
                      stageNum={stageNum}
                      stageNames={stageNames}
                      routeToStage={routeToStage}
                    />
                  </div>

                  <div style={{ paddingTop: "130px" }}>
                    <h1> {stageName} </h1>
                    <p> {stageDesc} </p>
                    {isValidMenu ? (
                      <div>
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
                                tableUsers={tableUsers}
                                match={match}
                                userId={userId}
                                currSeat={currSeat}
                              />
                            </ul>
                          );
                        })}
                      </div>
                    ) : null}
                    <SignOutButton
                      userId={userId}
                      restaurant={restName}
                      table={table}
                    />
                  </div>
                  <div className="fixed-bottom mb-4 d-flex justify-content-center">
                    <a href={"/" + restName + "/" + table + "/cart"}>
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
