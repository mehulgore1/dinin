import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import * as firebase from "firebase";
import FileUpload from "./FileUpload";
import EditMenuItem from "./EditMenuItem";
import { useHistory, generatePath } from "react-router-dom";
import TopBarMenu from "./TopBarMenu";
import { useAlert } from "react-alert";

const AddItemForm = props => {
  const alert = useAlert();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const database = firebase.database();

  const addItem = () => {
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
  const [restaurant, setRestaurant] = useState("");
  const { match } = props;
  const params = match.params;
  const tempRest = match.params.restaurant;
  const [stageNum, setStageNum] = useState(0);
  const [stageDesc, setStageDesc] = useState("");
  const [stageName, setStageName] = useState("");
  const [stageNames, setStageNames] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [editTitle, setEditTitle] = useState(false);
  const [editDesc, setEditDesc] = useState(false);

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
      restaurant: restaurant,
      stage: stage
    });
    history.replace(path);
  };

  useEffect(() => {
    setRestaurant(match.params.restaurant);
    database
      .ref(tempRest)
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
  }, []);

  const handleSetMenu = menu => {
    setMenu(menu);
  };

  const saveStageName = () => {
    database
      .ref(tempRest)
      .child("menu")
      .child(stageNum)
      .update({ stage_name: stageName });
    setEditTitle(false);
  };

  const saveStageDesc = () => {
    database
      .ref(tempRest)
      .child("menu")
      .child(stageNum)
      .update({ stage_desc: stageDesc });
    setEditDesc(false);
  };

  return (
    <div>
      {!isLoading ? (
        <div className="container mt-5 mb-5">
          <h1>Manager dashboard for {restaurant} </h1>
          <FileUpload match={match} handleSetMenu={handleSetMenu} />
          {/* <UpdateMenuForm addMenuItem={addMenuItem} /> */}
          <TopBarMenu
            stageNum={stageNum}
            stageNames={stageNames}
            routeToStage={routeToStage}
          />
          <AddItemForm
            stageName={stageName}
            stage={stageNum}
            restaurant={restaurant}
          />
          {editTitle ? (
            <div>
              <input
                className="form-control mt-2"
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
                Edit{" "}
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
                Edit{" "}
              </button>
            </p>
          )}
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
        </div>
      ) : null}
    </div>
  );
};

export default MenuEditor;
