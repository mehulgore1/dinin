import React, { useState, useEffect, Fragment } from "react";
import "./App.css";

const MenuItem = props => {
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = event => {
    setQuantity(event.target.value);
  };

  return (
    <div>
      <p>
        <strong> {props.title} </strong>
      </p>
      <p>{props.description} </p>
      <p>
        <strong> Price: </strong> {props.price}
      </p>
      <input
        type="text"
        value={notes}
        placeholder="notes"
        onChange={e => setNotes(e.target.value)}
      />
      <div>
        <label>
          Quantity
          <select value={quantity} onChange={handleQuantityChange}>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </label>
        <button
          className="btn btn-success"
          onClick={() =>
            props.sendToWaiter(props.title, notes, props.category, quantity)
          }
        >
          Add to Table
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
