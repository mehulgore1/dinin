import React, { useState, useEffect, Fragment } from "react";

const TopBarMenu = props => {
  return (
    <div className="hs mb-3 mt-3">
      {Object.keys(props.stageNames).map(thisStage => {
        var buttonClass =
          thisStage == props.stageNum ? "btn-dark" : "btn-outline-dark";
        return (
          <button
            key={thisStage}
            onClick={() => props.routeToStage(thisStage)}
            className={"btn item " + buttonClass}
          >
            {props.stageNames[thisStage]}
          </button>
        );
      })}
    </div>
  );
};

export default TopBarMenu;
