import React, { useState, useEffect, useRef } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { MdDelete } from "react-icons/md";
// import { toast } from "react-toastify";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { format, parseISO } from "date-fns";
import { MdOutlinePendingActions } from "react-icons/md";
import { GiCheckMark } from "react-icons/gi";
import { ImCross } from "react-icons/im";
import { FaRegHandshake } from "react-icons/fa";
import { TiCancelOutline } from "react-icons/ti";
import axios from "axios";
import { Check } from "lucide-react";

const StudentConsultations = () => {
  // const user = JSON.parse(localStorage.getItem("user"));
  // const isAdmin = user?.role?.toLowerCase() === "admin";

  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState("add");
  const [bookings, setBookings] = useState([]);
  const [dateFilter] = useState({ from: "", to: "" });
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [options_uniPref, setOptions_uniPref] = useState([]);
  const [uniSearchQuery, setUniSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [worldData, setWorldData] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");
  useEffect(() => {
    fetch("/world.json") // or import worldData from "../assets/world.json"
      .then((res) => res.json())
      .then((data) => setWorldData(data))
      .catch((err) => console.error("Error loading world data:", err));
  }, []);
  const [deletePopup, setDeletePopup] = useState({
    open: false,
    bookingId: null,
  });
  const [editingBooking, setEditingBooking] = useState(null); // store booking being edited

  const [activeStage_stage, setActiveStage_stage] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("menubarOpen");

    if (savedState !== null) {
      return JSON.parse(savedState);
    }

    return window.innerWidth >= 1024;
  });
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    destination: "",
    startDuration: "",
    nearestOffice: "",
    specificOffice: "",
    modeOfCon: "",
    studyLevel: "",
    fundingBy: "",
    status: "pending",
    stage: "New Lead",
    discoverySource: "",
    rate: "",
    assignee: "",
    dob: "",
    gender: "",
    currentEdu: "",
    workExp: "",
    city: "",
    state: "",
    country: "",
    parentName: "",
    parentPhone: "",
    intakeMonth: "",
    intakeYear: "",
    prefUni: "",
    docPass: "",
  });
  const nearestOffice = [
    {
      value: "rajkot",
      label: "Rajkot",
      subAreas: [
        { value: "rajkot_corporate", label: "Rajkot Corporate Office" },
        { value: "rajkot_head", label: "Rajkot Head Office" },
      ],
    },
    {
      value: "surat",
      label: "Surat",
      subAreas: [
        { value: "surat_ar_mall", label: "Surat-AR Mall" },
        { value: "surat_katargam", label: "Surat-Katargam" },
        { value: "surat_sarthana", label: "Surat-Sarthana" },
      ],
    },
    {
      value: "ahmedabad",
      label: "Ahmedabad",
      subAreas: [
        { value: "ahmedabad_bodakdev", label: "Ahmedabad-Bodakdev" },
        { value: "ahmedabad_motera", label: "Ahmedabad-Motera" },
        { value: "ahmedabad_nikol", label: "Ahmedabad-Nikol" },
      ],
    },
    { value: "jamnagar", label: "Jamnagar" },
    { value: "morbi", label: "Morbi" },
    { value: "gandhinagar", label: "Gandhinagar" },
    { value: "anand", label: "Anand" },
    { value: "vadodara", label: "Vadodara" },
    { value: "pune", label: "Pune" },
    { value: "indore", label: "Indore" },
    { value: "jaipur", label: "Jaipur" },
    { value: "delhi", label: "Delhi" },
    { value: "chandigarh", label: "Chandigarh" },
    { value: "kochi", label: "Kochi" },
    { value: "kathmandu_nepal", label: "Kathmandu, Nepal" },
  ];
  const [, setIdProofFile] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    converted: 0,
    declined: 0,
    cancelled: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "country") {
        updated.state = "";
        updated.city = "";
        const found = worldData.find((c) => c.name === value);
        setStateList(found ? found.states : []);
        setCityList([]);
      }

      if (name === "state") {
        updated.city = "";
        const foundState = stateList.find((s) => s.name === value);
        setCityList(foundState ? foundState.cities : []);
      }
      if (name === "destination") {
        updated.state = "";
        updated.city = "";
      } else if (name === "nearestOffice") {
        updated.city = "";
      }

      if (name === "totPay" || name === "advPay") {
        const total = parseFloat(updated.totPay) || 0;
        const advance = parseFloat(updated.advPay) || 0;
        updated.balPay = (total - advance).toFixed(2);
      }

      return updated;
    });
  };
  const restoreStateAndCity = (countryName, stateName) => {
    const foundCountry = worldData.find((c) => c.name === countryName);
    const states = foundCountry ? foundCountry.states : [];
    setStateList(states);
    const foundState = states.find((s) => s.name === stateName);
    setCityList(foundState ? foundState.cities : []);
  };
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
    const fetchStaff = async () => {
      try {
        const res = await axios.get(
          "https://transglobeedu.com/web-backend/getAllStaff",
        );
        if (res.data.success) {
          setStaffList(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching staff:", err);
      }
    };
    fetchStaff();
  }, []);
  const handleSaveBooking = async () => {
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        destination: formData.destination,
        startDuration: formData.startDuration,
        nearestOffice: formData.nearestOffice,
        specificOffice: formData.specificOffice,
        modeOfCon: formData.modeOfCon,
        studyLevel: formData.studyLevel,
        fundingBy: formData.fundingBy,
        status: formData.status,
        stage: formData.stage,
        discoverySource: formData.discoverySource,
        rate: formData.rate,
        assignee: formData.assignee,
        dob: formData.dob,
        gender: formData.gender,
        currentEdu: formData.currentEdu,
        workExp: formData.workExp,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        parentName: formData.parentName,
        parentPhone: formData.parentPhone,
        intakeMonth: formData.intakeMonth,
        intakeYear: formData.intakeYear,
        prefUni: formData.prefUni,
        docPass: formData.docPass,
      };

      if (formMode === "add") {
        await axios.post(
          "https://transglobeedu.com/web-backend/create",
          payload,
        );
        alert("Lead added successfully!");
      }

      if (formMode === "edit" && editingBooking?.id) {
        await axios.put(
          `https://transglobeedu.com/web-backend/update/${editingBooking.id}`,
          payload,
        );
        alert("Lead updated successfully!");
      }

      handleClosePopup();
      fetchBookings();
    } catch (err) {
      console.error("SAVE ERROR:", err);
      alert("Something went wrong while saving the booking.");
    }
  };
  const handleDeleteBooking = async () => {
    try {
      if (!deletePopup.bookingId) {
        alert("Invalid Lead ID");
        return;
      }

      await axios.delete(
        `https://transglobeedu.com/web-backend/delete/${deletePopup.bookingId}`,
      );

      alert("Lead deleted successfully.");
      setDeletePopup({ open: false, bookingId: null });
      fetchBookings();
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("Failed to delete booking.");
    }
  };
  const resetForm = () => {
    setFormData({
      country: "",
      state: "",
      city: "",
      prefUni: "",
      assignee: "",
      specificOffice: "",
    });
    setSelected_uniPref([]);
    setUniSearchQuery("");
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

  const statusColors = {
    pending: "border border-yellow-300 text-yellow-400",
    declined: "border border-orange-300 text-orange-400",
    converted: "border border-sky-400 text-sky-500",
    cancelled: "border border-red-500 text-red-500",
    approved: "border border-green-400 text-green-500",
  };

  const stageColors = {
    "New Lead": "bg-emerald-100 text-emerald-500",
    Prospect: "bg-yellow-100 text-yellow-500",
    Counselling: "bg-purple-100 text-purple-400",
    "Coaching Only": "bg-sky-100 text-sky-500",
    "Future Lead": "bg-pink-100 text-pink-600",
    "Verified Lead": "bg-teal-100 text-teal-700",
    "Lead Lost": "bg-red-100 text-red-500",
    "Offer Letter": "bg-blue-100 text-blue-600",
    "Letter Acceptance": "bg-lime-100 text-lime-600",
    "Admission Confirmation": "bg-green-200 text-green-700",
    "Deposit Payment": "bg-cyan-100 text-cyan-500",
    "Visa Docs Required": "bg-amber-100 text-amber-800",
    Discontinued: "bg-gray-300 text-gray-800",
  };

  const stages = Object.keys(stageColors);
  const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filteredBookings = bookings.filter((b) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      (b.bookingId && b.bookingId.toString().toLowerCase().includes(query)) ||
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(query) ||
      (b.destination && b.destination.toLowerCase().includes(query));

    let matchesDate = true;
    const checkinDate = normalizeDate(b.checkin);
    const fromDate = normalizeDate(dateFilter.from);
    const toDate = normalizeDate(dateFilter.to);

    if (fromDate) matchesDate = matchesDate && checkinDate >= fromDate;
    if (toDate) matchesDate = matchesDate && checkinDate <= toDate;

    const matchesStage = !activeStage_stage || b.stage === activeStage_stage;

    const matchesOffice = !officeFilter || b.nearestOffice === officeFilter;

    return matchesSearch && matchesDate && matchesStage && matchesOffice;
  });

  const rowsPerPage_booking = 20;
  const [currentPage_booking, setCurrentPage_booking] = useState(1);
  //   const [selectedRows_booking, setSelectedRows_booking] = useState([]);

  const indexOfLastTable_booking = currentPage_booking * rowsPerPage_booking;
  const indexOfFirstTable_booking =
    indexOfLastTable_booking - rowsPerPage_booking;

  const current_booking = filteredBookings.slice(
    indexOfFirstTable_booking,
    indexOfLastTable_booking,
  );
  // const totalPages_booking = Math.ceil(bookings.length / rowsPerPage_booking);
  const totalPages_booking = Math.ceil(
    filteredBookings.length / rowsPerPage_booking,
  );
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

  // const [showPopup_filter, setShowPopup_filter] = useState(false);
  // const filterRef = useRef(null);

  // useEffect(() => {
  //   function handleClickOutside(event) {
  //     if (filterRef.current && !filterRef.current.contains(event.target)) {
  //       setShowPopup_filter(false);
  //     }
  //   }

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  // when popup opens, set default bookingTime
  useEffect(() => {
    if (isOpen_popupForm) {
      setFormData((prev) => ({
        ...prev,
        bookingTime: new Date().toISOString(), // ISO format (safe for DB)
      }));
    }
  }, [isOpen_popupForm]);
  // const [, setProperties] = useState([]);

  // const handleDeleteBooking = async (id) => {
  //   if (!isAdmin) {
  //     toast.error("🚫 Only admins can modify bookings.");
  //     return;
  //   }

  //   try {
  //     const res = await fetch(
  //       `https://dash.zorbddddastays.com/web-backend/bookings/${id}`,
  //       { method: "DELETE" },
  //     );
  //     const result = await res.json();

  //     if (result.success) {
  //       toast.success(" Booking deleted successfully");
  //       setBookings((prev) => prev.filter((b) => b.id !== id));
  //       setDeletePopup({ open: false, bookingId: null }); // close popup
  //     } else {
  //       toast.error("Failed to delete: " + (result.error || "Unknown error"));
  //     }
  //   } catch (err) {
  //     console.error("Delete error:", err);
  //     toast.error("Could not connect to server");
  //   }
  // };
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

  // const filteredBookings = current_booking.filter((b) => {
  //   const query = searchQuery.toLowerCase();

  //   //  text-based search (Booking ID, Name, Destination)
  //   const matchesSearch =
  //     (b.bookingId && b.bookingId.toString().toLowerCase().includes(query)) ||
  //     `${b.firstName} ${b.lastName}`.toLowerCase().includes(query) ||
  //     (b.destination && b.destination.toLowerCase().includes(query));

  //   //  check-in date filter only
  //   let matchesDate = true;
  //   const checkinDate = normalizeDate(b.checkin);
  //   const fromDate = normalizeDate(dateFilter.from);
  //   const toDate = normalizeDate(dateFilter.to);

  //   if (fromDate) {
  //     matchesDate = matchesDate && checkinDate >= fromDate;
  //   }
  //   if (toDate) {
  //     matchesDate = matchesDate && checkinDate <= toDate;
  //   }

  //   // Stage filter
  //   const matchesStage = !activeStage_stage || b.stage === activeStage_stage;

  //   return matchesSearch && matchesDate && matchesStage;
  // });

  // const today = new Date();

  // const setQuickFilter = (type) => {
  //   let from, to;

  //   if (type === "Today") {
  //     from = to = today.toISOString().split("T")[0];
  //   }

  //   if (type === "Week") {
  //     const start = new Date(today);
  //     start.setDate(today.getDate() - today.getDay()); // start of week (Sunday)
  //     const end = new Date(start);
  //     end.setDate(start.getDate() + 6); // end of week (Saturday)

  //     from = start.toISOString().split("T")[0];
  //     to = end.toISOString().split("T")[0];
  //   }

  //   if (type === "Month") {
  //     const start = new Date(today.getFullYear(), today.getMonth(), 1);
  //     const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  //     from = start.toISOString().split("T")[0];
  //     to = end.toISOString().split("T")[0];
  //   }

  //   if (type === "Year") {
  //     const start = new Date(today.getFullYear(), 0, 1);
  //     const end = new Date(today.getFullYear(), 11, 31);

  //     from = start.toISOString().split("T")[0];
  //     to = end.toISOString().split("T")[0];
  //   }

  //   setDateFilter({ from, to });
  // };

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

  // const options_uniPref = [
  //   { value: "uni1", label: "Uni 1" },
  //   { value: "uni2", label: "Uni 2" },
  //   { value: "uni3", label: "Uni 3" },
  //   { value: "uni4", label: "Uni 4" },
  //   { value: "uni5", label: "Uni 5" },
  //   { value: "uni6", label: "Uni 6" },
  //   { value: "uni7", label: "Uni 7" },
  //   { value: "uni8", label: "Uni 8" },
  //   { value: "uni9", label: "Uni 9" },
  //   { value: "uni10", label: "Uni 10" },
  //   { value: "uni11", label: "Uni 11" },
  //   { value: "uni12", label: "Uni 12" },
  //   { value: "uni13", label: "Uni 13" },
  //   { value: "uni14", label: "Uni 14" },
  // ];
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await axios.get(
          "https://transglobeedu.com/web-backend/getAllUniversities",
        );
        // const mapped = res.data.map((uni) => ({
        //   value: uni.id.toString(),
        //   label: uni.name,
        // }));
        const mapped = res.data.map((uni) => ({
          value: uni.id.toString(),
          label: `${uni.name}, ${uni.country}`,
          name: uni.name,
          country: uni.country,
        }));
        setOptions_uniPref(mapped);
      } catch (err) {
        console.error("Error fetching universities:", err);
      }
    };
    fetchUniversities();
  }, []);
  const [selected_uniPref, setSelected_uniPref] = useState([]);
  const [isOpen_uniPref, setIsOpen_uniPref] = useState(false);
  const dropdownRef_uniPref = useRef();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef_uniPref.current?.contains(e.target)) {
        setIsOpen_uniPref(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // const toggleOption_uniPref = (option) => {
  //   setSelected_uniPref((prev) => {
  //     const updated = prev.some((item) => item.value === option.value)
  //       ? prev.filter((item) => item.value !== option.value)
  //       : [...prev, option];

  //     setFormData((f) => ({
  //       ...f,
  //       prefUni: updated.map((i) => i.label).join(", "),
  //     }));

  //     return updated;
  //   });
  // };

  const parsePrefUni = (prefUniStr) => {
    if (!prefUniStr) return [];
    return prefUniStr.split(", ").map((name) => {
      const found = options_uniPref.find((o) => o.label === name);
      return found || { value: name, label: name }; // fallback if not matched
    });
  };
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    // Use local timezone methods, not UTC
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
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
              Consultation Lead
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

              {/* <div className="flex items-center">
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
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center gap-5 text-gray-700 font-semibold mt-5">
          <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
            <div>
              <p className="text-sm font-normal">Pending</p>
              <p className="mt-2 text-lg text-black">
                {/* ₹{formatNumber(analytics.totalRevenue)} */}
                {statusCounts.pending}
                {/* <sup className="text-purple-900">+55%</sup> */}
              </p>
            </div>

            <div>
              <MdOutlinePendingActions className="bg-indigo-900 text-white text-3xl p-1.5 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
            <div>
              <p className="text-sm font-normal">Approved</p>
              <p className="mt-2 text-lg text-black">
                {statusCounts.approved}
                {/* ₹{formatNumber(analytics.pendingPayments)}
                <sup className="text-purple-900">+5%</sup> */}
              </p>
            </div>

            <div>
              <GiCheckMark className="bg-indigo-900 text-3xl text-white p-1.5 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
            <div>
              <p className="text-sm font-normal">Converted</p>
              <p className="mt-2 text-lg text-black">
                {statusCounts.converted}
                {/* ₹{formatNumber(analytics.profit)}
                <sup className="text-purple-900">+8%</sup> */}
              </p>
            </div>

            <div>
              <FaRegHandshake className="bg-indigo-900 text-3xl text-white p-1.5 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
            <div>
              <p className="text-sm font-normal">Declined</p>
              <p className="mt-2 text-lg text-black">{statusCounts.declined}</p>
            </div>

            <div>
              <TiCancelOutline className="bg-indigo-900 text-3xl text-white p-1 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
            <div>
              <p className="text-sm font-normal">Cancelled</p>
              <p className="mt-2 text-lg text-black">
                {statusCounts.cancelled}
              </p>
            </div>

            <div>
              <ImCross className="bg-indigo-900 text-3xl text-white p-2 rounded-md" />
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8">
          <div className="flex gap-4 w-full justify-between">
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer"
            >
              <option value="">Filter office</option>
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
              <option value="Kochi">Kochi</option>
              <option value="Kathmandu Nepal">Kathmandu Nepal</option>
            </select>

            <button
              onClick={() => {
                setFormMode("add");
                setIsOpen_popupForm(true);
              }}
              className="px-6 z-30 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white relative hover:scale-95 transition-all duration-300 ease-in-out"
            >
              + Add Leads
            </button>
          </div>

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
                  {" "}
                  <h2 className="text-[#1D2826] text-lg font-semibold">
                    {formMode === "add" && "Add New Lead"}
                    {formMode === "edit" && "Edit Lead"}
                    {formMode === "view" && "View Lead"}
                  </h2>
                </div>

                <button
                  onClick={handleClosePopup}
                  className="text-gray-500 hover:text-black text-xl"
                >
                  <MdCancel />
                </button>
              </div>

              <div className="max-h-[85vh] overflow-y-auto p-5 space-y-4">
                <div>
                  <p className="font-semibold text-[15px] text-indigo-800 mb-1">
                    Details:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 items-center border-2 border-dashed border-indigo-100 rounded-lg pt-1 p-4">
                    {/* first name */}
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
                    {/* last name */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="  text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
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
                    {/* email */}
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
                    {/* Phone */}
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
                        maxLength={10}
                        name="phone"
                        value={formData.phone || ""}
                        readOnly={isViewOnly}
                        disabled={isViewOnly}
                        onChange={(e) => {
                          const digitsOnly = e.target.value.replace(/\D/g, "");
                          handleChange({
                            target: { name: "phone", value: digitsOnly },
                          });
                        }}
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                    {/* Stage */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Stage
                      </label>
                      <select
                        name="stage"
                        value={formData.stage}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="New Lead">New Lead</option>
                        <option value="Prospect">Prospect</option>
                        <option value="Counselling">Counselling</option>
                        <option value="Coaching Only">Coaching Only</option>
                        <option value="Future Lead">Future Lead</option>
                        <option value="Verified Lead">Verified Lead</option>
                        <option value="Lead Lost">Lead Lost</option>
                        <option value="Offer Letter">Offer Letter</option>
                        <option value="Letter Acceptance">
                          Letter Acceptance
                        </option>
                        <option value="Admission Confirmation">
                          Admission Confirmation
                        </option>
                        <option value="Deposit Payment">Deposit Payment</option>
                        <option value="Visa Docs Required">
                          Visa Docs Required
                        </option>
                        <option value="Discontinued">Discontinued</option>
                      </select>
                    </div>
                    {/* Lead Status */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Lead Status
                      </label>

                      <select
                        name="status"
                        value={formData.status || ""} // controlled value
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select </option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="converted">Converted</option>
                        <option value="declined">Declined</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    {/* CreatedAt*/}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                        Lead Date & Time
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

                    {/* Assignee */}

                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Assignee
                      </label>
                      <select
                        name="assignee"
                        value={formData.assignee}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        {staffList.map((staff) => (
                          <option
                            key={staff.id}
                            value={`${staff.first_name} ${staff.last_name} - ${staff.role} (${staff.office})`}
                          >
                            {staff.first_name} {staff.last_name} — {staff.role}{" "}
                            ({staff.office})
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Source */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Discovery Source
                      </label>
                      <select
                        name="discoverySource"
                        value={formData.discoverySource}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Employee Referral">
                          Employee Referral
                        </option>
                        <option value="Student Referral">
                          Student Referral
                        </option>
                        <option value="Events">Events</option>
                        <option value="Friends / Family">
                          Friends / Family
                        </option>
                        <option value="Inbound Call">Inbound Call</option>
                        <option value="Partner">Partner</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Rate */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Rate
                      </label>
                      <select
                        name="rate"
                        value={formData.rate}
                        onChange={handleChange}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Hot">Hot</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                      </select>
                    </div>
                    {/* Assignee */}
                    {/* <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Assignee
                      </label>
                      <select
                        name="assignee"
                        value={formData.assignee}
                        onChange={handleChange}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="admin user 1">admin user 1</option>
                        <option value="admin user 2">admin user 2</option>
                      </select>
                    </div> */}
                    {/* office */}
                    {/* <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Nearest Office
                      </label>
                      <select
                        name="nearestOffice"
                        value={formData.nearestOffice || ""}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select </option>
                        <option value="Rajkot">Rajkot</option>
                        <option value="Surat">Surat</option>
                        <option value="Ahemdabad">Ahemdabad</option>
                        <option value="Jamnagar">Jamnagar</option>
                        <option value="Morbi">Morbi</option>
                        <option value="Junagadh">Junagadh</option>
                        <option value="Gandhinagar">Gandhinagar</option>
                        <option value="Anand">Anand</option>
                        <option value="Vadodra">Vadodra</option>
                        <option value="Indore">Indore</option>
                        <option value="Jaipur">Jaipur</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Kathmandu, Nepal">
                          Kathmandu, Nepal
                        </option>
                      </select>
                    </div> */}
                    {/* office */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Nearest Office
                      </label>
                      <select
                        name="nearestOffice"
                        value={formData.nearestOffice || ""}
                        onChange={(e) => {
                          const selectedLabel = e.target.value;
                          // reset specificArea when office changes
                          setFormData((prev) => ({
                            ...prev,
                            nearestOffice: selectedLabel,
                            specificOffice: "",
                          }));
                        }}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        {nearestOffice.map((office) => (
                          <option key={office.value} value={office.label}>
                            {office.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specific Area — only shows if selected office has subAreas */}
                    {nearestOffice.find(
                      (o) => o.label === formData.nearestOffice,
                    )?.subAreas && (
                      <div className="flex flex-col w-full">
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          Specific Area
                        </label>
                        <select
                          name="specificOffice"
                          value={formData.specificOffice || ""}
                          onChange={handleChange}
                          disabled={isViewOnly}
                          className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        >
                          <option value="">Select area</option>
                          {nearestOffice
                            .find((o) => o.label === formData.nearestOffice)
                            ?.subAreas.map((area) => (
                              <option key={area.value} value={area.label}>
                                {area.label}
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-[15px] text-indigo-800 mb-1">
                    Personal Info:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 items-center border-2 border-dashed border-indigo-100 rounded-lg pt-1 p-4">
                    {/* DOB */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={formData.dob ? formData.dob.slice(0, 10) : ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dob: e.target.value,
                          }))
                        }
                        disabled={isViewOnly}
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                    {/* Gender */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Gender
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Current Education */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Current Education
                      </label>
                      <select
                        name="currentEdu"
                        value={formData.currentEdu}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Completed 12th / Diploma">
                          Completed 12th / Diploma
                        </option>
                        <option value="Completed Undergraduate Degree">
                          Completed Undergraduate Degree
                        </option>
                        <option value="Completed Postgraduate Degree">
                          Completed Postgraduate Degree
                        </option>
                        <option value="Pursuing 12th / Diploma">
                          Pursuing 12th / Diploma
                        </option>
                        <option value="Pursuing Undergraduate Degree">
                          Pursuing Undergraduate Degree
                        </option>
                        <option value="Pursuing Postgraduate Degree">
                          Pursuing Postgraduate Degree
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Work Exp */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        Work Experience
                      </label>
                      <input
                        name="workExp"
                        value={formData.workExp}
                        onChange={handleChange}
                        placeholder="Enter your work experience"
                        required
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                    {/* Country */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        {worldData.map((c) => (
                          <option key={c.iso2} value={c.name}>
                            {c.name} {c.emoji}
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
                        value={formData.state}
                        onChange={handleChange}
                        disabled={isViewOnly || !formData.country}
                        className={`border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md ${
                          !formData.country
                            ? "bg-gray-100 cursor-not-allowed text-gray-400"
                            : ""
                        }`}
                      >
                        <option value="">
                          {!formData.country
                            ? "Select country first"
                            : "Select"}
                        </option>
                        {stateList.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
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
                        value={formData.city}
                        onChange={handleChange}
                        disabled={isViewOnly || !formData.state}
                        className={`border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md ${
                          !formData.state
                            ? "bg-gray-100 cursor-not-allowed text-gray-400"
                            : ""
                        }`}
                      >
                        <option value="">
                          {!formData.state ? "Select state first" : "Select"}
                        </option>
                        {cityList.map((city) => (
                          <option key={city.id} value={city.name}>
                            {city.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/* Parent Name */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        Parent's Name
                      </label>
                      <input
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        placeholder="Enter parent's name"
                        required
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                    {/* Parent Contact */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        Parent's Contact No.
                      </label>
                      <input
                        name="parentPhone"
                        value={formData.parentPhone}
                        onChange={handleChange}
                        placeholder="Enter parent's contact no."
                        required
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                  </div>
                </div>
                {/* Pref Uni */}
                <div>
                  <p className="font-semibold text-[15px] text-indigo-800 mb-1">
                    Preference:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 items-center border-2 border-dashed border-indigo-100 rounded-lg pt-1 p-4">
                    {/* Study Level */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Preferred Study Program
                      </label>

                      <select
                        name="studyLevel"
                        value={formData.studyLevel || ""} // controlled value
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="In Person">School</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Postgraduate">Postgraduate</option>
                      </select>
                    </div>
                    {/* Study Destination */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Study Destination
                      </label>
                      <select
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        // className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:border-black"
                      >
                        <option value="">Select</option>
                        <option value="Study in Australia">
                          Study in Australia
                        </option>
                        <option value="Study in Canada">Study in Canada</option>
                        <option value="Study in USA">Study in USA</option>
                        <option value="Study in UK">Study in UK</option>
                        <option value="Study in New Zealand">
                          Study in New Zealand
                        </option>
                        <option value="Study in Germany">
                          Study in Germany
                        </option>
                        <option value="Study in Singapore">
                          Study in Singapore
                        </option>
                        <option value="Study in Dubai">Study in Dubai</option>
                        <option value="Study in Europe">Study in Europe</option>
                        <option value="Study in Ireland">
                          Study in Ireland
                        </option>
                      </select>
                    </div>
                    {/* Intake Month */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Intake Month
                      </label>
                      <select
                        name="intakeMonth"
                        value={formData.intakeMonth}
                        onChange={handleChange}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                        <option value="Rolling">Rolling</option>
                      </select>
                    </div>
                    {/* Intake Month */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Intake Year
                      </label>
                      <select
                        name="intakeYear"
                        value={formData.intakeYear}
                        onChange={handleChange}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                        <option value="2031">2031</option>
                        <option value="2032">2032</option>
                        <option value="2033">2033</option>
                        <option value="2034">2034</option>
                        <option value="2035">2035</option>
                      </select>
                    </div>

                    {/* University */}
                    {/* University */}
                    <div
                      className="sm:col-span-2 flex flex-col w-full relative"
                      ref={dropdownRef_uniPref}
                    >
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Preferred University
                      </label>

                      <div
                        onClick={() => setIsOpen_uniPref(!isOpen_uniPref)}
                        className="border border-gray-400 rounded-lg min-h-[44px] px-3 py-2 text-sm flex flex-wrap gap-1 items-center cursor-pointer focus-within:border-black focus-within:shadow-md"
                      >
                        {selected_uniPref.length > 0 ? (
                          selected_uniPref.map((item) => (
                            <span
                              key={item.value}
                              className="bg-indigo-100/80 px-2 py-0.5 my-1 rounded text-sm flex items-center gap-1"
                            >
                              {item.label}
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = selected_uniPref.filter(
                                    (i) => i.value !== item.value,
                                  );
                                  setSelected_uniPref(updated);
                                  setFormData((prev) => ({
                                    ...prev,
                                    prefUni: updated
                                      .map((i) => i.label)
                                      .join(", "),
                                  }));
                                }}
                                className="cursor-pointer text-red-500"
                              >
                                ×
                              </span>
                            </span>
                          ))
                        ) : (
                          <span className="text-black/25">
                            Select universities
                          </span>
                        )}
                      </div>

                      {/* Dropdown */}
                      {isOpen_uniPref && (
                        <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-b-lg shadow-md z-50">
                          {/* Search Input */}
                          <div className="px-3 py-2 border-b border-gray-200">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search university..."
                              value={uniSearchQuery}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                setUniSearchQuery(e.target.value)
                              }
                              className="w-full text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-indigo-400"
                            />
                          </div>

                          {/* Filtered List */}
                          <div className="max-h-40 overflow-auto">
                            {options_uniPref
                              .filter((opt) =>
                                opt.label
                                  .toLowerCase()
                                  .includes(uniSearchQuery.toLowerCase()),
                              )
                              .map((option) => {
                                const isSelected = selected_uniPref.some(
                                  (item) => item.value === option.value,
                                );
                                return (
                                  <div
                                    key={option.value}
                                    onClick={() => {
                                      const updated = isSelected
                                        ? selected_uniPref.filter(
                                            (item) =>
                                              item.value !== option.value,
                                          )
                                        : [...selected_uniPref, option];
                                      setSelected_uniPref(updated);
                                      setFormData((prev) => ({
                                        ...prev,
                                        prefUni: updated
                                          .map((i) => i.label)
                                          .join(", "),
                                      }));
                                    }}
                                    className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center ${
                                      isSelected
                                        ? "bg-indigo-50"
                                        : "hover:bg-gray-100"
                                    }`}
                                  >
                                    {option.label}
                                    {isSelected && <span>✓</span>}
                                  </div>
                                );
                              })}

                            {options_uniPref.filter((opt) =>
                              opt.label
                                .toLowerCase()
                                .includes(uniSearchQuery.toLowerCase()),
                            ).length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-400">
                                No universities found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Start Duration */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Willing to start in?
                      </label>

                      <select
                        name="startDuration"
                        value={formData.startDuration || ""} // controlled value
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Now">Now</option>
                        <option value="In 1 Months">In 1 Months</option>
                        <option value="In 3 Months">In 3 Months</option>
                        <option value="In 6 Months">In 6 Months</option>
                        <option value="In 12 Months">In 12 Months</option>
                        <option value="Not Sure Yet">Not Sure Yet</option>
                      </select>
                    </div>
                    {/* Mode Of Contact */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Preferred Mode Of Counselling
                      </label>

                      <select
                        name="modeOfCon"
                        value={formData.modeOfCon || ""} // controlled value
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="In Person">In Person</option>
                        <option value="Virtual Counselling">
                          Virtual Counselling
                        </option>
                      </select>
                    </div>
                    {/* Funding */}
                    <div className="flex flex-col w-full">
                      <label className="\ text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Education Funded by?
                      </label>

                      <select
                        name="fundingBy"
                        value={formData.fundingBy || ""} // controlled value
                        onChange={handleChange}
                        disabled={isViewOnly}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Self Funded">Self Funded</option>
                        <option value="Parents">Parents</option>
                        <option value="Bank Loan">Bank Loan</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-[15px] text-indigo-800 mb-1">
                    Identity Docs:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-1.5 items-center border-2 border-dashed border-indigo-100 rounded-lg pt-1 p-4">
                    {/* Country */}
                    <div className="flex flex-col w-full">
                      <label className="  text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Country of Passport
                      </label>
                      <select
                        name="docPass"
                        value={formData.docPass}
                        onChange={handleChange}
                        className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      >
                        <option value="">Select</option>
                        <option value="Passport">Passport</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 max-w-[310px] gap-3 mt-5">
                  <button
                    onClick={handleClosePopup}
                    className="px-6 z-30 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveBooking}
                    className="px-6 z-30 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stages */}
        <div
          className={`flex overflow-x-auto py-4 mt-5 transition-all ease-linear duration-300 ${
            isSidebarOpen
              ? "lg:max-w-[79vw] 2xl:max-w-full"
              : "lg:max-w-[93vw] 2xl:max-w-full"
          }`}
        >
          {stages.map((stage, index_stage) => {
            const isActive_stage = stage === activeStage_stage;

            return (
              <div
                key={index_stage}
                onClick={() =>
                  setActiveStage_stage((prev) =>
                    prev === stage ? null : stage,
                  )
                }
                // className={`relative cursor-pointer min-w-[110px] pl-2 py-1.5 text-[10px] font-medium flex items-center justify-center whitespace-nowrap transition-all duration-200 shadow-newcustom ${stageColors[stage]} ${isActive_stage ? "ring-2 ring-black z-20" : "z-0"}`}
                className={`relative cursor-pointer ${
                  [
                    "New Lead",
                    "Prospect",
                    "Coaching Only",
                    "Future Lead",
                    "Verified Lead",
                    "Lead Lost",
                    "Offer Letter",
                  ].includes(stage)
                    ? "min-w-[100px]"
                    : "min-w-[118px]"
                } pl-2 py-1 text-[10px] font-medium flex items-center justify-center whitespace-nowrap transition-all duration-200 shadow-newcustom ${
                  stageColors[stage]
                } ${isActive_stage ? "ring-2 ring-black z-20" : "z-0"}`}
                style={{
                  clipPath:
                    "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 20% 50%)",
                  marginLeft: index_stage === 0 ? "0px" : "-23px",
                }}
              >
                {/* {stage} */}
                <span className="flex flex-col leading-tight text-center">
                  {(() => {
                    const words = stage.split(" ");

                    if (words.length <= 1) {
                      return <span>{stage}</span>;
                    }

                    const mid = Math.ceil(words.length / 2);

                    const firstLine = words.slice(0, mid).join(" ");
                    const secondLine = words.slice(mid).join(" ");

                    return (
                      <>
                        <span>{firstLine}</span>
                        <span>{secondLine}</span>
                      </>
                    );
                  })()}
                </span>

                {isActive_stage && (
                  <Check className="w-[13px] h-[13px] ml-1 -mr-2 border border-current rounded-full p-[1px]" />
                )}
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div>
          <div
            className={`shadow-md rounded-lg mt-5 transition-all ease-linear duration-300 ${
              isSidebarOpen
                ? "lg:max-w-[79vw] 2xl:max-w-full"
                : "lg:max-w-[93vw] 2xl:max-w-full"
            }`}
          >
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
                        <th className="p-4 w-1/10">Student Name</th>
                        <th className="p-4 w-1/10">Nearest Office</th>
                        <th className="p-4 w-1/10">Study Destination</th>
                        <th className="p-4 w-1/10">Lead Date</th>
                        <th className="p-4 w-1/10">Mode</th>
                        <th className="p-4 w-1/10">Fund-By</th>
                        <th className="p-4 w-1/10">Study Level</th>
                        <th className="p-4 min-w-52 text-center">Stage</th>
                        <th className="p-4 w-1/10 text-center">Status</th>
                        <th className="p-4 w-1/10">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {current_booking.map((b) => (
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

                          {/* Study Level */}
                          <td className="px-4 py-3">{b.studyLevel || "-"}</td>

                          {/* Stage */}
                          <td className="px-4 py-3 text-center">
                            {/* <div className="flex justify-between items-center"> */}
                            <button
                              className={`w-auto px-2 py-1 rounded text-xs font-medium capitalize scale-95 cursor-default ${
                                // statusColors[b.bookingStatus?.()] || ""
                                stageColors[b.stage] || ""
                              }`}
                            >
                              {b.stage}
                            </button>
                            {/* </div> */}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center">
                            {/* <div className="flex justify-between items-center"> */}
                            <button
                              className={`w-20 px-1 py-1 rounded text-xs font-medium capitalize scale-95 cursor-default ${
                                // statusColors[b.bookingStatus?.()] || ""
                                statusColors[b.status] || ""
                              }`}
                            >
                              {b.status}
                            </button>
                            {/* </div> */}
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
                            <div className="flex justify-center">
                              {/* Everyone can view */}
                              <button
                                className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                                onClick={() => {
                                  setEditingBooking(b);
                                  setFormData({
                                    ...b,
                                    isPackageBooking: !!b.package,
                                    dob: formatDateForInput(b.dob),
                                    specificOffice: b.specificOffice || "",
                                    bookingTime: b.bookingTime
                                      ? new Date(b.bookingTime).toISOString()
                                      : new Date().toISOString(),
                                  });
                                  setSelected_uniPref(parsePrefUni(b.prefUni));
                                  setFormMode("view");

                                  restoreStateAndCity(b.country, b.state);
                                  setIsViewOnly(true);
                                  setIsOpen_popupForm(true);
                                }}
                              >
                                <FaEye size={15} />
                              </button>

                              <>
                                <button
                                  className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                                  onClick={() => {
                                    setEditingBooking(b);
                                    setFormData({
                                      firstName: b.firstName || "",
                                      lastName: b.lastName || "",
                                      email: b.email || "",
                                      phone: b.phone || "",
                                      destination: b.destination || "",
                                      startDuration: b.startDuration || "",
                                      nearestOffice: b.nearestOffice || "",
                                      specificOffice: b.specificOffice || "",
                                      modeOfCon: b.modeOfCon || "",
                                      studyLevel: b.studyLevel || "",
                                      fundingBy: b.fundingBy || "",
                                      status: b.status || "pending",
                                      stage: b.stage || "New Lead",
                                      discoverySource: b.discoverySource || "",
                                      rate: b.rate || "",
                                      assignee: b.assignee || "",
                                      dob: formatDateForInput(b.dob),
                                      gender: b.gender || "",
                                      currentEdu: b.currentEdu || "",
                                      workExp: b.workExp || "",
                                      city: b.city || "",
                                      state: b.state || "",
                                      country: b.country || "",
                                      parentName: b.parentName || "",
                                      parentPhone: b.parentPhone || "",
                                      intakeMonth: b.intakeMonth || "",
                                      intakeYear: b.intakeYear || "",
                                      prefUni: b.prefUni || "",
                                      docPass: b.docPass || "",
                                    });
                                    setSelected_uniPref(
                                      parsePrefUni(b.prefUni),
                                    );
                                    setFormMode("edit");
                                    setIsViewOnly(false);

                                    restoreStateAndCity(b.country, b.state);
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

          {deletePopup.open && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black bg-opacity-40 z-40"
                onClick={() => setDeletePopup({ open: false, bookingId: null })}
              />

              {/* Popup box */}
              <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg w-[90%] max-w-md p-6 text-center">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Delete Consultation Lead?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this Consultation Lead? This
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
                    onClick={() => handleDeleteBooking(deletePopup.bookingId)}
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

export default StudentConsultations;
