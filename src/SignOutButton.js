import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const SignOutButton = props => {
  const handleSignOut = () => {
    firebase.auth().signOut();
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center">
        <button onClick={handleSignOut} className="btn btn-danger btn-lg">
          {" "}
          Sign Out{" "}
        </button>
      </div>
    </Fragment>
  );
};

export default SignOutButton;
