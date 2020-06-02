import React, { useState, useEffect, Fragment } from "react";
import "./App.css";

const MenuItem = props => {
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = event => {
    setQuantity(event.target.value);
  };

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
    <div>
      <div className="container">
        <div className="row">
          <div className="col">
            <div>
              {" "}
              <strong>{props.title}</strong>
            </div>
            <div>{props.description}</div>
            <div>
              <strong> $</strong> {props.price}
            </div>
            <div>
              <input
                className="form-control mt-2"
                type="text"
                value={notes}
                placeholder="Add Notes"
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div>
                <div className="d-flex justify-content-around">
                  <button
                    onClick={() => decQuantity()}
                    className="btn btn-dark mr-3"
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
                    className="btn btn-dark ml-3"
                  >
                    {" "}
                    +{" "}
                  </button>
                </div>
              </div>
              <div className="d-flex justify-content-around">
                <button
                  className="btn btn-success btn-lg mt-3"
                  onClick={() =>
                    props.sendToTable(
                      props.id,
                      props.title,
                      notes,
                      props.category,
                      quantity,
                      props.price
                    )
                  }
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
