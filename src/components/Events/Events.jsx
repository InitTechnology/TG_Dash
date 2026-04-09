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
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import axios from "axios";
import { toast } from "react-toastify";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line
  const [isFetching, setIsFetching] = useState(false); // optional

  const [selectedEventId, setSelectedEventId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    eventDate: "",
    destination: [],
    city: [],
  });
  const [destDropdownOpen, setDestDropdownOpen] = useState(false);
  const destinationRef = useRef(null);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Destination dropdown
      if (
        destinationRef.current &&
        !destinationRef.current.contains(e.target)
      ) {
        setDestDropdownOpen(false);
      }

      // City dropdown
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // const [events] = useState([
  //   {
  //     id: 1,
  //     title: "Study in Canada",
  //     dateShown: "10 Apr 2026",
  //     dates: ["10 Apr 2026"],
  //     image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d",
  //     destination: "Canada",
  //     city: "Toronto",
  //   },
  //   {
  //     id: 2,
  //     title: "USA Admission Seminar",
  //     dateShown: "15 Apr 2026",
  //     dates: ["15-04-2026", "16-04-2026"],
  //     image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  //     destination: "USA",
  //     city: "New York",
  //   },
  //   {
  //     id: 3,
  //     title: "Australia Education Expo",
  //     dateShown: "20 Apr 2026",
  //     dates: ["20-04-2026"],
  //     image: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d",
  //     destination: "Australia",
  //     city: "Melbourne",
  //   },
  // ]);

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

  useEffect(() => {
    setCurrentPage_events(1);
  }, [searchQuery]);

  const filteredEvents = events.filter((e) => {
    const query = searchQuery.toLowerCase();

    const matchesTitle = e.title?.toLowerCase().includes(query);
    const matchesDestination = e.destination?.toLowerCase().includes(query);

    return matchesTitle || matchesDestination;
  });
  const rowsPerPage_events = 20;
  const [currentPage_events, setCurrentPage_events] = useState(1);

  // const totalPages_events = Math.ceil(events.length / rowsPerPage_events);
  const totalPages_events = Math.ceil(
    filteredEvents.length / rowsPerPage_events,
  );

  const indexOfLast_events = currentPage_events * rowsPerPage_events;
  const indexOfFirst_events = indexOfLast_events - rowsPerPage_events;

  // const current_events = events.slice(indexOfFirst_events, indexOfLast_events);
  const current_events = filteredEvents.slice(
    indexOfFirst_events,
    indexOfLast_events,
  );
  const handleNextPage_events = () => {
    if (currentPage_events < totalPages_events) {
      setCurrentPage_events(currentPage_events + 1);
    }
  };

  const handlePrevPage_events = () => {
    if (currentPage_events > 1) {
      setCurrentPage_events(currentPage_events - 1);
    }
  };

  const handlePageChange_events = (page) => {
    setCurrentPage_events(page);
  };

  const generatePageNumbers_events = () => {
    const pages = [];

    if (totalPages_events <= 5) {
      for (let i = 1; i <= totalPages_events; i++) pages.push(i);
    } else {
      if (currentPage_events > 2) pages.push(1, "…");

      for (let i = currentPage_events - 1; i <= currentPage_events + 1; i++) {
        if (i > 0 && i <= totalPages_events) pages.push(i);
      }

      if (currentPage_events < totalPages_events - 1)
        pages.push("…", totalPages_events);
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

  const [isOpen_popupForm, setIsOpen_popupForm] = useState(false);

  const handleClosePopup = () => {
    setIsOpen_popupForm(false);
    setIsEditMode(false);
    setIsViewMode(false);
    setSelectedEventId(null);
    setFormData({
      title: "",
      date: "",
      eventDate: "",
      destination: [],
      city: [],
    });
    setPreview(null);
    setImage(null);
  };

  const [openCalendar, setOpenCalendar] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [error, setError] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   // Only WEBP
  //   if (file.type !== "image/webp") {
  //     setError("Only WEBP images are allowed.");
  //     e.target.value = "";
  //     setImage(null);
  //     setPreview(null);
  //     return;
  //   }

  //   const img = new Image();
  //   const objectUrl = URL.createObjectURL(file);

  //   img.onload = () => {
  //     if (img.width !== img.height) {
  //       setError("Please select a square ratio (1:1) image.");
  //       e.target.value = "";
  //       setImage(null);
  //       setPreview(null);
  //     } else {
  //       setError("");
  //       setImage(file);
  //       setPreview(objectUrl);
  //     }
  //   };

  //   img.src = objectUrl;
  // };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only WEBP
    if (file.type !== "image/webp") {
      setError("Only WEBP images are allowed.");
      e.target.value = "";
      setImage(null);
      setPreview(null);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const diff = Math.abs(img.width - img.height);

      if (diff > 50) {
        setError("Image should be approximately square (max 50px difference).");
        e.target.value = "";
        setImage(null);
        setPreview(null);
      } else {
        setError("");
        setImage(file);
        setPreview(objectUrl);
      }
    };

    img.src = objectUrl;
  };

  const handleClick = () => {
    inputRef.current.click(); // open file picker again
  };

  const fetchEvents = async () => {
    try {
      setIsFetching(true);
      const res = await axios.get(
        "https://transglobeedu.com/web-backend/events",
      );

      console.log(res.data); // ✅ correct

      setEvents(res.data.events || []);
    } catch (err) {
      console.error("Error fetching events:", err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  // const formattedStart = format(range[0].startDate, "yyyy-MM-dd");
  // const formattedEnd = format(range[0].endDate, "yyyy-MM-dd");
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);
      const start = range[0].startDate;
      const end = range[0].endDate;

      const formattedEventDate = `${format(start, "dd/MM/yyyy")}-${format(
        end,
        "dd/MM/yyyy",
      )}`;

      const form = new FormData();

      form.append("title", formData.title);
      form.append("eventDate", formattedEventDate); // ✅ FIXED
      form.append("date", formData.date);
      form.append("destination", formData.destination.join(", "));
      form.append("city", formData.city.join(", "));
      if (image) {
        form.append("image", image);
      }

      let url = "https://transglobeedu.com/web-backend/event";
      let method = "POST";

      if (isEditMode) {
        url = `https://transglobeedu.com/web-backend/event/${selectedEventId}`;
        method = "PUT"; // or PATCH depending backend
      }

      const res = await fetch(url, {
        method,
        body: form,
      });

      const data = await res.json();

      if (data.success) {
        // ✅ SUCCESS TOAST
        toast.success(
          isEditMode
            ? "Event updated successfully ✅"
            : "Event created successfully ✅",
        );

        handleClosePopup();

        // ✅ REFRESH PAGE AFTER TOAST
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        // ❌ ERROR TOAST
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving event");
    } finally {
      setIsSaving(false);
    }
  };
  const handleEdit = (event) => {
    setIsEditMode(true);
    setSelectedEventId(event.id);
    setIsOpen_popupForm(true);

    setFormData({
      title: event.title || "",
      date: event.date || "",
      eventDate: event.eventDate || "",
      destination: Array.isArray(event.destination)
        ? event.destination
        : event.destination
          ? event.destination.split(",").map((d) => d.trim())
          : [],
      city: Array.isArray(event.city)
        ? event.city
        : event.city
          ? event.city.split(",").map((c) => c.trim())
          : [],
    });

    if (event.eventDate && event.eventDate.includes("-")) {
      const [startStr, endStr] = event.eventDate.split("-");

      const parseDate = (str) => {
        const [day, month, year] = str.split("/");
        return new Date(`${year}-${month}-${day}`);
      };

      const startDate = parseDate(startStr);
      const endDate = parseDate(endStr);

      setRange([
        {
          startDate,
          endDate,
          key: "selection",
        },
      ]);
    }

    // Set preview image
    if (event.imageUrl) {
      setPreview(event.imageUrl);
    }
  };
  const handleView = (event) => {
    setIsViewMode(true);
    setIsEditMode(false);
    setSelectedEventId(event.id);
    setIsOpen_popupForm(true);

    setFormData({
      title: event.title || "",
      date: event.date || "",
      eventDate: event.eventDate || "",
      destination: Array.isArray(event.destination)
        ? event.destination
        : event.destination
          ? event.destination.split(",").map((d) => d.trim())
          : [],
      city: Array.isArray(event.city)
        ? event.city
        : event.city
          ? event.city.split(",").map((c) => c.trim())
          : [],
    });

    if (event.eventDate && event.eventDate.includes("-")) {
      const [startStr, endStr] = event.eventDate.split("-");

      const parseDate = (str) => {
        const [day, month, year] = str.split("/");
        return new Date(`${year}-${month}-${day}`);
      };

      const startDate = parseDate(startStr);
      const endDate = parseDate(endStr);

      setRange([
        {
          startDate,
          endDate,
          key: "selection",
        },
      ]);
    }
    if (event.imageUrl) {
      setPreview(event.imageUrl);
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?",
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      const res = await fetch(
        `https://transglobeedu.com/web-backend/event/${id}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("Event deleted ✅");
        fetchEvents(); // refresh table
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setDeletingId(null); // ✅ reset
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

        {/* Header */}
        <div className="flex justify-between gap-5 items-start lg:items-center">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
              Events
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
            {/* <select class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer">
              <option value="">Filter Country</option>
              <option value="Canada">Canada</option>
              <option value="USA">USA</option>
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Germany">Germany</option>
              <option value="UK">UK</option>
              <option value="Singapore">Singapore</option>
              <option value="Dubai">Dubai</option>
              <option value="Europe">Europe</option>
              <option value="Global">Global</option>
            </select> */}

            <div>
              <button
                onClick={() => {
                  setIsOpen_popupForm(true);
                }}
                className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
              >
                + Add Event
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
                          ? "View Event"
                          : isEditMode
                            ? "Edit Event"
                            : "Add Event"}
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
                      {/* Event Title */}
                      <div className="flex flex-col w-full">
                        <label
                          for="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Event Title
                        </label>
                        <input
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          disabled={isViewMode}
                          placeholder="Enter event title"
                          required
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      {/* Event Date(s) , stores in db as dd/mm/yyyy-dd/mm/yyyy in eventDate column */}
                      <div className="flex flex-col w-full relative">
                        <label
                          htmlFor="eventDates"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit z-10"
                        >
                          Event Date(s)
                        </label>

                        {/* Input Box */}
                        <div
                          onClick={() => {
                            if (!isViewMode) {
                              setOpenCalendar(true);
                            }
                          }}
                          className={`border border-gray-400 p-3 text-sm rounded-lg w-full ${
                            isViewMode
                              ? "bg-gray-100 cursor-not-allowed"
                              : "cursor-pointer focus-within:border-black focus-within:shadow-md"
                          }`}
                          // className="border border-gray-400 p-3 text-sm rounded-lg w-full cursor-pointer focus-within:border-black focus-within:shadow-md"
                        >
                          {range[0].startDate && range[0].endDate ? (
                            <span className="text-gray-800">
                              {format(range[0].startDate, "dd MMM yyyy")}
                              {range[0].startDate !== range[0].endDate && (
                                <>
                                  {" "}
                                  - {format(range[0].endDate, "dd MMM yyyy")}
                                </>
                              )}
                            </span>
                          ) : (
                            <span className="text-black/25">
                              Select event date(s)
                            </span>
                          )}
                        </div>

                        {/* Calendar Popup */}
                        {openCalendar && (
                          <>
                            {/* <div
                              className="fixed inset-0 bg-black/0 z-40"
                              onClick={() => setOpenCalendar(false)}
                            ></div> */}

                            {/* Calendar Box */}
                            <div className="absolute z-50 -left-11 sm:right-0 top-2 sm:top-[68px] bg-white shadow-custom rounded-xl p-4 w-auto scale-[0.75] sm:scale-100">
                              {/* Header */}
                              <div className="flex justify-between items-center mb-3">
                                <p className="font-semibold text-gray-800">
                                  Select Event Date(s)
                                </p>

                                <button
                                  onClick={() => setOpenCalendar(false)}
                                  className="text-gray-400 hover:text-black"
                                >
                                  <MdCancel size={20} />
                                </button>
                              </div>

                              {/* Selected Date Preview */}
                              <div className="text-sm text-center mb-3 text-gray-700">
                                {format(range[0].startDate, "dd MMM yyyy")}
                                {range[0].startDate !== range[0].endDate && (
                                  <>
                                    {" "}
                                    - {format(range[0].endDate, "dd MMM yyyy")}
                                  </>
                                )}
                              </div>

                              {/* Calendar */}
                              <DateRange
                                ranges={range}
                                onChange={(item) => setRange([item.selection])}
                                moveRangeOnFirstSelection={false}
                                minDate={new Date()}
                                rangeColors={["#312e81"]}
                              />

                              {/* Actions */}
                              <div className="flex justify-end mt-3 gap-2">
                                <button
                                  onClick={() => setOpenCalendar(false)}
                                  className="px-4 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
                                >
                                  Cancel
                                </button>

                                <button
                                  onClick={() => setOpenCalendar(false)}
                                  className="px-4 py-1.5 text-sm rounded-md bg-[#2B2A4C] text-white hover:opacity-90"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Display Date stores in db as date column  */}
                      <div className="flex flex-col w-full">
                        <label
                          for="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                        >
                          Display Date (Text)
                        </label>
                        <input
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          placeholder="20th to 25th July 2026 / 9th June 2026"
                          required
                          disabled={isViewMode}
                          className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      {/* Destination */}
                      {/* <div className="flex flex-col w-full">
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          Destination
                        </label>
                        <select
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        >
                          <option value="">Select</option>
                          <option value="Australia">Australia</option>
                          <option value="Canada">Canada</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="New Zealand">New Zealand</option>
                          <option value="Germany">Germany</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Dubai">Dubai</option>
                          <option value="Europe">Europe</option>
                          <option value="Ireland">Ireland</option>
                          <option value="Global">Global</option>
                        </select>
                      </div> */}
                      {/* Destination */}
                      <div
                        className="flex flex-col w-full relative"
                        ref={destinationRef}
                      >
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          Destination
                        </label>

                        {/* Trigger Box */}
                        <div
                          onClick={() =>
                            !isViewMode && setDestDropdownOpen((p) => !p)
                          }
                          className={`border border-gray-400 h-11 px-3 text-sm rounded-lg w-full flex items-center justify-between
      ${isViewMode ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer focus-within:border-black focus-within:shadow-md"}`}
                        >
                          <span
                            className={
                              formData.destination.length
                                ? "text-gray-800"
                                : "text-black/25"
                            }
                          >
                            {formData.destination.length
                              ? formData.destination.join(", ")
                              : "Select destination(s)"}
                          </span>
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${destDropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {/* Dropdown */}
                        {destDropdownOpen && (
                          <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                            {[
                              "Australia",
                              "Canada",
                              "USA",
                              "UK",
                              "New Zealand",
                              "Germany",
                              "Singapore",
                              "Dubai",
                              "Europe",
                              "Ireland",
                              "Global",
                            ].map((country) => (
                              <label
                                key={country}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.destination.includes(
                                    country,
                                  )}
                                  onChange={() => {
                                    setFormData((prev) => {
                                      const already =
                                        prev.destination.includes(country);
                                      return {
                                        ...prev,
                                        destination: already
                                          ? prev.destination.filter(
                                              (d) => d !== country,
                                            )
                                          : [...prev.destination, country],
                                      };
                                    });
                                  }}
                                  className="accent-indigo-700"
                                />
                                {country}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* City */}
                      {/* <div className="flex flex-col w-full">
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          City
                        </label>
                        <select
                          name="city"
                          value={formData.city}
                          disabled={isViewMode}
                          onChange={handleChange}
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
                      </div> */}
                      {/* City Multi Select */}
                      <div
                        className="flex flex-col w-full relative"
                        ref={cityRef}
                      >
                        <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                          City
                        </label>

                        {/* Trigger */}
                        <div
                          onClick={() =>
                            !isViewMode && setCityDropdownOpen((p) => !p)
                          }
                          className={`border border-gray-400 h-11 px-3 text-sm rounded-lg w-full flex items-center justify-between
    ${isViewMode ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                          <span
                            className={
                              formData.city.length
                                ? "text-gray-800"
                                : "text-black/25"
                            }
                          >
                            {formData.city.length
                              ? formData.city.join(", ")
                              : "Select city(s)"}
                          </span>

                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${
                              cityDropdownOpen ? "rotate-180" : ""
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {/* Dropdown */}
                        {cityDropdownOpen && (
                          <div className="absolute top-[72px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto">
                            {[
                              "Ahmedabad",
                              "Anand",
                              "Chandigarh",
                              "Delhi",
                              "Gandhinagar",
                              "Indore",
                              "Jaipur",
                              "Jamnagar",
                              "Junagadh",
                              "Morbi",
                              "Pune",
                              "Rajkot",
                              "Surat",
                              "Vadodara",
                              "Kathmandu Nepal",
                            ].map((city) => (
                              <label
                                key={city}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.city.includes(city)}
                                  onChange={() => {
                                    setFormData((prev) => {
                                      const already = prev.city.includes(city);
                                      return {
                                        ...prev,
                                        city: already
                                          ? prev.city.filter((c) => c !== city)
                                          : [...prev.city, city],
                                      };
                                    });
                                  }}
                                  className="accent-indigo-700"
                                />
                                {city}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Image */}
                      <div className="flex flex-col w-full sm:col-span-2">
                        {/* Messages */}
                        {error && (
                          <span className="text-red-500 text-xs mt-2">
                            {error}
                          </span>
                        )}

                        {image && !error && (
                          <span className="text-green-600 text-xs mt-2">
                            ✅ Image selected. Click it again to replace.
                          </span>
                        )}
                        <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                          Add Image
                        </label>

                        {/* Hidden Input */}
                        <input
                          ref={inputRef}
                          type="file"
                          accept="image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />

                        {/* Upload Box / Image Preview */}
                        <div
                          onClick={() => !isViewMode && handleClick()}
                          className={`border-indigo-200 border-2  border-dashed p-3 rounded-lg w-full min-h-80 flex items-center justify-center
  ${isViewMode ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
                          // onClick={handleClick}
                          // className="border-indigo-200 border-2 border-dashed p-3 rounded-lg w-full min-h-80 flex items-center justify-center cursor-pointer overflow-hidden hover:border-indigo-800 transition"
                        >
                          {!preview ? (
                            <span className="text-gray-400 text-sm">
                              Click to upload image
                            </span>
                          ) : (
                            <img
                              src={preview}
                              alt="preview"
                              className="w-full h-full object-contain"
                            />
                          )}
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

                      {!isViewMode && (
                        <button
                          onClick={handleSubmit}
                          disabled={isSaving}
                          className="px-6 py-2 bg-indigo-900 rounded-lg text-white flex items-center justify-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                              {isEditMode ? "Updating" : "Saving..."}
                            </>
                          ) : isEditMode ? (
                            "Update"
                          ) : (
                            "Save"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="shadow-md rounded-lg mt-5">
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
                  <th className="p-4 w-1/10">Image</th>
                  <th className="p-4 w-1/10">Event Title</th>
                  <th className="p-4 w-1/10">Date Displayed</th>
                  {/* <th className="p-4 w-1/10">Date(s)</th> */}
                  <th className="p-4 w-1/10">Destination</th>
                  <th className="p-4 w-1/10">City</th>
                  <th className="p-4 w-1/10 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {current_events.map((event) => (
                  <tr
                    key={event.id}
                    className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" />
                    </td>
                    <td className="px-4 py-3 font-semibold">{event.id}</td>
                    <td className="px-4 py-3">
                      <img
                        src={
                          event.imageUrl || "https://via.placeholder.com/100"
                        }
                        alt={event.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3">{event.title}</td>
                    <td className="px-4 py-3">{event.date}</td>
                    {/* <td className="px-4 py-3">{event.dates.join(", ")}</td> */}
                    <td className="px-4 py-3">{event.destination}</td>
                    <td className="px-4 py-3">{event.city}</td>

                    {/* Actions */}
                    <td>
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            handleView(event);
                          }}
                          className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                        >
                          <FaEye size={15} />
                        </button>
                        <>
                          <button
                            // onClick={() => {
                            //   setIsOpen_popupForm(true);
                            // }}
                            onClick={() => {
                              handleEdit(event);
                            }}
                            className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all"
                          >
                            {deletingId === event.id ? (
                              <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                            ) : (
                              <MdDelete size={15} />
                            )}
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
                {indexOfFirst_events + 1}-
                {Math.min(indexOfLast_events, events.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-white">
                {events.length}
              </span>
            </span>

            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
              {/* Prev */}
              <li>
                <button
                  onClick={handlePrevPage_events}
                  disabled={currentPage_events === 1}
                  className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  <MdKeyboardDoubleArrowLeft />
                </button>
              </li>

              {/* Pages */}
              {generatePageNumbers_events().map((page, index) =>
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
                      onClick={() => handlePageChange_events(page)}
                      className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
                        currentPage_events === page
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
                  onClick={handleNextPage_events}
                  disabled={currentPage_events === totalPages_events}
                  className="flex items-center justify-center px-1 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
                >
                  <MdKeyboardDoubleArrowRight />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
};

export default Events;
