import React, { useState, useEffect, Fragment } from "react";
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
                onHide={() => setModalShow(false)}
                description={props.description}
                sendToTable={props.sendToTable}
                setModalShow={setModalShow}
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
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-lg btn-dark btn-block mt-3"
            onClick={() => {
              props.setModalShow(false);
              props.sendToTable(
                props.id,
                props.title,
                notes,
                props.category,
                quantity,
                props.price
              );
            }}
          >
            Add {quantity} to Cart
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default MenuItem;
