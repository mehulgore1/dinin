import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import * as firebase from "firebase";

const Tables = props => {
  var database = firebase.database();
  const [tables, setTables] = useState([]);
  const { match } = props;

  useEffect(() => {
    database
      .ref(match.params.restaurant)
      .child("tables")
      .on("value", function(snapshot) {
        if (snapshot.val() != null) {
          setTables(Object.keys(snapshot.val()));
        } else {
          setTables([]);
        }
      });
  }, []);

  const finishSession = tableNum => {
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(tableNum)
      .remove();
  };

  const showConfirmAlert = tableNum => {
    var confirmOrder = window.confirm(
      "Are you sure? All table data will be deleted"
    );
    if (confirmOrder) {
      finishSession(tableNum);
    }
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-center">
        <h1> Table Management </h1>
      </div>
      <div className="d-flex justify-content-around">
        <a href={"/" + match.params.restaurant + "/orders"}>
          {" "}
          <button className="btn btn-lg btn-dark">Orders</button>{" "}
        </a>
        <a href={"/" + match.params.restaurant + "/requests"}>
          <button className="btn btn-dark btn-lg"> View Requests </button>{" "}
        </a>
      </div>
      {tables.map(tableNum => {
        return (
          <div key={tableNum} className="d-flex justify-content-around mt-3">
            <h1> Table {tableNum} </h1>
            <button
              onClick={() => showConfirmAlert(tableNum)}
              className="btn btn btn-danger"
            >
              {" "}
              Finish Table Session{" "}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Tables;
