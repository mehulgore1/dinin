import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as firebase from "firebase";
import MenuEditor from "./MenuEditor";
import { BrowserRouter, Route, Switch } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={MenuEditor} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
