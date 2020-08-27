import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useHistory } from "react-router-dom";
import { useAlert } from "react-alert";
import ManagerMenu from "./ManagerMenu";

const Requests = props => {
  const history = useHistory();
  const alert = useAlert();
  const [requests, setRequests] = useState({});
  var database = firebase.database();
  const [restName, setRestName] = useState(null);
  const [shortName, setShortName] = useState(null);
  const [managerId, setManagerId] = useState(null);

  const initRequests = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("requests")
      .on("value", function(snapshot) {
        setRequests(snapshot.val());
      });
  };

  useEffect(() => {
    initSignedInState();
  }, []);

  useEffect(() => {
    if (shortName != null && restName != null) {
      initRequests();
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

  const completeRequest = request_key => {
    var table = requests[request_key]["table"];
    delete requests[request_key];
    database
      .ref("restaurants")
      .child(shortName)
      .child("requests")
      .child(request_key)
      .remove();

    database
      .ref("restaurants")
      .child(shortName)
      .child("tables")
      .child(table)
      .child("requests")
      .child(request_key)
      .remove();
  };

  const ackRequest = request_key => {
    var table = requests[request_key]["table"];
    database
      .ref("restaurants")
      .child(shortName)
      .child("tables")
      .child(table)
      .child("requests")
      .child(request_key)
      .child("status")
      .set("Seen");

    database
      .ref("restaurants")
      .child(shortName)
      .child("requests")
      .child(request_key)
      .child("status")
      .set("Seen");

    alert.show("Table Notified");
  };

  const requestSeen = request_key => {
    return (
      requests[request_key] != null && requests[request_key]["status"] == "Seen"
    );
  };

  return (
    <div className="container mt-5">
      {shortName != null ? <ManagerMenu shortName={shortName} /> : null}
      {Object.keys(requests || {}).map((request_key, index) => {
        return (
          <Fragment key={request_key}>
            <div className="d-flex justify-content-around mt-4">
              <h3>
                {" "}
                Table {requests[request_key]["table"]}:{" "}
                {requests[request_key]["request"]}{" "}
              </h3>
            </div>{" "}
            <div className="d-flex justify-content-around">
              {requestSeen(request_key) ? (
                <h2> Seen ✓ </h2>
              ) : (
                <button
                  onClick={() => ackRequest(request_key)}
                  className="btn btn-primary"
                >
                  {" "}
                  Acknowledge{" "}
                </button>
              )}
              <button
                onClick={() => completeRequest(request_key)}
                className="btn btn-success"
              >
                {" "}
                Complete{" "}
              </button>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
};

export default Requests;
