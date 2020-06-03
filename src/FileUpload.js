import { CSVReader } from "react-papaparse";
import React, { useState, useEffect } from "react";
import * as firebase from "firebase";

const FileUpload = props => {
  const restaurant = props.match.params.restaurant;
  const handleOnDrop = data => {
    var database = firebase.database();
    database
      .ref(restaurant)
      .child("menu")
      .remove();
    var finalMenu = {};
    for (var itemArray of data) {
      var itemData = itemArray.data;
      if (!(itemData[4] in finalMenu)) {
        finalMenu[itemData[4]] = {};
      }
      if (!([itemData[3]] in finalMenu[itemData[4]])) {
        finalMenu[itemData[4]][itemData[3]] = [];
      }
      var tempItem = {
        title: itemData[0],
        description: itemData[1],
        price: itemData[2],
        category: itemData[3]
      };
      var key = database
        .ref(restaurant)
        .child("menu")
        .child(itemData[4])
        .child(tempItem.category)
        .push(tempItem).key;
      database
        .ref(restaurant)
        .child("menu")
        .child(itemData[4])
        .update({ stage_name: itemData[5] });
      tempItem.id = key;
      console.log(itemData[3] in finalMenu[itemData[4]]);
      finalMenu[itemData[4]][itemData[3]].push(tempItem);
      finalMenu[itemData[4]]["stage_name"] = itemData[5];
    }
    console.log(finalMenu);
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
