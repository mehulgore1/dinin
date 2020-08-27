import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";
import { useHistory } from "react-router-dom";
import { useAlert } from "react-alert";
import ManagerMenu from "./ManagerMenu";

const Tables = props => {
  const history = useHistory();
  const database = firebase.database();
  const [tables, setTables] = useState([]);
  const [restName, setRestName] = useState(null);
  const [shortName, setShortName] = useState(null);
  const [managerId, setManagerId] = useState(null);

  const initTables = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("tables")
      .on("value", function(snapshot) {
        if (snapshot.val() != null) {
          setTables(Object.keys(snapshot.val()));
        } else {
          setTables([]);
        }
      });
  };

  useEffect(() => {
    initSignedInState();
  }, []);

  useEffect(() => {
    if (shortName != null && restName != null) {
      initTables();
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

  const finishSession = tableNum => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("tables")
      .child(tableNum)
      .child("users")
      .once("value")
      .then(function(snapshot) {
        return snapshot.val();
      })
      .then(users => {
        database
          .ref("restaurants")
          .child(shortName)
          .child("tables")
          .child(tableNum)
          .child("past_users")
          .update(users);
      })
      .then(irr => {
        database
          .ref("restaurants")
          .child(shortName)
          .child("tables")
          .child(tableNum)
          .child("users")
          .remove();

        database
          .ref("restaurants")
          .child(shortName)
          .child("tables")
          .child(tableNum)
          .child("batches")
          .remove();

        database
          .ref("restaurants")
          .child(shortName)
          .child("tables")
          .child(tableNum)
          .child("requests")
          .remove();
        window.alert("Table is Empty and Ready for Next Customer");
      });
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
      {shortName != null ? <ManagerMenu shortName={shortName} /> : null}
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
