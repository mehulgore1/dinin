import { CSVReader } from "react-papaparse";
import React, { useState, useEffect } from "react";
import * as firebase from "firebase";
import { isProperty } from "@babel/types";

const FileUpload = props => {
  const handleOnDrop = data => {
    var database = firebase.database();
    database.ref("menu").remove();
    var finalMenu = [];
    for (var itemArray of data) {
      var itemData = itemArray["data"];
      var tempItem = {
        title: itemData[0],
        description: itemData[1],
        price: itemData[2]
      };
      database.ref("menu").push(tempItem);
      finalMenu.push(tempItem);
    }
    props.handleSetMenu(finalMenu);
  };

  const handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  const handleOnRemoveFile = data => {
    console.log("---------------------------");
    console.log(data);
    console.log("---------------------------");
  };

  return (
    <CSVReader
      onDrop={handleOnDrop}
      onError={handleOnError}
      addRemoveButton
      onRemoveFile={handleOnRemoveFile}
    >
      <span>Drop CSV file here or click to upload.</span>
    </CSVReader>
  );
};

export default FileUpload;
