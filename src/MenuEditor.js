import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import * as firebase from "firebase";
import FileUpload from "./FileUpload";
import { connect } from "tls";

const MenuItem = props => {
  const [title, SetTitle] = useState("title");
  const [description, setDescription] = useState("description");
  const [price, setPrice] = useState("price");

  return (
    <div>
      <h3> {props.title} </h3>
      <p>{props.description} </p>
      <p>
        {" "}
        <strong> Price: </strong> {props.price}
      </p>
      {/* <button onClick={() => props.deleteMenuItem(props.id)}> Delete </button> */}
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

const MenuEditor = props => {
  var database = firebase.database();
  const [val, setVal] = useState(2);
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const { match } = props;
  const tempRest = match.params.restaurant;

  //   const addMenuItem = (title, description, price) => {
  //     var tempMenu = [...menu];
  //     var tempItem = {
  //       title: title,
  //       description: description,
  //       price: price
  //     };
  //     var key = database
  //       .ref(tempRest)
  //       .child("menu/")
  //       .push(tempItem).key;
  //     tempItem["id"] = key;
  //     tempMenu.push(tempItem);
  //     setMenu(tempMenu);
  //   };

  //   const deleteMenuItem = id => {
  //     database
  //       .ref(tempRest)
  //       .child("menu")
  //       .child(id)
  //       .remove();
  //     setMenu(menu.filter(item => item.id !== id));
  //   };

  useEffect(() => {
    setRestaurant(match.params.restaurant);
    database
      .ref(tempRest)
      .child("menu")
      .once("value")
      .then(function(snapshot) {
        console.log(snapshot.val());
        setMenu(snapshot.val());
      });
  }, []);

  const handleSetMenu = menu => {
    setMenu(menu);
  };

  return (
    <div className="container mt-5 mb-5">
      <h1>Manager dashboard for {restaurant} </h1>
      <FileUpload match={match} handleSetMenu={handleSetMenu} />
      {/* <UpdateMenuForm addMenuItem={addMenuItem} /> */}
      {Object.keys(menu).map((stage, i) => {
        console.log(menu[stage]);
        var stageName = menu[stage]["stage_name"];
        var stageDesc = menu[stage]["stage_desc"];
        return (
          <Fragment key={stage}>
            <h1> {stageName} </h1>
            <p> {stageDesc} </p>
            <Fragment key={stage}>
              {Object.keys(menu[stage]["items"]).map(item_key => {
                var item = menu[stage]["items"][item_key];
                return (
                  <ul key={item}>
                    <MenuItem
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      price={item.price}
                      //deleteMenuItem={deleteMenuItem}
                    />
                  </ul>
                );
              })}
            </Fragment>
          </Fragment>
        );
      })}
    </div>
  );
};

export default MenuEditor;
