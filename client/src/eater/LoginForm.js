import React, { useState, useEffect, Fragment } from "react";
import "../App.css";
import * as firebase from "firebase";
import { addUserToSeat, getNumUsersAtTable } from "../utils/firebase";

const LoginForm = props => {
  const database = firebase.database();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [confResult, setConfResult] = useState({});
  const [name, setName] = useState("");
  const [anonName, setAnonName] = useState("");
  const [offersChecked, setOffersChecked] = useState(true);
  const [guestSignIn, setGuestSignIn] = useState(false);
  const [numSeats, setNumSeats] = useState(0);
  const { match } = props;
  const restName = match.params.restaurant;
  const table = match.params.table;

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
            .update({
              phone_number: user.phoneNumber,
              type: "eater"
            });

          database
            .ref("users")
            .child(user.uid)
            .child("restaurants")
            .child(restName)
            .update({ offers: offersChecked });
          addUserToDb(user.uid, name);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  };

  useEffect(() => {
    initNumSeats();
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        callback: function(response) {}
      }
    );
  }, []);

  const initNumSeats = async () => {
    var seats = await getNumUsersAtTable(restName, table);
    setNumSeats(seats);
  };

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
    var seatNum = numSeats + 1;
    database
      .ref("users")
      .child(uid)
      .update({ name: thisName, type: "customer" });

    addUserToSeat(restName, table, uid, thisName, seatNum);
  };

  const showGuestSignIn = () => {
    setGuestSignIn(true);
  };

  return (
    <Fragment>
      <div className="d-flex justify-content-center mt-5">
        <h2 className="text-capitalize"> Welcome to {restName}</h2>
      </div>
      <div className="d-flex justify-content-center mt-5">
        <h2> Verify Your Seat </h2>
      </div>
      <div className="d-flex justify-content-center">
        <p> You only have to do this once! </p>
      </div>
      {/* <div className="d-flex justify-content-center mt-3">
        <Form.Group controlId="formBasicCheckbox">
          <Form.Check
            checked={offersChecked}
            onChange={e => setOffersChecked(e.target.checked)}
            type="checkbox"
            label="Text me Discounts"
          />
        </Form.Group>
      </div> */}
      <div className="form-group">
        <input
          className="form-control mt-5"
          type="text"
          value={phoneNumber}
          placeholder="Phone Number"
          onChange={e => setPhoneNumber(e.target.value)}
        />
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-warning btn-lg btn-block"
            onClick={sendVerificationCode}
          >
            {" "}
            Send Code{" "}
          </button>
        </div>
        <input
          className="form-control mt-5"
          type="text"
          value={authCode}
          placeholder="6-Digit Verification Code"
          onChange={e => setAuthCode(e.target.value)}
          autoComplete="one-time-code"
        />
        <input
          className="form-control mt-2"
          type="text"
          value={name}
          placeholder="Enter your Name"
          onChange={e => setName(e.target.value)}
        />
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-dark btn-lg btn-block"
            id="sign-in-button"
            onClick={signInWithPhoneNumber}
          >
            {" "}
            Let's Go!{" "}
          </button>
        </div>
      </div>
      {guestSignIn ? (
        <Fragment>
          <div className="d-flex justify-content-center">
            <h4 className="text-muted mt-5"> Sign In As Guest </h4>
          </div>
          <div className="d-flex justify-content-center">
            <p className="text-muted">
              Not Recommended - Your data will be lost
            </p>
          </div>
          <div className="form-group">
            <input
              className="form-control"
              type="text"
              value={anonName}
              placeholder="Enter your Name"
              onChange={e => setAnonName(e.target.value)}
            />
            <div
              onClick={function() {}}
              className="d-flex justify-content-center mt-2"
            >
              <button
                className="btn btn-outline-secondary btn-sm btn-block"
                onClick={signInAsGuest}
              >
                Guest Login
              </button>
            </div>
          </div>
        </Fragment>
      ) : (
        <div className="d-flex justify-content-center mt-5">
          <button onClick={showGuestSignIn} className="btn btn-link">
            {" "}
            Sign In a Different Way{" "}
          </button>
        </div>
      )}
    </Fragment>
  );
};

export default LoginForm;
