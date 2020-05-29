import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const SignOutButton = props => {
  const handleSignOut = () => {
    props.setSignedInFalse();
    firebase.auth().signOut();
  };

  return (
    <Fragment>
      <button onClick={handleSignOut} className="btn btn-danger">
        {" "}
        Sign Out{" "}
      </button>
    </Fragment>
  );
};

export default SignOutButton;
