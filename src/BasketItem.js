import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import { Modal, Button } from "react-bootstrap";

const BasketItem = props => {
  const [modalShow, setModalShow] = useState(false);
  const {
    item,
    tableData,
    batch_key,
    seat,
    itemRef,
    deleteItem,
    item_key
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
      />
      <div className="container">
        <div className="row align-items-center h-100">
          <div className="col">
            <h3>
              <span className="badge badge-dark">{props.item["quantity"]}</span>
            </h3>
          </div>
          <div className="col-8">
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
  const { batch_key, item_key, seat, item, itemRef } = props;
  const [quantity, setQuantity] = useState(item["quantity"]);
  const [notes, setNotes] = useState(item["notes"]);

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

  const updateItem = () => {
    itemRef.child("quantity").set(quantity);
    itemRef.child("notes").set(notes);
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
            onClick={() => {
              props.setModalShow(false);
              props.deleteItem(batch_key, seat, item_key);
            }}
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
        <div className="d-flex justify-content-around mt-3">
          <button
            className="btn btn-lg btn-success btn-block mt-3"
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
