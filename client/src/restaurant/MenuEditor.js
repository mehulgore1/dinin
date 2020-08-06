import React, { useState, useEffect, Fragment } from "react";
import "../App.css";
import * as firebase from "firebase";
import FileUpload from "./FileUpload";
import EditMenuItem from "./EditMenuItem";
import { useHistory, generatePath } from "react-router-dom";
import TopBarMenu from "../TopBarMenu";
import { useAlert } from "react-alert";

const AddItemForm = props => {
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const database = firebase.database();

  const addItem = () => {
    if (!price.match(/^\d+\.\d{0,2}$/)) {
      window.alert("Please enter a valid price to 2 decimal places");
      return;
    } else if (title == "") {
      window.alert("Please enter a title for this item");
      return;
    }
    var item = {
      price: price,
      category: props.stageName,
      description: description,
      title: title
    };
    database
      .ref(props.restaurant)
      .child("menu")
      .child(props.stage)
      .child("items")
      .push(item);
    setTitle("");
    setDescription("");
    setPrice("");
    alert.info("Item Added!");
  };

  return (
    <div>
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

      <div className="d-flex justify-content-around mt-3 mb-3">
        <button className="btn btn-lg btn-dark btn-block" onClick={addItem}>
          Add Item
        </button>
      </div>
    </div>
  );
};

const MenuEditor = props => {
  var database = firebase.database();
  const history = useHistory();
  const [menu, setMenu] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const { match } = props;
  const params = match.params;
  const [stageNum, setStageNum] = useState(0);
  const [stageDesc, setStageDesc] = useState("");
  const [stageName, setStageName] = useState("");
  const [stageNames, setStageNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [editStage, setEditStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    setStageNum(params.stage);
  }, [props.location]);

  useEffect(() => {
    if (menu != null && menu[stageNum] != null) {
      setStageName(menu[stageNum]["stage_name"]);
      setStageDesc(menu[stageNum]["stage_desc"]);
      setIsLoading(false);
    }
  }, [menu, stageNum]);

  const routeToStage = stage => {
    const path = generatePath(match.path, {
      stage: stage
    });
    history.replace(path);
  };

  const initSignedInState = () => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setUserId(user.uid);
      } else {
      }
    });
  };

  const initMenu = () => {
    database
      .ref(restaurant)
      .child("menu")
      .on("value", function(snapshot) {
        var tempMenu = snapshot.val();
        console.log(snapshot.val());
        for (var stage in tempMenu) {
          // get stage names for menu
          var temp = stageNames;
          temp[stage] = tempMenu[stage]["stage_name"];
          setStageNames(temp);
        }
        setMenu(tempMenu);
      });
  };

  useEffect(() => {
    if (restaurant != null) {
      console.log(restaurant);
      initMenu();
    }
  }, [restaurant]);

  useEffect(() => {
    if (userId != null) {
      database
        .ref("managers")
        .child(userId)
        .on("value", function(snapshot) {
          console.log(snapshot.val());
          console.log(snapshot.val()["restaurant_name"]);
          setRestaurant(snapshot.val().restaurant_name);
        });
    }
  }, [userId]);

  useEffect(() => {
    initSignedInState();
  }, []);

  const handleSetMenu = menu => {
    setMenu(menu);
  };

  const saveStageName = () => {
    database
      .ref(restaurant)
      .child("menu")
      .child(stageNum)
      .update({ stage_name: stageName });
    setEditTitle(false);
  };

  const saveStageDesc = () => {
    database
      .ref(restaurant)
      .child("menu")
      .child(stageNum)
      .update({ stage_desc: stageDesc });
    setEditDesc(false);
  };

  const addStage = () => {
    var nextStageNum = Object.keys(stageNames).length;
    database
      .ref(restaurant)
      .child("menu")
      .child(nextStageNum)
      .update({ stage_name: newStageName, stage_desc: "", items: "null" });
    setEditStage(false);
    routeToStage(nextStageNum);
  };

  const deleteStage = () => {
    var confirm = window.confirm(
      "Are you sure you want to delete this category and all its items?"
    );
    if (confirm) {
      routeToStage(0);
      database
        .ref(restaurant)
        .child("menu")
        .child(stageNum)
        .remove();
    }
  };

  const handleSignOut = () => {
    firebase.auth().signOut();
    history.replace("/manager");
  };

  return (
    <div>
      <button onClick={handleSignOut}> Sign out </button>
      {!isLoading ? (
        <div className="container mt-5 mb-5">
          <h1>Manager dashboard for {restaurant} </h1>
          <a
            href="https://connect.stripe.com/oauth/authorize?client_id=ca_HmWshdSsfZwOc9svGPGlrTgD9kXlrBYt&state=4cdee65a-3c4f-470a-8243-557a04809a33 
&scope=read_write&response_type=code"
          >
            <button>Connect With Stripe</button>
          </a>

          <FileUpload match={match} handleSetMenu={handleSetMenu} />
          {/* <UpdateMenuForm addMenuItem={addMenuItem} /> */}
          <TopBarMenu
            stageNum={stageNum}
            stageNames={stageNames}
            routeToStage={routeToStage}
          />
          {editStage ? (
            <div>
              <input
                className="form-control mt-2"
                type="text"
                value={newStageName}
                onChange={e => setNewStageName(e.target.value)}
              />
              <button className="btn btn-dark" onClick={() => addStage()}>
                {" "}
                Save{" "}
              </button>
            </div>
          ) : (
            <button
              className="btn item btn-outline-dark"
              onClick={() => setEditStage(true)}
            >
              + Add Category
            </button>
          )}

          <AddItemForm
            stageName={stageName}
            stage={stageNum}
            restaurant={restaurant}
          />
          {editTitle ? (
            <div>
              <input
                className="form-control mt-2"
                placeholder="Edit Category Title"
                type="text"
                value={stageName}
                onChange={e => setStageName(e.target.value)}
              />
              <button className="btn btn-dark" onClick={() => saveStageName()}>
                {" "}
                Save{" "}
              </button>
            </div>
          ) : (
            <h1>
              {stageName}{" "}
              <button
                className="btn btn-warning"
                onClick={() => setEditTitle(true)}
              >
                {" "}
                Edit Title{" "}
              </button>
            </h1>
          )}

          {editDesc ? (
            <div>
              <input
                className="form-control mt-2"
                type="text"
                value={stageDesc}
                onChange={e => setStageDesc(e.target.value)}
                placeholder="Edit Category Description"
              />
              <button className="btn btn-dark" onClick={() => saveStageDesc()}>
                {" "}
                Save{" "}
              </button>
            </div>
          ) : (
            <p>
              {stageDesc}{" "}
              <button
                className="btn btn-warning"
                onClick={() => setEditDesc(true)}
              >
                {" "}
                Edit Description{" "}
              </button>
            </p>
          )}
          <Fragment>
            {menu[stageNum] != null &&
            menu[stageNum]["items"] != null &&
            menu[stageNum]["items"] != "null" ? (
              <Fragment>
                {Object.keys(menu[stageNum]["items"]).map(item_key => {
                  var item = menu[stageNum]["items"][item_key];
                  return (
                    <EditMenuItem
                      key={item_key}
                      item_key={item_key}
                      item={item}
                      stage={stageNum}
                      restaurant={restaurant}
                    />
                  );
                })}
              </Fragment>
            ) : null}
          </Fragment>
        </div>
      ) : null}
      <button
        className="btn btn-danger btn-block"
        onClick={() => deleteStage()}
      >
        Delete Whole Category
      </button>
    </div>
  );
};

export default MenuEditor;
