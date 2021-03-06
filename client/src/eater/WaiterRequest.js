import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useAlert, positions } from "react-alert";

const WaiterRequest = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [userId, setUserId] = useState({});
  const [users, setUsers] = useState({});
  const { match } = props;
  const restName = match.params.restaurant;
  const table = match.params.table;

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

  const handleSendRequest = request => {
    var time = formatAMPM(new Date());
    const requestObj = {
      table: props.match.params.table,
      request: request,
      status: "Pending",
      requestedAt: time
    };
    var key = database
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .child("requests")
      .push(requestObj).key;

    database
      .ref("restaurants")
      .child(restName)
      .child("requests")
      .child(key)
      .set(requestObj);

    alert.show("Waitstaff Notified", {
      timeout: 2000,
      position: positions.MIDDLE
    });
  };

  const showInputConfirmAlert = () => {
    var notes = window.prompt("Enter message to waitstaff");
    if (notes != null) {
      handleSendRequest(notes);
    }
  };

  const getWater = () => {
    if (users[userId] != null) {
      if (users[userId]["water_ordered"]) {
        // has already ordered water, refill
        handleSendRequest("Water Refill Requested");
      } else {
        // hasn't ordered water get 1 glass
        handleSendRequest("One New Glass of Water Requested");
        database
          .ref("restaurants")
          .child(restName)
          .child("tables")
          .child(table)
          .child("users")
          .child(userId)
          .child("water_ordered")
          .set(true);
      }
    }
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setUserId(user.uid);
      }
    });
    database
      .ref("restaurants")
      .child(restName)
      .child("tables")
      .child(table)
      .child("users")
      .on("value", function(snapshot) {
        setUsers(snapshot.val());
      });
  }, []);

  return (
    <div className="d-flex justify-content-around mt-3">
      <button
        className="btn btn-warning btn-lg"
        onClick={showInputConfirmAlert}
      >
        Waiter Request
      </button>
      <a href={"/" + restName + "/" + table + "/receipt"}>
        <button className="btn btn-dark btn-lg">View Check</button>{" "}
      </a>
    </div>
  );
};

export default WaiterRequest;
