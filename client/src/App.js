import React from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import MenuEditor from "./restaurant/MenuEditor";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CustomerMenu from "./eater/CustomerMenu";
import OrderQ from "./restaurant/OrderQ";
import TableBasket from "./eater/TableBasket";
import Requests from "./restaurant/Requests";
import Receipt from "./eater/Receipt";
import Tables from "./restaurant/Tables";
import PaymentSuccess from "./eater/PaymentSuccess";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/:restaurant/manager/menu/:stage"
          component={MenuEditor}
        />
        <Route
          exact
          path="/:restaurant/menu/:table/:seat/:stage"
          component={CustomerMenu}
        />
        <Route
          exact
          path="/redirect/session_id/:id"
          component={PaymentSuccess}
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