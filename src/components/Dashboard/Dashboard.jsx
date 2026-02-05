import React, { useState, useEffect, useRef } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "./Dashboard.css";
import MyCharts from "./MyCharts";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { HiOutlineUsers } from "react-icons/hi2";
import { BsCalendarEvent } from "react-icons/bs";
import { MdHistory } from "react-icons/md";

const Dashboard = () => {
  /* ---------------- UI STATE ---------------- */
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showPopup_filter, setShowPopup_filter] = useState(false);
  const [todayBookings, setTodayBookings] = useState(0);
  const [recentConsultations, setRecentConsultations] = useState([]);

  // const [dashboardData, setDashboardData] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalConsultations: 0,
    upcomingConsultations: 0,
    pastConsultations: 0,
    studentsComingFrom: [],
    studentsGoingTo: [],
    preferredStudyLevels: [],
    monthlyConsultations: [],
  });
  const currentMonth = new Date().getMonth() + 1;
  const [, setMonthlyCount] = useState(0);

  useEffect(() => {
    const currentMonth = new Date().getMonth() + 1;
    const monthData = dashboardData.monthlyConsultations?.find(
      (m) => m.month === currentMonth,
    );
    setMonthlyCount(monthData?.totalConsultations || 0);
  }, [dashboardData]);

  const [loading, setLoading] = useState(true);

  const filterRef = useRef(null);

  // useEffect(() => {
  //   const fetchDashboardData = async () => {
  //     try {
  //       const res = await fetch(
  //         "https://transglobeedu.com/web-backend/getbriefs",
  //       );
  //       const json = await res.json();

  //       if (json.success) {
  //         console.log("API:", json.data);

  //         setDashboardData(json.data);
  //       }
  //     } catch (error) {
  //       console.error("Dashboard API error:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchDashboardData();
  // }, []);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(
          "https://transglobeedu.com/web-backend/getbriefs",
          {
            cache: "no-store",
          },
        );

        const text = await res.text();
        console.log("RAW RESPONSE FROM API:", text);

        const json = JSON.parse(text);

        if (json.success) {
          console.log("PARSED JSON:", json.data);
          setDashboardData(json.data);
          setRecentConsultations(json.data.recentConsultations || []);
          setTodayBookings(json.data.todayBookings || 0);
        }
      } catch (error) {
        console.error("Dashboard API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ---------------- DUMMY DATA ---------------- */

  // const analyticsData = {
  //   totalConsultations: 1240,
  //   upcomingConsultations: 86,
  //   pastConsultations: 1154,
  // };

  // const consultations = [
  //   {
  //     id: 1,
  //     firstName: "Aarav",
  //     lastName: "Shah",
  //     studyLevel: "Undergraduate",
  //     destination: "Canada",
  //     consultationDate: "2025-01-12",
  //     status: "DONE",
  //   },
  //   {
  //     id: 2,
  //     firstName: "Sara",
  //     lastName: "Khan",
  //     studyLevel: "Postgraduate",
  //     destination: "UK",
  //     consultationDate: "2025-01-10",
  //     status: "PENDING",
  //   },
  //   {
  //     id: 3,
  //     firstName: "Rohit",
  //     lastName: "Mehta",
  //     studyLevel: "School",
  //     destination: "Australia",
  //     consultationDate: "2025-01-08",
  //     status: "DONE",
  //   },
  //   {
  //     id: 4,
  //     firstName: "Neha",
  //     lastName: "Patel",
  //     studyLevel: "Postgraduate",
  //     destination: "USA",
  //     consultationDate: "2025-01-06",
  //     status: "CANCELLED",
  //   },
  //   {
  //     id: 5,
  //     firstName: "Kabir",
  //     lastName: "Verma",
  //     studyLevel: "Undergraduate",
  //     destination: "Germany",
  //     consultationDate: "2025-01-15",
  //     status: "DONE",
  //   },
  //   {
  //     id: 6,
  //     firstName: "Ananya",
  //     lastName: "Iyer",
  //     studyLevel: "Postgraduate",
  //     destination: "Ireland",
  //     consultationDate: "2025-01-14",
  //     status: "PENDING",
  //   },
  //   {
  //     id: 7,
  //     firstName: "Aditya",
  //     lastName: "Singh",
  //     studyLevel: "School",
  //     destination: "New Zealand",
  //     consultationDate: "2025-01-13",
  //     status: "DONE",
  //   },
  //   {
  //     id: 8,
  //     firstName: "Pooja",
  //     lastName: "Malhotra",
  //     studyLevel: "Undergraduate",
  //     destination: "Singapore",
  //     consultationDate: "2025-01-11",
  //     status: "DONE",
  //   },
  //   {
  //     id: 9,
  //     firstName: "Rahul",
  //     lastName: "Nair",
  //     studyLevel: "Postgraduate",
  //     destination: "Dubai",
  //     consultationDate: "2025-01-09",
  //     status: "CANCELLED",
  //   },
  //   {
  //     id: 10,
  //     firstName: "Simran",
  //     lastName: "Kaur",
  //     studyLevel: "Undergraduate",
  //     destination: "Europe",
  //     consultationDate: "2025-01-07",
  //     status: "PENDING",
  //   },
  //   {
  //     id: 11,
  //     firstName: "Mohit",
  //     lastName: "Aggarwal",
  //     studyLevel: "Postgraduate",
  //     destination: "Canada",
  //     consultationDate: "2025-01-05",
  //     status: "DONE",
  //   },
  //   {
  //     id: 12,
  //     firstName: "Isha",
  //     lastName: "Bansal",
  //     studyLevel: "School",
  //     destination: "UK",
  //     consultationDate: "2025-01-04",
  //     status: "DONE",
  //   },
  // ];

  // const recentConsultations = consultations.slice(0, 10);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-500",
    declined: "bg-orange-100 text-orange-400",
    converted: "bg-sky-100 text-sky-500",
    cancelled: "bg-red-100 text-red-400",
    approved: "bg-green-100 text-green-500",
  };

  // const studyDestinations = [
  //   { destination: "Australia", totalStudents: 120 },
  //   { destination: "Canada", totalStudents: 95 },
  //   { destination: "USA", totalStudents: 150 },
  //   { destination: "UK", totalStudents: 80 },
  //   { destination: "New Zealand", totalStudents: 60 },
  //   { destination: "Germany", totalStudents: 50 },
  //   { destination: "Singapore", totalStudents: 40 },
  //   { destination: "Dubai", totalStudents: 30 },
  //   { destination: "Europe", totalStudents: 70 },
  //   { destination: "Ireland", totalStudents: 25 },
  // ];

  // const topStudyLevels = [
  //   { level: "School", totalStudents: 120 },
  //   { level: "Undergraduate", totalStudents: 200 },
  //   { level: "Postgraduate", totalStudents: 80 },
  // ];

  /* ---------------- EFFECTS ---------------- */

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowPopup_filter(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- JSX ---------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen p-10">
        Loading dashboard...
      </div>
    );
  }

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
          <div className="flex flex-col lg:flex-row gap-5 items-center">
            <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
              Dashboard
            </p>
          </div>

          <div className="flex items-center">
            <div className="">
              <button className="Btn">
                <svg
                  className="svgIcon"
                  viewBox="0 0 384 512"
                  height="1em"
                  xmlns="http:www.w3.org/2000/svg"
                >
                  <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
                </svg>
                <span className="icon2"></span>
                <span className="tooltip text-sm">Download</span>
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
                  <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-custom z-10 p-4 space-y-4">
                    <div className="flex justify-between gap-2">
                      {["Today", "Week", "Month", "Year"].map((label) => (
                        <button
                          key={label}
                          className="flex-1 py-1 px-2 bg-gray-100 active:bg-[#E7E7F8] hover:bg-[#E7E7F8] rounded text-sm font-medium"
                        >
                          {label}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          className="border text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#2B2A4C] focus:border-black"
                        />
                        <span className="text-sm text-gray-500">-</span>
                        <input
                          type="date"
                          className="border text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-[#2B2A4C] focus:border-black"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[75%_23%] gap-[2%] mt-5">
          {/* ---------------- LEFT COLUMN ---------------- */}
          <div>
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Total Consultations */}
              <div className="flex items-center justify-between bg-[#E7E7F8] p-4 rounded-lg">
                <div>
                  <p>Total Consultations</p>
                  <p className="text-lg font-medium">
                    {dashboardData.totalConsultations}
                  </p>
                </div>
                <HiOutlineUsers className="bg-[#2B2A4C] text-white text-3xl p-1.5 rounded-md" />
              </div>

              {/* Upcoming Consultations */}
              <div className="flex items-center justify-between bg-[#E7E7F8] p-4 rounded-lg">
                <div>
                  <p>Monthly Consultations</p>
                  <p className="text-lg font-medium">
                    {" "}
                    {dashboardData.monthlyConsultations?.find(
                      (m) => m.month === currentMonth,
                    )?.totalConsultations || 0}
                  </p>
                </div>
                <BsCalendarEvent className="bg-[#2B2A4C] text-white text-3xl p-2 rounded-md" />
              </div>

              {/* Past Consultations */}
              <div className="flex items-center justify-between bg-[#E7E7F8] p-4 rounded-lg">
                <div>
                  <p>Past Consultations (2 Week)</p>
                  <p className="text-lg font-medium">
                    {dashboardData.pastConsultations}
                  </p>
                </div>
                <MdHistory className="bg-[#2B2A4C] text-white text-3xl p-1.5 rounded-md" />
              </div>
            </div>
            {/* Charts */}

            <MyCharts
              studentsComingFrom={dashboardData?.studentsComingFrom || []}
              monthlyData={dashboardData?.monthlyConsultations}
            />
            {/* Recent Consultations Table */}
            <div className="bg-white shadow-md rounded-lg mt-5 overflow-hidden">
              <div className="flex flex-wrap justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">Recent Consultations</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <IoIosCheckmarkCircle className="text-green-500 mr-1" />
                    {todayBookings} booking{todayBookings !== 1 ? "s" : ""} came
                    today
                  </p>
                </div>

                <div>
                  <a
                    href="/StudentConsultations"
                    className="text-sm text-gray-500 hover:text-black hover:underline"
                  >
                    View more
                  </a>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#E7E7F8] text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Student
                      </th>
                      <th className="px-4 py-3 text-left font-medium">
                        Destination - Study Level
                      </th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentConsultations.map((c) => {
                      const isToday =
                        new Date(c.createdAt).toDateString() ===
                        new Date().toDateString();

                      return (
                        <tr
                          key={c.id}
                          className={`border-b ${
                            isToday ? "bg-green-50" : "even:bg-gray-100"
                          }`}
                        >
                          <td className="px-4 py-3">
                            {c.firstName} {c.lastName}
                          </td>

                          <td className="px-4 py-3">
                            {c.destination} – {c.studyLevel}
                          </td>

                          <td className="px-4 py-3">
                            {new Date(c.createdAt).toLocaleDateString("en-GB")}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                                statusColors[c.status]
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ---------------- RIGHT COLUMN ---------------- */}
          <div className="hidden lg:block ">
            <div className="bg-white shadow-md p-5 rounded-lg">
              {/* Study Destinations */}
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Popular Study Destinations
              </h2>
              {/* 
              {(() => {
                const total = studyDestinations.reduce(
                  (sum, item) => sum + item.totalStudents,
                  0,
                );

                const colors = [
                  "bg-indigo-300",
                  "bg-[#040463]",
                  "bg-indigo-300",
                  "bg-[#040463]",
                  "bg-indigo-300",
                  "bg-[#040463]",
                  "bg-indigo-300",
                  "bg-[#040463]",
                  "bg-indigo-300",
                  "bg-[#040463]",
                ];

                return studyDestinations.map((item, index) => {
                  const percent = ((item.totalStudents / total) * 100).toFixed(
                    0,
                  );

                  return (
                    <div key={index} className="mb-4">
                      <div className="flex justify-between text-sm font-medium mb-1">
                        <span>{item.destination}</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                          className={`h-2 ${colors[index % colors.length]} rounded`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                });
              })()} */}
              {dashboardData.studentsGoingTo.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{item.destination.replace("Study in ", "")}</span>
                    <span>{Math.round(item.percentage)}%</span>
                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded">
                    <div
                      className={`h-2 ${
                        index % 2 === 0 ? "bg-indigo-300" : "bg-[#040463]"
                      } rounded`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
                Top Preferred Study Levels
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {dashboardData.preferredStudyLevels.map((item, index) => (
                  <div
                    key={index}
                    className={`border-2 rounded-xl p-4 ${
                      [
                        "border-red-800",
                        "border-indigo-200",
                        "border-[#040463]",
                        "border-green-600",
                      ][index % 4]
                    }`}
                  >
                    <p className="text-lg font-medium">{item.studyLevel}</p>
                    <p className="text-sm text-gray-600">
                      {item.count} students
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

// import React, { useState, useEffect, useRef } from "react";
// import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";
// import "./Dashboard.css";
// import MyCharts from "./MyCharts";
// import { GiNetworkBars } from "react-icons/gi";
// import { BsFillLuggageFill } from "react-icons/bs";
// import { FaMoneyBillTrendUp } from "react-icons/fa6";
// import { IoIosCheckmarkCircle } from "react-icons/io";

// const Dashboard = () => {
//   // Move ALL hooks to the top, before any conditional returns
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
//   const [bookings, setBookings] = useState([]);
//   const [loadingBookings, setLoadingBookings] = useState(true);
//   const [topProperties, setTopProperties] = useState([]);
//   const [analyticsData, setAnalyticsData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [showPopup_filter, setShowPopup_filter] = useState(false);
//   const [bookingsByDestination, setBookingsByDestination] = useState([]);

//   const filterRef = useRef(null);

//   // Move all useEffect hooks here as well
//   useEffect(() => {
//     async function fetchBookings() {
//       try {
//         setLoadingBookings(true);
//         const response = await fetch(
//           "https://dash.zorbastays.com/web-backend/bookings",
//         );
//         const data = await response.json();

//         const sortedData = data.sort(
//           (a, b) => new Date(b.bookingTime) - new Date(a.bookingTime),
//         );

//         setBookings(sortedData);
//       } catch (error) {
//         console.error("Error fetching bookings:", error);
//       } finally {
//         setLoadingBookings(false);
//       }
//     }

//     fetchBookings();
//   }, []);

//   useEffect(() => {
//     async function fetchAnalytics() {
//       const res = await fetch(
//         "https://dash.zorbastays.com/web-backend/getAnalytics",
//       );
//       const data = await res.json();
//       setTopProperties(data.topProperties);
//     }
//     fetchAnalytics();
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);

//       if (mobile) {
//         setIsSidebarOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const res = await fetch(
//           "https://dash.zorbastays.com/web-backend/getAnalytics",
//         );
//         const data = await res.json();
//         setAnalyticsData(data);
//       } catch (error) {
//         console.error("Error fetching analytics:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, []);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (filterRef.current && !filterRef.current.contains(event.target)) {
//         setShowPopup_filter(false);
//       }
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   useEffect(() => {
//     async function fetchAnalytics() {
//       const res = await fetch(
//         "https://dash.zorbastays.com/web-backend/getAnalytics",
//       );
//       const data = await res.json();
//       setBookingsByDestination(data.bookingsByDestination);
//     }
//     fetchAnalytics();
//   }, []);

//   // Now the conditional returns can happen after all hooks are declared
//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-50">
//         {/* Spinner */}
//         <div className="w-12 h-12 border-4 border-[#2B2A4C] border-dashed rounded-full animate-spin mb-6"></div>

//         <p className="mt-4 text-gray-600 font-medium">Fetching analytics...</p>
//       </div>
//     );
//   }

//   if (!analyticsData) {
//     return <p>Failed to load analytics.</p>;
//   }

//   const recentBookings = bookings.slice(0, 10);

//   const statusColors = {
//     CANCELLED: "bg-amber-800/20 text-amber-800",
//     CONFIRMED: "bg-green-500/20 text-green-500",
//     BOOKED: "bg-purple-500/20 text-purple-500",
//     FAILED: "bg-red-500/20 text-red-500",
//     PENDING: "bg-yellow-200/50 text-yellow-500",
//   };

//   // Rest of your component JSX remains the same...
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
//         <div className="flex justify-between gap-5 items-start lg:items-center">
//           <div className="flex flex-col lg:flex-row gap-5 items-center">
//             <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
//               Dashboard
//             </p>
//           </div>

//           <div className="flex items-center">
//             <div className="">
//               <button className="Btn">
//                 <svg
//                   className="svgIcon"
//                   viewBox="0 0 384 512"
//                   height="1em"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.8 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"></path>
//                 </svg>
//                 <span className="icon2"></span>
//                 <span className="tooltip text-sm">Download</span>
//               </button>
//             </div>

//             <div className="flex items-center">
//               <div className="relative inline-block" ref={filterRef}>
//                 <div
//                   onClick={() => setShowPopup_filter((prev) => !prev)}
//                   className={`flex flex-col items-center gap-4 cursor-pointer select-none group scale-[0.75] py-2.5 px-2 rounded-full border-2 transition-all duration-300 ${
//                     showPopup_filter
//                       ? "border-[#1D2826]"
//                       : "border-transparent hover:border-[#1D2826]"
//                   }`}
//                 >
//                   <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full">
//                     <div
//                       className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
//                       style={{
//                         left: showPopup_filter ? "100%" : "0%",
//                         transform: `translate(${
//                           showPopup_filter ? "-100%" : "0"
//                         }, -50%)`,
//                       }}
//                     ></div>
//                   </div>

//                   <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full -my-2.5">
//                     <div
//                       className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
//                       style={{
//                         left: showPopup_filter ? "0%" : "100%",
//                         transform: `translate(${
//                           showPopup_filter ? "0" : "-100%"
//                         }, -50%)`,
//                       }}
//                     ></div>
//                   </div>

//                   <div className="relative w-6 h-0.5 bg-[#1D2826] rounded-full">
//                     <div
//                       className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border-2 border-black bg-white transition-all duration-300"
//                       style={{
//                         left: showPopup_filter ? "100%" : "0%",
//                         transform: `translate(${
//                           showPopup_filter ? "-100%" : "0"
//                         }, -50%)`,
//                       }}
//                     ></div>
//                   </div>
//                 </div>

//                 {showPopup_filter && (
//                   <div className="absolute top-full mt-1 right-0 bg-white border rounded-lg shadow-custom z-10 p-4 space-y-4">
//                     <div className="flex justify-between gap-2">
//                       {["Today", "Week", "Month", "Year"].map((label) => (
//                         <button
//                           key={label}
//                           className="flex-1 py-1 px-2 bg-gray-100 active:bg-[#DAE0CE] hover:bg-[#DAE0CE] rounded text-sm font-medium"
//                         >
//                           {label}
//                         </button>
//                       ))}
//                     </div>

//                     <div className="flex flex-col gap-2">
//                       <div className="flex items-center gap-2">
//                         <input
//                           type="date"
//                           className="border text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-black"
//                         />
//                         <span className="text-sm text-gray-500">-</span>
//                         <input
//                           type="date"
//                           className="border text-sm rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-black"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[73%_25%] gap-[2%] items-start mt-5">
//           {/* Main col-1 */}
//           <div>
//             {/* Boxes */}

//             <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 items-center gap-5 text-gray-700 font-semibold">
//               {/* Total Bookings */}
//               <div className="flex items-center justify-between gap-5 bg-[#E7E7F8] py-2 px-4 rounded-lg">
//                 <div>
//                   <p>Total Bookings</p>
//                   <p className="mt-2 text-lg text-black">
//                     {analyticsData.totalBookings.toLocaleString()}{" "}
//                     <sup className="text-purple-900">+55%</sup>
//                   </p>
//                 </div>
//                 <div>
//                   <GiNetworkBars className="bg-[#2B2A4C] text-3xl text-white p-1.5 rounded-md" />
//                 </div>
//               </div>

//               {/* Upcoming Trips */}
//               <div className="flex items-center justify-between gap-5 bg-[#E7E7F8] py-2 px-4 rounded-lg">
//                 <div>
//                   <p>Upcoming Trips</p>
//                   <p className="mt-2 text-lg text-black">
//                     {analyticsData.upcomingTrips.toLocaleString()}{" "}
//                     <sup className="text-purple-900">+5%</sup>
//                   </p>
//                 </div>
//                 <div>
//                   <BsFillLuggageFill className="bg-[#2B2A4C] text-3xl text-white p-1.5 rounded-md" />
//                 </div>
//               </div>

//               {/* Total Revenue */}
//               <div className="flex items-center justify-between gap-5 bg-[#E7E7F8] py-2 px-4 rounded-lg">
//                 <div>
//                   <p>Total Revenue</p>
//                   <p className="mt-2 text-lg text-black">
//                     {`₹${parseFloat(analyticsData.totalRevenue).toLocaleString()}`}{" "}
//                     <sup className="text-purple-900">+8%</sup>
//                   </p>
//                 </div>
//                 <div>
//                   <FaMoneyBillTrendUp className="bg-[#2B2A4C] text-3xl text-white p-1.5 rounded-md" />
//                 </div>
//               </div>
//             </div>

//             {/* Charts */}
//             <MyCharts />

//             {/* Table */}
//             <div>
//               <div className="shadow-md rounded-lg mt-5 overflow-hidden">
//                 <div className="flex justify-between bg-white rounded-t-lg p-4 text-gray-700">
//                   <div>
//                     <p className="font-semibold">Recent Bookings</p>
//                     <p className="flex items-center text-xs text-gray-500 mt-2">
//                       <IoIosCheckmarkCircle className="mr-1 text-lg fill-green-500" />
//                       <span className="text-gray-700 font-semibold">
//                         20 done&nbsp;
//                       </span>
//                       this month
//                     </p>
//                   </div>

//                   <div>
//                     <a
//                       href="/Bookings"
//                       className="text-gray-400 hover:text-gray-700 text-sm underline underline-offset-2"
//                     >
//                       View more
//                     </a>
//                   </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                   <table className="w-full text-sm text-left rtl:text-right text-gray-500">
//                     <thead className="text-xs text-gray-600 uppercase bg-[#E7E7F8] border-b">
//                       <tr>
//                         <th className="px-4 py-3 w-1/10">Customer Name</th>
//                         <th className="px-4 py-3 w-1/10">
//                           Package / Destination
//                         </th>
//                         <th className="px-4 py-3 w-1/10">Booking Date</th>
//                         <th className="px-4 py-3 w-1/12">Status</th>
//                         {/* <th className="px-4 py-3 w-1/10">Payment</th> */}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {loadingBookings ? (
//                         <tr>
//                           <td
//                             colSpan="5"
//                             className="text-center py-4 text-gray-500"
//                           >
//                             Loading...
//                           </td>
//                         </tr>
//                       ) : recentBookings.length > 0 ? (
//                         recentBookings.map((b) => (
//                           <tr
//                             key={b.id || b.bookingId}
//                             className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
//                           >
//                             <td className="px-4 py-2">
//                               {b.firstName && b.lastName
//                                 ? `${b.firstName} ${b.lastName}`
//                                 : "-"}
//                             </td>

//                             <td className="px-4 py-2">
//                               {b.package
//                                 ? `${b.package} - ${b.destination}`
//                                 : b.destination || "-"}
//                             </td>

//                             <td className="px-4 py-2">
//                               {b.bookingTime
//                                 ? new Date(b.bookingTime).toLocaleDateString(
//                                     "en-GB",
//                                   )
//                                 : "-"}
//                             </td>

//                             <td className="px-4 py-2">
//                               <button
//                                 className={`w-20 px-1 py-1 rounded-lg text-xs scale-90 ${
//                                   statusColors[
//                                     b.bookingStatus?.toUpperCase()
//                                   ] || ""
//                                 }`}
//                               >
//                                 {b.bookingStatus || "PENDING"}
//                               </button>
//                             </td>

//                             {/* <td className="px-4 py-2">{b.bTocPrice || "-"}</td> */}
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan="5"
//                             className="text-center py-4 text-gray-500"
//                           >
//                             No bookings found.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Main col-2 */}
//           <div className="hidden lg:block">
//             <div className="bg-white shadow-md p-5 rounded-lg mx-auto">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 Bookings
//               </h2>

//               {bookingsByDestination && bookingsByDestination.length > 0 ? (
//                 (() => {
//                   const totalBookings = bookingsByDestination.reduce(
//                     (sum, item) => sum + item.totalBookings,
//                     0,
//                   );

//                   const colors = [
//                     "bg-sky-300",
//                     "bg-yellow-200",
//                     "bg-orange-300",
//                     "bg-teal-300",
//                     "bg-red-300",
//                     "bg-blue-300",
//                   ];

//                   return bookingsByDestination.map((item, index) => {
//                     const percent = (
//                       (item.totalBookings / totalBookings) *
//                       100
//                     ).toFixed(0);
//                     return (
//                       <div key={index} className="mb-4">
//                         <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
//                           <span>{item.destination}</span>
//                           <span>{percent}%</span>
//                         </div>
//                         <div className="w-full h-2 bg-gray-200 rounded">
//                           <div
//                             className={`h-2 ${
//                               colors[index % colors.length]
//                             } rounded`}
//                             style={{ width: `${percent}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     );
//                   });
//                 })()
//               ) : (
//                 <p className="text-gray-500 text-sm">No data available</p>
//               )}

//               <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
//                 Top-Performing Properties
//               </h2>

//               <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//                 {topProperties && topProperties.length > 0 ? (
//                   topProperties.map((property, index) => (
//                     <div
//                       key={index}
//                       className={`border-2 rounded-xl p-4 flex flex-col items-start ${
//                         [
//                           "border-sky-500",
//                           "border-yellow-300",
//                           "border-orange-400",
//                           "border-green-400",
//                         ][index % 4]
//                       }`}
//                     >
//                       <p className="text-lg font-bold text-gray-800">
//                         {property.property}
//                       </p>
//                       <p className="text-sm mt-1 text-gray-600">
//                         {property.totalBookings}
//                         <span className="text-sm font-normal ml-1">
//                           bookings
//                         </span>
//                       </p>
//                     </div>
//                   ))
//                 ) : (
//                   <p className="text-gray-500 text-sm col-span-2">
//                     No data available
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;
