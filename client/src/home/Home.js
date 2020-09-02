import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = props => {
  const [showEater, setShowEater] = useState(false);
  const [showOwner, setShowOwner] = useState(false);
  const [showWaiter, setShowWaiter] = useState(false);

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-center mb-3">
        <h1> Dinin: The mobile dining experience </h1>
      </div>
      <div className="card mt-3">
        <div class="card-body">
          <h2 class="card-title">For Owners</h2>
          <h5>
            Focus on providing quality food and customer service, not logistics{" "}
          </h5>
          <h4>
            <span
              className="badge badge-light"
              onClick={() => setShowOwner(!showOwner)}
            >
              Details
            </span>
          </h4>
          {showOwner ? (
            <div>
              {" "}
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Keep Workers Safe during COVID</li>
                <li class="list-group-item">
                  {" "}
                  Faster, Higher Quality Customer Service{" "}
                </li>
                <li class="list-group-item">Increase Order/Basket Size</li>
                <li class="list-group-item">
                  Gain Insights from Customer Data
                </li>
                <li class="list-group-item">
                  Increase Table Turnover Efficiency
                </li>
                <li class="list-group-item">
                  Easy Loyalty Program Integration
                </li>
                <li class="list-group-item">
                  Easier Onboarding for New Employees
                </li>
                <li class="list-group-item">
                  Increase Revenue during Peak Times
                </li>
                <li class="list-group-item">
                  Increase Labor Force Productivity and Efficiency
                </li>
                <li class="list-group-item">
                  Seamless Identity Verification of 21+ Eaters{" "}
                </li>
              </ul>
            </div>
          ) : null}
        </div>
        <button className="btn btn-large btn-warning"> Schedule a Demo</button>
      </div>
      <div className="card mt-3">
        <div className="card-body">
          <h2 className="card-title"> For Eaters </h2>
          <h5>
            {" "}
            Focus on your friends and family, not waiting, ordering and payments
          </h5>
          <h4>
            <span
              className="badge badge-light"
              onClick={() => setShowEater(!showEater)}
            >
              Details
            </span>
          </h4>
          {showEater ? (
            <div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">No hassle check splitting</li>
                <li class="list-group-item">
                  No more "waiting" for your server. Communicate Digitally with
                  Waitstaff for On-Demand Service{" "}
                </li>
                <li class="list-group-item">
                  Rich data and Menu Recommendations
                </li>
                <li class="list-group-item">
                  Pay With Apple Pay and Google Pay
                </li>
                <li class="list-group-item">
                  COVID-19 Minimized Touch Points: Digital Menu and Mobile
                  Payments
                </li>
                <li class="list-group-item">
                  Order Tracking: See current order status and past orders
                </li>
              </ul>
            </div>
          ) : null}
          <h5 className="mt-3">
            Want Dinin at your local restaurant? Let them know by filling out
            the form below. We will notify you once we are there!{" "}
          </h5>
        </div>
        <button className="btn btn-large btn-primary">
          {" "}
          Get Dinin Near You!{" "}
        </button>
      </div>

      <div className="card mt-3">
        <div class="card-body">
          <h2 class="card-title">For Waitstaff</h2>
          <h5>Increase your tips with faster, genuine service</h5>
          <h4>
            <span
              className="badge badge-light"
              onClick={() => setShowWaiter(!showWaiter)}
            >
              Details
            </span>
          </h4>
          {showWaiter ? (
            <div>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">Increase Tip Volume and Amount</li>
                <li class="list-group-item">No More check Splitting Errors</li>
                <li class="list-group-item">
                  Have more genuine interactions with customers
                </li>
                <li class="list-group-item">Faster Tip Cashouts</li>
              </ul>{" "}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
