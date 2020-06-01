import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useAlert } from "react-alert";

const WaiterRequest = props => {
  const alert = useAlert();
  var database = firebase.database();
  const [userId, setUserId] = useState({});
  const [seats, setSeats] = useState({});
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
    for (var seat in seats) {
      if (seats[seat] != null && seats[seat]["user_id"] == userId) {
        if (seats[seat]["waterOrdered"]) {
          // has already ordered water, refill
          handleSendRequest("Water Refill Requested");
        } else {
          // hasn't ordered water get 1 glass
          handleSendRequest("1 New Glass of Water Requested");
          database
            .ref(props.match.params.restaurant)
            .child("tables")
            .child(props.match.params.table)
            .child("seats")
            .child(seat)
            .child("waterOrdered")
            .set(true);
        }
      }
    }
  };

  useEffect(() => {
    database
      .ref(props.match.params.restaurant)
      .child("tables")
      .child(props.match.params.table)
      .child("seats")
      .on("value", function(snapshot) {
        setSeats(snapshot.val());
      });
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setUserId(user.uid);
      } else {
        console.log("user NOT signed in ");
      }
    });
  }, []);

  return (
    <Fragment>
      <div className="container">
        <div className="d-flex justify-content-around">
          <button className="btn btn-primary" onClick={getWater}>
            {" "}
            Water{" "}
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleSendRequest("Check Requested")}
          >
            {" "}
            Get Check{" "}
          </button>
          <button className="btn btn-warning" onClick={showInputConfirmAlert}>
            {" "}
            Call Waitstaff{" "}
          </button>
        </div>
      </div>
      {/* <label>
        Request
        <select value={request} onChange={handleRequestChange}>
          <option value="Get water"> Get/refill water </option>
          <option value="Waiter Needed"> Call waiter over </option>
        </select>
      </label>
      <button className="btn btn-primary" onClick={handleSendRequest}>
        {" "}
        Send Request{" "}
      </button> */}
    </Fragment>
  );
};

export default WaiterRequest;
