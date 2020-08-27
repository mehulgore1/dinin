import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useHistory } from "react-router-dom";
import * as firebase from "firebase";
import { useAlert } from "react-alert";
import ManagerMenu from "./ManagerMenu";

const OrderQ = props => {
  const alert = useAlert();
  const history = useHistory();
  var database = firebase.database();
  const [orders, setOrders] = useState([]);
  const { match } = props;
  const [numRequests, setNumRequests] = useState(0);
  const [restName, setRestName] = useState(null);
  const [shortName, setShortName] = useState(null);
  const [managerId, setManagerId] = useState(null);

  const sendStatus = (table, batch, seat_num, item_key, status) => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("tables")
      .child(table)
      .child("batches")
      .child(batch)
      .child("seat_data")
      .child(seat_num)
      .child("items")
      .child(item_key)
      .update({ status: status });

    alert.show("Table Notified");
  };

  const initSignedInState = () => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var uid = user.uid;
        database
          .ref("managers")
          .once("value")
          .then(snapshot => {
            if (!snapshot.hasChild(uid)) {
              routeToManagerLogin();
            } else {
              setManagerId(uid);
            }
          });
      } else {
        routeToManagerLogin();
      }
    });
  };

  const routeToManagerLogin = () => {
    var url = "/manager";
    history.replace(url);
  };

  const completeBatch = (table, batch_key) => {
    const thisTable = table;
    var confirm = window.confirm("Are you sure all items are in?");
    if (confirm) {
      database
        .ref("restaurants")
        .child(shortName)
        .child("tables")
        .once("value")
        .then(function(snapshot) {
          return snapshot.hasChild(thisTable);
        })
        .then(exists => {
          if (
            exists &&
            orders[batch_key] != null &&
            orders[batch_key]["seat_data"] != null
          ) {
            for (var seat in orders[batch_key]["seat_data"]) {
              for (var item_key in orders[batch_key]["seat_data"][seat][
                "items"
              ]) {
                database
                  .ref("restaurants")
                  .child(shortName)
                  .child("tables")
                  .child(table)
                  .child("batches")
                  .child(batch_key)
                  .child("seat_data")
                  .child(seat)
                  .child("items")
                  .child(item_key)
                  .update({ status: "Kitchen Preparing" });
              }
            }
          }
        })
        .then(() => {
          database
            .ref("restaurants")
            .child(shortName)
            .child("order_queue")
            .child(batch_key)
            .remove();

          delete orders[batch_key];

          alert.show("Removed From Queue, Table Notified");
        });
    }
  };

  useEffect(() => {
    initSignedInState();
  }, []);

  useEffect(() => {
    if (shortName != null && restName != null) {
      initOrders();
    }
  }, [shortName, restName]);

  useEffect(() => {
    if (managerId != null) {
      initRestNames();
    }
  }, [managerId]);

  const initRestNames = () => {
    database
      .ref("managers")
      .child(managerId)
      .once("value")
      .then(snapshot => {
        var manager = snapshot.val();
        setRestName(manager.restaurant_name);
        setShortName(manager.restaurant_short_name);
      });
  };

  const initOrders = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("order_queue")
      .on("value", function(snapshot) {
        setOrders(snapshot.val());
      });
    database
      .ref("restaurants")
      .child(shortName)
      .child("requests")
      .on("value", function(snapshot) {
        setNumRequests(snapshot.numChildren());
      });
  };

  return (
    <div className="container mt-5">
      {shortName != null ? <ManagerMenu shortName={shortName} /> : null}
      {Object.keys(orders || {}).map((batch_key, index) => {
        return (
          <Fragment key={batch_key}>
            <div className="d-flex justify-content-around">
              <h2> Table {orders[batch_key]["table"]} </h2>{" "}
            </div>
            {Object.keys(orders[batch_key]["seat_data"] || {}).map(
              (seat, i) => {
                var items = orders[batch_key]["seat_data"][seat]["items"];
                return (
                  <Fragment key={seat}>
                    <h3>Seat {seat}</h3>
                    {Object.keys(items || {}).map((key, i) => {
                      var item = items[key];
                      return (
                        <Fragment key={key}>
                          <div>
                            <h4>
                              {" "}
                              <strong> {item["category"]} </strong>{" "}
                              {item["quantity"]} {item["title"]}
                            </h4>{" "}
                          </div>{" "}
                          {item["notes"] != "" ? (
                            <div>
                              <h4>
                                <strong>Notes</strong> {item["notes"]}
                              </h4>
                            </div>
                          ) : null}
                          <div className="d-flex justify-content-around">
                            <button
                              className="btn btn-warning"
                              onClick={() =>
                                sendStatus(
                                  orders[batch_key]["table"],
                                  batch_key,
                                  seat,
                                  key,
                                  "Issue, Waiter Coming"
                                )
                              }
                            >
                              Issue
                            </button>
                          </div>
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              }
            )}
            <hr />
            <div className="d-flex justify-content-around">
              <button
                className="btn btn-success btn-lg btn-block"
                onClick={() =>
                  completeBatch(orders[batch_key]["table"], batch_key)
                }
              >
                Finish Table {orders[batch_key]["table"]}
              </button>
            </div>
            <hr />
          </Fragment>
        );
      })}
    </div>
  );
};

export default OrderQ;
