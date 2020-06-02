import React, { useState, useEffect, Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const LoginForm = props => {
  const database = firebase.database();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [confResult, setConfResult] = useState({});
  const [name, setName] = useState("");
  const [anonName, setAnonName] = useState("");

  const onPhoneNumberChange = event => {
    setPhoneNumber(event.target.value);
  };

  const onAuthCodeChange = event => {
    setAuthCode(event.target.value);
  };

  const sendVerificationCode = () => {
    if (phoneNumber == "") {
      window.alert("Number is Empty!");
      return;
    }
    var appVerifier = window.recaptchaVerifier;
    firebase
      .auth()
      .signInWithPhoneNumber("+1" + phoneNumber, appVerifier)
      .then(function(confirmationResult) {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        console.log("SMS sent");
        window.confirmationResult = confirmationResult;
        setConfResult(confirmationResult);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  const signInWithPhoneNumber = () => {
    if (name == "") {
      window.alert("Name is Empty!");
      return;
    }
    if (Object.keys(confResult).length !== 0) {
      confResult
        .confirm(authCode)
        .then(function(result) {
          // User signed in successfully.
          var user = result.user;
          database
            .ref("users")
            .child(user.uid)
            .child("phone_number")
            .set(user.phoneNumber);
          addUserToDb(user.uid, name);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: function(response) {
          sendVerificationCode();
        }
      }
    );
  }, []);

  const signInAsGuest = () => {
    if (anonName != "") {
      firebase
        .auth()
        .signInAnonymously()
        .then(result => {
          addUserToDb(result.user.uid, anonName);
        })
        .catch(function(error) {
          console.log(error);
        });
    } else {
      window.alert("Name is Empty!");
    }
  };

  const addUserToDb = (uid, thisName) => {
    database
      .ref("users")
      .child(uid)
      .update({ name: thisName });

    database
      .ref(props.match.params.restaurant)
      .child("tables")
      .child(props.match.params.table)
      .child("users")
      .child(uid)
      .update({
        name: thisName,
        seat: props.match.params.seat,
        water_ordered: false
      });
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center mt-5">
        <h2> Welcome to {props.match.params.restaurant}</h2>
      </div>
      <div className="d-flex justify-content-center">
        <h2> Sign In With Phone </h2>
      </div>
      <div className="form-group">
        <input
          className="form-control mt-2"
          type="text"
          value={phoneNumber}
          placeholder="Phone Number"
          onChange={e => setPhoneNumber(e.target.value)}
        />
        <div className="d-flex justify-content-center mt-2">
          <button
            className="btn btn-primary btn-lg"
            onClick={sendVerificationCode}
          >
            {" "}
            Send Code{" "}
          </button>
        </div>
        <input
          className="form-control mt-2"
          type="text"
          value={authCode}
          placeholder="6-digit Verification Code"
          onChange={e => setAuthCode(e.target.value)}
        />
        <input
          className="form-control mt-2"
          type="text"
          value={name}
          placeholder="Enter your Name"
          onChange={e => setName(e.target.value)}
        />
        <div className="d-flex justify-content-center mt-2">
          <button
            className="btn btn-primary btn-lg"
            id="sign-in-button"
            onClick={signInWithPhoneNumber}
          >
            {" "}
            Let's Go!{" "}
          </button>
        </div>
      </div>
      <div className="d-flex justify-content-center">
        <h2> Sign In As Guest </h2>
      </div>
      <div className="form-group">
        <input
          className="form-control mt-2"
          type="text"
          value={anonName}
          placeholder="Enter your Name"
          onChange={e => setAnonName(e.target.value)}
        />
        <div className="d-flex justify-content-center mt-2">
          <button className="btn btn-secondary btn-lg" onClick={signInAsGuest}>
            Sign in As Guest
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default LoginForm;
