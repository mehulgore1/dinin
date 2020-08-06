import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../App.css";
import * as firebase from "firebase";

const ManagerLogin = props => {
  const { match } = props;
  const history = useHistory();
  const database = firebase.database();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(true);
  const [restName, setRestName] = useState("");
  const [shortName, setShortName] = useState("");

  const handleSignup = () => {
    if (!shortName.match(/^[A-Za-z]+$/)) {
      window.alert("Needs to be lower case with no spaces");
      return;
    }
    if (
      !email.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      window.alert("Please type a valid email");
      return;
    }
    // if (
    //   !password.match(
    //     /^(?=.*[A-Z].*[A-Z])(?=.*[!@#$&*])(?=.*[0-9].*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8}$/
    //   )
    // ) {
    //   window.alert("Please type a more secure password");
    //   return;
    // }
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(result => {
        var user = firebase.auth().currentUser;
        console.log(user);
        database
          .ref("managers")
          .child(user.uid)
          .update({
            email: email,
            restaurant_name: restName,
            restaurant_short_name: shortName
          });
        database
          .ref(shortName)
          .child("menu")
          .child(0)
          .update({
            stage_desc: "empty description",
            stage_name: "empty category"
          });
        var url = "/manager/menu/0";
        history.replace(url);
      })
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error);
      });
  };

  const handleLogin = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(result => {})
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error);
        // ...
      });
  };

  return (
    <div>
      <h1> Welcome to your Restaurant Dashboard </h1>
      {hasAccount ? (
        <div>
          {" "}
          <h4> Manager Login: </h4>
          <div className="form-group">
            <input
              className="form-control mt-5"
              type="text"
              value={email}
              placeholder="Manager Email"
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="form-control mt-5"
              type="password"
              value={password}
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleLogin} className="btn btn-primary">
            Login
          </button>
        </div>
      ) : (
        <div>
          <h4> Setup your Restaurant: </h4>
          <div className="form-group">
            <input
              className="form-control mt-5"
              type="text"
              value={restName}
              placeholder="Restaurant Name"
              onChange={e => setRestName(e.target.value)}
            />
            <input
              className="form-control mt-5"
              type="text"
              value={shortName}
              placeholder="Create a short name"
              onChange={e => setShortName(e.target.value)}
            />
            <input
              className="form-control mt-5"
              type="text"
              value={email}
              placeholder="Manager Email"
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="form-control mt-5"
              type="password"
              value={password}
              placeholder="Password"
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button onClick={handleSignup} className="btn btn-primary">
            Create Your Account
          </button>
        </div>
      )}
      {hasAccount ? (
        <button onClick={() => setHasAccount(false)}>
          {" "}
          Create an Account{" "}
        </button>
      ) : (
        <button onClick={() => setHasAccount(true)}>
          {" "}
          Login to existing account
        </button>
      )}
    </div>
  );
};

export default ManagerLogin;
