import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import WaiterRequest from "./WaiterRequest";
import { useHistory, generatePath } from "react-router-dom";
import { useAlert } from "react-alert";
import TableDone from "./TableDone";
import BasketItem from "./BasketItem";

const TableBasket = props => {
  const alert = useAlert();
  const history = useHistory();

  const database = firebase.database();
  const [tableData, setTableData] = useState({});
  const [reverseBatches, setReverseBatches] = useState([]);
  const [reverseRequests, setReverseRequests] = useState([]);
  const [currentBatch, setCurrentBatch] = useState(1);

  const { match } = props;

  const [tableDone, setTableDone] = useState(false);
  const [userId, setUserId] = useState(null);
  const [hidePastOrders, setHidePastOrders] = useState(true);

  useEffect(() => {
    initSignedInState();
    initTableData();
  }, []);

  useEffect(() => {
    if ("batches" in tableData) {
      const arr = [];
      Object.keys(tableData["batches"]).forEach(key => {
        arr.push({ [key]: tableData["batches"][key] });
      });
      setReverseBatches(arr.slice(0).reverse());
    }
    if ("requests" in tableData) {
      const arr = [];
      Object.keys(tableData["requests"]).forEach(key => {
        arr.push({ [key]: tableData["requests"][key] });
      });
      setReverseRequests(arr.slice(0).reverse());
    }
  }, [tableData]);

  useEffect(() => {
    if (userId != null) {
      initTableDone();
    }
  }, [userId]);

  const initTableDone = () => {
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .on("value", function(snapshot) {
        if (snapshot.hasChild("past_users")) {
          database
            .ref(match.params.restaurant)
            .child("tables")
            .child(match.params.table)
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

  const initSignedInState = () => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setUserId(user.uid);
      } else {
        console.log("user NOT signed in ");
        setUserId(null);
      }
    });
  };

  const initTableData = () => {
    database
      .ref(match.params.restaurant)
      .child("tables")
      .once("value")
      .then(function(snapshot) {
        return snapshot.hasChild(match.params.table);
      })
      .then(exists => {
        if (exists) {
          database
            .ref(match.params.restaurant)
            .child("tables")
            .child(match.params.table)
            .on("value", function(snapshot) {
              if (snapshot.val() != null) {
                setTableData(snapshot.val());
              } else {
                setTableData({});
              }
            });

          database
            .ref(match.params.restaurant)
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
  };

  const handleAddMoreItems = () => {
    var seat = tableData["users"][userId]["seat"];
    const path = generatePath(match.path, {
      restaurant: match.params.restaurant,
      table: match.params.table
    });
    var pathExtra = "/" + seat + "/1";
    history.replace(path + pathExtra);
  };

  const formatAMPM = date => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };

  const showConfirmAlert = () => {
    var confirmOrder = window.confirm(
      "Are you sure you want to order these items?"
    );
    if (confirmOrder) {
      handleBatchOrder();
    }
  };

  const handleBatchOrder = () => {
    var batchObject = tableData["batches"][currentBatch];
    if (batchObject == "") {
      return;
    }
    batchObject["table"] = match.params.table;

    for (var seat in tableData["batches"][currentBatch]["seat_data"]) {
      for (var item_key in tableData["batches"][currentBatch]["seat_data"][
        seat
      ]["items"]) {
        tableData["batches"][currentBatch]["seat_data"][seat]["items"][
          item_key
        ]["ordered"] = true;
        database
          .ref(match.params.restaurant)
          .child("tables")
          .child(match.params.table)
          .child("batches")
          .child(currentBatch)
          .child("seat_data")
          .child(seat)
          .child("items")
          .child(item_key)
          .update({ ordered: true });
      }
    }

    var time = formatAMPM(new Date());
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .child(currentBatch)
      .child("ordered_at")
      .set(time);

    database
      .ref(match.params.restaurant)
      .child("order_queue")
      .child(currentBatch)
      .set(batchObject);
    var userSeat = tableData["users"][userId]["seat"];
    var seat_data = tableData["batches"][currentBatch]["seat_data"];

    for (var seat in seat_data) {
      var user_id = getUserIdForSeat(seat);
      var userItems = seat_data[seat]["items"];

      database
        .ref(match.params.restaurant)
        .child("tables")
        .child(match.params.table)
        .child("users")
        .child(user_id)
        .child("items")
        .update(userItems);
    }

    var batch_key = database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .push("").key;
    setCurrentBatch(batch_key);

    alert.success("Order Sent, Awaiting Status");
  };

  const deleteItem = (batch_key, seat_num, item_key) => {
    const batch_key_param = batch_key;
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .child(batch_key)
      .child("seat_data")
      .child(seat_num)
      .child("items")
      .child(item_key)
      .remove();
    // removed only item, old batch key does not exist
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .once("value", function(snapshot) {
        console.log(batch_key_param);
        if (!snapshot.hasChild(batch_key_param)) {
          // set to same batch key
          database
            .ref(match.params.restaurant)
            .child("tables")
            .child(match.params.table)
            .child("batches")
            .child(batch_key_param)
            .set("");
        }
      });
  };

  const hasBeenOrdered = batch_key => {
    return (
      tableData["batches"] != null &&
      tableData["batches"][batch_key] != null &&
      tableData["batches"][batch_key] != "" &&
      "ordered_at" in tableData["batches"][batch_key]
    );
  };

  const emptyOrder = batch_key => {
    return (
      tableData["batches"] != null &&
      tableData["batches"][batch_key] != null &&
      tableData["batches"][batch_key] == ""
    );
  };

  const showBatchText = batch_key => {
    if (!emptyOrder(batch_key) && hasBeenOrdered(batch_key)) {
      // item ordered, show time
      return <h3> {tableData["batches"][batch_key]["ordered_at"]} </h3>;
    } else if (!emptyOrder(batch_key) && !hasBeenOrdered(batch_key)) {
      // pending order, show "yet to order"
      return <h1> Your Table's Cart </h1>;
    } else {
      return null;
    }
  };

  const showOrderButton = batch_key => {
    return !emptyOrder(batch_key) && !hasBeenOrdered(batch_key);
  };

  const getUserNameForSeat = this_seat => {
    for (var user in tableData["users"]) {
      if (tableData["users"][user]["seat"] == this_seat) {
        return tableData["users"][user]["name"];
      }
    }
  };

  const getUserIdForSeat = this_seat => {
    for (var user_id in tableData["users"]) {
      if (tableData["users"][user_id]["seat"] == this_seat) {
        return user_id;
      }
    }
  };

  const userInThisSeat = this_seat => {
    return (
      tableData["users"] != null &&
      tableData["users"][userId] != null &&
      tableData["users"][userId]["seat"] == this_seat
    );
  };

  return (
    <div className="">
      {tableDone ? (
        <TableDone />
      ) : (
        <div className="container mt-3 mb-5">
          <WaiterRequest match={match} />
          <div className="d-flex justify-content-around mt-3">
            <button
              className="btn btn-dark btn-lg mb-3"
              onClick={() => handleAddMoreItems()}
            >
              + Add More Items
            </button>
          </div>
          {reverseBatches.map((batch_obj, batch_index) => {
            return (
              <Fragment key={batch_index}>
                {!hidePastOrders && batch_index == 1 ? (
                  <button
                    className="btn btn-lg btn-block btn-primary mb-3"
                    onClick={() => setHidePastOrders(true)}
                  >
                    Hide Past Orders
                  </button>
                ) : null}
                {hidePastOrders && batch_index == 1 ? (
                  <button
                    className="btn btn-lg btn-block btn-primary mb-3"
                    onClick={() => setHidePastOrders(false)}
                  >
                    Show Past Orders
                  </button>
                ) : null}
                {Object.keys(reverseBatches[batch_index] || {}).map(
                  (batch_key, index) => {
                    if (hidePastOrders && hasBeenOrdered(batch_key)) {
                      return null;
                    }
                    if (
                      tableData["batches"] == null ||
                      tableData["batches"][batch_key] == null ||
                      tableData["batches"][batch_key]["seat_data"] == null
                    ) {
                      return null;
                    }
                    return (
                      <div className="" key={batch_key}>
                        {showBatchText(batch_key)}
                        {Object.keys(
                          tableData["batches"][batch_key]["seat_data"] || {}
                        ).map((seat, i) => {
                          var items =
                            tableData["batches"][batch_key]["seat_data"][seat][
                              "items"
                            ];
                          return (
                            <Fragment key={seat}>
                              <h3 className="ml-3">
                                {getUserNameForSeat(seat)}
                              </h3>
                              {Object.keys(items || {}).map((item_key, i) => {
                                var item = items[item_key];
                                const itemRef = database
                                  .ref(match.params.restaurant)
                                  .child("tables")
                                  .child(match.params.table)
                                  .child("batches")
                                  .child(batch_key)
                                  .child("seat_data")
                                  .child(seat)
                                  .child("items")
                                  .child(item_key);

                                return (
                                  <BasketItem
                                    key={item_key}
                                    item={item}
                                    itemRef={itemRef}
                                    item_key={item_key}
                                    batch_key={batch_key}
                                    seat={seat}
                                    deleteItem={deleteItem}
                                    tableData={tableData}
                                    userInThisSeat={userInThisSeat}
                                  />
                                );
                              })}
                            </Fragment>
                          );
                        })}
                        {showOrderButton(batch_key) ? (
                          <div className="d-flex justify-content-around mb-3">
                            <button
                              className="btn btn-lg btn-dark btn-block"
                              onClick={showConfirmAlert}
                            >
                              {" "}
                              Order these items{" "}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                )}
              </Fragment>
            );
          })}
          <div className="">
            {" "}
            <h1> Requests </h1>{" "}
          </div>
          {reverseRequests.map((request_obj, index) => {
            return (
              <Fragment key={index}>
                {Object.keys(reverseRequests[index] || {}).map((key, i) => {
                  if (
                    tableData["requests"] == null ||
                    tableData["requests"][key] == null ||
                    tableData["requests"][key]["requestedAt"] == null
                  ) {
                    return null;
                  }
                  return (
                    <Fragment key={key}>
                      <div className="container ml-3 mt-3">
                        <div className="row">
                          <div>
                            {" "}
                            <h5>
                              {" "}
                              {tableData["requests"][key]["requestedAt"]}
                            </h5>{" "}
                          </div>
                        </div>
                        <div className="row">
                          {" "}
                          <h6>
                            <strong>
                              {tableData["requests"][key]["request"]} :{" "}
                            </strong>
                            {tableData["requests"][key]["status"]}
                          </h6>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableBasket;
