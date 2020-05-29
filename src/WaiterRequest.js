import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const WaiterRequest = props => {
  var database = firebase.database();
  //const [request, setRequest] = useState("Get water");

  //   const handleRequestChange = event => {
  //     setRequest(event.target.value);
  //   };

  const handleSendRequest = request => {
    const requestObj = {
      table: props.match.params.table,
      request: request,
      status: ""
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
  };

  return (
    <Fragment>
      <div className="container">
        <div className="d-flex justify-content-around">
          <button
            className="btn btn-primary"
            onClick={() => handleSendRequest("Water Requested")}
          >
            {" "}
            Water{" "}
          </button>
          <button
            className="btn btn-warning"
            onClick={() => handleSendRequest("Waitstaff Requested")}
          >
            {" "}
            Call Waitstaff{" "}
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleSendRequest("Check Requested")}
          >
            {" "}
            Get Check{" "}
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
