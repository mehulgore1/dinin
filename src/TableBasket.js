import React, { useState, useEffect, Fragment } from "react";
import * as firebase from "firebase";
import WaiterRequest from "./WaiterRequest";
import { useHistory, generatePath } from "react-router-dom";

const TableBasket = props => {
  var database = firebase.database();
  const [tableData, setTableData] = useState({});
  const [newTabledata, setNewTableData] = useState({});
  const [currentBatch, setCurrentBatch] = useState(1);
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

    database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .limitToLast(1)
      .on("value", function(snapshot) {
        snapshot.forEach(function(child) {
          setCurrentBatch(child.key);
        });
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

  const handleBatchOrder = () => {
    var batchObject = tableData["batches"][currentBatch];
    batchObject["table"] = match.params.table;
    database
      .ref(match.params.restaurant)
      .child("order_queue")
      .child(currentBatch)
      .set(batchObject);

    var batch_key = database
      .ref(match.params.restaurant)
      .child("tables")
      .child(match.params.table)
      .child("batches")
      .push("").key;
    setCurrentBatch(batch_key);
  };

  return (
    <>
      <h1> Dashboard for table {match.params.table} </h1>
      <WaiterRequest match={match} />
      {Object.keys(tableData["batches"] || {}).map((batch_key, index) => {
        return (
          <Fragment key={batch_key}>
            <h1> Batch {index + 1} </h1>
            {Object.keys(
              tableData["batches"][batch_key]["seat_data"] || {}
            ).map((seat, i) => {
              var items =
                tableData["batches"][batch_key]["seat_data"][seat]["items"];
              return (
                <Fragment key={seat}>
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
                      <Fragment key={key}>
                        <p>
                          {" "}
                          Title {item["title"]} Quantity {item["quantity"]}{" "}
                          Notes {item["notes"]} Status {item["status"]}{" "}
                        </p>
                      </Fragment>
                    );
                  })}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
      <button onClick={handleBatchOrder}> Order these items </button>
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
