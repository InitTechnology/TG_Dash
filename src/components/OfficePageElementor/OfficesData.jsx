import React, { useState, useEffect } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet, useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const OfficesData = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [deletePopup, setDeletePopup] = useState({
    open: false,
    officeId: null,
    officeName: "",
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("menubarOpen");

    if (savedState !== null) {
      return JSON.parse(savedState);
    }

    return window.innerWidth >= 1024;
  });

  // const officesData = [
  //   {
  //     id: 1,
  //     branchName: "Trans Globe Ahmedabad",
  //     city: "Ahmedabad",
  //     state: "Gujarat",
  //     lastUpdatedAt: "12-04-2026",
  //     progress: 100,
  //   },
  //   {
  //     id: 2,
  //     branchName: "Trans Globe Surat",
  //     city: "Surat",
  //     state: "Gujarat",
  //     lastUpdatedAt: "10-04-2026",
  //     progress: 45,
  //   },
  //   {
  //     id: 3,
  //     branchName: "Trans Globe Vadodara",
  //     city: "Vadodara",
  //     state: "Gujarat",
  //     lastUpdatedAt: "08-04-2026",
  //     progress: 70,
  //   },
  //   {
  //     id: 4,
  //     branchName: "Trans Globe Rajkot",
  //     city: "Rajkot",
  //     state: "Gujarat",
  //     lastUpdatedAt: "05-04-2026",
  //     progress: 15,
  //   },
  //   {
  //     id: 5,
  //     branchName: "Trans Globe Delhi",
  //     city: "Delhi",
  //     state: "Delhi",
  //     lastUpdatedAt: "01-04-2026",
  //     progress: 85,
  //   },
  // ];

  // useEffect(() => {
  //   setLoading(true);

  //   setTimeout(() => {
  //     setBookings(officesData);
  //     setLoading(false);
  //   }, 400);
  //   // eslint-disable-next-line
  // }, []);
  const API_BASE = "https://transglobeedu.com/web-backend";

  useEffect(() => {
    const fetchOffices = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/branchoffices`);
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          const mappedOffices = result.data.map((office) => ({
            id: office.id,
            branchName: office.office || "N/A",
            city: office.city || "N/A",
            state: office.state || "N/A",
            lastUpdatedAt: office.updated_at
              ? new Date(office.updated_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "N/A",
            progress: 100,
            ...office,
          }));
          setBookings(mappedOffices);
        } else {
          setBookings([]);
        }
      } catch (error) {
        console.error("Error fetching offices:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, []);
  const DonutChart = ({ value = 0 }) => {
    const percentage = value;

    const radius = 20;
    const stroke = 2;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
      if (percentage === 100) return "#4ADE80";
      if (percentage > 50) return "#ffe947";
      if (percentage > 15) return "#fc9947";
      return "#EF4444";
    };

    return (
      <div className="flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <circle
            stroke={getColor()}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="10"
            fill="#2B2A4C"
          >
            {percentage}%
          </text>
        </svg>
      </div>
    );
  };

  const handleDelete_officeData = async (id) => {
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/branchoffices/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (result.success) {
        // ✅ remove from UI
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        alert("Failed to delete office");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Something went wrong");
    } finally {
      setDeletePopup({ open: false, officeId: null, officeName: "" });
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

  const rowsPerPage_officeData = 20;
  const [currentPage_officeData, setCurrentPage_officeData] = useState(1);
  //   const [selectedRows_officeData, setSelectedRows_officeData] = useState([]);

  const indexOfLastTable_officeData =
    currentPage_officeData * rowsPerPage_officeData;
  const indexOfFirstTable_officeData =
    indexOfLastTable_officeData - rowsPerPage_officeData;

  const current_officeData = bookings.slice(
    indexOfFirstTable_officeData,
    indexOfLastTable_officeData,
  );
  // const totalPages_officeData = Math.ceil(
  //   bookings.length / rowsPerPage_officeData,
  // );
  const totalFilteredBookings = bookings.filter((b) => {
    if (filterCity && b.branchName !== filterCity) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        (b.id && b.id.toString().includes(query)) ||
        (b.branchName && b.branchName.toLowerCase().includes(query)) ||
        (b.city && b.city.toLowerCase().includes(query)) ||
        (b.state && b.state.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }
    return true;
  }).length;

  const totalPages_officeData = Math.ceil(
    totalFilteredBookings / rowsPerPage_officeData,
  );
  const handlePageChange_officeData = (pageNumber_officeData) => {
    setCurrentPage_officeData(pageNumber_officeData);
    // setSelectedRows_officeData([]);
  };

  const handleNextPage_officeData = () => {
    if (currentPage_officeData < totalPages_officeData) {
      setCurrentPage_officeData(currentPage_officeData + 1);
    }
  };

  const handlePrevPage_officeData = () => {
    if (currentPage_officeData > 1) {
      setCurrentPage_officeData(currentPage_officeData - 1);
    }
  };

  const generatePageNumbers_officeData = () => {
    const pageNumbers_officeData = [];

    if (totalPages_officeData <= 3) {
      for (let i = 1; i <= totalPages_officeData; i++) {
        pageNumbers_officeData.push(i);
      }
    } else {
      if (currentPage_officeData > 2) {
        pageNumbers_officeData.push(1);
        pageNumbers_officeData.push("...");
      }
      for (
        let i = currentPage_officeData - 1;
        i <= currentPage_officeData + 1;
        i++
      ) {
        if (i > 0 && i <= totalPages_officeData) {
          pageNumbers_officeData.push(i);
        }
      }
      if (currentPage_officeData < totalPages_officeData - 1) {
        pageNumbers_officeData.push("...");
        pageNumbers_officeData.push(totalPages_officeData);
      }
    }
    return pageNumbers_officeData;
  };

  const filtered_officeData = bookings
    .filter((b) => {
      // Dropdown filter
      if (filterCity && b.branchName !== filterCity) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          (b.id && b.id.toString().includes(query)) ||
          (b.branchName && b.branchName.toLowerCase().includes(query)) ||
          (b.city && b.city.toLowerCase().includes(query)) ||
          (b.state && b.state.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      return true;
    })
    .slice(indexOfFirstTable_officeData, indexOfLastTable_officeData);

  //   const today = new Date();

  //   const setQuickFilter = (type) => {
  //     let from, to;

  //     if (type === "Today") {
  //       from = to = today.toISOString().split("T")[0];
  //     }

  //     if (type === "Week") {
  //       const start = new Date(today);
  //       start.setDate(today.getDate() - today.getDay()); // start of week (Sunday)
  //       const end = new Date(start);
  //       end.setDate(start.getDate() + 6); // end of week (Saturday)

  //       from = start.toISOString().split("T")[0];
  //       to = end.toISOString().split("T")[0];
  //     }

  //     if (type === "Month") {
  //       const start = new Date(today.getFullYear(), today.getMonth(), 1);
  //       const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  //       from = start.toISOString().split("T")[0];
  //       to = end.toISOString().split("T")[0];
  //     }

  //     if (type === "Year") {
  //       const start = new Date(today.getFullYear(), 0, 1);
  //       const end = new Date(today.getFullYear(), 11, 31);

  //       from = start.toISOString().split("T")[0];
  //       to = end.toISOString().split("T")[0];
  //     }

  //     setDateFilter({ from, to });
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
            <p className="font-semibold text-lg sm:text-xl text-gray-700 ml-10 lg:ml-0">
              Offices Data
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

              {/* <div className="">
                <button class="Btn">
                  <svg
                    class="svgIcon"
                    viewBox="0 0 384 512"
                    height="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                  </svg>
                  <span class="icon2"></span>
                  <span class="tooltip text-sm">Download</span>
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8">
          <div className="flex gap-4 w-full justify-between">
            <select
              value={filterCity}
              onChange={(e) => {
                setFilterCity(e.target.value);
                setCurrentPage_officeData(1); // Reset to first page when filtering
              }}
              class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer"
            >
              <option value="">Filter By office</option>
              {bookings.map((office) => (
                <option key={office.id} value={office.branchName}>
                  {office.branchName}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigate("/OfficePageElementor")}
              className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white relative hover:scale-95 transition-all duration-300 ease-in-out"
            >
              + Add Office
            </button>
          </div>
        </div>

        {/* Table */}
        <div>
          <div className="shadow-md rounded-lg mt-5">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-10 h-10 border-4 border-[#2B2A4C] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading offices...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-[#E7E7F8] border-b">
                      <tr>
                        <th className="p-4"> ID</th>

                        <th className="p-4 w-1/10">Branch Name</th>
                        <th className="p-4 w-1/10">City</th>
                        <th className="p-4 w-1/10">State</th>
                        <th className="p-4 w-1/10">Last Updated At</th>
                        <th className="p-4 w-20 text-center">Status</th>
                        <th className="p-4 w-1/10 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered_officeData.map((b) => (
                        <tr
                          key={b.id}
                          className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                        >
                          {/* ID */}
                          <td className="px-4 py-3 font-medium">{b.id}</td>

                          {/* Branch Name */}
                          <td className="px-4 py-3">
                            <Tooltip title={b.branchName}>
                              {b.branchName}
                            </Tooltip>
                          </td>

                          {/* City */}
                          <td className="px-4 py-3">{b.city}</td>

                          {/* State */}
                          <td className="px-4 py-3">{b.state}</td>

                          {/* Last Updated */}
                          <td className="px-4 py-3">{b.lastUpdatedAt}</td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <DonutChart value={b.progress} />
                            </div>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="flex justify-center">
                              <button
                                onClick={() =>
                                  navigate("/OfficePageElementor", { state: b })
                                }
                                className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                              >
                                <FaEye size={15} />
                              </button>

                              <button
                                onClick={() => navigate(`/edit-office/${b.id}`)}
                                className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                              >
                                <FaEdit size={14} />
                              </button>

                              <button
                                onClick={() =>
                                  setDeletePopup({
                                    open: true,
                                    officeId: b.id,
                                    officeName: b.branchName,
                                  })
                                }
                                className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all"
                              >
                                <MdDelete size={15} />
                              </button>
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
                      {indexOfFirstTable_officeData + 1}-
                      {Math.min(indexOfLastTable_officeData, bookings.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700 dark:text-white">
                      {totalFilteredBookings}
                    </span>
                  </span>

                  <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
                    <li>
                      <button
                        onClick={handlePrevPage_officeData}
                        disabled={currentPage_officeData === 1}
                        className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                      >
                        <MdKeyboardDoubleArrowLeft />
                      </button>
                    </li>
                    {generatePageNumbers_officeData().map((page, index) =>
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
                            onClick={() => handlePageChange_officeData(page)}
                            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
                              currentPage_officeData === page
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
                        onClick={handleNextPage_officeData}
                        disabled={
                          currentPage_officeData === totalPages_officeData
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

          {deletePopup.open && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={() =>
                  setDeletePopup({
                    open: false,
                    officeId: null,
                    officeName: "",
                  })
                }
              />

              {/* Popup box */}
              <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg w-[90%] max-w-lg p-6 text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Delete{" "}
                  <span className="font-semibold text-red-500">
                    {deletePopup.officeName}
                  </span>{" "}
                  Branch ?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this Office?
                  <br /> This action will also delete the corresponding "Exam
                  Pages" too.
                </p>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() =>
                      setDeletePopup({
                        open: false,
                        officeId: null,
                        officeName: "",
                      })
                    }
                    className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() =>
                      handleDelete_officeData(deletePopup.officeId)
                    }
                    className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
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

export default OfficesData;
