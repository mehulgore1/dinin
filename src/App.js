import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";

const MenuItem = props => {
  const [title, SetTitle] = useState("title");
  const [description, setDescription] = useState("description");
  const [price, setPrice] = useState("price");

  return (
    <div>
      <p>
        {" "}
        <strong> {props.title} </strong>{" "}
      </p>
      <p>{props.description} </p>
      <p>
        {" "}
        <strong> Price: </strong> {props.price}
      </p>
      <button> Edit </button>
    </div>
  );
};

const UpdateMenuForm = props => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  return (
    <div>
      <h4> Add Menu Item </h4>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description"
      />
      <input
        type="text"
        value={price}
        onChange={e => setPrice(e.target.value)}
        placeholder="Price"
      />
      <button onClick={() => props.addMenuItem(title, description, price)}>
        {" "}
        Add{" "}
      </button>
    </div>
  );
};

const App = () => {
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);

  const addMenuItem = (title, description, price) => {
    var tempMenu = [...menu];
    var tempItem = {
      title: title,
      description: description,
      price: price
    };
    tempMenu.push(tempItem);
    setMenu(tempMenu);
  };

  useEffect(() => {
    var tempMenu = [...menu];
    var tempItem = {
      title: "Burger",
      description: "delicious sandwich with patty",
      price: "10.99"
    };
    tempMenu.push(tempItem);
    setMenu(tempMenu);
  }, []);

  return (
    <div className="App">
      <UpdateMenuForm addMenuItem={addMenuItem} />
      <ul>
        {menu.map(item => (
          <MenuItem
            title={item.title}
            description={item.description}
            price={item.price}
          />
        ))}
      </ul>
    </div>
  );
};

export default App;
