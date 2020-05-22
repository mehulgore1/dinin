import React, { useState, useEffect } from "react";
import "./App.css";
import * as firebase from "firebase";

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
      <button onClick={() => props.deleteMenuItem(props.id)}> Delete </button>
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

const MenuEditor = () => {
  var database = firebase.database();
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);

  const addMenuItem = (title, description, price) => {
    var tempMenu = [...menu];
    var tempItem = {
      title: title,
      description: description,
      price: price
    };
    var key = database.ref("menu/").push(tempItem).key;
    tempItem["id"] = key;
    console.log(tempItem);
    tempMenu.push(tempItem);
    setMenu(tempMenu);
  };

  const deleteMenuItem = id => {
    database
      .ref("menu")
      .child(id)
      .remove();
    setMenu(menu.filter(item => item.id !== id));
  };

  useEffect(() => {
    var tempMenu = [...menu];
    database
      .ref("menu")
      .once("value")
      .then(function(snapshot) {
        for (var key in snapshot.val()) {
          var item = snapshot.val()[key];
          var tempItem = {
            id: key,
            title: item.title,
            description: item.description,
            price: item.price
          };
          tempMenu.push(tempItem);
        }
        return tempMenu;
      })
      .then(menu => setMenu(menu));
  }, []);

  return (
    <div className="App">
      <UpdateMenuForm addMenuItem={addMenuItem} />
      <ul>
        {menu.map(item => (
          <MenuItem
            key={item.id}
            id={item.id}
            title={item.title}
            description={item.description}
            price={item.price}
            deleteMenuItem={deleteMenuItem}
          />
        ))}
      </ul>
    </div>
  );
};

export default MenuEditor;
