import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./components/Dashboard/Dashboard";
import Login from "./components/Login/Login";
import StudentConsultations from "./components/StudentConsultations/StudentConsultations";
import Universities from "./components/Universities/Universities";
import AddUniversityElementor from "./components/Universities/AddUniversityElementor";
import EditUniversityElementor from "./components/Universities/EditUniversityElementor";
import axios from "axios";

axios.defaults.headers.get["Cache-Control"] = "no-cache";
axios.defaults.headers.get["Pragma"] = "no-cache";
axios.defaults.headers.get["Expires"] = "0";

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
              path="/StudentConsultations"
              element={<StudentConsultations />}
            />
            <Route path="/Universities" element={<Universities />} />
            <Route
              path="/AddUniversityElementor"
              element={<AddUniversityElementor />}
            />
            <Route
              path="/EditUniversityElementor/:uni_id"
              element={<EditUniversityElementor />}
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
