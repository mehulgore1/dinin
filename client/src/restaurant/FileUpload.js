import { CSVReader } from "react-papaparse";
import React, { useState, useEffect } from "react";
import * as firebase from "firebase";

const FileUpload = props => {
  const restaurant = props.restaurant;

  const handleOnDrop = data => {
    var stageCount = 0;
    var thisStage = 0;
    var categories = {};
    var database = firebase.database();
    database
      .ref("restaurants")
      .child(restaurant)
      .child("menu")
      .remove();
    var finalMenu = {};
    for (var itemArray of data) {
      var itemData = itemArray.data;
      if (itemData.length < 4) {
        // do not accept csv row under certain size
        return;
      }
      var category = itemData[0];
      var title = itemData[1];
      var description = itemData[2];
      var price = itemData[3];
      if (!(category in categories)) {
        // category has not been added, create new structure
        thisStage = stageCount;
        finalMenu[thisStage] = {};
        finalMenu[thisStage]["items"] = [];
        categories[category] = thisStage;
        stageCount = stageCount + 1;
      } else {
        thisStage = categories[category];
      }
      if (title == "" && price == "") {
        // stage description
        finalMenu[thisStage]["stage_desc"] = description;
        database
          .ref("restaurants")
          .child(restaurant)
          .child("menu")
          .child(thisStage)
          .update({ stage_desc: description });
        continue;
      }
      var tempItem = {
        title: title,
        description: description,
        price: price,
        category: category
      };
      var key = database
        .ref("restaurants")
        .child(restaurant)
        .child("menu")
        .child(thisStage)
        .child("items")
        .push(tempItem).key;
      database
        .ref("restaurants")
        .child(restaurant)
        .child("menu")
        .child(thisStage)
        .update({ stage_name: category });
      tempItem.id = key;
      finalMenu[thisStage]["items"].push(tempItem);
      finalMenu[thisStage]["stage_name"] = category;
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
