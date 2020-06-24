import React, { useState, useEffect, Fragment } from "react";
import "./App.css";
import * as firebase from "firebase";
import FileUpload from "./FileUpload";
import EditMenuItem from "./EditMenuItem";
import { useHistory, generatePath } from "react-router-dom";
import TopBarMenu from "./TopBarMenu";

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
      .once("value")
      .then(function(snapshot) {
        console.log(snapshot.val());
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
          <h1> {stageName} </h1>
          <p> {stageDesc} </p>
          <Fragment>
            {Object.keys(menu[stageNum]["items"]).map(item_key => {
              var item = menu[stageNum]["items"][item_key];
              return <EditMenuItem key={item_key} item={item} />;
            })}
          </Fragment>
        </div>
      ) : null}
    </div>
  );
};

export default MenuEditor;
