import React, { useState, useEffect } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuEditor from "./MenuEditor";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CustomerMenu from "./CustomerMenu";
import OrderQ from "./OrderQ";
import TableBasket from "./TableBasket";
import Requests from "./Requests";
import Receipt from "./Receipt";
import Tables from "./Tables";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/:restaurant/manager/" component={MenuEditor} />
        <Route
          exact
          path="/:restaurant/menu/:table/:seat/:stage"
          component={CustomerMenu}
        />
        <Route exact path="/:restaurant/menu/:table" component={TableBasket} />
        <Route exact path="/:restaurant/orders/" component={OrderQ} />
        <Route exact path="/:restaurant/requests" component={Requests} />
        <Route exact path="/:restaurant/:table/receipt" component={Receipt} />
        <Route exact path="/:restaurant/tables" component={Tables} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
