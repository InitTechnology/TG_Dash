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
import StudentDocument from "./components/Applications/StudentDocument";
import axios from "axios";
import DocumentEvaluator from "./components/Applications/DocumentEvaluator";
import StudentDocuments from "./components/Applications/StudentDocuments";
import StaffManagement from "./components/StaffManagement/StaffManagement";
import Events from "./components/Events/Events";
import BannerElementor from "./components/BannerElementor/BannerElementor";
import ProtectedRoute from "./components/ProtechtedRoutes";
import ExamPageElementor from "./components/ExamPageElementor/ExamPageElementor";
import OfficePageElementor from "./components/OfficePageElementor/OfficePageElementor";
import EditOfficePageElementor from "./components/OfficePageElementor/EditOfficePageElementor";
import EditExamPageElementor from "./components/ExamPageElementor/EditExamPageElementor";
import ExamsData from "./components/ExamPageElementor/ExamsData";
import OfficesData from "./components/OfficePageElementor/OfficesData";

axios.defaults.headers.get["Cache-Control"] = "no-cache";
axios.defaults.headers.get["Pragma"] = "no-cache";
axios.defaults.headers.get["Expires"] = "0";
axios.interceptors.request.use((config) => {
  if (config.method === "get") {
    config.params = { ...config.params, _: new Date().getTime() };
  }
  return config;
});

function App() {
  return (
    <div>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Suspense
          fallback={
            <div className="flex items-center text-center">Loading...</div>
          }
        >
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/SignIn" element={<Login />} />

            {/* Protected routes — wrap each one */}
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/StudentConsultations"
              element={
                <ProtectedRoute>
                  <StudentConsultations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Universities"
              element={
                <ProtectedRoute>
                  <Universities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/StudentDocument"
              element={
                <ProtectedRoute>
                  <StudentDocument />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AddUniversityElementor"
              element={
                <ProtectedRoute>
                  <AddUniversityElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/EditUniversityElementor/:uni_id"
              element={
                <ProtectedRoute>
                  <EditUniversityElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/DocumentEvaluator"
              element={
                <ProtectedRoute>
                  <DocumentEvaluator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/StudentDocuments"
              element={
                <ProtectedRoute>
                  <StudentDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/UserManagement"
              element={
                <ProtectedRoute>
                  <StaffManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/BannerElementor"
              element={
                <ProtectedRoute>
                  <BannerElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ExamPageElementor"
              element={
                <ProtectedRoute>
                  <ExamPageElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/OfficePageElementor"
              element={
                <ProtectedRoute>
                  <OfficePageElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-office/:officeId"
              element={
                <ProtectedRoute>
                  <EditOfficePageElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-exam-page/:officeId/:examSlug"
              element={
                <ProtectedRoute>
                  <EditExamPageElementor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam"
              element={
                <ProtectedRoute>
                  <ExamsData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/office"
              element={
                <ProtectedRoute>
                  <OfficesData />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
