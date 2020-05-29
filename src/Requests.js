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

  return (
    <Fragment>
      <h1> Waiter requests for {match.params.restaurant} </h1>
      {Object.keys(requests || {}).map((request_key, index) => {
        return (
          <Fragment>
            <div>
              Request {requests[request_key]["request"]}
              Table {requests[request_key]["table"]}
              <button className="btn btn-primary"> Acknowledge </button>
              <button className="btn btn-success"> Complete </button>
            </div>
          </Fragment>
        );
      })}
    </Fragment>
  );
};

export default Requests;
