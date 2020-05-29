import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Root from "./Root";
import * as serviceWorker from "./serviceWorker";
import * as firebase from "firebase";

var firebaseConfig = {
  apiKey: "AIzaSyA5mq106o1VmVPrEJef61P2XNNLcFsE2uQ",
  authDomain: "dinin-2f0b9.firebaseapp.com",
  databaseURL: "https://dinin-2f0b9.firebaseio.com",
  projectId: "dinin-2f0b9",
  storageBucket: "dinin-2f0b9.appspot.com",
  messagingSenderId: "181153685615",
  appId: "1:181153685615:web:35cb2d9171341283aa6d9a",
  measurementId: "G-YSTCM76J2T"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
