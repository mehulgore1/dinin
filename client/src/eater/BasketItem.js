import React, { useState, useEffect, Fragment, useReducer } from "react";
import "../App.css";
import { Modal, Button } from "react-bootstrap";
import * as firebase from "firebase";

const BasketItem = props => {
  const [modalShow, setModalShow] = useState(false);
  const {
    item,
    tableData,
    batch_key,
    seat,
    itemRef,
    deleteItem,
    item_key,
    userId,
    params
  } = props;

  return (
    <div>
      <BasketItemDetailsModal
        item={item}
        item_key={item_key}
        batch_key={batch_key}
        seat={seat}
        show={modalShow}
        onHide={() => setModalShow(false)}
        itemRef={itemRef}
        setModalShow={setModalShow}
        deleteItem={deleteItem}
        userId={userId}
        params={params}
      />
      <div className="container">
        <div className="row align-items-center h-100">
          <div className="col">
            <h3>
              <span className="badge badge-dark">{props.item["quantity"]}</span>
            </h3>
          </div>
          <div className="col-6">
            <div>
              {" "}
              <strong>{item["title"]}</strong>
            </div>
            <div>{item["notes"]}</div>
            {tableData["batches"][batch_key] != "" &&
            "ordered_at" in tableData["batches"][batch_key] ? (
              <div>
                <h6>
                  <strong>Status </strong>
                  {item["status"] == "Kitchen Preparing" ? (
                    <span className="badge badge-pill badge-success">
                      {item["status"]}
                    </span>
                  ) : (
                    <span className="badge badge-pill badge-warning">
                      {item["status"]}
                    </span>
                  )}
                </h6>
              </div>
            ) : null}
          </div>
          <div className="col">
            {props.userInThisSeat(seat) && !item["ordered"] ? (
              <div
                className="d-flex justify-content-around"
                onClick={e => e.stopPropagation()}
              >
                <button
                  className="btn btn-warning mr-3"
                  onClick={() => setModalShow(true)}
                >
                  Edit
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default BasketItem;

function BasketItemDetailsModal(props) {
  const { batch_key, item_key, seat, item, itemRef, userId, params } = props;
  const [quantity, setQuantity] = useState(item["quantity"]);
  const [notes, setNotes] = useState(item["notes"]);
  const [splitSeats, setSplitSeats] = useState({});
  const [isSplit, setIsSplit] = useState(false);
  const [serverSplit, setServerSplit] = useState(false);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const database = firebase.database();
  const thisRest = params.restaurant;
  const thisTable = params.table;

  const seatDataRef = database
    .ref("restaurants")
    .child(thisRest)
    .child("tables")
    .child(thisTable)
    .child("batches")
    .child(batch_key)
    .child("seat_data");

  useEffect(() => {
    itemRef.on("value", function(snapshot) {
      var split = snapshot.hasChild("split");
      if (split) {
        // already split set quantity to 1
        setQuantity(1);
      }
      setIsSplit(split);
      setServerSplit(split);
      if (split) {
        // get split seats
        itemRef
          .child("split")
          .once("value")
          .then(function(snapshot) {
            var tempSplitSeats = {};
            var splits = snapshot.val();
            var arrayLength = splits.length;
            for (var i = 0; i < arrayLength; i++) {
              if (splits[i]) {
                tempSplitSeats[i] = splits[i];
              }
            }
            setSplitSeats(tempSplitSeats);
          });
      } else {
        // create split seats
        database
          .ref("restaurants")
          .child(thisRest)
          .child("tables")
          .child(thisTable)
          .child("users")
          .once("value")
          .then(function(snapshot) {
            var users = snapshot.val();
            var tempSplitSeats = {};
            for (var id in users) {
              var name = users[id]["name"];
              var seat = users[id]["seat"];
              tempSplitSeats[seat] = {};
              tempSplitSeats[seat]["taken"] = false;
              tempSplitSeats[seat]["name"] = name;
              tempSplitSeats[seat]["user_id"] = id;
            }
            console.log(tempSplitSeats);
            setSplitSeats(tempSplitSeats);
          });
      }
    });
  }, []);

  const incQuantity = () => {
    if (quantity < 1) {
      setQuantity(1);
    } else {
      setQuantity(quantity + 1);
    }
  };

  const decQuantity = () => {
    var newQuantity = quantity - 1;
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    setQuantity(newQuantity);
  };

  const updateItem = () => {
    var tempSplitSeats = splitSeats;
    var validSplit = false;
    for (var seat in splitSeats) {
      if (splitSeats[seat]["taken"] && splitSeats[seat]["user_id"] != userId) {
        // other seat selected, split is valid
        validSplit = true;
      }
    }
    validSplit = validSplit && isSplit;
    if (validSplit) {
      // already split once, just adjusting now
      for (var seat in splitSeats) {
        if (validSplit && splitSeats[seat]["user_id"] == props.userId) {
          // valid split, need to add current user
          tempSplitSeats[seat]["taken"] = true;
        }
      }
      var splitCount = 0;
      for (var seat in tempSplitSeats) {
        // find number of splitting people
        if (tempSplitSeats[seat]["taken"]) {
          splitCount++;
        }
      }
      var fraction = Number((quantity / splitCount).toFixed(2));
      var tempItem = {
        title: item["title"],
        notes: notes,
        category: item["category"],
        quantity: fraction,
        status: "Order Sent",
        ordered: false,
        price: item["price"]
      };
      tempItem.split = tempSplitSeats;
      for (var currSeat in tempSplitSeats) {
        // if taken, then update, otherwise remove
        if (tempSplitSeats[currSeat]["taken"]) {
          seatDataRef
            .child(currSeat)
            .child("items")
            .child(item_key)
            .update(tempItem);
        } else {
          seatDataRef
            .child(currSeat)
            .child("items")
            .child(item_key)
            .remove();
        }
      }
    } else if (!validSplit && serverSplit) {
      // removing split from this item, delete from other users besides yourself
      for (var currSeat in splitSeats) {
        if (splitSeats[currSeat]["user_id"] != userId) {
          seatDataRef
            .child(currSeat)
            .child("items")
            .child(item_key)
            .remove();
        } else {
          // your userId, remove "split" and reset quantity
          itemRef.child("split").remove();
          itemRef.update({ quantity: quantity });
        }
      }
    } else {
      // no split, just update
      itemRef.child("quantity").set(quantity);
      itemRef.child("notes").set(notes);
    }
  };

  const toggleSplitSeat = seat => {
    var tempSplitSeats = splitSeats;
    tempSplitSeats[seat]["taken"] = !tempSplitSeats[seat]["taken"];
    setSplitSeats(tempSplitSeats);
    forceUpdate();
  };

  const toggleSplit = () => {
    if (!isSplit) {
      // going to be split, need to reset quantity to 1
      setQuantity(1);
    }
    setIsSplit(isSplit => !isSplit);
  };

  const deleteItem = (batch_key, seat, item_key) => {
    if (isSplit) {
      // need to remove from all other seats
      for (var currSeat in splitSeats) {
        if (splitSeats[currSeat]["user_id"] != userId) {
          database
            .ref("restaurants")
            .ref(thisRest)
            .child("tables")
            .child(thisTable)
            .child("batches")
            .child(batch_key)
            .child("seat_data")
            .child(currSeat)
            .child("items")
            .child(item_key)
            .remove();
        }
      }
    }
    props.setModalShow(false);
    // remove logic for current session seat
    props.deleteItem(batch_key, seat, item_key);
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          {item["title"]}
          {"  "}
          <button
            onClick={() => deleteItem(batch_key, seat, item_key)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <input
            className="form-control mt-2"
            type="text"
            value={notes}
            placeholder="Add Notes, Customize..."
            onChange={e => setNotes(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-center mt-3">
          <button
            onClick={() => decQuantity()}
            className="btn btn-outline-dark mr-3"
          >
            {" "}
            -{" "}
          </button>
          <div className="align-self-center">
            {" "}
            <h3> {quantity} </h3>
          </div>
          <button
            onClick={() => incQuantity()}
            className="btn btn-outline-dark ml-3"
          >
            {" "}
            +{" "}
          </button>
        </div>
        <div className="d-flex justify-content-center mt-3 mb-3">
          <button onClick={toggleSplit} className="btn btn-warning btn-lg">
            {isSplit ? "Remove Split" : "Split"}
          </button>
        </div>

        {isSplit ? (
          <ul className="list-group">
            {" "}
            {Object.keys(splitSeats).map(seat => {
              var active = splitSeats[seat]["taken"] ? "active" : "";
              if (splitSeats[seat]["user_id"] == props.userId) {
                return null;
              }
              return (
                <li
                  key={seat}
                  className={"list-group-item " + active}
                  onClick={() => toggleSplitSeat(seat)}
                >
                  {" "}
                  {splitSeats[seat]["name"]}{" "}
                </li>
              );
            })}
          </ul>
        ) : null}
        <div className="d-flex justify-content-around mt-3">
          <button
            className="btn btn-lg btn-dark btn-block mt-3"
            onClick={() => {
              props.setModalShow(false);
              updateItem();
            }}
          >
            Save
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
