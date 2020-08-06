import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const Receipt = props => {
  const database = firebase.database();
  const [items, setItems] = useState({});
  const [userId, setUserId] = useState(null);
  const { match } = props;

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("user signed in ");
        setUserId(user.uid);
      } else {
        console.log("user NOT signed in ");
      }
    });
  }, []);

  useEffect(() => {
    if (userId != null) {
      database
        .ref(match.params.restaurant)
        .child("tables")
        .child(match.params.table)
        .child("users")
        .child(userId)
        .child("items")
        .on("value", function(snapshot) {
          setItems(snapshot.val());
        });
    }
  }, [userId]);

  return (
    <Fragment>
      <div className="d-flex justify-content-center">
        <h1> Receipt </h1>{" "}
      </div>
      {Object.keys(items || {}).map((key, i) => {
        var item = items[key];
        return (
          <Fragment key={key}>
            <div className="d-flex justify-content-between">
              <div className="ml-3">
                {" "}
                <h2> {item["quantity"]} </h2>
              </div>
              <div>
                <div>
                  {" "}
                  <h2>{item["title"]}</h2>
                </div>
                <div>
                  {" "}
                  <h2> {item["notes"]}</h2>
                </div>
              </div>
              <div className="mr-3">
                {" "}
                <h2> ${item["price"]} </h2>
              </div>
            </div>
          </Fragment>
        );
      })}
      <div className="d-flex justify-content-center">
        <a href={"/" + match.params.restaurant + "/menu/" + match.params.table}>
          <button className="btn btn-dark btn-lg">Go to Table Dashboard</button>
        </a>
      </div>
    </Fragment>
  );
};

export default Receipt;
