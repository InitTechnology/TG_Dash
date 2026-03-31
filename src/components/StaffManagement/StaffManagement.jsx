import React, { useState, useEffect } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdCancel } from "react-icons/md";
import axios from "axios";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // 🔍 FILTER
  const filteredStaff = Array.isArray(staff)
    ? staff.filter((s) => {
        const q = searchQuery.toLowerCase();

        return (
          `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          s.role?.toLowerCase().includes(q)
        );
      })
    : [];

  // 📄 PAGINATION
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);

  // 📦 FETCH
  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(
        "https://transglobeedu.com/web-backend/getAllStaff",
      );
      setStaff(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStaff(false);
    }
  };

  // ❌ DELETE
  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Delete this staff?")) return;

    try {
      await axios.delete(`https://transglobeedu.com/web-backend/staff/${id}`);

      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  // 📱 RESPONSIVE
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✏️ OPEN EDIT
  const handleOpenEdit = (staffData) => {
    setEditingStaff({ ...staffData });
    setIsEditOpen(true);
  };

  // ❌ CLOSE EDIT
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingStaff(null);
  };

  // ✅ UPDATE
  const handleUpdateStaff = async () => {
    try {
      const payload = {
        first_name: editingStaff.first_name,
        last_name: editingStaff.last_name,
        email: editingStaff.email,
        phone: editingStaff.phone,
        role: editingStaff.role,
        office: editingStaff.office,
      };

      const res = await axios.put(
        `https://transglobeedu.com/web-backend/staff/${editingStaff.id}`,
        payload,
      );

      if (res.data.success) {
        setStaff((prev) =>
          prev.map((s) =>
            s.id === editingStaff.id ? { ...s, ...payload } : s,
          ),
        );

        handleCloseEdit();
      }
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  return (
    <div className="flex bg-[#F8F9FA]">
      <Menubar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />

      <main
        className={`p-5 lg:p-6 transition-all duration-500 w-full ${
          isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Outlet />

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <p className="font-semibold text-xl text-gray-700">
            Staff Management
          </p>

          <div className="p-2 w-40 border rounded-full flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none text-sm w-full bg-transparent"
            />
          </div>
        </div>

        {/* 🔥 SIDE PANEL EDIT */}
        <div className="relative z-50">
          {isEditOpen && (
            <div
              onClick={handleCloseEdit}
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
            />
          )}

          <div
            className={`fixed top-0 right-0 h-full w-[85%] md:w-[500px] bg-white z-50 shadow-lg transform transition-transform duration-500 ${
              isEditOpen ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* HEADER */}
            <div className="p-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold">Edit Staff</h2>
              <button onClick={handleCloseEdit}>
                <MdCancel size={22} />
              </button>
            </div>

            {/* FORM */}
            {editingStaff && (
              <div className="p-4 space-y-4 overflow-y-auto h-[90%]">
                <div className=" grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 items-center max-h-[85vh] overflow-y-auto py-2">
                  <div className="flex flex-col w-full ">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      First Name
                    </label>
                    <input
                      value={editingStaff.first_name || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          first_name: e.target.value,
                        })
                      }
                      placeholder="First Name"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>
                  <div className="flex flex-col w-full ">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Last Name
                    </label>
                    <input
                      value={editingStaff.last_name || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          last_name: e.target.value,
                        })
                      }
                      placeholder="Last Name"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full ">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Email
                    </label>
                    <input
                      value={editingStaff.email || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full ">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Phone
                    </label>
                    <input
                      value={editingStaff.phone || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Phone"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>
                  <div className="flex flex-col w-full ">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Role
                    </label>
                    {/* <input
                      value={editingStaff.role || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          role: e.target.value,
                        })
                      }
                      placeholder="Role"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    /> */}
                    <select
                      value={editingStaff.role || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          role: e.target.value,
                        })
                      }
                      className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    >
                      <option value="">Select Role</option>
                      <option value="Commutatus Admin">Commutatus Admin</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Office Owner">Office Owner</option>
                      <option value="Application Admin">
                        Application Admin
                      </option>
                      <option value="Manager">Manager</option>
                      <option value="Senior Counsellor">
                        Senior Counsellor
                      </option>
                      <option value="Counsellor">Counsellor</option>
                      <option value="Student Outreach Executive">
                        Student Outreach Executive
                      </option>
                      <option value="Application Manager">
                        Application Manager
                      </option>
                      <option value="Application Executive">
                        Application Executive
                      </option>
                      <option value="Sub-Agent">Sub-Agent</option>
                    </select>
                  </div>
                  <div className="flex flex-col w-full ">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Office
                    </label>
                    <select
                      value={editingStaff.office || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          office: e.target.value,
                        })
                      }
                      className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    >
                      <option value="">Select Office</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Anand">Anand</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Gandhinagar">Gandhinagar</option>
                      <option value="Indore">Indore</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Jamnagar">Jamnagar</option>
                      <option value="Junagadh">Junagadh</option>
                      <option value="Morbi">Morbi</option>
                      <option value="Pune">Pune</option>
                      <option value="Rajkot">Rajkot</option>
                      <option value="Surat">Surat</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Kathmandu Nepal">Kathmandu Nepal</option>
                    </select>
                    {/* <input
                      value={editingStaff.office || ""}
                      onChange={(e) =>
                        setEditingStaff({
                          ...editingStaff,
                          office: e.target.value,
                        })
                      }
                      placeholder="Office"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    /> */}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCloseEdit}
                    className="w-full py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUpdateStaff}
                    className="w-full py-2 bg-indigo-900 text-white rounded"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div className="shadow-md rounded-lg mt-5">
          {loadingStaff ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-500">
                  <thead className="bg-[#E7E7F8] text-xs uppercase">
                    <tr>
                      <th className="p-4">ID</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentStaff.map((s) => (
                      <tr key={s.id} className="border-b text-center">
                        <td className="p-4">{s.id}</td>
                        <td className="p-4">
                          {s.first_name} {s.last_name}
                        </td>
                        <td className="p-4">{s.email}</td>
                        <td className="p-4">{s.phone}</td>
                        <td className="p-4">{s.role}</td>

                        <td className="p-4 flex justify-center gap-2">
                          {/* <Link to={`/ViewStaff/${s.id}`}>
                            <FaEye />
                          </Link> */}

                          <button onClick={() => handleOpenEdit(s)}>
                            <FaEdit />
                          </button>

                          <button onClick={() => handleDeleteStaff(s.id)}>
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex justify-between px-4 py-2">
                <span>
                  Showing {indexOfFirst + 1}-
                  {Math.min(indexOfLast, filteredStaff.length)} of{" "}
                  {filteredStaff.length}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <MdKeyboardDoubleArrowLeft />
                  </button>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <MdKeyboardDoubleArrowRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StaffManagement;

// import React, { useState, useEffect } from "react";
// import Menubar from "../Menubar/Menubar";
// import { Outlet, Link } from "react-router-dom";
// import "../Dashboard/Dashboard.css";
// // import { Tooltip } from "antd";
// import {
//   MdKeyboardDoubleArrowLeft,
//   MdKeyboardDoubleArrowRight,
// } from "react-icons/md";
// import { FaEdit, FaEye } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import axios from "axios";

// const StaffManagement = () => {
//   const [staff, setStaff] = useState([]);
//   const [loadingStaff, setLoadingStaff] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [editingStaff, setEditingStaff] = useState(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

//   // 🔍 Search filter
//   const filteredStaff = Array.isArray(staff)
//     ? staff.filter((s) => {
//         const q = searchQuery.toLowerCase();

//         return (
//           `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
//           s.email?.toLowerCase().includes(q) ||
//           s.phone?.toLowerCase().includes(q) ||
//           s.role?.toLowerCase().includes(q)
//         );
//       })
//     : [];

//   // 📄 Pagination
//   const rowsPerPage = 10;
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

//   const indexOfLast = currentPage * rowsPerPage;
//   const indexOfFirst = indexOfLast - rowsPerPage;

//   const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);

//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   const fetchStaff = async () => {
//     try {
//       const res = await axios.get(
//         "https://transglobeedu.com/web-backend/getAllStaff",
//       );

//       // ✅ FIX HERE
//       setStaff(res.data.data || []);
//     } catch (err) {
//       console.error("Error fetching staff:", err);
//     } finally {
//       setLoadingStaff(false);
//     }
//   };

//   const handleDeleteStaff = async (id) => {
//     if (!window.confirm("Delete this staff?")) return;

//     try {
//       await axios.delete(`https://transglobeedu.com/web-backend/staff/${id}`);

//       setStaff((prev) => prev.filter((s) => s.id !== id));
//     } catch (err) {
//       console.error(err);
//       alert("Delete failed");
//     }
//   };

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setIsSidebarOpen(false);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);
//   const handleUpdateStaff = async () => {
//     try {
//       const res = await axios.put(
//         `https://transglobeedu.com/web-backend/staff/${editingStaff.id}`,
//         editingStaff,
//       );

//       if (res.data.success) {
//         setStaff((prev) =>
//           prev.map((s) => (s.id === editingStaff.id ? editingStaff : s)),
//         );

//         setEditingStaff(null);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Update failed");
//     }
//   };
//   return (
//     <div className="flex bg-[#F8F9FA]">
//       <Menubar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         isMobile={isMobile}
//       />

//       <main
//         className={`p-5 lg:p-6 transition-all duration-500 w-full ${
//           isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"
//         }`}
//       >
//         <Outlet />

//         {/* Header */}
//         <div className="flex justify-between items-center">
//           <p className="font-semibold text-xl text-gray-700">
//             Staff Management
//           </p>

//           {/* Search */}
//           <div className="p-2 w-40 border rounded-full flex items-center">
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="outline-none text-sm w-full bg-transparent"
//             />
//           </div>
//         </div>

//         {/* Add Button */}
//         {/* <div className="mt-6 flex justify-end">
//           <Link
//             to="/AddStaff"
//             className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:scale-95"
//           >
//             + Add Staff
//           </Link>
//         </div> */}
//         {editingStaff && (
//           <div className="bg-white shadow-lg rounded-xl p-6 mt-5 border">
//             <h2 className="text-lg font-semibold mb-4">Edit Staff</h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 value={editingStaff.first_name}
//                 onChange={(e) =>
//                   setEditingStaff({
//                     ...editingStaff,
//                     first_name: e.target.value,
//                   })
//                 }
//                 placeholder="First Name"
//                 className="border p-2 rounded"
//               />

//               <input
//                 type="text"
//                 value={editingStaff.last_name}
//                 onChange={(e) =>
//                   setEditingStaff({
//                     ...editingStaff,
//                     last_name: e.target.value,
//                   })
//                 }
//                 placeholder="Last Name"
//                 className="border p-2 rounded"
//               />

//               <input
//                 type="email"
//                 value={editingStaff.email}
//                 onChange={(e) =>
//                   setEditingStaff({ ...editingStaff, email: e.target.value })
//                 }
//                 placeholder="Email"
//                 className="border p-2 rounded"
//               />

//               <input
//                 type="text"
//                 value={editingStaff.phone}
//                 onChange={(e) =>
//                   setEditingStaff({ ...editingStaff, phone: e.target.value })
//                 }
//                 placeholder="Phone"
//                 className="border p-2 rounded"
//               />

//               <input
//                 type="text"
//                 value={editingStaff.role}
//                 onChange={(e) =>
//                   setEditingStaff({ ...editingStaff, role: e.target.value })
//                 }
//                 placeholder="Role"
//                 className="border p-2 rounded"
//               />

//               <input
//                 type="text"
//                 value={editingStaff.office}
//                 onChange={(e) =>
//                   setEditingStaff({ ...editingStaff, office: e.target.value })
//                 }
//                 placeholder="Office"
//                 className="border p-2 rounded"
//               />
//             </div>

//             <div className="flex gap-3 mt-5">
//               <button
//                 onClick={handleUpdateStaff}
//                 className="px-5 py-2 bg-indigo-900 text-white rounded-lg"
//               >
//                 Save
//               </button>

//               <button
//                 onClick={() => setEditingStaff(null)}
//                 className="px-5 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         )}
//         {/* Table */}
//         <div className="shadow-md rounded-lg mt-5">
//           {loadingStaff ? (
//             <div className="flex justify-center items-center py-10">
//               <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
//               <span className="ml-3">Loading staff...</span>
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-gray-500">
//                   <thead className="bg-[#E7E7F8] text-gray-700 text-xs uppercase">
//                     <tr>
//                       <th className="p-4">ID</th>
//                       <th className="p-4">Name</th>
//                       <th className="p-4">Email</th>
//                       <th className="p-4">Phone</th>
//                       <th className="p-4">Role</th>
//                       <th className="p-4">Actions</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {currentStaff.map((s) => (
//                       <tr
//                         key={s.id}
//                         className="bg-white even:bg-gray-50 border-b hover:bg-gray-100"
//                       >
//                         <td className="p-4 text-center">{s.id}</td>

//                         <td className="p-4 text-center">
//                           {s.first_name} {s.last_name}
//                         </td>

//                         <td className="p-4 text-center">{s.email}</td>
//                         <td className="p-4 text-center">{s.phone}</td>
//                         <td className="p-4 text-center">{s.role}</td>

//                         <td className="p-4 flex gap-2 justify-center">
//                           <Link to={`/ViewStaff/${s.id}`}>
//                             <FaEye />
//                           </Link>

//                           <button onClick={() => setEditingStaff(s)}>
//                             <FaEdit />
//                           </button>
//                           <button onClick={() => handleDeleteStaff(s.id)}>
//                             <MdDelete />
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               <div className="flex justify-between px-4 py-2 bg-[#f7f7f7]">
//                 <span className="text-sm">
//                   Showing {indexOfFirst + 1}-
//                   {Math.min(indexOfLast, filteredStaff.length)} of{" "}
//                   {filteredStaff.length}
//                 </span>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage(currentPage - 1)}
//                     disabled={currentPage === 1}
//                   >
//                     <MdKeyboardDoubleArrowLeft />
//                   </button>

//                   <button
//                     onClick={() => setCurrentPage(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                   >
//                     <MdKeyboardDoubleArrowRight />
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default StaffManagement;
