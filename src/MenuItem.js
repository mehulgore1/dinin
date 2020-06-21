import React, { useState, useEffect, Fragment, useReducer } from "react";
import "./App.css";
import { Modal, Button } from "react-bootstrap";

const MenuItem = props => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <div>
      <div className="shadow card" onClick={() => setModalShow(true)}>
        <div className="card-body">
          <div className="col">
            <div>
              {" "}
              <strong>{props.title}</strong>
            </div>
            <div>{props.description}</div>
            <div>
              <strong> $</strong> {props.price}
            </div>
          </div>
          <div className="row">
            <div></div>
            <div
              onClick={e => e.stopPropagation()}
              className="d-flex justify-content-around"
            >
              <ItemDetailsModal
                id={props.id}
                title={props.title}
                category={props.category}
                price={props.price}
                show={modalShow}
                tableUsers={props.tableUsers}
                onHide={() => setModalShow(false)}
                description={props.description}
                sendToTable={props.sendToTable}
                setModalShow={setModalShow}
                userId={props.userId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ItemDetailsModal(props) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [isSplit, setIsSplit] = useState(false);
  const [splitSeats, setSplitSeats] = useState({});
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    setSplitSeats(props.tableUsers);
  }, [props]);

  const incQuantity = () => {
    var newQuantity = quantity + 1;
    setQuantity(newQuantity);
  };

  const decQuantity = () => {
    var newQuantity = quantity - 1;
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    setQuantity(newQuantity);
  };

  const toggleSplit = () => {
    setIsSplit(isSplit => !isSplit);
  };

  const toggleSplitSeat = seat => {
    var tempSplitSeats = splitSeats;
    tempSplitSeats[seat]["taken"] = !tempSplitSeats[seat]["taken"];
    setSplitSeats(tempSplitSeats);
    forceUpdate();
  };

  const handleSendToTable = () => {
    var tempSplitSeats = splitSeats;
    var validSplit = false;
    var seats = [];
    for (var seat in splitSeats) {
      if (
        splitSeats[seat]["taken"] &&
        splitSeats[seat]["user_id"] != props.userId
      ) {
        // seat selected, split is valid
        validSplit = true;
      }
    }
    validSplit = validSplit && isSplit;
    for (var seat in splitSeats) {
      if (validSplit && splitSeats[seat]["user_id"] == props.userId) {
        // valid split, need to add current user
        tempSplitSeats[seat]["taken"] = true;
      }
    }
    var splits = validSplit ? tempSplitSeats : null;
    props.setModalShow(false);
    props.sendToTable(
      props.id,
      props.title,
      notes,
      props.category,
      quantity,
      props.price,
      splits
    );
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          {" "}
          <p> {props.description}</p>{" "}
        </div>
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
          <button onClick={() => decQuantity()} className="btn btn-dark mr-3">
            {" "}
            -{" "}
          </button>
          <div className="align-self-center">
            {" "}
            <h3> {quantity} </h3>
          </div>
          <button onClick={() => incQuantity()} className="btn btn-dark ml-3">
            {" "}
            +{" "}
          </button>
        </div>
        <div className="d-flex justify-content-center mt-3 mb-3">
          <button onClick={toggleSplit} className="btn btn-warning btn-lg">
            {" "}
            Split{" "}
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
              console.log(active);
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
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-lg btn-dark btn-block mt-3"
            onClick={handleSendToTable}
          >
            Add {quantity} to Cart
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default MenuItem;
