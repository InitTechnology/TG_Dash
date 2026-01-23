import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import ConsultationBookings from "./components/ConsultationBookings/ConsultationBookings";

function App() {
  return (
    <div>
      <Router>
        {/* <Header /> */}

        <ToastContainer position="top-right" autoClose={3000} />

        <Suspense
          fallback={
            <div className="flex items-center text-center">Loading...</div>
          }
        >
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/SignIn" element={<Login />} />
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route
              path="/ConsultationBookings"
              element={<ConsultationBookings />}
            />

            {/* <Route path="*" element={<Error />} /> */}
          </Routes>
        </Suspense>

        {/* <Footer /> */}
      </Router>
    </div>
  );
}

export default App;
