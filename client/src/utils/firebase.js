import * as firebase from "firebase";

var database = {};

export const initFirebase = () => {
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
  database = firebase.database();
};

export const addUserToSeat = (restName, table, uid, userName, seatNum) => {
  database
    .ref("restaurants")
    .child(restName)
    .child("tables")
    .child(table)
    .child("users")
    .child(uid)
    .update({
      name: userName,
      seat: seatNum,
      water_ordered: false
    });
};

export const isUserAtTable = async (restName, table, uid) => {
  return database
    .ref("restaurants")
    .child(restName)
    .child("tables")
    .child(table)
    .child("users")
    .once("value")
    .then(function(snapshot) {
      return snapshot.hasChild(uid);
    });
};

export const getUserName = async uid => {
  return database
    .ref("users")
    .child(uid)
    .once("value")
    .then(function(snapshot) {
      console.log(snapshot.val());
      return snapshot.val().name;
    });
};

export const getNumUsersAtTable = async (restName, table) => {
  return database
    .ref("restaurants")
    .child(restName)
    .child("tables")
    .child(table)
    .child("users")
    .on("value", function(snapshot) {
      var val = snapshot.val();
      if (val != null) {
        var seats = Object.keys(val).length;
        return seats;
      } else {
        return 0;
      }
    });
};

export const getCurrentSeat = async (restName, table, uid) => {
  return database
    .ref("restaurants")
    .child(restName)
    .child("tables")
    .child(table)
    .child("users")
    .child(uid)
    .once("value")
    .then(snapshot => {
      return snapshot.val().seat;
    });
};

export const getUser = async () => {
  return firebase.auth().onAuthStateChanged();
};
