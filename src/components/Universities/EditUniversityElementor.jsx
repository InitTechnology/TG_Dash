import React, { useEffect, useRef, useState } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { TbPhotoPlus } from "react-icons/tb";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { IoAlertSharp } from "react-icons/io5";

const EditUniversityElementor = () => {
  // const user = JSON.parse(localStorage.getItem("user"));
  // const isAdmin = user?.role?.toLowerCase() === "admin";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

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

  const [universityName, setUniversityName] = useState("");
  const [country, setCountry] = useState("");
  const [logo, setLogo] = useState(null);
  const [flag, setFlag] = useState(null);

  const logoInputRef = useRef(null);
  const flagInputRef = useRef(null);

  const handleImage = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    setter(URL.createObjectURL(file));
  };

  const [courses, setCourses] = useState([{}]);

  const addCourse = () => {
    setCourses([...courses, {}]);
  };

  const removeCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const [showPopup, setShowPopup] = useState(false);

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
              Edit University Elementor
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {/* Banner */}
          <div className="px-5 h-[50vh] w-full bg-[#E7E7F8] rounded-2xl flex flex-col items-center justify-center">
            {/* Logo Upload */}
            <div className="flex flex-col items-center">
              <div className="h-28 bg-white p-2 rounded-md border-2 border-dashed border-[#2B2A4C] flex items-center justify-center">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="max-h-full"
                    accept="image/webp"
                  />
                ) : (
                  <span className="text-xs text-[#2B2A4C]/60 text-center">
                    Upload
                    <br />
                    University Logo
                  </span>
                )}
              </div>

              <button
                onClick={() => logoInputRef.current.click()}
                className="flex items-center ml-auto gap-1 text-xs text-[#2B2A4C] mt-2 bg-white/50 py-1 px-2 rounded hover:bg-white"
              >
                {logo ? "Replace" : "Upload"} <TbPhotoPlus />
              </button>

              <input
                type="file"
                ref={logoInputRef}
                accept="image/webp"
                hidden
                onChange={(e) => handleImage(e, setLogo)}
              />
            </div>

            {/* University Name */}
            <input
              type="text"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              placeholder="University Name"
              className="mt-5 font-bold text-[#2B2A4C] text-xl sm:text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl bg-transparent outline-none text-center border-b-2 border-[#2B2A4C] placeholder:text-[#2B2A4C]/20"
              style={{ lineHeight: 1.3 }}
            />

            {/* Flag + Country */}
            <div className="flex gap-2 items-center mt-2">
              {/* Flag Upload */}
              <div
                onClick={() => flagInputRef.current.click()}
                className="h-4 w-6 border border-dashed border-[#2B2A4C] flex items-center justify-center cursor-pointer"
              >
                {flag ? (
                  <img src={flag} alt="Flag" className="h-full w-auto" />
                ) : (
                  <span className="text-[8px] text-[#2B2A4C]/60">Flag</span>
                )}
              </div>

              <input
                type="file"
                ref={flagInputRef}
                accept="image/*"
                hidden
                onChange={(e) => handleImage(e, setFlag)}
              />

              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent outline-none border-b border-[#2B2A4C] text-sm text-left w-24 text-[#2B2A4C]"
              >
                <option value="" disabled>
                  Country
                </option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col w-full mt-5">
            <label
              for="input"
              className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
            >
              University Website Link
            </label>
            <input
              placeholder="Enter university website link to scrape data from"
              name="input"
              className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
            />
          </div>

          {/* University Info */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <p
                className="font-bold text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-[#2B2A4C] mb-3"
                style={{ lineHeight: 1.3 }}
              >
                $UniversityName{" "}
                <span className="text-[#B31312] dark:text-white font-normal">
                  Details
                </span>
              </p>

              <div className="mb-5">
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
                >
                  Scrape Uni Info
                </button>
              </div>
            </div>

            <textarea
              className="w-full leading-relaxed bg-transparent focus:outline-none border-b border-[#2B2A4C] placeholder:text-[#2B2A4C]/50 pb-20"
              placeholder="Enter university details here..."
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p
                className="font-bold text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-[#2B2A4C] mt-10"
                style={{ lineHeight: 1.3 }}
              >
                Available{" "}
                <span className="text-[#B31312] dark:text-white font-normal">
                  Courses
                </span>
              </p>

              <div>
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
                >
                  Scrape Courses
                </button>
              </div>
            </div>
          </div>

          {courses.map((course, index) => (
            <>
              <div key={index} className="mt-5 space-y-4">
                <div className="border border-gray-300 rounded-xl bg-white">
                  {/* Header */}
                  <div className="w-full px-5 py-4 bg-[#F7F7FB] rounded-t-xl">
                    <p className="font-semibold text-lg md:text-xl text-[#2B2A4C]">
                      Course Name
                    </p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="px-5 pb-5 text-sm md:text-base text-gray-600 space-y-5 mt-3"
                  >
                    <textarea
                      placeholder="Enter course information here..."
                      className="w-full h-24 border-b border-gray-300 focus:outline-none focus:ring-0"
                    ></textarea>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">
                        Fee Details:{" "}
                      </p>
                      <textarea
                        type="text"
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Fee details description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">
                        Qualification:{" "}
                      </p>

                      <textarea
                        type="text"
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Qualification description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Hostel:</p>
                      <textarea
                        type="text"
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Hostel description..."
                      />
                    </div>

                    <div>
                      <div>
                        <p className="font-medium text-[#2B2A4C]">
                          Scholarship:
                        </p>
                        <textarea
                          type="text"
                          className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                          placeholder="Scholarship description..."
                        />
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mt-3 mb-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <p className="font-medium text-[#2B2A4C]">
                            Scholarship Application Period:{" "}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            <input
                              type="date"
                              className="text-sm w-32 border border-[#2B2A4C] rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                            />
                            -
                            <input
                              type="date"
                              className="text-sm w-32 border border-[#2B2A4C] rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>

                        <div>
                          Is it for Indian Students?{" "}
                          <input type="checkbox" className="ml-2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Duration:</p>
                      <textarea
                        type="text"
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Course duration description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Intake:</p>
                      <textarea
                        type="text"
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Intake description..."
                      />
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="flex justify-end gap-2 items-center mt-2">
                {index !== 0 && (
                  <button
                    onClick={() => removeCourse(index)}
                    className="p-2 border border-indigo-900 rounded-full text-indigo-900 hover:scale-95 transition-all duration-300"
                  >
                    <FaMinus />
                  </button>
                )}

                <button
                  onClick={addCourse}
                  className="p-2 bg-indigo-900 rounded-full text-white hover:scale-95 transition-all duration-300"
                >
                  <FaPlus />
                </button>
              </div>
            </>
          ))}

          <hr className="border-t border-gray-300 mx-[10%] mt-10 mb-14" />

          {/* Additional Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="font-semibold text-lg text-gray-700">
              Additional Information{" "}
              <span className="text-xs">
                (Used internally and may not be displayed)
              </span>{" "}
            </p>

            <button
              onClick={() => setShowPopup(true)}
              className="w-36 px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
            >
              Scrape Data
            </button>
          </div>

          {showPopup && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setShowPopup(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg mx-4 bg-white rounded-xl px-4 py-6"
              >
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-1.5 right-3 text-gray-400 hover:text-black text-lg"
                >
                  ✕
                </button>

                <h2 className="flex gap-2 items-center text-xl sm:text-2xl font-semibold text-red-700">
                  <IoAlertSharp
                    size={28}
                    className="rounded-full text-white bg-red-700 p-0.5"
                  />
                  Attention
                </h2>

                <p className="leading-relaxed mt-5">
                  This action will replace current data with new data.
                  <br />
                  Once scraped, the old data will be lost.
                  <br />
                  <br />
                  <span className="font-medium text-red-800">Note:</span> Best
                  practice is to copy the current data before replacing.
                </p>

                <div className="flex justify-end gap-3 mt-5">
                  <button
                    onClick={() => {
                      setShowPopup(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-800 text-white hover:bg-red-700 transition"
                  >
                    Replace Data
                  </button>

                  <button
                    onClick={() => setShowPopup(false)}
                    className="px-4 py-2 rounded-lg border border-[#2B2A4C] text-[#2B2A4C] hover:bg-[#2B2A4C] hover:text-white transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
            <div className="flex flex-col w-full">
              <label
                for="input"
                className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
              >
                State
              </label>
              <input
                placeholder="Enter university state"
                name="input"
                className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
              />
            </div>

            <div className="flex flex-col w-full">
              <label
                for="input"
                className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
              >
                City
              </label>
              <input
                placeholder="Enter university city"
                name="input"
                className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
              />
            </div>

            <div className="flex flex-col w-full">
              <label
                for="input"
                className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
              >
                Rank
              </label>
              <input
                placeholder="Enter university rank"
                name="input"
                className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
              />
            </div>

            <div className="flex flex-col w-full">
              <label
                for="input"
                className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
              >
                International Students
              </label>
              <input
                placeholder="No. of international students"
                name="input"
                className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
              />
            </div>
          </div>

          <br />

          <div className="flex justify-center gap-3 my-8">
            <button className="w-28 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
              Cancel
            </button>

            <button className="w-28 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditUniversityElementor;
