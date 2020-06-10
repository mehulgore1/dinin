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

class FirebaseUtils {
  constructor() {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    firebase.analytics();
    this.db = firebase.database();
  }

  async getUserId() {
    const user = await firebase.auth().currentUser;
    console.log(user);
    return user ? user.uid : null;
  }

  async getTableDone(restaurant, table) {
    const user = await firebase.auth().currentUser;
    if (user) {
      this.db
        .ref(restaurant)
        .child("tables")
        .child(table)
        .once("value")
        .then(function(snapshot) {
          return snapshot.hasChild("past_users");
        })
        .then(past_users => {
          if (past_users) {
            this.db
              .ref(restaurant)
              .child("tables")
              .child(table)
              .child("past_users")
              .on("value", function(snapshot) {
                return snapshot.hasChild(user.uid);
              });
          } else {
            return false;
          }
        });
    }
  }
}

export default new FirebaseUtils();
