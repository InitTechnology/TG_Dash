import React, { useState, useEffect, useRef } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
// import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isOpen_popupForm, setIsOpen_popupForm] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    office: "",
    pass: "",
    confirmPass: "",
  });

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

  const resetForm = () => {
    setFormData({
      id: null,
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "",
      office: "",
      pass: "",
      confirmPass: "",
    });
  };

  const handleClosePopup = () => {
    setIsOpen_popupForm(false);
    setIsEditMode(false);
    resetForm();
  };

  const handleAddStaff = async () => {
    if (isViewMode) return;

    if (
      !formData.first_name ||
      !formData.email ||
      !formData.phone ||
      !formData.role ||
      !formData.office
    ) {
      alert("Please fill all required fields");
      return;
    }
    if (formData.pass !== formData.confirmPass) {
      alert("Passwords do not match");
      return;
    }
    try {
      // const { id, ...payload } = formData;
      const payload = {
        firstName: formData.first_name,
        lastName: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        pass: formData.pass,
        role: formData.role,
        office: formData.office,
      };
      console.log("Sending:", payload);

      const res = await axios.post(
        "https://transglobeedu.com/web-backend/regUser",
        payload,
      );

      console.log("Success:", res.data);

      if (res.data.success) {
        await fetchStaff();
        toast.success("User added successfully 🎉");
        handleClosePopup();
      }
    } catch (err) {
      console.error("ERROR:", err);
      console.error("RESPONSE:", err.response?.data);

      alert(err.response?.data?.message || "API Error");
    }
  };

  const handleUpdateStaff = async () => {
    try {
      const res = await axios.put(
        `https://transglobeedu.com/web-backend/staff/${formData.id}`,
        formData,
      );

      if (res.data.success) {
        setStaff((prev) =>
          prev.map((s) => (s.id === formData.id ? { ...s, ...formData } : s)),
        );
        handleClosePopup();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`https://transglobeedu.com/web-backend/staff/${id}`);
      setStaff((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q)
    );
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("menubarOpen");

    if (savedState !== null) {
      return JSON.parse(savedState);
    }

    return window.innerWidth >= 1024;
  });
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rowsPerPage_userManagement = 5;
  const [currentPage_userManagement, setCurrentPage_userManagement] =
    useState(1);

  const totalPages_userManagement = Math.ceil(
    filteredStaff.length / rowsPerPage_userManagement,
  );

  const indexOfLast_userManagement =
    currentPage_userManagement * rowsPerPage_userManagement;
  const indexOfFirst_userManagement =
    indexOfLast_userManagement - rowsPerPage_userManagement;

  const current_userManagement = filteredStaff.slice(
    indexOfFirst_userManagement,
    indexOfLast_userManagement,
  );

  const handleNextPage_userManagement = () => {
    if (currentPage_userManagement < totalPages_userManagement) {
      setCurrentPage_userManagement(currentPage_userManagement + 1);
    }
  };

  const handlePrevPage_userManagement = () => {
    if (currentPage_userManagement > 1) {
      setCurrentPage_userManagement(currentPage_userManagement - 1);
    }
  };

  const handlePageChange_userManagement = (page) => {
    setCurrentPage_userManagement(page);
  };

  const generatePageNumbers_userManagement = () => {
    const pages = [];

    if (totalPages_userManagement <= 5) {
      for (let i = 1; i <= totalPages_userManagement; i++) pages.push(i);
    } else {
      if (currentPage_userManagement > 2) pages.push(1, "…");

      for (
        let i = currentPage_userManagement - 1;
        i <= currentPage_userManagement + 1;
        i++
      ) {
        if (i > 0 && i <= totalPages_userManagement) pages.push(i);
      }

      if (currentPage_userManagement < totalPages_userManagement - 1)
        pages.push("…", totalPages_userManagement);
    }

    return pages;
  };

  const [, setIsOpen] = useState(false);
  // const [search] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //   const [isOpen_popupForm, setIsOpen_popupForm] = useState(false);

  //   const handleClosePopup = () => {
  //     setIsOpen_popupForm(false);
  //   };

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
        <div className="flex justify-between gap-5 items-start lg:items-center">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
              User Management
            </p>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {/* Search bar */}
              <div className="mr-2 p-2 overflow-hidden w-8 h-8 hover:w-[120px] sm:hover:w-[250px] hover:border hover:border-[#1D2826] hover:shadow-[2px_2px_20px_rgba(0,0,0,0.08)] rounded-full flex group items-center hover:duration-300 duration-300">
                {/* Search icon */}
                <div className="flex items-center justify-center fill-[#1D2826]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                  >
                    <path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"></path>
                  </svg>
                </div>

                {/* Input */}
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-none outline-none text-sm bg-transparent w-full font-normal px-2 focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8">
          <div className="flex gap-4 w-full justify-end">
            <div>
              <button
                onClick={() => {
                  setIsOpen_popupForm(true);
                  setIsEditMode(false);
                  setIsViewMode(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
              >
                + Add User
              </button>

              <div className="relative z-50">
                {isOpen_popupForm && (
                  <div
                    onClick={handleClosePopup}
                    className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop_popupForm"
                  />
                )}

                <div
                  className={`fixed top-0 right-0 h-full w-[85%] md:w-[680px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
                    isOpen_popupForm ? "translate-x-0" : "translate-x-full"
                  } panel_popupForm`}
                >
                  <div className="p-4 flex justify-between items-start border-b header_popupForm">
                    <div>
                      <h2 className="text-[#1D2826] text-lg font-semibold">
                        {isViewMode
                          ? "View User"
                          : isEditMode
                            ? "Edit User"
                            : "Add User"}
                      </h2>
                    </div>

                    <button
                      onClick={handleClosePopup}
                      className="text-gray-500 hover:text-black text-xl"
                    >
                      <MdCancel />
                    </button>
                  </div>

                  <div className="max-h-[90vh] overflow-y-auto p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          First Name
                        </label>
                        <input
                          placeholder="Enter first name"
                          required
                          value={formData.first_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              first_name: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Last Name
                        </label>
                        <input
                          placeholder="Enter last name"
                          required
                          value={formData.last_name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              last_name: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Email
                        </label>
                        <input
                          placeholder="Enter email"
                          required
                          name="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Phone No.
                        </label>
                        <input
                          placeholder="Enter phone number"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          Role
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        >
                          <option value="">Select</option>
                          <option value="Commutatus Admin">
                            Commutatus Admin
                          </option>
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

                      <div className="flex flex-col w-full">
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          Office
                        </label>
                        <select
                          value={formData.office}
                          onChange={(e) =>
                            setFormData({ ...formData, office: e.target.value })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        >
                          <option value="">Select</option>
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
                          <option value="Kathmandu Nepal">
                            Kathmandu Nepal
                          </option>
                        </select>
                      </div>
                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="Enter password"
                          value={formData.pass}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pass: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      <div className="flex flex-col w-full">
                        <label
                          htmlFor="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm password"
                          value={formData.confirmPass}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              confirmPass: e.target.value,
                            })
                          }
                          disabled={isViewMode}
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>
                    </div>

                    <br />

                    <div className="grid grid-cols-2 max-w-[310px] gap-3 mt-5">
                      <button
                        onClick={handleClosePopup}
                        className="px-6 z-30 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={
                          isEditMode ? handleUpdateStaff : handleAddStaff
                        }
                        className={`px-6 z-30 py-2 bg-indigo-900 rounded-lg text-center text-white relative after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm ${
                          isViewMode
                            ? "cursor-not-allowed"
                            : "cursor-pointer hover:scale-95"
                        }`}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="shadow-md rounded-lg mt-5">
          {loadingStaff ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-[#E7E7F8] border-b">
                    <tr>
                      <th className="p-4">
                        <input
                          type="checkbox"
                          //   onChange={handleSelectAll_booking}
                          //   checked={
                          //     selectedRows_booking.length ===
                          //       current_booking.length && current_booking.length > 0
                          //   }
                        />
                      </th>
                      <th className="p-4">ID</th>
                      <th className="p-4 w-1/10">Name</th>
                      <th className="p-4 w-1/10">Email</th>
                      <th className="p-4 w-1/10">Phone No.</th>
                      <th className="p-4 w-1/10">Role</th>
                      <th className="p-4">Office</th>
                      <th className="p-4 w-1/10 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current_userManagement.map((staff) => (
                      <tr
                        key={staff.id}
                        className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                      >
                        <td className="px-4 py-3">
                          <input type="checkbox" />
                        </td>
                        <td className="px-4 py-3 font-semibold">{staff.id}</td>
                        <td className="px-4 py-3">
                          {staff.first_name} {staff.last_name}
                        </td>
                        <td className="px-4 py-3">{staff.email}</td>
                        <td className="px-4 py-3">{staff.phone}</td>
                        <td className="px-4 py-3">{staff.role}</td>
                        <td className="px-4 py-3">{staff.office}</td>

                        {/* Actions */}
                        <td>
                          <div className="flex justify-center">
                            <button
                              //   onClick={() => {
                              //     setIsOpen_popupForm(true);
                              //   }}
                              onClick={() => {
                                setFormData(staff);
                                setIsViewMode(true);
                                setIsEditMode(false);
                                setIsOpen_popupForm(true);
                              }}
                              className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                            >
                              <FaEye size={15} />
                            </button>
                            <>
                              <button
                                onClick={() => {
                                  setFormData(staff);
                                  setIsEditMode(true);
                                  setIsViewMode(false);
                                  setIsOpen_popupForm(true);
                                }}
                                // onClick={() => {
                                //   setIsOpen_popupForm(true);
                                // }}
                                className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(staff.id)}
                                className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all"
                              >
                                <MdDelete size={15} />
                              </button>
                            </>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <nav
                className="flex items-center flex-column flex-wrap md:flex-row justify-between rounded-b-lg px-2 py-1 bg-[#f7f7f7]"
                aria-label="Table navigation"
              >
                <span className="text-xs font-normal text-gray-500 mb-4 md:mb-0 block w-full md:inline md:w-auto">
                  Showing{" "}
                  <span className="font-semibold text-gray-700 dark:text-white">
                    {indexOfFirst_userManagement + 1}-
                    {Math.min(indexOfLast_userManagement, staff.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-gray-700 dark:text-white">
                    {staff.length}
                  </span>
                </span>

                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                  {/* Prev */}
                  <li>
                    <button
                      onClick={handlePrevPage_userManagement}
                      disabled={currentPage_userManagement === 1}
                      className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                    >
                      <MdKeyboardDoubleArrowLeft />
                    </button>
                  </li>

                  {/* Pages */}
                  {generatePageNumbers_userManagement().map((page, index) =>
                    page === "…" ? (
                      <li
                        key={index}
                        className="px-1 h-8 flex items-center justify-center text-gray-500 bg-[#f7f7f7]"
                      >
                        <span>…</span>
                      </li>
                    ) : (
                      <li key={index}>
                        <button
                          onClick={() => handlePageChange_userManagement(page)}
                          className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
                            currentPage_userManagement === page
                              ? "text-purple-400 underline underline-offset-2"
                              : ""
                          }`}
                        >
                          {page}
                        </button>
                      </li>
                    ),
                  )}

                  {/* Next */}
                  <li>
                    <button
                      onClick={handleNextPage_userManagement}
                      disabled={
                        currentPage_userManagement === totalPages_userManagement
                      }
                      className="flex items-center justify-center px-1 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
                    >
                      <MdKeyboardDoubleArrowRight />
                    </button>
                  </li>
                </ul>
              </nav>
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
// import { Outlet } from "react-router-dom";
// import "../Dashboard/Dashboard.css";
// import {
//   MdKeyboardDoubleArrowLeft,
//   MdKeyboardDoubleArrowRight,
// } from "react-icons/md";
// import { FaEdit } from "react-icons/fa";
// import { MdDelete, MdCancel } from "react-icons/md";
// import axios from "axios";

// const StaffManagement = () => {
//   const [staff, setStaff] = useState([]);
//   const [loadingStaff, setLoadingStaff] = useState(true);
//   const [searchQuery, setSearchQuery] = useState("");

//   const [editingStaff, setEditingStaff] = useState(null);
//   const [isEditOpen, setIsEditOpen] = useState(false);

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

//   // 🔍 FILTER
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

//   // 📄 PAGINATION
//   const rowsPerPage = 10;
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.ceil(filteredStaff.length / rowsPerPage);
//   const indexOfLast = currentPage * rowsPerPage;
//   const indexOfFirst = indexOfLast - rowsPerPage;
//   const currentStaff = filteredStaff.slice(indexOfFirst, indexOfLast);

//   // 📦 FETCH
//   useEffect(() => {
//     fetchStaff();
//   }, []);

//   const fetchStaff = async () => {
//     try {
//       const res = await axios.get(
//         "https://transglobeedu.com/web-backend/getAllStaff",
//       );
//       setStaff(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoadingStaff(false);
//     }
//   };

//   // ❌ DELETE
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

//   // 📱 RESPONSIVE
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setIsSidebarOpen(false);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // ✏️ OPEN EDIT
//   const handleOpenEdit = (staffData) => {
//     setEditingStaff({ ...staffData });
//     setIsEditOpen(true);
//   };

//   // ❌ CLOSE EDIT
//   const handleCloseEdit = () => {
//     setIsEditOpen(false);
//     setEditingStaff(null);
//   };

//   // ✅ UPDATE
//   const handleUpdateStaff = async () => {
//     try {
//       const payload = {
//         first_name: editingStaff.first_name,
//         last_name: editingStaff.last_name,
//         email: editingStaff.email,
//         phone: editingStaff.phone,
//         role: editingStaff.role,
//         office: editingStaff.office,
//       };

//       const res = await axios.put(
//         `https://transglobeedu.com/web-backend/staff/${editingStaff.id}`,
//         payload,
//       );

//       if (res.data.success) {
//         setStaff((prev) =>
//           prev.map((s) =>
//             s.id === editingStaff.id ? { ...s, ...payload } : s,
//           ),
//         );

//         handleCloseEdit();
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

//         {/* HEADER */}
//         <div className="flex justify-between items-center">
//           <p className="font-semibold text-xl text-gray-700">
//             Staff Management
//           </p>

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

//         {/* SIDE PANEL EDIT */}
//         <div className="relative z-50">
//           {isEditOpen && (
//             <div
//               onClick={handleCloseEdit}
//               className="fixed inset-0 bg-black bg-opacity-30 z-40"
//             />
//           )}

//           <div
//             className={`fixed top-0 right-0 h-full w-[85%] md:w-[500px] bg-white z-50 shadow-lg transform transition-transform duration-500 ${
//               isEditOpen ? "translate-x-0" : "translate-x-full"
//             }`}
//           >
//             {/* HEADER */}
//             <div className="p-4 flex justify-between items-center border-b">
//               <h2 className="text-lg font-semibold">Edit Staff</h2>
//               <button onClick={handleCloseEdit}>
//                 <MdCancel size={22} />
//               </button>
//             </div>

//             {/* FORM */}
//             {editingStaff && (
//               <div className="p-4 space-y-4 overflow-y-auto h-[90%]">
//                 <div className=" grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 items-center max-h-[85vh] overflow-y-auto py-2">
//                   <div className="flex flex-col w-full ">
//                     <label
//                       for="input"
//                       className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                     >
//                       First Name
//                     </label>
//                     <input
//                       value={editingStaff.first_name || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           first_name: e.target.value,
//                         })
//                       }
//                       placeholder="First Name"
//                       className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     />
//                   </div>
//                   <div className="flex flex-col w-full ">
//                     <label
//                       for="input"
//                       className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                     >
//                       Last Name
//                     </label>
//                     <input
//                       value={editingStaff.last_name || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           last_name: e.target.value,
//                         })
//                       }
//                       placeholder="Last Name"
//                       className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     />
//                   </div>

//                   <div className="flex flex-col w-full ">
//                     <label
//                       for="input"
//                       className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                     >
//                       Email
//                     </label>
//                     <input
//                       value={editingStaff.email || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           email: e.target.value,
//                         })
//                       }
//                       placeholder="Email"
//                       className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     />
//                   </div>

//                   <div className="flex flex-col w-full ">
//                     <label
//                       for="input"
//                       className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                     >
//                       Phone
//                     </label>
//                     <input
//                       value={editingStaff.phone || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           phone: e.target.value,
//                         })
//                       }
//                       placeholder="Phone"
//                       className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     />
//                   </div>
//                   <div className="flex flex-col w-full ">
//                     <label
//                       for="input"
//                       className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                     >
//                       Role
//                     </label>
//                     {/* <input
//                       value={editingStaff.role || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           role: e.target.value,
//                         })
//                       }
//                       placeholder="Role"
//                       className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     /> */}
//                     <select
//                       value={editingStaff.role || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           role: e.target.value,
//                         })
//                       }
//                       className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     >
//                       <option value="">Select Role</option>
//                       <option value="Commutatus Admin">Commutatus Admin</option>
//                       <option value="Super Admin">Super Admin</option>
//                       <option value="Office Owner">Office Owner</option>
//                       <option value="Application Admin">
//                         Application Admin
//                       </option>
//                       <option value="Manager">Manager</option>
//                       <option value="Senior Counsellor">
//                         Senior Counsellor
//                       </option>
//                       <option value="Counsellor">Counsellor</option>
//                       <option value="Student Outreach Executive">
//                         Student Outreach Executive
//                       </option>
//                       <option value="Application Manager">
//                         Application Manager
//                       </option>
//                       <option value="Application Executive">
//                         Application Executive
//                       </option>
//                       <option value="Sub-Agent">Sub-Agent</option>
//                     </select>
//                   </div>
//                   <div className="flex flex-col w-full ">
//                     <label
//                       for="input"
//                       className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                     >
//                       Office
//                     </label>
//                     <select
//                       value={editingStaff.office || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           office: e.target.value,
//                         })
//                       }
//                       className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     >
//                       <option value="">Select Office</option>
//                       <option value="Ahmedabad">Ahmedabad</option>
//                       <option value="Anand">Anand</option>
//                       <option value="Chandigarh">Chandigarh</option>
//                       <option value="Delhi">Delhi</option>
//                       <option value="Gandhinagar">Gandhinagar</option>
//                       <option value="Indore">Indore</option>
//                       <option value="Jaipur">Jaipur</option>
//                       <option value="Jamnagar">Jamnagar</option>
//                       <option value="Junagadh">Junagadh</option>
//                       <option value="Morbi">Morbi</option>
//                       <option value="Pune">Pune</option>
//                       <option value="Rajkot">Rajkot</option>
//                       <option value="Surat">Surat</option>
//                       <option value="Vadodara">Vadodara</option>
//                       <option value="Kathmandu Nepal">Kathmandu Nepal</option>
//                     </select>
//                     {/* <input
//                       value={editingStaff.office || ""}
//                       onChange={(e) =>
//                         setEditingStaff({
//                           ...editingStaff,
//                           office: e.target.value,
//                         })
//                       }
//                       placeholder="Office"
//                       className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                     /> */}
//                   </div>
//                 </div>

//                 <div className="flex gap-3 pt-4">
//                   <button
//                     onClick={handleCloseEdit}
//                     className="w-full py-2 border rounded"
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     onClick={handleUpdateStaff}
//                     className="w-full py-2 bg-indigo-900 text-white rounded"
//                   >
//                     Save
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="shadow-md rounded-lg mt-5">
//           {loadingStaff ? (
//             <div className="flex justify-center items-center py-10">
//               <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-gray-500">
//                   <thead className="bg-[#E7E7F8] text-xs uppercase">
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
//                       <tr key={s.id} className="border-b text-center">
//                         <td className="p-4">{s.id}</td>
//                         <td className="p-4">
//                           {s.first_name} {s.last_name}
//                         </td>
//                         <td className="p-4">{s.email}</td>
//                         <td className="p-4">{s.phone}</td>
//                         <td className="p-4">{s.role}</td>

//                         <td className="p-4 flex justify-center gap-2">
//                           {/* <Link to={`/ViewStaff/${s.id}`}>
//                             <FaEye />
//                           </Link> */}

//                           <button onClick={() => handleOpenEdit(s)}>
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

//               {/* PAGINATION */}
//               <div className="flex justify-between px-4 py-2">
//                 <span>
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
