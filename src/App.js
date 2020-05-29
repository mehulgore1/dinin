import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuEditor from "./MenuEditor";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CustomerMenu from "./CustomerMenu";
import OrderQ from "./OrderQ";
import TableBasket from "./TableBasket";
import Requests from "./Requests";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/manager/:restaurant" component={MenuEditor} />
        <Route
          exact
          path="/menu/:restaurant/:table/:seat/:stage"
          component={CustomerMenu}
        />
        <Route exact path="/menu/:restaurant/:table" component={TableBasket} />
        <Route exact path="/orders/:restaurant" component={OrderQ} />
        <Route exact path="/requests/:restaurant" component={Requests} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
