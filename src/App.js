import React, { useState, useEffect } from "react";
import "./App.css";
import MenuEditor from "./MenuEditor";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CustomerMenu from "./CustomerMenu";
import OrderQ from "./OrderQ";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/manager" component={MenuEditor} />
        <Route exact path="/customer" component={CustomerMenu} />
        <Route exact path="/orders" component={OrderQ} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
