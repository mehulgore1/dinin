import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useAlert } from "react-alert";

const Requests = props => {
  const alert = useAlert();
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
      .set("Seen");

    alert.show("Table Notified");
  };

  return (
    <div className="container mt-5">
      <h1> Waiter requests for {match.params.restaurant} </h1>
      <div className="d-flex justify-content-around">
        <a href={"/" + match.params.restaurant + "/tables"}>
          <button className="btn btn-dark btn-lg"> Manage Tables </button>{" "}
        </a>
        <a href={"/" + match.params.restaurant + "/orders"}>
          <button className="btn btn-dark btn-lg"> View Orders </button>{" "}
        </a>
      </div>
      {Object.keys(requests || {}).map((request_key, index) => {
        return (
          <Fragment key={request_key}>
            <div className="d-flex justify-content-around">
              <h3>
                {" "}
                Table {requests[request_key]["table"]}:{" "}
                {requests[request_key]["request"]}{" "}
              </h3>
            </div>{" "}
            <div className="d-flex justify-content-around">
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
    </div>
  );
};

export default Requests;
