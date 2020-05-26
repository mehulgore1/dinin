import React, { useState, useEffect } from "react";
import * as firebase from "firebase";
import WaiterRequest from "./WaiterRequest";
import { useHistory, generatePath } from "react-router-dom";

const TableBasket = props => {
  var database = firebase.database();
  const [tableData, setTableData] = useState({});
  const [newTabledata, setNewTableData] = useState({});
  const { match } = props;
  const history = useHistory();

  useEffect(() => {
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .on("value", function(snapshot) {
        setTableData(snapshot.val());
      });
  }, []);

  const handleAddMoreItems = seat => {
    const path = generatePath(match.path, {
      restaurant: match.params.restaurant,
      table: match.params.table
    });
    var pathExtra = "/" + seat + "/1";
    history.replace(path + pathExtra);
  };

  return (
    <>
      <h1> Dashboard for table {match.params.table} </h1>
      <WaiterRequest match={match} />
      {Object.keys(tableData["seats"] || {}).map((seat, i) => {
        var items = tableData["seats"][seat]["items"];
        return (
          <React.Fragment key={seat}>
            <h2>
              {" "}
              Seat {seat}{" "}
              <button onClick={() => handleAddMoreItems(seat)}>
                {" "}
                Add more items{" "}
              </button>{" "}
            </h2>
            {Object.keys(items || {}).map((key, i) => {
              var item = items[key];
              return (
                <React.Fragment key={key}>
                  <p>
                    {" "}
                    Title {item["title"]} Quantity {item["quantity"]} Notes{" "}
                    {item["notes"]} Status {item["status"]}{" "}
                  </p>
                </React.Fragment>
              );
            })}
          </React.Fragment>
        );
      })}
      <button> Order these items </button>
      <h2> Requests </h2>
      {Object.keys(tableData["requests"] || {}).map((key, i) => {
        return (
          <React.Fragment key={key}>
            <p>
              {" "}
              Request {tableData["requests"][key]["request"]} Status
              {tableData["requests"][key]["status"]}
            </p>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default TableBasket;
