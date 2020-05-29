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
          <div className="col-8">
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
                type="text"
                value={notes}
                placeholder="Add Notes"
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="col-4">
            <div>
              <div className="d-flex justify-content-around">
                <button
                  onClick={() => decQuantity()}
                  className="btn btn-primary btn-sm"
                >
                  {" "}
                  -{" "}
                </button>
                <div className="align-self-center"> {quantity} </div>
                <button
                  onClick={() => incQuantity()}
                  className="btn btn-primary btn-sm"
                >
                  {" "}
                  +{" "}
                </button>
              </div>
            </div>
            <a
              href={
                "/" +
                props.match.params.restaurant +
                "/menu/" +
                props.match.params.table
              }
            >
              <button
                className="btn btn-success"
                onClick={() =>
                  props.sendToWaiter(
                    props.title,
                    notes,
                    props.category,
                    quantity
                  )
                }
              >
                Add
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItem;
