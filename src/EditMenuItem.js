import React, { useState, useEffect, Fragment, useReducer } from "react";
import "./App.css";
import { Modal, Button } from "react-bootstrap";

const EditMenuItem = props => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <div>
      <EditMenuItemDetailsModal
        item_key={props.item_key}
        item={props.item}
        //onHide={() => setModalShow(false)}
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

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Edit Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <input
            className="form-control mt-2"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <input
            className="form-control mt-2"
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div>
          <input
            className="form-control mt-2"
            type="text"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
        </div>
        <div className="d-flex justify-content-center mt-3">
          <button className="btn btn-lg btn-dark mt-3">Save</button>
          <button
            className="btn btn-lg btn-secondary mt-3"
            onClick={props.setModalShow(false)}
          >
            Cancel
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default EditMenuItem;
