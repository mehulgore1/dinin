import React, { useState, useEffect } from "react";
import * as firebase from "firebase";
import WaiterRequest from "./WaiterRequest";

const TableBasket = props => {
  var database = firebase.database();
  const [tableData, setTableData] = useState({});
  const { match } = props;

  useEffect(() => {
    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .on("value", function(snapshot) {
        setTableData(snapshot.val());
      });
  }, []);

  return (
    <>
      <h1> Dashboard for table {match.params.table} </h1>
      <WaiterRequest match={match} />
      {Object.keys(tableData["seats"] || {}).map((seat, i) => {
        var items = tableData["seats"][seat]["items"];
        return (
          <>
            <h2> Seat {seat} </h2>
            {Object.keys(items || {}).map((key, i) => {
              var item = items[key];
              return (
                <>
                  <p>
                    {" "}
                    Title {item["title"]} Quantity {item["quantity"]} Notes{" "}
                    {item["notes"]} Status {item["status"]}{" "}
                  </p>
                </>
              );
            })}
          </>
        );
      })}
      <h2> Requests </h2>
      {Object.keys(tableData["requests"] || {}).map((key, i) => {
        return (
          <>
            <p>
              {" "}
              Request {tableData["requests"][key]["request"]} Status
              {tableData["requests"][key]["status"]}
            </p>
          </>
        );
      })}
    </>
  );
};

export default TableBasket;
