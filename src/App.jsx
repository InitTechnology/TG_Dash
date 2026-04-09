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
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;

// import React, { Suspense } from "react";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Dashboard from "./components/Dashboard/Dashboard";
// import Login from "./components/Login/Login";
// import StudentConsultations from "./components/StudentConsultations/StudentConsultations";
// import Universities from "./components/Universities/Universities";
// import AddUniversityElementor from "./components/Universities/AddUniversityElementor";
// import EditUniversityElementor from "./components/Universities/EditUniversityElementor";
// import StudentDocument from "./components/Applications/StudentDocument";
// import axios from "axios";
// import DocumentEvaluator from "./components/Applications/DocumentEvaluator";
// import StudentDocuments from "./components/Applications/StudentDocuments";
// import StaffManagement from "./components/StaffManagement/StaffManagement";
// import Events from "./components/Events/Events";
// import BannerElementor from "./components/BannerElementor/BannerElementor";
// import ExamPageElementor from "./components/ExamPageElementor/ExamPageElementor";

// axios.defaults.headers.get["Cache-Control"] = "no-cache";
// axios.defaults.headers.get["Pragma"] = "no-cache";
// axios.defaults.headers.get["Expires"] = "0";

// function App() {
//   return (
//     <div>
//       <Router>
//         {/* <Header /> */}

//         <ToastContainer position="top-right" autoClose={3000} />

//         <Suspense
//           fallback={
//             <div className="flex items-center text-center">Loading...</div>
//           }
//         >
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route path="/SignIn" element={<Login />} />
//             <Route path="/Dashboard" element={<Dashboard />} />
//             <Route
//               path="/StudentConsultations"
//               element={<StudentConsultations />}
//             />
//             <Route path="/Universities" element={<Universities />} />
//             <Route path="/StudentDocument" element={<StudentDocument />} />
//             <Route
//               path="/AddUniversityElementor"
//               element={<AddUniversityElementor />}
//             />
//             <Route
//               path="/EditUniversityElementor/:uni_id"
//               element={<EditUniversityElementor />}
//             />

//             <Route path="/DocumentEvaluator" element={<DocumentEvaluator />} />

//             <Route path="/StudentDocuments" element={<StudentDocuments />} />

//             <Route path="/UserManagement" element={<StaffManagement />} />

//             <Route path="/Events" element={<Events />} />

//             <Route path="/BannerElementor" element={<BannerElementor />} />

//             <Route path="/ExamPageElementor" element={<ExamPageElementor />} />

//             {/* <Route path="*" element={<Error />} /> */}
//           </Routes>
//         </Suspense>

//         {/* <Footer /> */}
//       </Router>
//     </div>
//   );
// }

// export default App;
