import React, { useState, useEffect, Fragment } from "react";
import "../App.css";
import * as firebase from "firebase";
import FileUpload from "./FileUpload";
import EditMenuItem from "./EditMenuItem";
import { useHistory, generatePath } from "react-router-dom";
import TopBarMenu from "../TopBarMenu";
import { useAlert } from "react-alert";
import axios from "axios";
import ManagerMenu from "./ManagerMenu";

const AddItemForm = props => {
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const database = firebase.database();

  const addItem = () => {
    if (!price.match(/^\d+\.\d{0,2}$/)) {
      alert.error("Please enter a valid price to 2 decimal places");
      return;
    } else if (title == "") {
      alert.error("Please enter a title for this item");
      return;
    }
    var item = {
      price: price,
      category: props.stageName,
      description: description,
      title: title
    };
    database
      .ref("restaurants")
      .child(props.restaurant)
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
  const [shortName, setShortName] = useState(null);
  const { match } = props;
  const params = match.params;
  const [stageNum, setStageNum] = useState(0);
  const [stageDesc, setStageDesc] = useState("");
  const [stageName, setStageName] = useState("");
  const [stageNames, setStageNames] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);
  const [editStage, setEditStage] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [userId, setUserId] = useState(null);
  const [stripeId, setStripeId] = useState(null);
  const [stripeAccount, setStripeAccount] = useState({});

  useEffect(() => {
    setStageNum(params.stage);
  }, [props.location]);

  useEffect(() => {
    if (menu != null && menu[stageNum] != null) {
      setStageName(menu[stageNum]["stage_name"]);
      setStageDesc(menu[stageNum]["stage_desc"]);
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
        history.replace("/manager");
      }
    });
  };

  const initMenu = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("menu")
      .on("value", function(snapshot) {
        var tempMenu = snapshot.val();
        for (var stage in tempMenu) {
          // get stage names for menu
          var temp = stageNames;
          temp[stage] = tempMenu[stage]["stage_name"];
          setStageNames(temp);
        }
        setMenu(tempMenu);
      });
    database
      .ref("restaurants")
      .child(shortName)
      .on("value", function(snapshot) {
        if (snapshot.child("stripe_connect_id").exists()) {
          setStripeId(snapshot.val().stripe_connect_id);
        }
      });
  };

  useEffect(() => {
    if (shortName != null && restaurant != null) {
      initMenu();
    }
  }, [restaurant, shortName]);

  useEffect(() => {
    if (userId != null) {
      database
        .ref("managers")
        .child(userId)
        .on("value", function(snapshot) {
          var manager = snapshot.val();
          setRestaurant(manager.restaurant_name);
          setShortName(manager.restaurant_short_name);
        });
    }
  }, [userId]);

  useEffect(() => {
    initSignedInState();
  }, []);

  useEffect(() => {
    if (stripeId != null) {
      pullStripeAccount();
    }
  }, [stripeId]);

  const pullStripeAccount = () => {
    axios.post("/api/retrieve-connect-account", { stripeId }).then(res => {
      setStripeAccount(res.data.account);
    });
  };

  const handleSetMenu = menu => {
    setMenu(menu);
  };

  const saveStageName = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child("menu")
      .child(stageNum)
      .update({ stage_name: stageName });
    setEditTitle(false);
    initMenu();
  };

  const saveStageDesc = () => {
    database
      .ref("restaurants")
      .child(shortName)
      .child(shortName)
      .child("menu")
      .child(stageNum)
      .update({ stage_desc: stageDesc });
    setEditDesc(false);
    initMenu();
  };

  const addStage = () => {
    var nextStageNum = Object.keys(stageNames).length;
    database
      .ref("restaurants")
      .child(shortName)
      .child("menu")
      .child(nextStageNum)
      .update({ stage_name: newStageName, stage_desc: "", items: "null" });
    setEditStage(false);
    routeToStage(nextStageNum);
    initMenu();
  };

  const deleteStage = () => {
    var confirm = window.confirm(
      "Are you sure you want to delete this category and all its items?"
    );
    if (confirm) {
      routeToStage(0);
      database
        .ref("restaurants")
        .child(shortName)
        .child("menu")
        .child(stageNum)
        .remove();
      initMenu();
    }
  };

  const isValidMenu = () => {
    return (
      menu != null &&
      menu[stageNum] != null &&
      menu[stageNum]["items"] != null &&
      menu[stageNum]["items"] != "null"
    );
  };

  return (
    <div>
      {shortName != null ? <ManagerMenu shortName={shortName} /> : null}
      {!isLoading ? (
        <div className="container mt-5 mb-5">
          <h5>
            {" "}
            Stripe Status:{" "}
            {stripeAccount.details_submitted ? "Connected" : "Unfinished"}{" "}
          </h5>
          {stripeAccount.details_submitted ? (
            <a href="https://dashboard.stripe.com/dashboard">
              <button className="btn btn-primary">
                Stripe Payments Dashboard
              </button>
            </a>
          ) : (
            <a
              href={
                "https://connect.stripe.com/oauth/authorize?client_id=ca_HmWshdSsfZwOc9svGPGlrTgD9kXlrBYt&state=" +
                shortName +
                "&scope=read_write&response_type=code"
              }
            >
              <button className="btn btn-primary">
                {" "}
                Connect to Stripe Payments{" "}
              </button>
            </a>
          )}

          {/* <button className="btn btn-primary" onClick={() => goToDashboard()}>
            {" "}
            Login to your dashboard{" "}
          </button> */}
          <FileUpload
            restaurant={shortName}
            match={match}
            handleSetMenu={handleSetMenu}
          />
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
            restaurant={shortName}
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
            {isValidMenu() ? (
              <Fragment>
                {Object.keys(menu[stageNum]["items"]).map(item_key => {
                  var item = menu[stageNum]["items"][item_key];
                  return (
                    <EditMenuItem
                      key={item_key}
                      item_key={item_key}
                      item={item}
                      stage={stageNum}
                      restaurant={shortName}
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
