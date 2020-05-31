import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import WaiterRequest from "./WaiterRequest";
import { useHistory, generatePath } from "react-router-dom";
import useIsMounted from "react-is-mounted-hook";
import { useAlert } from "react-alert";

const TableBasket = props => {
  const alert = useAlert();
  var database = firebase.database();
  const isMounted = useIsMounted();
  const [tableData, setTableData] = useState({});
  const [newTabledata, setNewTableData] = useState({});
  const [currentBatch, setCurrentBatch] = useState(1);
  const { match } = props;
  const history = useHistory();

  useEffect(() => {
    if (isMounted()) {
      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          console.log("user signed in ");
        } else {
          console.log("user NOT signed in ");
        }
      });
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
  }, []);

  const handleAddMoreItems = seat => {
    const path = generatePath(match.path, {
      restaurant: match.params.restaurant,
      table: match.params.table
    });
    var pathExtra = "/" + seat + "/1";
    history.replace(path + pathExtra);
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

    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes();
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

    var batch_key = database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .push("").key;
    setCurrentBatch(batch_key);

    alert.show("Items Ordered, Awaiting Status");
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

    delete tableData["batches"][batch_key]["seat_data"][seat_num]["items"][
      item_key
    ];
    // removed only item, old batch key does not exist
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .once("value", function(snapshot) {
        console.log(batch_key_param);
        if (!snapshot.hasChild(batch_key_param)) {
          var batch_key_new = database
            .ref(match.params.restaurant)
            .child("tables")
            .child(match.params.table)
            .child("batches")
            .push("").key;
          setCurrentBatch(batch_key_new);
        }
      });
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center">
        <h1> Your Table: </h1>
      </div>
      <WaiterRequest match={match} />
      {Object.keys(tableData["batches"] || {}).map((batch_key, index) => {
        return (
          <Fragment key={batch_key}>
            {tableData["batches"][batch_key] != "" &&
            "ordered_at" in tableData["batches"][batch_key] ? (
              <h1>
                {" "}
                Ordered at {tableData["batches"][batch_key]["ordered_at"]}{" "}
              </h1>
            ) : (
              <h1> Pending Orders </h1>
            )}
            {Object.keys(
              tableData["batches"][batch_key]["seat_data"] || {}
            ).map((seat, i) => {
              var items =
                tableData["batches"][batch_key]["seat_data"][seat]["items"];
              return (
                <Fragment key={seat}>
                  <h2>
                    {" "}
                    Seat {seat}{" "}
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddMoreItems(seat)}
                    >
                      +
                    </button>{" "}
                  </h2>
                  {Object.keys(items || {}).map((key, i) => {
                    var item = items[key];
                    return (
                      <Fragment key={key}>
                        <div className="container">
                          <div className="row">
                            <div className="col"> {item["quantity"]} </div>
                            <div className="col-8">
                              <div>
                                {" "}
                                <strong>{item["title"]}</strong>
                              </div>
                              <div>{item["notes"]}</div>
                              <div>
                                <strong>Status </strong> {item["status"]}{" "}
                              </div>
                            </div>
                            <div className="col">
                              {!item["ordered"] ? (
                                <button
                                  className="btn btn-danger"
                                  onClick={() =>
                                    deleteItem(batch_key, seat, key)
                                  }
                                >
                                  x
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
      <div className="d-flex justify-content-center">
        <button className="btn btn-dark btn-lg" onClick={handleBatchOrder}>
          {" "}
          Order these items{" "}
        </button>
      </div>
      <h2> Requests </h2>
      {Object.keys(tableData["requests"] || {}).map((key, i) => {
        return (
          <React.Fragment key={key}>
            <div className="container">
              <div className="row">
                <strong> {tableData["requests"][key]["request"]} </strong> :
                {tableData["requests"][key]["status"]}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </Fragment>
  );
};

export default TableBasket;
