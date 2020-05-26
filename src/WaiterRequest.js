import React, { useState, useEffect } from "react";
import * as firebase from "firebase";

const WaiterRequest = props => {
  var database = firebase.database();
  const [request, setRequest] = useState("Get water");

  const handleRequestChange = event => {
    setRequest(event.target.value);
  };

  const handleSendRequest = () => {
    const requestObj = {
      request: request,
      status: ""
    };
    database
      .ref(props.match.params.restaurant)
      .child("tables")
      .child(props.match.params.table)
      .child("requests")
      .push(requestObj);
  };

  return (
    <>
      <label>
        Request
        <select value={request} onChange={handleRequestChange}>
          <option value="Get water"> Get/refill water </option>
          <option value="Waiter Needed"> Call waiter over </option>
        </select>
      </label>
      <button onClick={handleSendRequest}> Send Request </button>
    </>
  );
};

export default WaiterRequest;
