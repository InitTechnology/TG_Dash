import React, { useState, useEffect, useRef } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";

const Universities = () => {
  // const user = JSON.parse(localStorage.getItem("user"));
  // const isAdmin = user?.role?.toLowerCase() === "admin";

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [dateFilter] = useState({ from: "", to: "" });

  const [searchQuery, setSearchQuery] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const [, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    converted: 0,
    declined: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, []);
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await axios.get("https://transglobeedu.com/web-backend/all");
      console.log("Fetched bookings:", res.data.data);

      if (res.data.success) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching consultations:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const rowsPerPage_booking = 20;
  const [currentPage_booking, setCurrentPage_booking] = useState(1);
  //   const [selectedRows_booking, setSelectedRows_booking] = useState([]);

  const indexOfLastTable_booking = currentPage_booking * rowsPerPage_booking;
  const indexOfFirstTable_booking =
    indexOfLastTable_booking - rowsPerPage_booking;

  const current_booking = bookings.slice(
    indexOfFirstTable_booking,
    indexOfLastTable_booking,
  );
  const totalPages_booking = Math.ceil(bookings.length / rowsPerPage_booking);

  const handlePageChange_booking = (pageNumber_booking) => {
    setCurrentPage_booking(pageNumber_booking);
    // setSelectedRows_booking([]);
  };

  const handleNextPage_booking = () => {
    if (currentPage_booking < totalPages_booking) {
      setCurrentPage_booking(currentPage_booking + 1);
    }
  };

  const handlePrevPage_booking = () => {
    if (currentPage_booking > 1) {
      setCurrentPage_booking(currentPage_booking - 1);
    }
  };

  const generatePageNumbers_booking = () => {
    const pageNumbers_booking = [];

    if (totalPages_booking <= 3) {
      for (let i = 1; i <= totalPages_booking; i++) {
        pageNumbers_booking.push(i);
      }
    } else {
      if (currentPage_booking > 2) {
        pageNumbers_booking.push(1);
        pageNumbers_booking.push("...");
      }
      for (let i = currentPage_booking - 1; i <= currentPage_booking + 1; i++) {
        if (i > 0 && i <= totalPages_booking) {
          pageNumbers_booking.push(i);
        }
      }
      if (currentPage_booking < totalPages_booking - 1) {
        pageNumbers_booking.push("...");
        pageNumbers_booking.push(totalPages_booking);
      }
    }
    return pageNumbers_booking;
  };

  const [selectedRows_booking, setSelectedRows_booking] = useState([]);

  const handleRowCheckboxChange_booking = (order) => {
    setSelectedRows_booking((prevSelected) =>
      prevSelected.includes(order)
        ? prevSelected.filter((id) => id !== order)
        : [...prevSelected, order],
    );
  };

  const handleSelectAll_booking = () => {
    if (selectedRows_booking.length === current_booking.length) {
      setSelectedRows_booking([]);
    } else {
      setSelectedRows_booking(current_booking.map((booking) => booking.order));
    }
  };

  const [, setShowPopup_filter] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowPopup_filter(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filteredBookings = current_booking.filter((b) => {
    const query = searchQuery.toLowerCase();

    //  text-based search (Booking ID, Name, Destination)
    const matchesSearch =
      (b.bookingId && b.bookingId.toString().toLowerCase().includes(query)) ||
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(query) ||
      (b.destination && b.destination.toLowerCase().includes(query));

    //  check-in date filter only
    let matchesDate = true;
    const checkinDate = normalizeDate(b.checkin);
    const fromDate = normalizeDate(dateFilter.from);
    const toDate = normalizeDate(dateFilter.to);

    if (fromDate) {
      matchesDate = matchesDate && checkinDate >= fromDate;
    }
    if (toDate) {
      matchesDate = matchesDate && checkinDate <= toDate;
    }

    return matchesSearch && matchesDate;
  });

  const [, setBookedByDate] = useState({});

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await fetch(
          "https://dash.zorbdddddastays.com/web-backend/getBookingsByDateProp",
        );
        const data = await res.json();
        if (data.success) setBookedByDate(data.bookings);
      } catch (err) {
        console.error("Error fetching booked dates:", err);
      }
    };
    fetchBookedDates();
  }, []);

  const getStatusCounts = async () => {
    try {
      const res = await axios.get(
        "https://transglobeedu.com/web-backend/getstatus",
      );

      if (res.data.success) {
        setStatusCounts(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch status counts:", error);
    }
  };

  useEffect(() => {
    getStatusCounts();
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
        <div className="flex justify-between gap-5 items-start lg:items-center">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
              Universities
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

                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-gray-500 hover:text-black text-lg font-bold px-1"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8">
          <div className="flex gap-4 w-full justify-between">
            <select class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer">
              <option value="">Filter Country</option>
              <option value="">Canada</option>
              <option value="">USA</option>
              <option value="">UK</option>
            </select>

            <a
              href="/AddUniversityElementor"
              className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
            >
              + Add University
            </a>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="shadow-md rounded-lg mt-5">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading bookings...</span>
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
                            onChange={handleSelectAll_booking}
                            checked={
                              selectedRows_booking.length ===
                                current_booking.length &&
                              current_booking.length > 0
                            }
                          />
                        </th>
                        <th className="p-4"> ID</th>
                        <th className="p-4 w-1/10">University Logo</th>
                        <th className="p-4 w-1/10">University Name</th>
                        <th className="p-4 w-1/10">Country</th>
                        <th className="p-4 w-1/10">State</th>
                        <th className="p-4 w-1/10">City</th>
                        <th className="p-4 w-1/10">Rank</th>
                        <th className="p-4 w-1/10">International Students</th>
                        <th className="p-4 w-1/10">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              onChange={() =>
                                handleRowCheckboxChange_booking(b.id)
                              }
                              checked={selectedRows_booking.includes(b.id)}
                            />
                          </td>
                          {/* Booking ID */}
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {b.id || "-"}
                          </td>
                          {/* Customer Name */}
                          <td className="px-4 py-3">
                            <Tooltip
                              title={`${b.firstName} ${b.lastName}`}
                              placement="left"
                            >
                              {b.firstName} {b.lastName}
                            </Tooltip>
                          </td>

                          {/* Property Code */}
                          <td className="px-4 py-3">
                            <Tooltip
                              title={`${b.nearestOffice}`}
                              placement="left"
                            >
                              {b.nearestOffice || "-"}
                            </Tooltip>
                          </td>

                          {/* Destination */}
                          <td className="px-4 py-3">
                            <Tooltip
                              title={
                                b.package
                                  ? `${b.package}-${b.destination}`
                                  : b.destination || "-"
                              }
                              placement="left"
                            >
                              {b.destination || "-"}
                            </Tooltip>
                          </td>

                          {/* Booking Date */}
                          <td className="px-4 py-3">
                            {/* <Tooltip title={b.bookingTime} placement="left">
                              {b.bookingTime
                                ? new Date(b.bookingTime).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "-"}
                            </Tooltip> */}
                            {new Date(b.createdAt).toLocaleDateString("en-GB")}
                          </td>

                          {/* Check-In */}
                          <td className="px-4 py-3">
                            {/* <Tooltip
                              title={
                                b.checkin
                                  ? new Date(b.checkin).toLocaleDateString(
                                      "en-GB",
                                    ) // dd/mm/yyyy
                                  : "-"
                              }
                              placement="left"
                            >
                              {b.checkin
                                ? new Date(b.checkin).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "-"}
                            </Tooltip> */}

                            {b.modeOfCon || "-"}
                          </td>

                          {/* Check-Out */}
                          <td className="px-4 py-3">
                            {/* <Tooltip
                              title={
                                b.checkout
                                  ? new Date(b.checkout).toLocaleDateString(
                                      "en-GB",
                                    )
                                  : "-"
                              }
                              placement="left"
                            >
                              {b.checkout
                                ? new Date(b.checkout).toLocaleDateString(
                                    "en-GB",
                                  )
                                : "-"}
                            </Tooltip> */}
                            {b.fundingBy || "-"}
                          </td>
                          <td className="px-4 py-3">{b.studyLevel || "-"}</td>

                          {/* Actions */}
                          <td>
                            <div className="flex justify-center">
                              <a
                                href="/EditUniversityElementor"
                                className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                              >
                                <FaEye size={15} />
                              </a>

                              <>
                                <a
                                  href="/EditUniversityElementor"
                                  className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                                >
                                  <FaEdit size={14} />
                                </a>

                                <button className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all">
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
                      {indexOfFirstTable_booking + 1}-
                      {Math.min(indexOfLastTable_booking, bookings.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700 dark:text-white">
                      {bookings.length}
                    </span>
                  </span>

                  <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li>
                      <button
                        onClick={handlePrevPage_booking}
                        disabled={currentPage_booking === 1}
                        className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                      >
                        <MdKeyboardDoubleArrowLeft />
                      </button>
                    </li>
                    {generatePageNumbers_booking().map((page, index) =>
                      page === "..." ? (
                        <li
                          key={index}
                          className="px-1 h-8 flex items-center justify-center text-gray-500 bg-[#f7f7f7]"
                        >
                          <span>...</span>
                        </li>
                      ) : (
                        <li key={index}>
                          <button
                            onClick={() => handlePageChange_booking(page)}
                            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
                              currentPage_booking === page
                                ? "text-purple-400 underline underline-offset-2"
                                : ""
                            }`}
                          >
                            {page}
                          </button>
                        </li>
                      ),
                    )}
                    <li>
                      <button
                        onClick={handleNextPage_booking}
                        disabled={currentPage_booking === totalPages_booking}
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
        </div>
      </main>
    </div>
  );
};

export default Universities;
