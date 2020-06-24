import React, { useState, useEffect, Fragment, useReducer } from "react";
import "./App.css";
import { Modal, Button } from "react-bootstrap";
import * as firebase from "firebase";

const EditMenuItem = props => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <div>
      <EditMenuItemDetailsModal
        item_key={props.item_key}
        item={props.item}
        stage={props.stage}
        restaurant={props.restaurant}
        onHide={() => setModalShow(false)}
        setModalShow={setModalShow}
        show={modalShow}
      />
      <div className="shadow card">
        <div className="card-body">
          <div className="col">
            <div>
              {" "}
              <strong>{props.item.title}</strong>
            </div>
            <div>{props.item.description}</div>
            <div>
              <strong> $</strong> {props.item.price}
            </div>
          </div>
          <div
            className="d-flex justify-content-around"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="btn btn-warning"
              onClick={() => setModalShow(true)}
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function EditMenuItemDetailsModal(props) {
  const [title, setTitle] = useState(props.item.title);
  const [description, setDescription] = useState(props.item.description);
  const [price, setPrice] = useState(props.item.price);
  const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
  const database = firebase.database();
  const itemRef = database
    .ref(props.restaurant)
    .child("menu")
    .child(props.stage)
    .child("items")
    .child(props.item_key);

  const saveItem = () => {
    itemRef.update({
      description: description,
      price: price,
      title: title
    });
    props.setModalShow(false);
  };

  const deleteItem = () => {
    itemRef.remove();
    props.setModalShow(false);
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
          {props.item.title}
          <button className="btn btn-danger ml-3" onClick={deleteItem}>
            Delete
          </button>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <h4> Title </h4>
          <input
            className="form-control mt-2"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <h4> Description </h4>
          <textarea
            className="form-control mt-2"
            type="textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <h4> Price </h4>
          <input
            className="form-control mt-2"
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-around mt-3">
          <button className="btn btn-lg btn-dark mt-3" onClick={saveItem}>
            Save
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default EditMenuItem;
