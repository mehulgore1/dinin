import React, { useState, useEffect, Fragment } from "react";
import { useHistory, generatePath } from "react-router-dom";
import "./App.css";
import * as firebase from "firebase";

const SignOutButton = props => {
  const database = firebase.database();

  const handleSignOut = () => {
    // remove user from table
    database
      .ref(props.restaurant)
      .child("tables")
      .child(props.table)
      .child("users")
      .child(props.userId)
      .remove();
    firebase.auth().signOut();
  };

  return (
    <div className="d-flex justify-content-center">
      <button onClick={handleSignOut} className="btn btn-outline-secondary">
        {" "}
        Sign Out{" "}
      </button>
    </div>
  );
};

export default SignOutButton;
