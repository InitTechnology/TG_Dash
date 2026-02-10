import React, { useEffect, useRef, useState } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { TbPhotoPlus } from "react-icons/tb";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import { IoAlertSharp } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import { useMemo } from "react";
const EditUniversityElementor = () => {
  const navigate = useNavigate(); // inside your component
  const location = useLocation();
  const isViewMode = location.state?.viewOnly === true;
  const disableIfView = isViewMode ? { disabled: true } : {};

  const [saving, setSaving] = useState(false); // inside your component
  const { uni_id } = useParams();

  // Use uni_id directly in your API call
  const uniId = uni_id;
  // const user = JSON.parse(localStorage.getItem("user"));
  // const isAdmin = user?.role?.toLowerCase() === "admin";
  const [scraping, setScraping] = useState(false);
  // const [rankQS, setRankQS] = useState("");
  // const [inStudents, setInStudents] = useState("");
  const [website, setWebsite] = useState("");
  const [uniInfo, setUniInfo] = useState("");
  const [stateName, setStateName] = useState("");
  const [city, setCity] = useState("");
  const [rank, setRank] = useState("");
  const [internationalStudents, setInternationalStudents] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const flagUrls = useMemo(
    () => ({
      Australia:
        "https://cdn.britannica.com/78/6078-050-18D5DEFE/Flag-Australia.jpg",
      Canada:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/1200px-Flag_of_Canada_%28Pantone%29.svg.png",
      UK: "https://cdn.britannica.com/25/4825-050-977D8C5E/Flag-United-Kingdom.jpg",
      USA: "https://upload.wikimedia.org/wikipedia/commons/9/96/Flag_of_the_United_States_%28DDD-F-416E_specifications%29.svg",
      Germany:
        "https://img.freepik.com/free-vector/illustration-german-flag_53876-27101.jpg?semt=ais_hybrid&w=740&q=80",
      Dubai:
        "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
      Europe:
        "https://img.freepik.com/free-vector/illustration-european-union-flag_53876-27018.jpg?semt=ais_hybrid&w=740&q=80",
      Ireland:
        "https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg",
      Singapore:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/1200px-Flag_of_Singapore.svg.png",
      "New Zealand":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1200px-Flag_of_New_Zealand.svg.png",
    }),
    [],
  );

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
  // useEffect(() => {
  //   fetch(`https://transglobeedu.com/web-backend/university/${uniId}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (!data.success) return;

  //       const u = data.university;

  //       setUniversityName(u.name || "");
  //       setCountry(u.country || "");
  //       setStateName(u.state || "");
  //       setCity(u.city || "");
  //       setRank(u.rankQS || "");
  //       setInternationalStudents(u.inStudents || "");
  //       setWebsite(u.websiteUrl || "");
  //       setUniInfo(u.uniInfo || "");

  //       if (u.logo_url) setLogo(u.logo_url);

  //       setCourses(
  //         data.courses.map((course) => ({
  //           course_name: course.course_name || "",
  //           fees: course.fees || "",
  //           qualification: course.qualification || "",
  //           hostel: course.hostel || "",
  //           scholarship: course.scholarship || "",
  //           schStartDate: course.schStartDate || "",
  //           schEndDate: course.schEndDate || "",
  //           isforIndian: course.isforIndian === 1,
  //           duration: course.duration || "",
  //           intake_start: course.intake_start || "",
  //           courseInfo: course.courseInfo || "",
  //         })),
  //       );
  //     })
  //     .catch((err) => console.error("Error fetching university:", err));
  // }, [uniId]);
  useEffect(() => {
    if (country) {
      setFlag(flagUrls[country] || null);
    }
  }, [country, flagUrls]);

  useEffect(() => {
    fetch(`https://transglobeedu.com/web-backend/university/${uniId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) return;

        const u = data.university;

        setUniversityName(u.name || "");
        setCountry(u.country || "");
        setStateName(u.state || "");
        setCity(u.city || "");
        setRank(u.rankQS || "");
        setInternationalStudents(u.inStudents || "");
        setWebsite(u.websiteUrl || "");
        setUniInfo(u.uniInfo || "");

        if (u.logo_url) setLogo(u.logo_url);

        // -----------------------------
        // FIX: Ensure courses always exists
        // -----------------------------
        if (Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(
            data.courses.map((course) => ({
              course_name: course.course_name || "",
              fees: course.fees || "",
              qualification: course.qualification || "",
              hostel: course.hostel || "",
              scholarship: course.scholarship || "",
              schStartDate: course.schStartDate || "",
              schEndDate: course.schEndDate || "",
              isforIndian: course.isforIndian === 1,
              duration: course.duration || "",
              intake_start: course.intake_start || "",
              courseInfo: course.courseInfo || "",
            })),
          );
        } else {
          // Show one empty form block if no courses exist
          setCourses([
            {
              course_name: "",
              courseInfo: "",
              fees: "",
              duration: "",
              hostel: "",
              scholarship: "",
              intake_start: "",
              qualification: "",
              schStartDate: "",
              schEndDate: "",
              isforIndian: false,
            },
          ]);
        }
      })
      .catch((err) => console.error("Error fetching university:", err));
  }, [uniId]);

  const handleSave = async () => {
    setSaving(true);

    const formData = new FormData();

    // University basic details
    formData.append("name", universityName);
    formData.append("country", country);
    formData.append("state", stateName);
    formData.append("city", city);
    formData.append("websiteUrl", website);
    formData.append("uniInfo", uniInfo);
    formData.append("rankQS", rank);
    formData.append("inStudents", internationalStudents);

    // Logo upload (only if new file selected)
    if (logoInputRef.current?.files[0]) {
      formData.append("logo", logoInputRef.current.files[0]);
    }

    // Flag upload (optional)
    if (flagInputRef.current?.files[0]) {
      formData.append("flag", flagInputRef.current.files[0]);
    }

    // Convert courses array → backend expects STRING
    const coursesData = courses.map((course) => ({
      ...course,
      isforIndian: course.isforIndian ? 1 : 0, // convert boolean to 1/0
    }));
    formData.append("courses", JSON.stringify(coursesData));

    try {
      const res = await fetch(
        `https://transglobeedu.com/web-backend/university/${uniId}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("University updated successfully!");
        navigate("/universities"); // redirect after save
      } else {
        alert("Update failed: " + data.message);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating university.");
    } finally {
      setSaving(false);
    }
  };
  const handleScrapeDataEdit = async () => {
    try {
      if (!universityName || !country || !stateName || !website) {
        alert("Please enter university name , country , state and websiteURL.");
        return;
      }

      setScraping(true);

      const res = await axios.post(
        "https://transglobeedu.com/web-backend/fetch-university-courses",
        {
          universityName,
          country,
          stateValue: stateName,
          websiteUrl: website,
        },
      );

      if (!res.data.success) {
        alert("Scraping failed");
        return;
      }

      const data = res.data.data;

      // --------------------------------
      // UPDATE UNIVERSITY INFO (if exists)
      // --------------------------------
      if (data.university_info) setUniInfo(data.university_info);

      if (data.world_rank?.qs_ranking) setRank(data.world_rank.qs_ranking);

      if (data.international_students?.total_count)
        setInternationalStudents(data.international_students.total_count);

      // --------------------------------
      // UPDATE COURSES (replace with scraped)
      // --------------------------------
      const parsedCourses = (data.courses || []).map((c) => ({
        course_name: c.course_name || "",
        courseInfo: c.course_info || "",
        fees: c.course_fees || "",
        duration: c.course_duration || "",
        hostel: c.hostel_fees || "",
        scholarship: c.scholarship || "",
        intake_start: c.course_start_date || "",
        qualification: c.course_qualification || "",
        schStartDate: "",
        schEndDate: "",
        isforIndian: false,
      }));

      if (parsedCourses.length > 0) {
        setCourses(parsedCourses);
      }

      alert("Scrape successful! Data updated.");
    } catch (error) {
      console.error("Scrape error:", error);
      alert("Error scraping data");
    } finally {
      setScraping(false);
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
              {...disableIfView}
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
                onChange={(e) => {
                  const selected = e.target.value;
                  setCountry(selected);
                  setFlag(flagUrls[selected] || "");
                }}
                {...disableIfView}
                // onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent outline-none border-b border-[#2B2A4C] text-sm text-left w-24 text-[#2B2A4C]"
              >
                <option value="" disabled>
                  Country
                </option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
                <option value="New Zealand">New Zealand</option>
                <option value="Germany">Germany</option>
                <option value="Dubai">Dubai</option>
                <option value="Europe">Europe</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
          </div>

          <hr className="border-t border-gray-300 my-12" />

          <div className="lg:mx-[5%]">
            <div className="flex flex-col w-full mt-5">
              <p className="font-semibold text-center text-xl text-gray-700 mb-5">
                Additional Information{" "}
                <span className="text-xs">
                  (Used internally and may not be displayed)
                </span>{" "}
              </p>

              <label
                for="input"
                className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
              >
                University Website Link
              </label>
              <input
                placeholder="Enter university website link to scrape data from"
                onChange={(e) => setWebsite(e.target.value)}
                value={website}
                {...disableIfView}
                className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
              />
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
                  // name="input"
                  value={stateName}
                  {...disableIfView}
                  onChange={(e) => setStateName(e.target.value)}
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
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  {...disableIfView}
                  // name="input"
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
                  // name="input"
                  value={rank}
                  onChange={(e) => setRank(e.target.value)}
                  {...disableIfView}
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
                  // name="input"
                  value={internationalStudents}
                  onChange={(e) => setInternationalStudents(e.target.value)}
                  {...disableIfView}
                  className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                />
              </div>
            </div>
          </div>

          <hr className="border-t border-gray-300 my-14" />

          {/* University Info */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <p
                className="font-bold text-2xl md:text-3xl lg:text-4xl 2xl:text-5xl text-[#2B2A4C] mb-3"
                style={{ lineHeight: 1.3 }}
              >
                {universityName || "University Name"}{" "}
                <span className="text-[#B31312] dark:text-white font-normal">
                  Details
                </span>
              </p>

              <div className="mb-5">
                <button
                  // onClick={() => setShowPopup(true)}
                  onClick={handleScrapeDataEdit}
                  disabled={isViewMode || scraping}
                  className="px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
                >
                  {scraping ? "Scraping..." : "Scrape Data"}
                </button>
              </div>
            </div>

            <textarea
              className="w-full leading-relaxed bg-transparent focus:outline-none border-b border-[#2B2A4C] placeholder:text-[#2B2A4C]/50 pb-20"
              placeholder="Enter university details here..."
              value={uniInfo}
              {...disableIfView}
              onChange={(e) => setUniInfo(e.target.value)}
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

              {/* <div>
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
                >
                  Scrape Courses
                </button>
              </div> */}
            </div>
          </div>

          {courses.map((course, index) => (
            <>
              <div key={index} className="mt-5 space-y-4">
                <div className="border border-gray-300 rounded-xl bg-white">
                  {/* Header */}
                  <div className="w-full px-5 py-4 bg-[#F7F7FB] rounded-t-xl">
                    <input
                      type="text"
                      value={courses[index].course_name}
                      onChange={(e) =>
                        setCourses((prev) => {
                          const updated = [...prev];
                          updated[index].course_name = e.target.value;
                          return updated;
                        })
                      }
                      {...disableIfView}
                      className="w-full lg:w-[50%] font-semibold text-lg md:text-xl text-[#2B2A4C] outline-none focus:outline-none focus:ring-0 bg-transparent border-b-2 border-[#2B2A4C]"
                      placeholder="Enter Course Name"
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="px-5 pb-5 text-sm md:text-base text-gray-600 space-y-5 mt-3"
                  >
                    <textarea
                      placeholder="Enter course information here..."
                      value={course.courseInfo}
                      onChange={(e) =>
                        setCourses((prev) => {
                          const updated = [...prev];
                          updated[index].courseInfo = e.target.value;
                          return updated;
                        })
                      }
                      {...disableIfView}
                      className="w-full h-24 border-b border-gray-300 focus:outline-none focus:ring-0"
                    ></textarea>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">
                        Fee Details:{" "}
                      </p>
                      <textarea
                        type="text"
                        value={course.fees}
                        onChange={(e) =>
                          setCourses((prev) => {
                            const updated = [...prev];
                            updated[index].fees = e.target.value;
                            return updated;
                          })
                        }
                        {...disableIfView}
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
                        value={course.qualification}
                        onChange={(e) =>
                          setCourses((prev) => {
                            const updated = [...prev];
                            updated[index].qualification = e.target.value;
                            return updated;
                          })
                        }
                        {...disableIfView}
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Qualification description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Hostel:</p>
                      <textarea
                        type="text"
                        value={course.hostel}
                        onChange={(e) =>
                          setCourses((prev) => {
                            const updated = [...prev];
                            updated[index].hostel = e.target.value;
                            return updated;
                          })
                        }
                        {...disableIfView}
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
                          value={course.scholarship}
                          onChange={(e) =>
                            setCourses((prev) => {
                              const updated = [...prev];
                              updated[index].scholarship = e.target.value;
                              return updated;
                            })
                          }
                          {...disableIfView}
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
                              value={course.schStartDate || ""}
                              onChange={(e) =>
                                setCourses((prev) => {
                                  const updated = [...prev];
                                  updated[index].schStartDate = e.target.value;
                                  return updated;
                                })
                              }
                              {...disableIfView}
                              className="text-sm w-32 border border-[#2B2A4C] rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                            />
                            -
                            <input
                              type="date"
                              value={course.schEndDate || ""}
                              onChange={(e) =>
                                setCourses((prev) => {
                                  const updated = [...prev];
                                  updated[index].schEndDate = e.target.value;
                                  return updated;
                                })
                              }
                              {...disableIfView}
                              className="text-sm w-32 border border-[#2B2A4C] rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>

                        <div>
                          Is it for Indian Students?{" "}
                          <input
                            type="checkbox"
                            checked={course.isforIndian}
                            onChange={(e) =>
                              setCourses((prev) => {
                                const updated = [...prev];
                                updated[index].isforIndian = e.target.checked;
                                return updated;
                              })
                            }
                            {...disableIfView}
                            className="ml-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Duration:</p>
                      <textarea
                        type="text"
                        value={course.duration}
                        onChange={(e) =>
                          setCourses((prev) => {
                            const updated = [...prev];
                            updated[index].duration = e.target.value;
                            return updated;
                          })
                        }
                        {...disableIfView}
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Course duration description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Intake:</p>
                      <textarea
                        type="text"
                        value={course.intake_start}
                        onChange={(e) =>
                          setCourses((prev) => {
                            const updated = [...prev];
                            updated[index].intake_start = e.target.value;
                            return updated;
                          })
                        }
                        {...disableIfView}
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

          <br />

          <div className="flex justify-center gap-3 my-8">
            <Link to="/Universities">
              <button className="w-28 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
                Cancel
              </button>
            </Link>
            <button
              onClick={handleSave}
              disabled={isViewMode || saving}
              className="w-28 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditUniversityElementor;
