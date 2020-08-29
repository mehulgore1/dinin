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
import ManagerLogin from "./restaurant/ManagerLogin";

const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/manager/menu/:stage" component={MenuEditor} />
        <Route exact path="/manager" component={ManagerLogin} />
        <Route
          exact
          path="/:restaurant/:table/menu/:stage"
          component={CustomerMenu}
        />
        <Route
          exact
          path="/redirect/session_id/:id"
          component={PaymentSuccess}
        />
        <Route exact path="/:restaurant/:table/cart" component={TableBasket} />
        <Route exact path="/manager/orders/" component={OrderQ} />
        <Route exact path="/manager/requests" component={Requests} />
        <Route exact path="/:restaurant/:table/receipt" component={Receipt} />
        <Route exact path="/:restaurant/tables" component={Tables} />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
