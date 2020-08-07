import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../App.css";
import * as firebase from "firebase";
import { useAlert } from "react-alert";

const ManagerLogin = props => {
  const { match } = props;
  const alert = useAlert();
  const history = useHistory();
  const database = firebase.database();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAccount, setHasAccount] = useState(true);
  const [restName, setRestName] = useState("");
  const [shortName, setShortName] = useState("");

  const handleSignup = () => {
    if (!shortName.match(/^[A-Za-z]+$/)) {
      alert.error("Short Name Needs to be lower case with no spaces");
      return;
    }
    if (
      !email.match(
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      alert.error("Please type a valid email");
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
          .ref("restaurants")
          .child(shortName)
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
      .then(result => {
        var url = "/manager/menu/0";
        history.replace(url);
      })
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
          <div>
            <div className="form-group">
              <label for="email">Email address</label>
              <input
                id="email"
                className="form-control"
                type="text"
                value={email}
                placeholder="Manager Email"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                className="form-control"
                type="password"
                value={password}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>
          <button onClick={handleLogin} className="btn btn-primary">
            Login
          </button>
        </div>
      ) : (
        <div>
          <h4> Setup your Restaurant: </h4>
          <div>
            <div className="form-group">
              <label for="restname">Full Restaurant Name</label>
              <input
                id="restname"
                className="form-control"
                type="text"
                value={restName}
                placeholder="Restaurant Name"
                onChange={e => setRestName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label for="shortname">
                Choose a Short Name (lowercase with no spaces to use with qr
                code links){" "}
              </label>
              <input
                id="shortname"
                className="form-control"
                type="text"
                value={shortName}
                placeholder="Create a short name"
                onChange={e => setShortName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label for="manageremail">Manager/Owner Email</label>
              <input
                if="manageremail"
                className="form-control"
                type="text"
                value={email}
                placeholder="Manager Email"
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                className="form-control"
                type="password"
                value={password}
                placeholder="Password"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
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
