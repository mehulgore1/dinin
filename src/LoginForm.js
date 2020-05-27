import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import * as firebase from "firebase";
import { isProperty } from "@babel/types";

const LoginForm = props => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [confResult, setConfResult] = useState({});

  const onPhoneNumberChange = event => {
    setPhoneNumber(event.target.value);
  };

  const onAuthCodeChange = event => {
    setAuthCode(event.target.value);
  };

  const sendVerificationCode = () => {
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
    console.log(confResult);
    console.log(authCode);
    confResult
      .confirm(authCode)
      .then(function(result) {
        // User signed in successfully.
        props.setSignedInTrue();
        var user = result.user;
        console.log(user);
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  useEffect(() => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: function(response) {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      }
    );
  }, []);

  return (
    <Fragment>
      <input
        type="text"
        value={phoneNumber}
        placeholder="Phone Number"
        onChange={e => setPhoneNumber(e.target.value)}
      />
      <button onClick={sendVerificationCode}> Send Code </button>
      <input
        type="text"
        value={authCode}
        placeholder="6-digit Verification Code"
        onChange={e => setAuthCode(e.target.value)}
      />
      <button id="sign-in-button" onClick={signInWithPhoneNumber}>
        {" "}
        Let's Go!{" "}
      </button>
    </Fragment>
  );
};

export default LoginForm;
