import React, { useState, useEffect } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet, useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { LuLockKeyhole } from "react-icons/lu";
import { LuLockKeyholeOpen } from "react-icons/lu";
import { ImCross } from "react-icons/im";
import { GiCheckMark } from "react-icons/gi";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { BiSolidLockOpen } from "react-icons/bi";
import { BiSolidLock } from "react-icons/bi";

const DocumentEvaluator = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [dateFilter] = useState({ from: "", to: "" });

  const [searchQuery, setSearchQuery] = useState("");

  const [deletePopup, setDeletePopup] = useState({
    open: false,
    bookingId: null,
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

  const studentDocs = [
    {
      id: 1,
      firstName: "Neha",
      lastName: "Verma",
      fundingBy: "Self",
      nearestOffice: "Ahmedabad",
      destination: "Canada",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: true,
        actSat: true,
      },
    },
    {
      id: 2,
      firstName: "Rahul",
      lastName: "Sharma",
      fundingBy: "Parents",
      nearestOffice: "Surat",
      destination: "UK",
      package: "Student Visa",
      studyLevel: "Bachelors",
      mode: "lock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 3,
      firstName: "Priya",
      lastName: "Patel",
      fundingBy: "Loan",
      nearestOffice: "Vadodara",
      destination: "Australia",
      package: "PR",
      studyLevel: "Diploma",
      mode: "unlock",
      status: "Application Rejected",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 4,
      firstName: "Arjun",
      lastName: "Mehta",
      fundingBy: "Self",
      nearestOffice: "Rajkot",
      destination: "USA",
      package: "Student Visa",
      studyLevel: "Masters",
      mode: "lock",
      status: "In Process",
      docs: {
        passport: true,
        transcripts: false,
        sop: false,
        lor: false,
        cv: false,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },

    {
      id: 5,
      firstName: "Karan",
      lastName: "Patel",
      fundingBy: "Self",
      nearestOffice: "Ahmedabad",
      destination: "Canada",
      package: "Student Visa",
      studyLevel: "Diploma",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: false,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 6,
      firstName: "Sneha",
      lastName: "Iyer",
      fundingBy: "Parents",
      nearestOffice: "Pune",
      destination: "UK",
      package: "PR",
      studyLevel: "Masters",
      mode: "lock",
      status: "Application Rejected",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 7,
      firstName: "Amit",
      lastName: "Singh",
      fundingBy: "Loan",
      nearestOffice: "Delhi",
      destination: "Australia",
      package: "Student Visa",
      studyLevel: "Bachelors",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: false,
        sop: false,
        lor: false,
        cv: true,
        englishTest: true,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 8,
      firstName: "Riya",
      lastName: "Shah",
      fundingBy: "Self",
      nearestOffice: "Surat",
      destination: "USA",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: true,
        actSat: false,
      },
    },
    {
      id: 9,
      firstName: "Vikram",
      lastName: "Joshi",
      fundingBy: "Parents",
      nearestOffice: "Rajkot",
      destination: "Canada",
      package: "Student Visa",
      studyLevel: "Diploma",
      mode: "lock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 10,
      firstName: "Anjali",
      lastName: "Desai",
      fundingBy: "Self",
      nearestOffice: "Vadodara",
      destination: "UK",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 11,
      firstName: "Rohit",
      lastName: "Kumar",
      fundingBy: "Loan",
      nearestOffice: "Indore",
      destination: "Australia",
      package: "Student Visa",
      studyLevel: "Bachelors",
      mode: "lock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: false,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 12,
      firstName: "Megha",
      lastName: "Nair",
      fundingBy: "Parents",
      nearestOffice: "Chandigarh",
      destination: "USA",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: true,
        actSat: true,
      },
    },
    {
      id: 13,
      firstName: "Deepak",
      lastName: "Yadav",
      fundingBy: "Self",
      nearestOffice: "Jaipur",
      destination: "Canada",
      package: "Student Visa",
      studyLevel: "Diploma",
      mode: "lock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 14,
      firstName: "Pooja",
      lastName: "Kapoor",
      fundingBy: "Loan",
      nearestOffice: "Delhi",
      destination: "UK",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 15,
      firstName: "Harsh",
      lastName: "Trivedi",
      fundingBy: "Self",
      nearestOffice: "Ahmedabad",
      destination: "Australia",
      package: "Student Visa",
      studyLevel: "Bachelors",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: false,
        cv: true,
        englishTest: true,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 16,
      firstName: "Isha",
      lastName: "Gupta",
      fundingBy: "Parents",
      nearestOffice: "Delhi",
      destination: "Canada",
      package: "PR",
      studyLevel: "Masters",
      mode: "lock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 17,
      firstName: "Manav",
      lastName: "Shah",
      fundingBy: "Loan",
      nearestOffice: "Surat",
      destination: "UK",
      package: "Student Visa",
      studyLevel: "Diploma",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 18,
      firstName: "Kriti",
      lastName: "Reddy",
      fundingBy: "Self",
      nearestOffice: "Hyderabad",
      destination: "USA",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: true,
        actSat: false,
      },
    },
    {
      id: 19,
      firstName: "Nikhil",
      lastName: "Agarwal",
      fundingBy: "Parents",
      nearestOffice: "Jaipur",
      destination: "Canada",
      package: "Student Visa",
      studyLevel: "Bachelors",
      mode: "lock",
      status: "Application Rejected",
      docs: {
        passport: true,
        transcripts: false,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 20,
      firstName: "Sanya",
      lastName: "Malhotra",
      fundingBy: "Self",
      nearestOffice: "Chandigarh",
      destination: "Australia",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "In Process",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 21,
      firstName: "Aditya",
      lastName: "Kulkarni",
      fundingBy: "Loan",
      nearestOffice: "Pune",
      destination: "UK",
      package: "Student Visa",
      studyLevel: "Diploma",
      mode: "lock",
      status: "In Process",
      docs: {
        passport: true,
        transcripts: true,
        sop: false,
        lor: false,
        cv: true,
        englishTest: true,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 22,
      firstName: "Tanya",
      lastName: "Bansal",
      fundingBy: "Parents",
      nearestOffice: "Delhi",
      destination: "USA",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Application Rejected",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: true,
        actSat: true,
      },
    },
    {
      id: 23,
      firstName: "Yash",
      lastName: "Chauhan",
      fundingBy: "Self",
      nearestOffice: "Rajkot",
      destination: "Canada",
      package: "Student Visa",
      studyLevel: "Bachelors",
      mode: "lock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: false,
        lor: false,
        cv: true,
        englishTest: false,
        funds: false,
        gmatGre: false,
        actSat: false,
      },
    },
    {
      id: 24,
      firstName: "Divya",
      lastName: "Menon",
      fundingBy: "Loan",
      nearestOffice: "Bangalore",
      destination: "Australia",
      package: "PR",
      studyLevel: "Masters",
      mode: "unlock",
      status: "Admission Confirmed",
      docs: {
        passport: true,
        transcripts: true,
        sop: true,
        lor: true,
        cv: true,
        englishTest: true,
        funds: true,
        gmatGre: false,
        actSat: false,
      },
    },
  ];

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      setBookings(studentDocs);
      setLoading(false);
    }, 400);
    // eslint-disable-next-line
  }, []);

  const getSubmittedDocsCount = (b) => {
    if (!b.docs) return 0;
    return Object.values(b.docs).filter(Boolean).length;
  };

  const DonutChart = ({ value, total = 9 }) => {
    const percentage = (value / total) * 100;
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
          {/* Background */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress */}
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

          {/* Text */}
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontSize="10"
            fill="#2B2A4C"
          >
            {value}/9
          </text>
        </svg>
      </div>
    );
  };

  const handleDeleteBooking = () => {
    if (!deletePopup.bookingId) return;

    setBookings((prev) => prev.filter((b) => b.id !== deletePopup.bookingId));

    setDeletePopup({ open: false, bookingId: null });
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
    "Admission Confirmed": "text-green-500",
    "Application Rejected": "text-red-400",
    "In Process": "text-sky-400",
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
      (b.id && b.id.toString().toLowerCase().includes(query)) ||
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
              Student's Document Evaluator
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
            </div>
          </div>
        </div>

        {/* Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 items-center gap-5 text-gray-700 font-semibold mt-5">
          <div className="border border-[#E7E7F8] py-2 px-4 rounded-lg">
            <p className="text-sm font-normal">Total Applications</p>

            <div className="grid grid-cols-[auto_25px] items-center justify-between gap-5 h-full mt-2">
              <div>
                <p className="mt-2 text-lg text-black">9987</p>
              </div>

              <div>
                <HiOutlineDocumentDuplicate className="bg-indigo-900 text-white text-[27px] p-1.5 rounded-md" />
              </div>
            </div>
          </div>

          <div className="border border-[#E7E7F8] py-2 px-4 rounded-lg">
            <p className="text-sm font-normal">Locked Applications</p>

            <div className="grid grid-cols-[auto_25px] items-center justify-between gap-5 h-full mt-2">
              <div>
                <p className="mt-2 text-lg text-black">78</p>
              </div>

              <div>
                <LuLockKeyhole className="bg-indigo-900 text-[27px] text-white p-1.5 rounded-md" />
              </div>
            </div>
          </div>

          <div className="border border-[#E7E7F8] py-2 px-4 rounded-lg">
            <p className="text-sm font-normal">Unlocked Applications</p>

            <div className="grid grid-cols-[auto_25px] items-center justify-between gap-5 h-full mt-2">
              <div>
                <p className="mt-2 text-lg text-black">879</p>
              </div>

              <div>
                <LuLockKeyholeOpen className="bg-indigo-900 text-[27px] text-white p-1.5 rounded-md" />
              </div>
            </div>
          </div>

          <div className="border border-[#E7E7F8] py-2 px-4 rounded-lg">
            <p className="text-sm font-normal">Admission Confirmed</p>

            <div className="grid grid-cols-[auto_25px] items-center justify-between gap-5 h-full mt-2">
              <div>
                <p className="mt-2 text-lg text-black">987</p>
              </div>

              <div>
                <GiCheckMark className="bg-indigo-900 text-[27px] text-white p-1.5 rounded-md" />
              </div>
            </div>
          </div>

          <div className="border border-[#E7E7F8] py-2 px-4 rounded-lg">
            <p className="text-sm font-normal">Application Rejected</p>

            <div className="grid grid-cols-[auto_25px] items-center justify-between gap-5 h-full mt-2">
              <div>
                <p className="mt-2 text-lg text-black">987</p>
              </div>

              <div>
                <ImCross className="bg-indigo-900 text-[27px] text-white p-2 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-8">
          <div className="flex gap-4 w-full justify-between">
            <select class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer">
              <option value="">Filter By office</option>
              <option value="">Ahmedabad</option>
              <option value="">Anand</option>
              <option value="">Chandigarh</option>
              <option value="">Delhi</option>
              <option value="">Gandhinagar</option>
              <option value="">Indore</option>
              <option value="">Jaipur</option>
              <option value="">Jamnagar</option>
              <option value="">Junagadh</option>
              <option value="">Morbi</option>
              <option value="">Pune</option>
              <option value="">Rajkot</option>
              <option value="">Surat</option>
              <option value="">Vadodara</option>
              <option value="">Kathmandu Nepal</option>
            </select>

            {/* <button onClick={() => { setFormMode("add"); setIsOpen_popupForm(true); }}  className="px-6 z-30 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white relative hover:scale-95 transition-all duration-300 ease-in-out"  >  + Add Inquiry </button> */}
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
                        <th className="p-4"> ID</th>
                        <th className="p-4 w-20 text-center">
                          Document Completion(%)
                        </th>
                        <th className="p-4 w-1/10">Student Name</th>
                        <th className="p-4 w-1/10">Email</th>
                        <th className="p-4 w-1/10">Nearest Office</th>
                        <th className="p-4 w-1/10">Study Destination</th>
                        <th className="p-4 w-1/10">Study Level</th>

                        <th className="p-4 w-1/10 text-center">Mode</th>
                        <th className="p-4 w-1/10 text-center">Status</th>
                        <th className="p-4 w-1/10 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr
                          key={b.id}
                          className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                        >
                          {/* Booking ID */}
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {b.id || "-"}
                          </td>

                          {/* Donut chart */}
                          <td className="px-4 py-3">
                            <DonutChart value={getSubmittedDocsCount(b)} />
                          </td>

                          {/* Customer Name */}
                          <td className="px-4 py-3 capitalize">
                            <Tooltip
                              title={`${b.firstName} ${b.lastName}`}
                              placement="left"
                            >
                              {b.firstName} {b.lastName}
                            </Tooltip>
                          </td>

                          {/* Funding By */}
                          <td className="px-4 py-3">{b.fundingBy || "-"}</td>

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

                          {/* Study Level */}
                          <td className="px-4 py-3">{b.studyLevel || "-"}</td>

                          {/* Mode */}
                          <td className="px-4 py-3">
                            <div className="flex justify-center items-center">
                              <div
                                className={`flex justify-center items-center rounded-full p-1.5 ${
                                  b.mode === "lock"
                                    ? "text-indigo-800"
                                    : "text-indigo-200"
                                }`}
                              >
                                {b.mode === "lock" ? (
                                  <BiSolidLock size={20} />
                                ) : (
                                  <BiSolidLockOpen size={20} />
                                )}
                              </div>
                            </div>
                          </td>
                          {/* <td className="px-4 py-3">
                            <div className="flex justify-center items-center">
                              <button
                                className={`w-20 px-1 py-1 rounded text-xs font-medium capitalize scale-95 cursor-default ${
                                  // modeColors[b.bookingStatus?.()] || ""
                                  modeColors[b.mode] || ""
                                }`}
                              >
                                {b.mode}
                              </button>
                            </div>
                          </td> */}

                          {/* Status */}
                          <td className="px-4 py-3">
                            <div className="flex justify-center items-center">
                              <button
                                className={`w-20 px-1 py-1 rounded text-xs font-medium capitalize scale-95 cursor-default ${
                                  b.mode === "lock"
                                    ? statusColors[b.status] || ""
                                    : "text-gray-400"

                                  // statusColors[b.status] || ""
                                }`}
                              >
                                {b.mode === "lock" ? b.status : "-"}
                              </button>
                            </div>
                          </td>

                          {/* Actions */}
                          <td>
                            <div className="flex justify-center">
                              {/* Everyone can view */}
                              <button
                                onClick={() =>
                                  navigate("/StudentDocuments", { state: b })
                                }
                                className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                              >
                                <FaEye size={15} />
                              </button>

                              <>
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
                  Delete Consultation?
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this Consultation? This action
                  cannot be undone.
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

export default DocumentEvaluator;
