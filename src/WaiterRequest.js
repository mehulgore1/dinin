import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useAlert } from "react-alert";

const WaiterRequest = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [userId, setUserId] = useState({});
  const [users, setUsers] = useState({});
  //const [request, setRequest] = useState("Get water");

  //   const handleRequestChange = event => {
  //     setRequest(event.target.value);
  //   };

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
      .ref(props.match.params.restaurant)
      .child("tables")
      .child(props.match.params.table)
      .child("requests")
      .push(requestObj).key;

    database
      .ref(props.match.params.restaurant)
      .child("requests")
      .child(key)
      .set(requestObj);

    alert.show("Waitstaff Notified");
  };

  const showInputConfirmAlert = () => {
    var notes = window.prompt("Enter message to waitstaff");
    if (notes != null) {
      handleSendRequest(notes);
    }
  };

  const getWater = () => {
    for (var user in users) {
      if (users[user] != null) {
        if (users[user]["water_ordered"]) {
          // has already ordered water, refill
          handleSendRequest("Water Refill Requested");
        } else {
          // hasn't ordered water get 1 glass
          handleSendRequest("1 New Glass of Water Requested");
          database
            .ref(props.match.params.restaurant)
            .child("tables")
            .child(props.match.params.table)
            .child("users")
            .child(userId)
            .child("water_ordered")
            .set(true);
        }
      }
    }
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setUserId(user.uid);
      } else {
        console.log("user NOT signed in ");
      }
    });
    database
      .ref(props.match.params.restaurant)
      .child("tables")
      .child(props.match.params.table)
      .child("users")
      .on("value", function(snapshot) {
        setUsers(snapshot.val());
      });
  }, []);

  return (
    <div className="d-flex justify-content-around mt-3">
      <button className="btn btn-primary btn-lg" onClick={getWater}>
        Water
      </button>
      <button
        className="btn btn-warning btn-lg"
        onClick={showInputConfirmAlert}
      >
        Call Waitstaff
      </button>
    </div>
  );
};

export default WaiterRequest;
