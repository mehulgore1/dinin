import React, { useState, useEffect } from "react";
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
    var finalMenu = {};
    database
      .ref(tempRest)
      .child("menu")
      .once("value")
      .then(function(snapshot) {
        for (var stage in snapshot.val()) {
          if (!(stage in finalMenu)) {
            finalMenu[stage] = {};
          }
          for (var category in snapshot.val()[stage]) {
            if (!(category in finalMenu[stage])) {
              finalMenu[stage][category] = [];
            }
            var categoryItems = snapshot.val()[stage][category];
            for (var key in categoryItems) {
              var item = categoryItems[key];
              var tempItem = {
                id: key,
                title: item.title,
                description: item.description,
                price: item.price,
                category: item.category
              };
              finalMenu[stage][category].push(tempItem);
            }
          }
        }
        console.log(finalMenu);
        return finalMenu;
      })
      .then(menu => setMenu(menu));
  }, []);

  const handleSetMenu = menu => {
    setMenu(menu);
  };

  return (
    <>
      <h1>Manager dashboard for {restaurant} </h1>
      <FileUpload match={match} handleSetMenu={handleSetMenu} />
      {/* <UpdateMenuForm addMenuItem={addMenuItem} /> */}
      {Object.keys(menu).map((stage, i) => {
        return (
          <>
            <h1> {stage} </h1>
            {Object.keys(menu[stage]).map((category, i) => {
              return (
                <>
                  <h1> {category} </h1>
                  {menu[stage][category].map(item => (
                    <ul>
                      <MenuItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        price={item.price}
                        //deleteMenuItem={deleteMenuItem}
                      />
                    </ul>
                  ))}
                </>
              );
            })}
          </>
        );
      })}
    </>
  );
};

export default MenuEditor;
