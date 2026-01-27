import React, { useState, useEffect, useRef } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FiUploadCloud } from "react-icons/fi";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
import { GiNetworkBars } from "react-icons/gi";
import { BsFillLuggageFill } from "react-icons/bs";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import axios from "axios";

const ConsultationBookings = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("add");
  const [bookings, setBookings] = useState([]);
  const [dateFilter, setDateFilter] = useState({ from: "", to: "" });
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualProperty, setManualProperty] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    open: false,
    bookingId: null,
  });
  const [editingBooking, setEditingBooking] = useState(null); // store booking being edited

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [formData, setFormData] = useState({
    country: "",
    state: "",
    city: "",
    gstNum: "",
    totPay: "",
    advPay: "",
    balPay: "",
  });
  const [idProofFile, setIdProofFile] = useState(null);
  const [executives, setExecutives] = useState([]);
  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        const res = await fetch(
          "https://dash.zorbastays.com/web-backend/users",
        );
        const data = await res.json();
        setExecutives(data);
      } catch (err) {
        console.error("Error fetching executives:", err);
      }
    };

    fetchExecutives();
  }, []);

  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  // };
  const [worldData, setWorldData] = useState([]);

  useEffect(() => {
    // fetch from public/world.json
    fetch("/world.json")
      .then((res) => res.json())
      .then((data) => setWorldData(data))
      .catch((err) => console.error("Error loading world.json:", err));
  }, []);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //     ...(name === "country" && { state: "", city: "" }), // reset if country changes
  //     ...(name === "state" && { city: "" }), // reset if state changes
  //   }));
  // };
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // 🌍 Reset dependent dropdowns
      if (name === "country") {
        updated.state = "";
        updated.city = "";
      } else if (name === "state") {
        updated.city = "";
      }

      // 💰 Auto-calculate balance when total or advance changes
      if (name === "totPay" || name === "advPay") {
        const total = parseFloat(updated.totPay) || 0;
        const advance = parseFloat(updated.advPay) || 0;
        updated.balPay = (total - advance).toFixed(2);
      }

      return updated;
    });
  };

  // Find selected country object
  const selectedCountry = worldData.find((c) => c.name === formData.country);

  // Extract states
  const states = selectedCountry?.states || [];

  // Find selected state object
  const selectedState = states.find((s) => s.name === formData.state);

  // Extract cities
  const cities = selectedState?.cities || [];
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIdProofFile(file); // save selected file
    }
  };
  const fileInputRef = useRef(null);

  const handleBoxClick = () => {
    fileInputRef.current.click();
  };

  // put this near the top of your component (after useState for bookings)
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await axios.get("https://transglobeedu.com/web-backend/all");

      if (res.data.success) {
        setBookings(res.data.data); // 👈 THIS IS IMPORTANT
      }
    } catch (err) {
      console.error("Error fetching consultations:", err);
    } finally {
      setLoading(false);
    }
  };

  // then call it in useEffect
  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSaveBooking = async () => {
    if (!isAdmin) {
      toast.error(" Only admins can modify bookings.");
      return;
    }

    let data = new FormData(); // Change from const to let

    // Only append fields that have values (not empty strings, undefined, or null)
    Object.keys(formData).forEach((key) => {
      if (
        key !== "bookingId" &&
        formData[key] !== undefined &&
        formData[key] !== null &&
        formData[key] !== ""
      ) {
        data.append(key, formData[key]);
      }
    });

    if (idProofFile) {
      data.append("idProof", idProofFile);
    }

    const profit =
      Number(formData.bTocPrice || 0) - Number(formData.bTobPrice || 0);
    data.append("profit", profit);

    try {
      let url = "https://dash.zorbastays.com/web-backend/createBooking";
      let method = "POST";

      if (editingBooking) {
        url = `https://dash.zorbastays.com/web-backend/bookings/${editingBooking.id}`;
        method = "PUT";

        const entries = Array.from(data.entries());
        data = new FormData();
        entries.forEach(([key, value]) => {
          if (value !== "" && value !== "undefined" && value !== "null") {
            data.append(key, value);
          }
        });
      }

      const res = await fetch(url, { method, body: data });
      const result = await res.json();

      if (result.success) {
        toast.success(
          editingBooking
            ? " Booking updated successfully!"
            : ` Booking added successfully! ID: ${result.bookingId}`,
        );

        if (editingBooking) {
          setBookings((prev) =>
            prev.map((bk) =>
              bk.id === editingBooking.id ? { ...bk, ...formData, profit } : bk,
            ),
          );
        } else {
          fetchBookings();
        }

        handleClosePopup();
        setEditingBooking(null);
      } else {
        toast.error(" Failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Booking error:", err);
      toast.error("Could not connect to server");
    }
  };

  const resetForm = () => {
    setFormData({
      country: "",
      state: "",
      city: "",
    });
    setIdProofFile(null);
    setEditingBooking(null);
  };

  const handleClosePopup = () => {
    setIsOpen_popupForm(false);
    resetForm();
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

  // const navigate = useNavigate();

  // const [selected_filter, setSelected_filter] = useState("Today");

  // const [active_filter, setActive_filter] = useState(false);

  // const toggleAll_filter = () => {
  //   setActive_filter((prev_filter) => !prev_filter);
  // };

  const statusColors = {
    CANCELLED: "bg-amber-800/20 text-amber-800",
    CONFIRMED: "bg-green-500/20 text-green-500",
    BOOKED: "bg-purple-500/20 text-purple-500",
    FAILED: "bg-red-500/20 text-red-500",
    PENDING: "bg-yellow-200/40 text-yellow-300",
    PAID: "bg-transparent text-green-500",
    UNPAID: "bg-transparent text-red-400",
    PROCESSING: "bg-pink-200/40 text-pink-300",
  };

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

  const [isOpen_popupForm, setIsOpen_popupForm] = useState(false);

  const [showPopup_filter, setShowPopup_filter] = useState(false);
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
  // when popup opens, set default bookingTime
  useEffect(() => {
    if (isOpen_popupForm) {
      setFormData((prev) => ({
        ...prev,
        bookingTime: new Date().toISOString(), // ISO format (safe for DB)
      }));
    }
  }, [isOpen_popupForm]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch(
          "https://dash.zorbastays.com/web-backend/properties",
        );
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("Error fetching properties:", err);
      }
    };

    fetchProperties();
  }, []);

  const handleDeleteBooking = async (id) => {
    if (!isAdmin) {
      toast.error("🚫 Only admins can modify bookings.");
      return;
    }

    try {
      const res = await fetch(
        `https://dash.zorbastays.com/web-backend/bookings/${id}`,
        { method: "DELETE" },
      );
      const result = await res.json();

      if (result.success) {
        toast.success(" Booking deleted successfully");
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setDeletePopup({ open: false, bookingId: null }); // close popup
      } else {
        toast.error("Failed to delete: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Could not connect to server");
    }
  };
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // sort alphabetically
  const sortedProperties = [...properties].sort((a, b) =>
    a.propertyName.localeCompare(b.propertyName),
  );

  // filter by search
  const filteredProperties = sortedProperties.filter((p) =>
    p.propertyName.toLowerCase().includes(search.toLowerCase()),
  );
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

  const today = new Date();

  const setQuickFilter = (type) => {
    let from, to;

    if (type === "Today") {
      from = to = today.toISOString().split("T")[0];
    }

    if (type === "Week") {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay()); // start of week (Sunday)
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // end of week (Saturday)

      from = start.toISOString().split("T")[0];
      to = end.toISOString().split("T")[0];
    }

    if (type === "Month") {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      from = start.toISOString().split("T")[0];
      to = end.toISOString().split("T")[0];
    }

    if (type === "Year") {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);

      from = start.toISOString().split("T")[0];
      to = end.toISOString().split("T")[0];
    }

    setDateFilter({ from, to });
  };
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    profit: 0,
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          "https://dash.zorbastays.com/web-backend/getBookingAnalytics",
        );
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error(" Error fetching analytics:", err);
      }
    };

    fetchAnalytics();
  }, []);

  // format numbers with commas
  const formatNumber = (num) =>
    new Intl.NumberFormat("en-IN").format(Number(num));
  const [bookedByDate, setBookedByDate] = useState({});

  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await fetch(
          "https://dash.zorbastays.com/web-backend/getBookingsByDateProp",
        );
        const data = await res.json();
        if (data.success) setBookedByDate(data.bookings);
      } catch (err) {
        console.error("Error fetching booked dates:", err);
      }
    };
    fetchBookedDates();
  }, []);

  // helper to expand date range
  const getDatesInRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(current.toISOString().split("T")[0]); // yyyy-mm-dd
      current.setDate(current.getDate() + 1);
    }
    return dates;
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

        {/* Header */}
        <div className="flex justify-between gap-5 items-start lg:items-center">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
              Consultation Bookings
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-3 items-start lg:items-center">
              <div className="flex items-center pl-2 border border-black rounded-lg">
                <IoMdTime className="text-lg" />

                <select
                  name="filter"
                  value={selected_filter}
                  onChange={(e) => setSelected_filter(e.target.value)}
                  className="block text-center text-xs bg-transparent focus:outline-none focus:ring-0 border-none focus:border-none"
                  style={{ appearance: "none" }}
                >
                  <option key="" value="Today">
                    Today
                  </option>
                  <option key="" value="Week">
                    This Week
                  </option>
                  <option key="" value="Custom">
                    Custom
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <div
                  onClick={toggleAll_filter}
                  className="flex flex-col items-center gap-4 pl-2 cursor-pointer select-none group scale-[0.8]"
                >
                  <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full ">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
                      style={{
                        left: active_filter ? "100%" : "0%",
                        transform: `translate(${
                          active_filter ? "-100%" : "0"
                        }, -50%)`,
                      }}
                    ></div>
                  </div>

                  <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full -my-2.5">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
                      style={{
                        left: active_filter ? "0%" : "100%",
                        transform: `translate(${
                          active_filter ? "0" : "-100%"
                        }, -50%)`,
                      }}
                    ></div>
                  </div>

                  <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
                      style={{
                        left: active_filter ? "100%" : "0%",
                        transform: `translate(${
                          active_filter ? "-100%" : "0"
                        }, -50%)`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="-mr-1">
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
                </div>

                <div class="p-2 overflow-hidden w-8 h-8 hover:w-[120px] sm:hover:w-[250px] hover:border hover:border-[#1D2826] hover:shadow-[2px_2px_20px_rgba(0,0,0,0.08)] rounded-full flex group items-center hover:duration-300 duration-300">
                  <div class="flex items-center justify-center fill-[#1D2826]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      id="Isolation_Mode"
                      data-name="Isolation Mode"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                    >
                      <path d="M18.9,16.776A10.539,10.539,0,1,0,16.776,18.9l5.1,5.1L24,21.88ZM10.5,18A7.5,7.5,0,1,1,18,10.5,7.507,7.507,0,0,1,10.5,18Z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    class="border-none outline-none text-sm bg-transparent w-full font-normal px-2 focus:ring-0"
                  />
                </div>
              </div>
            </div> */}
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

              <div className="">
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
              </div>

              <div className="flex items-center">
                <div className="relative inline-block" ref={filterRef}>
                  <div
                    onClick={() => setShowPopup_filter((prev) => !prev)}
                    className={`flex flex-col items-center gap-4 cursor-pointer select-none group scale-[0.75] py-2.5 px-2 rounded-full border-2 transition-all duration-300 ${
                      showPopup_filter
                        ? "border-[#1D2826]"
                        : "border-transparent hover:border-[#1D2826]"
                    }`}
                  >
                    <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
                        style={{
                          left: showPopup_filter ? "100%" : "0%",
                          transform: `translate(${
                            showPopup_filter ? "-100%" : "0"
                          }, -50%)`,
                        }}
                      ></div>
                    </div>

                    <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full -my-2.5">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
                        style={{
                          left: showPopup_filter ? "0%" : "100%",
                          transform: `translate(${
                            showPopup_filter ? "0" : "-100%"
                          }, -50%)`,
                        }}
                      ></div>
                    </div>

                    <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
                        style={{
                          left: showPopup_filter ? "100%" : "0%",
                          transform: `translate(${
                            showPopup_filter ? "-100%" : "0"
                          }, -50%)`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {showPopup_filter && (
                    <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-custom z-10 p-4 space-y-4 w-64">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Filter out on Check-In Date
                      </h3>
                      {/* Quick buttons */}
                      <div className="flex justify-between gap-2">
                        {["Today", "Week", "Month", "Year"].map((label) => (
                          <button
                            key={label}
                            onClick={() => setQuickFilter(label)}
                            className="flex-1 py-1 px-2 bg-gray-100 hover:bg-[#DAE0CE] rounded text-sm font-medium"
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* Custom date range */}
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <DatePicker
                            selected={
                              dateFilter.from ? parseISO(dateFilter.from) : null
                            }
                            onChange={(date) =>
                              setDateFilter((prev) => ({
                                ...prev,
                                from: date ? format(date, "yyyy-MM-dd") : "",
                              }))
                            }
                            dateFormat="dd-MM-yyyy" // 👈 shows as dd-MM-yyyy
                            placeholderText="dd-mm-yyyy"
                            className="border text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-black"
                          />
                          <span className="text-sm text-gray-500">-</span>
                          <DatePicker
                            selected={
                              dateFilter.to ? parseISO(dateFilter.to) : null
                            }
                            onChange={(date) =>
                              setDateFilter((prev) => ({
                                ...prev,
                                to: date ? format(date, "yyyy-MM-dd") : "",
                              }))
                            }
                            dateFormat="dd-MM-yyyy"
                            placeholderText="dd-mm-yyyy"
                            className="border text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-black"
                          />
                        </div>
                      </div>

                      {/* Apply & Reset */}
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={() => setDateFilter({ from: "", to: "" })}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setShowPopup_filter(false)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}

                  {deletePopup.open && (
                    <>
                      {/* Overlay */}
                      <div
                        className="fixed inset-0 bg-black bg-opacity-40 z-40"
                        onClick={() =>
                          setDeletePopup({ open: false, bookingId: null })
                        }
                      />

                      {/* Popup box */}
                      <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-3">
                          Delete Booking?
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                          Are you sure you want to delete this booking? This
                          action cannot be undone.
                        </p>

                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() =>
                              setDeletePopup({ open: false, bookingId: null })
                            }
                            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteBooking(deletePopup.bookingId)
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
              </div>
            </div>
          </div>
        </div>

        {/* Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 items-center gap-5 text-gray-700 font-semibold mt-5">
          <div className="flex items-center justify-between gap-5 bg-[#E7E7F8] py-2 px-4 rounded-lg">
            <div>
              <p>Total Consultations</p>
              <p className="mt-2 text-lg text-black">
                ₹{formatNumber(analytics.totalRevenue)}
                <sup className="text-purple-900">+55%</sup>
              </p>
            </div>

            <div>
              <GiNetworkBars className="bg-[#2B2A4C] text-3xl text-white p-1.5 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 bg-[#E7E7F8] py-2 px-4 rounded-lg">
            <div>
              <p>Monthly Consultations</p>
              <p className="mt-2 text-lg text-black">
                ₹{formatNumber(analytics.pendingPayments)}
                <sup className="text-purple-900">+5%</sup>
              </p>
            </div>

            <div>
              <BsFillLuggageFill className="bg-[#2B2A4C] text-3xl text-white p-1.5 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 bg-[#E7E7F8] py-2 px-4 rounded-lg">
            <div>
              <p>Past Consultations (2 Week)</p>
              <p className="mt-2 text-lg text-black">
                ₹{formatNumber(analytics.profit)}
                <sup className="text-purple-900">+8%</sup>
              </p>
            </div>

            <div>
              <FaMoneyBillTrendUp className="bg-[#2B2A4C] text-3xl text-white p-1.5 rounded-md" />
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="flex justify-between gap-10 mt-8">
          {isAdmin && (
            <button
              onClick={() => {
                setFormMode("add");
                setIsOpen_popupForm(true);
              }}
              className="px-6 z-30 py-2 bg-[#1D2826] rounded-lg text-center text-white relative hover:scale-95 ..."
            >
              + Add Booking
            </button>
          )}

          <div className="relative z-50">
            {isOpen_popupForm && (
              <div
                onClick={handleClosePopup}
                className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop_popupForm"
              />
            )}

            <div
              className={`fixed top-0 right-0 h-full w-[85%] md:w-[640px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
                isOpen_popupForm ? "translate-x-0" : "translate-x-full"
              } panel_popupForm`}
            >
              <div className="p-4 flex justify-between items-center border-b header_popupForm">
                <h2 className="text-[#1D2826] text-lg font-semibold">
                  {formMode === "add" && "Add New Booking"}
                  {formMode === "edit" && "Edit Booking"}
                  {formMode === "view" && "View Booking"}
                </h2>
                <button
                  onClick={handleClosePopup}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  <MdCancel />
                </button>
              </div>

              <div className="p-4">
                <div className="font-semibold text-gray-500 text-sm text-right">
                  <input
                    type="checkbox"
                    id="isPackageBooking"
                    name="isPackageBooking"
                    checked={formData.isPackageBooking || false}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPackageBooking: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-green-600 border-gray-400 rounded focus:ring-0 focus:border-black"
                  />
                  <label
                    htmlFor="isPackageBooking"
                    className="text-sm font-medium text-gray-700"
                  >
                    &nbsp; &nbsp;Does this booking belong to a package?
                  </label>
                  {/* Booking ID: <span className="text-black my-1">10294837</span> */}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 items-center max-h-[85vh] overflow-y-auto py-2">
                  <div className="flex flex-col w-full">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      First Name
                    </label>
                    <input
                      placeholder="Enter first name"
                      required
                      name="firstName"
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      value={formData.firstName || ""}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Last Name
                    </label>
                    <input
                      placeholder="Enter last name"
                      required
                      name="lastName"
                      value={formData.lastName || ""}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      onChange={handleChange}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Email
                    </label>
                    <input
                      placeholder="Enter your email"
                      required
                      name="email"
                      value={formData.email || ""}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      onChange={handleChange}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Phone Number
                    </label>
                    <input
                      placeholder="Enter phone number"
                      required
                      name="phone"
                      value={formData.phone || ""}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      onChange={handleChange}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  {/* Country */}
                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Country
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:border-black"
                    >
                      <option value="">Select your country</option>
                      {worldData.map((country) => (
                        <option key={country.id} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* State */}
                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                      State
                    </label>
                    <select
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      disabled={isViewOnly || !formData.country}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:border-black"
                    >
                      <option value="">Select your state</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.name}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                      City
                    </label>
                    <select
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      disabled={isViewOnly || !formData.state}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:border-black"
                    >
                      <option value="">Select your city</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Booking Date & Time
                    </label>
                    <input
                      type="text"
                      name="bookingTime"
                      readOnly
                      value={
                        formData.bookingTime
                          ? new Date(formData.bookingTime).toLocaleString()
                          : ""
                      }
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md text-black"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="checkin"
                      className="text-gray-400 text-xs font-semibold relative z-20 top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Check In Date
                    </label>
                    <DatePicker
                      selected={
                        formData.checkin ? parseISO(formData.checkin) : null
                      }
                      onChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkin: date ? format(date, "yyyy-MM-dd") : "", // store safe in DB
                        }))
                      }
                      dateFormat="dd-MM-yyyy"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                      placeholderText="dd-mm-yyyy"
                      disabled={isViewOnly}
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="checkout"
                      className="text-gray-400 text-xs font-semibold relative z-20 top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Check Out Date
                    </label>
                    <DatePicker
                      selected={
                        formData.checkout ? parseISO(formData.checkout) : null
                      }
                      onChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          checkout: date ? format(date, "yyyy-MM-dd") : "",
                        }))
                      }
                      dateFormat="dd-MM-yyyy"
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                      placeholderText="dd-mm-yyyy"
                      disabled={isViewOnly}
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Trip Executive
                    </label>

                    <select
                      name="tripExecutive"
                      value={formData.tripExecutive || ""}
                      onChange={handleChange}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    >
                      <option value="">Select Trip Executive</option>
                      {executives.map((exec, idx) => (
                        <option key={idx} value={exec.name}>
                          {exec.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Booking Status
                    </label>

                    <select
                      name="bookingStatus"
                      value={formData.bookingStatus || ""} // controlled value
                      onChange={handleChange}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    >
                      <option value="">Select booking status</option>
                      <option value="Pending">Pending</option>
                      <option value="Booked">Booked</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Processing">Processing</option>
                    </select>
                  </div>

                  <div className="flex flex-col w-full">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Payment Status
                    </label>

                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus || ""} // controlled value
                      onChange={handleChange}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    >
                      <option value="">Select payment status</option>
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* <div
                    className="flex flex-col w-full relative"
                    ref={dropdownRef}
                  >
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Property
                    </label>

               
                    <div
                      onClick={() => {
                        if (
                          !isViewOnly &&
                          formData.checkin &&
                          formData.checkout
                        ) {
                          setIsOpen(!isOpen);
                        }
                      }}
                      className={`border-gray-400 p-3 text-sm border rounded-lg w-full cursor-pointer focus:outline-none ${
                        isViewOnly || !formData.checkin || !formData.checkout
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    >
                      {formData.property || "Select a property"}
                    </div>
                    {(!formData.checkin || !formData.checkout) &&
                      !isViewOnly && (
                        <p className="text-xs text-red-500 mt-1">
                          Please select both check-in and check-out dates first
                        </p>
                      )}
                    {isOpen && !isViewOnly && (
                      <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                       
                        <div className="flex items-center p-2 border-b">
                          <input
                            type="text"
                            placeholder="Type a property"
                            className="w-full p-2 text-sm border rounded focus:outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                          />
                        </div>

                       
                        <ul className="max-h-48 overflow-y-auto">
                          {filteredProperties.length > 0 ? (
                            filteredProperties.map((p) => {
                              let isUnavailable = false;

                              if (formData.checkin && formData.checkout) {
                                const selectedDates = getDatesInRange(
                                  formData.checkin,
                                  formData.checkout
                                );

                                // check if this property is booked in that range
                                isUnavailable = selectedDates.some((date) =>
                                  bookedByDate[date]?.some(
                                    (b) => b.property === p.propertyName
                                  )
                                );
                              }

                              return (
                                <li
                                  key={p.id}
                                  onClick={() => {
                                    if (isUnavailable) return; 
                                    handleChange({
                                      target: {
                                        name: "property",
                                        value: p.propertyName,
                                      },
                                    });
                                    setIsOpen(false);
                                    setSearch("");
                                  }}
                                  className={`px-4 py-2 text-sm ${
                                    isUnavailable
                                      ? "text-gray-400 cursor-not-allowed line-through"
                                      : "hover:bg-gray-100 cursor-pointer"
                                  }`}
                                  title={
                                    isUnavailable
                                      ? "This property is already booked"
                                      : ""
                                  }
                                >
                                  {p.propertyName}
                                </li>
                              );
                            })
                          ) : (
                            <li className="px-4 py-2 text-gray-400 text-sm">
                              No results found
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div> */}

                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="totPay"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Total Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter total amount"
                      name="totPay"
                      value={formData.totPay || ""}
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="advPay"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Advance Payment
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter advance payment"
                      name="advPay"
                      value={formData.advPay || ""}
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="balPay"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      Balance Amount
                    </label>
                    <input
                      // type="number"
                      // step="0.01"
                      // placeholder="Enter balance amount"
                      // name="balPay"
                      // value={formData.balPay || ""}
                      // onChange={handleChange}
                      // readOnly={isViewOnly}
                      // disabled={isViewOnly}
                      type="number"
                      step="0.01"
                      placeholder="Enter balance amount"
                      name="balPay"
                      value={formData.balPay || ""}
                      readOnly
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div
                    className="flex flex-col w-full relative"
                    ref={dropdownRef}
                  >
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Property
                    </label>

                    {/* Display selected value */}
                    <div
                      onClick={() => {
                        if (
                          !isViewOnly &&
                          (editingBooking?.property ||
                            (formData.checkin && formData.checkout))
                        ) {
                          setIsOpen(!isOpen);
                        }
                      }}
                      className={`border-gray-400 p-3 text-sm border rounded-lg w-full cursor-pointer focus:outline-none ${
                        isViewOnly ||
                        (!editingBooking?.property &&
                          (!formData.checkin || !formData.checkout))
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white"
                      }`}
                    >
                      {formData.property || "Select a property"}
                    </div>

                    {/* Helper text when dates are missing (only for new bookings) */}
                    {(!formData.checkin || !formData.checkout) &&
                      !isViewOnly &&
                      !editingBooking && (
                        <p className="text-xs text-red-500 mt-1">
                          Please select both check-in and check-out dates first
                        </p>
                      )}

                    {/* Show different helper text when editing but dates are missing */}
                    {editingBooking &&
                      (!formData.checkin || !formData.checkout) &&
                      !isViewOnly && (
                        <p className="text-xs text-yellow-500 mt-1">
                          Check-in/check-out dates missing. Update dates to
                          change property.
                        </p>
                      )}

                    {isOpen &&
                      !isViewOnly &&
                      (editingBooking?.property ||
                        (formData.checkin && formData.checkout)) && (
                        <div className="absolute z-20 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {/* Toggle for Add Property */}
                          <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
                            <span className="text-sm font-semibold text-gray-600">
                              Select or Add Property
                            </span>
                            <button
                              type="button"
                              onClick={() => setManualMode((prev) => !prev)}
                              className="text-blue-600 text-xs font-medium hover:underline"
                            >
                              {manualMode ? "← Back to list" : "+ Add manually"}
                            </button>
                          </div>

                          {/* Search / Manual Input */}
                          <div className="flex items-center p-2 border-b">
                            {manualMode ? (
                              <input
                                type="text"
                                placeholder="Enter property name"
                                className="w-full p-2 text-sm border rounded focus:outline-none"
                                value={manualProperty}
                                onChange={(e) =>
                                  setManualProperty(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    manualProperty.trim()
                                  ) {
                                    handleChange({
                                      target: {
                                        name: "property",
                                        value: manualProperty.trim(),
                                      },
                                    });
                                    setIsOpen(false);
                                    setManualMode(false);
                                    setManualProperty("");
                                  }
                                }}
                              />
                            ) : (
                              <input
                                type="text"
                                placeholder="Type a property"
                                className="w-full p-2 text-sm border rounded focus:outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                              />
                            )}
                          </div>

                          {/* List */}
                          {!manualMode && (
                            <ul className="max-h-48 overflow-y-auto">
                              {filteredProperties.length > 0 ? (
                                filteredProperties.map((p) => {
                                  let isUnavailable = false;

                                  if (formData.checkin && formData.checkout) {
                                    const selectedDates = getDatesInRange(
                                      formData.checkin,
                                      formData.checkout,
                                    );

                                    isUnavailable = selectedDates.some(
                                      (date) => {
                                        const bookingsForDate =
                                          bookedByDate[date] || [];
                                        return bookingsForDate.some(
                                          (b) =>
                                            b.property === p.propertyName &&
                                            (!editingBooking ||
                                              b.bookingId !==
                                                editingBooking.bookingId),
                                        );
                                      },
                                    );
                                  }

                                  return (
                                    <li
                                      key={p.id}
                                      onClick={() => {
                                        if (isUnavailable) return;
                                        handleChange({
                                          target: {
                                            name: "property",
                                            value: p.propertyName,
                                          },
                                        });
                                        setIsOpen(false);
                                        setSearch("");
                                      }}
                                      className={`px-4 py-2 text-sm ${
                                        isUnavailable
                                          ? "text-gray-400 cursor-not-allowed line-through"
                                          : "hover:bg-gray-100 cursor-pointer"
                                      }`}
                                      title={
                                        isUnavailable
                                          ? "This property is already booked"
                                          : ""
                                      }
                                    >
                                      {p.propertyName}
                                    </li>
                                  );
                                })
                              ) : (
                                <li className="px-4 py-2 text-gray-400 text-sm">
                                  No results found
                                </li>
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                  </div>

                  {/* Destination */}
                  <div
                    className={`flex flex-col w-full ${
                      formData.isPackageBooking
                        ? "sm:col-span-1"
                        : "sm:col-span-1"
                    }`}
                  >
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      Destination
                    </label>
                    <input
                      placeholder="Enter destination"
                      required
                      name="destination"
                      value={formData.destination || ""}
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  {/* Package input (only if checkbox is checked) */}
                  {formData.isPackageBooking && (
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                        Package
                      </label>
                      <input
                        placeholder="Enter package name"
                        name="package"
                        value={formData.package || ""}
                        onChange={handleChange}
                        readOnly={isViewOnly}
                        disabled={isViewOnly}
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                  )}
                  <div className="flex flex-col w-full">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      B2B Price
                    </label>
                    <input
                      placeholder="Enter B2B Price"
                      name="bTobPrice"
                      value={formData.bTobPrice || ""} // controlled value
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>
                  <div className="flex flex-col w-full">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                    >
                      B2C Price
                    </label>
                    <input
                      placeholder="Enter B2C Price"
                      name="bTocPrice"
                      value={formData.bTocPrice || ""} // controlled value
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div>
                    {/*  Profit Display */}
                    {formData.bTocPrice && formData.bTobPrice && (
                      <p className="text-green-600 text-sm mt-1">
                        Profit revenue for this booking:{" "}
                        {Number(formData.bTocPrice || 0) -
                          Number(formData.bTobPrice || 0)}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col w-full sm:col-span-2">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      GST Number
                    </label>
                    <input
                      placeholder="Enter GST Number"
                      name="gstNum"
                      value={formData.gstNum || ""}
                      onChange={handleChange}
                      readOnly={isViewOnly}
                      disabled={isViewOnly}
                      className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="flex flex-col w-full sm:col-span-2">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                      ID Proof
                    </label>

                    {isViewOnly ? (
                      editingBooking?.idProof ? (
                        <div className="flex flex-col items-start gap-2 p-3 border rounded-lg">
                          <a
                            href={`https://dash.zorbastays.com/web-backend/bookings/${editingBooking?.id}/idProof`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Download
                          </a>
                        </div>
                      ) : (
                        // ✅ View mode: no file → show message
                        <div className="flex flex-col items-start gap-2 p-3 border rounded-lg">
                          <p className="text-sm text-red-500">
                            ID Proof was not uploaded
                          </p>
                        </div>
                      )
                    ) : editingBooking?.idProof ? (
                      // ✅ Edit mode: file exists → download + replace
                      <div className="flex flex-col items-start gap-2 p-3 border rounded-lg">
                        <p className="text-sm text-gray-700">
                          Existing file uploaded
                        </p>
                        <div className="flex gap-3">
                          <a
                            href={`https://dash.zorbastays.com/web-backend/bookings/${editingBooking?.id}/idProof`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                          >
                            Download
                          </a>
                          <button
                            onClick={handleBoxClick}
                            type="button"
                            className="px-3 py-1 bg-gray-700 text-white rounded text-sm"
                          >
                            Replace File
                          </button>
                        </div>
                      </div>
                    ) : (
                      // ✅ Edit mode: no file yet → upload
                      <div
                        onClick={handleBoxClick}
                        className="border-2 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center text-center p-6 cursor-pointer hover:border-black transition-all"
                      >
                        <FiUploadCloud className="w-10 h-10 text-green-600 mb-2" />
                        <p className="text-sm font-medium text-black">
                          {idProofFile
                            ? idProofFile.name
                            : "Select File to Upload"}
                        </p>
                        <p className="text-xs text-gray-400">Image or PDF</p>
                      </div>
                    )}

                    {!isViewOnly && (
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={handleClosePopup}
                      className="px-6 z-30 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleSaveBooking}
                      className="px-6 z-30 py-2 bg-green-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-green-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <a
            href="/BookingCalendar"
            className="px-6 z-30 py-2 bg-gray-500 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-900 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
          >
            Booking Calendar
          </a> */}
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
                    <thead className="text-xs text-gray-400 uppercase bg-green-50 border-b">
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
                        <th className="p-4 w-1/12"> ID</th>
                        <th className="p-4 w-1/10">Student Name</th>
                        <th className="p-4 w-1/10">Nearest Office</th>
                        <th className="p-4 w-1/10">Study Destination</th>
                        <th className="p-4 w-1/10">Booking Date</th>
                        <th className="p-4 w-1/10">Mode</th>
                        <th className="p-4 w-1/10">Fund-By</th>
                        <th className="p-4 w-1/10">Study Level</th>
                        <th className="p-4 w-1/10">Status</th>
                        <th className="p-4 w-1/10">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id || b.bookingId}
                          className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              onChange={() =>
                                handleRowCheckboxChange_booking(
                                  b.id || b.bookingId,
                                )
                              }
                              checked={selectedRows_booking.includes(
                                b.id || b.bookingId,
                              )}
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
                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            {b.studyLevel || "-"}
                          </td>
                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            <div className="flex justify-between items-center">
                              <button
                                className={`w-20 px-1 py-1 rounded-lg text-xs scale-90 cursor-default ${
                                  statusColors[
                                    b.bookingStatus?.toUpperCase()
                                  ] || ""
                                }`}
                              >
                                {b.status}
                              </button>
                            </div>
                          </td>
                          {/* Actions */}
                          <td>
                            {/* <div className="flex">
                          <button
                            className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                            onClick={() => {
                              setEditingBooking(b);
                              setFormData({
                                ...b,
                                isPackageBooking: !!b.package, // ✅ tick checkbox if package exists
                                bookingTime: b.bookingTime
                                  ? new Date(b.bookingTime).toISOString()
                                  : new Date().toISOString(),
                              });
                                 setFormMode("view"); 
                              setIsViewOnly(true); // ✅ enables read-only mode
                              setIsOpen_popupForm(true);
                            }}
                          >
                            <FaEye size={15} />
                          </button>
                          <button
                            className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                            onClick={() => {
                              setEditingBooking(b);
                              setFormData({
                                ...b,
                                isPackageBooking: !!b.package,
                                bookingTime: b.bookingTime
                                  ? new Date(b.bookingTime).toISOString()
                                  : new Date().toISOString(),
                              });
                               setFormMode("edit");
                              setIsViewOnly(false); // disable view-only mode
                              setIsOpen_popupForm(true);
                            }}
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeletePopup({ open: true, bookingId: b.id })
                            }
                            className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                          >
                            <MdDelete size={15} />
                          </button>
                        </div> */}
                            <div className="flex">
                              {/* Everyone can view */}
                              <button
                                className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                                onClick={() => {
                                  setEditingBooking(b);
                                  setFormData({
                                    ...b,
                                    isPackageBooking: !!b.package,
                                    bookingTime: b.bookingTime
                                      ? new Date(b.bookingTime).toISOString()
                                      : new Date().toISOString(),
                                  });
                                  setFormMode("view");
                                  setIsViewOnly(true);
                                  setIsOpen_popupForm(true);
                                }}
                              >
                                <FaEye size={15} />
                              </button>

                              {/* Only admins can edit/delete */}
                              {isAdmin && (
                                <>
                                  <button
                                    className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                                    onClick={() => {
                                      setEditingBooking(b);
                                      setFormData({
                                        ...b,
                                        isPackageBooking: !!b.package,
                                        bookingTime: b.bookingTime
                                          ? new Date(
                                              b.bookingTime,
                                            ).toISOString()
                                          : new Date().toISOString(),
                                      });
                                      setFormMode("edit");
                                      setIsViewOnly(false);
                                      setIsOpen_popupForm(true);
                                    }}
                                  >
                                    <FaEdit size={14} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      setDeletePopup({
                                        open: true,
                                        bookingId: b.id,
                                      })
                                    }
                                    className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                                  >
                                    <MdDelete size={15} />
                                  </button>
                                </>
                              )}
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
                            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-gray-100 hover:text-gray-700 ${
                              currentPage_booking === page
                                ? "text-green-500 underline underline-offset-2"
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

export default ConsultationBookings;
