import React, { useState, useEffect } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet, Link } from "react-router-dom";
import "../Dashboard/Dashboard.css";
// import { Tooltip } from "antd";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // 🔍 Search filter
  const filteredStaff = staff.filter((s) => {
    const q = searchQuery.toLowerCase();

    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  // 📄 Pagination
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;

  const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(
        "https://transglobeedu.com/web-backend/getAllStaff",
      );

      // ✅ FIX HERE
      setStaff(res.data.data || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
    } finally {
      setLoadingStaff(false);
    }
  };

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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="font-semibold text-xl text-gray-700">
            Staff Management
          </p>

          {/* Search */}
          {/* <div className="p-2 w-40 border rounded-full flex items-center">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="outline-none text-sm w-full bg-transparent"
            />
          </div> */}
        </div>

        {/* Add Button */}
        {/* <div className="mt-6 flex justify-end">
          <Link
            to="/AddStaff"
            className="px-6 py-2 bg-indigo-900 text-white rounded-lg hover:scale-95"
          >
            + Add Staff
          </Link>
        </div> */}

        {/* Table */}
        <div className="shadow-md rounded-lg mt-5">
          {loadingStaff ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3">Loading staff...</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-500">
                  <thead className="bg-[#E7E7F8] text-gray-700 text-xs uppercase">
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
                      <tr
                        key={s.id}
                        className="bg-white even:bg-gray-50 border-b hover:bg-gray-100"
                      >
                        <td className="p-4 text-center">{s.id}</td>

                        <td className="p-4 text-center">
                          {s.first_name} {s.last_name}
                        </td>

                        <td className="p-4 text-center">{s.email}</td>
                        <td className="p-4 text-center">{s.phone}</td>
                        <td className="p-4 text-center">{s.role}</td>

                        <td className="p-4 flex gap-2 justify-center">
                          <Link to={`/ViewStaff/${s.id}`}>
                            <FaEye />
                          </Link>

                          <Link to={`/EditStaff/${s.id}`}>
                            <FaEdit />
                          </Link>

                          <button onClick={() => handleDeleteStaff(s.id)}>
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between px-4 py-2 bg-[#f7f7f7]">
                <span className="text-sm">
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
