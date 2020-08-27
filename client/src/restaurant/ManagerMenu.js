import React, { useState, useEffect, Fragment } from "react";
import "../App.css";
import * as firebase from "firebase";
import { useHistory } from "react-router-dom";

const ManagerMenu = props => {
  const history = useHistory();
  const shortName = props.shortName;
  const database = firebase.database();
  const [numRequests, setNumRequests] = useState(0);
  const [numOrders, setNumOrders] = useState(0);

  useEffect(() => {
    initNumOrders();
    initNumRequests();
  }, []);

  const initNumOrders = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("order_queue")
      .on("value", function(snapshot) {
        setNumOrders(snapshot.numChildren());
      });
  };

  const initNumRequests = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("requests")
      .on("value", function(snapshot) {
        setNumRequests(snapshot.numChildren());
      });
  };

  const handleSignOut = () => {
    firebase.auth().signOut();
    history.replace("/manager");
  };

  return (
    <div>
      <div className="d-flex justify-content-around mt-5">
        <a href={"/manager/menu/0"}>
          <button className="btn btn-dark btn-lg"> Dashboard </button>{" "}
        </a>
        <a href={"/manager/tables"}>
          <button className="btn btn-dark btn-lg"> Tables </button>{" "}
        </a>
        <a href={"/manager/requests"}>
          <button className="btn btn-dark btn-lg">
            Requests{" "}
            {numRequests != 0 ? (
              <span className="badge badge-success"> {numRequests}</span>
            ) : null}
          </button>{" "}
        </a>
        <a href={"/manager/orders"}>
          <button className="btn btn-dark btn-lg">
            {" "}
            Orders{" "}
            {numOrders != 0 ? (
              <span className="badge badge-success"> {numOrders}</span>
            ) : null}
          </button>{" "}
        </a>
        <button className="btn btn-danger" onClick={handleSignOut}>
          {" "}
          Sign out{" "}
        </button>{" "}
      </div>
    </div>
  );
};

export default ManagerMenu;
