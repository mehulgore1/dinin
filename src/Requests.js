import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const Requests = props => {
  const [requests, setRequests] = useState({});
  var database = firebase.database();
  const { match } = props;

  useEffect(() => {
    database
      .ref(match.params.restaurant)
      .child("requests")
      .on("value", function(snapshot) {
        setRequests(snapshot.val());
      });
  }, []);

  const completeRequest = request_key => {
    var table = requests[request_key]["table"];
    delete requests[request_key];
    database
      .ref(match.params.restaurant)
      .child("requests")
      .child(request_key)
      .remove();

    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(table)
      .child("requests")
      .child(request_key)
      .remove();
  };

  const ackRequest = request_key => {
    var table = requests[request_key]["table"];
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(table)
      .child("requests")
      .child(request_key)
      .child("status")
      .set("Acknowledged");
  };

  return (
    <Fragment>
      <h1> Waiter requests for {match.params.restaurant} </h1>
      {Object.keys(requests || {}).map((request_key, index) => {
        return (
          <Fragment key={request_key}>
            <div>
              Request {requests[request_key]["request"]}
              Table {requests[request_key]["table"]}
              <button
                onClick={() => ackRequest(request_key)}
                className="btn btn-primary"
              >
                {" "}
                Acknowledge{" "}
              </button>
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
    </Fragment>
  );
};

export default Requests;
