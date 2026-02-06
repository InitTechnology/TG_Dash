import React, { useEffect, useRef, useState } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import "../Dashboard/Dashboard.css";
import { TbPhotoPlus } from "react-icons/tb";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa6";
import axios from "axios";
const AddUniversityElementor = () => {
  // const user = JSON.parse(localStorage.getItem("user"));
  // const isAdmin = user?.role?.toLowerCase() === "admin";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const flagUrls = {
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

  // const [universityName, setUniversityName] = useState("");
  // const [country, setCountry] = useState("");
  const [logo, setLogo] = useState(null);
  const [flag, setFlag] = useState(null);

  const logoInputRef = useRef(null);
  const flagInputRef = useRef(null);

  const [courses, setCourses] = useState([{}]);

  // const addCourse = () => {
  //   setCourses([...courses, {}]);
  // };

  // const removeCourse = (index) => {
  //   setCourses(courses.filter((_, i) => i !== index));
  // };

  // -------------------------------
  // STATE MANAGEMENT
  // -------------------------------
  const [country, setCountry] = useState("United States");
  const [stateValue, setStateValue] = useState("");
  const [city, setCity] = useState("");

  const [universityName, setUniversityName] = useState("");
  const [uniInfo, setUniInfo] = useState("");
  const [rankQS, setRankQS] = useState("");
  const [inStudents, setInStudents] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // const [courses, setCourses] = useState([
  //   {
  //     course_name: "",
  //     courseInfo: "",
  //     fees: "",
  //     duration: "",
  //     hostel: "",
  //     scholarship: "",
  //     intake_start: "",
  //     qualification: "",
  //   },
  // ]);

  // -------------------------------
  // IMAGE UPLOAD TO BACKEND
  // -------------------------------
  // const uploadToServer = async (file, setter) => {
  //   try {
  //     const fd = new FormData();
  //     fd.append("logo", file);

  //     const res = await axios.post(
  //       "https://transglobeedu.com/web-backend/upload",
  //       fd,
  //       { headers: { "Content-Type": "multipart/form-data" } },
  //     );

  //     setter(res.data.url);
  //   } catch (error) {
  //     console.error("Upload failed:", error);
  //     alert("Image upload failed!");
  //   }
  // };

  // -------------------------------
  // COURSE MANAGERS
  // -------------------------------
  const updateCourse = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  const addCourse = () => {
    setCourses([
      ...courses,
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
  };

  const removeCourse = (index) => {
    if (courses.length === 1) return;
    setCourses(courses.filter((_, i) => i !== index));
  };

  // -------------------------------
  // SAVE UNIVERSITY
  // -------------------------------
  // const handleSave = async () => {
  //   try {
  //     const payload = {
  //       name: universityName,
  //       country,
  //       state: stateValue,
  //       city,
  //       logo_url: uploadedLogoUrl,
  //       flag_url: uploadedFlagUrl,
  //       uniInfo,
  //       rankQS,
  //       inStudents,
  //       courses,
  //     };

  //     const res = await axios.post(
  //       "https://transglobeedu.com/web-backend/university/add",
  //       payload,
  //     );

  //     alert("University saved successfully!");

  //     console.log("✔ Response:", res.data);
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error saving university");
  //   }
  // };
  const handleSave = async () => {
    try {
      const fd = new FormData();

      // append file (REAL FILE not preview URL)
      if (logoInputRef.current.files[0]) {
        fd.append("logo", logoInputRef.current.files[0]);
      }

      // append text fields
      fd.append("name", universityName);
      fd.append("country", country);
      fd.append("state", stateValue);
      fd.append("city", city);
      fd.append("uniInfo", uniInfo);
      fd.append("websiteUrl", websiteUrl);
      fd.append("rankQS", rankQS);
      fd.append("inStudents", inStudents);

      // courses → send as JSON string
      fd.append("courses", JSON.stringify(courses));

      const res = await axios.post(
        "https://transglobeedu.com/web-backend/university/add",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      alert("University saved successfully!");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      alert("Error saving university");
    }
  };
  const handleScrapeData = async () => {
    try {
      if (!universityName || !country) {
        alert("Please enter university name and select country.");
        return;
      }

      const res = await axios.post(
        "https://transglobeedu.com/web-backend/fetch-university-courses",
        {
          universityName,
          country,
        },
      );

      if (!res.data.success) {
        alert("Scraping failed");
        return;
      }

      const data = res.data.data;

      // -----------------------------
      // SET UNIVERSITY DATA
      // -----------------------------
      setUniInfo(data.university_info || "");
      setRankQS(data.world_rank?.qs_ranking || "");
      setInStudents(data.international_students?.total_count || "");
      setWebsiteUrl(""); // scraper did not return website_url

      // -----------------------------
      // SET COURSES
      // -----------------------------
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

      setCourses(parsedCourses);

      alert("Scrape successful! Data autofilled.");
    } catch (error) {
      console.error("Scrape error:", error);
      alert("Error scraping data");
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
              Add University Elementor
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
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;

                  setLogo(URL.createObjectURL(file)); // preview
                  // upload
                }}
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

              {/* <input
                type="file"
                ref={flagInputRef}
                accept="image/*"
                hidden
                onChange={(e) => {
                  const selected = e.target.value;
                  setCountry(selected);
                  setFlag(flagUrls[selected] || ""); // 👈 automatically set flag URL
                }}
              /> */}

              <select
                value={country}
                // onChange={(e) => setCountry(e.target.value)}
                onChange={(e) => {
                  const selected = e.target.value;
                  setCountry(selected);
                  setFlag(flagUrls[selected] || ""); // 👈 auto-sets the flag
                }}
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

          <div className="flex flex-col w-full mt-5">
            <label
              for="input"
              className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
            >
              University Website Link
            </label>
            <input
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
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
                {universityName || "University Name"}{" "}
                <span className="text-[#B31312] dark:text-white font-normal">
                  Details
                </span>
              </p>

              <div className="mb-5">
                <button
                  onClick={handleScrapeData}
                  className="px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
                >
                  Scrape Uni Info
                </button>
              </div>
            </div>

            <textarea
              value={uniInfo}
              onChange={(e) => setUniInfo(e.target.value)}
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

              {/* <div>
                <button className="px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out">
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
                        updateCourse(index, "course_name", e.target.value)
                      }
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
                      value={courses[index].courseInfo}
                      onChange={(e) =>
                        updateCourse(index, "courseInfo", e.target.value)
                      }
                      placeholder="Enter course information here..."
                      className="w-full h-24 border-b border-gray-300 focus:outline-none focus:ring-0"
                    ></textarea>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">
                        Fee Details:{" "}
                      </p>
                      <textarea
                        type="text"
                        value={courses[index].fees}
                        onChange={(e) =>
                          updateCourse(index, "fees", e.target.value)
                        }
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
                        value={courses[index].qualification}
                        onChange={(e) =>
                          updateCourse(index, "qualification", e.target.value)
                        }
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Qualification description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Hostel:</p>
                      <textarea
                        type="text"
                        value={courses[index].hostel}
                        onChange={(e) =>
                          updateCourse(index, "hostel", e.target.value)
                        }
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
                          value={courses[index].scholarship}
                          onChange={(e) =>
                            updateCourse(index, "scholarship", e.target.value)
                          }
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
                              value={courses[index].schStartDate}
                              onChange={(e) =>
                                updateCourse(
                                  index,
                                  "schStartDate",
                                  e.target.value,
                                )
                              }
                              className="text-sm w-32 border border-[#2B2A4C] rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                            />
                            -
                            <input
                              type="date"
                              value={courses[index].schEndDate}
                              onChange={(e) =>
                                updateCourse(
                                  index,
                                  "schEndDate",
                                  e.target.value,
                                )
                              }
                              className="text-sm w-32 border border-[#2B2A4C] rounded-md px-2 py-1 focus:outline-none focus:ring-0"
                            />
                          </div>
                        </div>

                        <div>
                          Is it for Indian Students?{" "}
                          <input
                            type="checkbox"
                            checked={courses[index].isforIndian}
                            onChange={(e) =>
                              updateCourse(
                                index,
                                "isforIndian",
                                e.target.checked,
                              )
                            }
                            className="ml-2"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Duration:</p>
                      <textarea
                        type="text"
                        value={courses[index].duration}
                        onChange={(e) =>
                          updateCourse(index, "duration", e.target.value)
                        }
                        className="mt-1 border-b border-gray-300 focus:outline-none focus:ring-0 w-full"
                        placeholder="Course duration description..."
                      />
                    </div>

                    <div>
                      <p className="font-medium text-[#2B2A4C]">Intake:</p>
                      <textarea
                        type="text"
                        value={courses[index].intake_start}
                        onChange={(e) =>
                          updateCourse(index, "intake_start", e.target.value)
                        }
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

            {/* <button
              onClick={handleScrapeData}
              className="w-36 px-3 py-1.5 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
            >
              Scrape Data
            </button> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5">
            <div className="flex flex-col w-full">
              <label
                for="input"
                className="text-gray-500 text-sm font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
              >
                State
              </label>
              <input
                value={stateValue}
                onChange={(e) => setStateValue(e.target.value)}
                placeholder="Enter university state"
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter university city"
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
                value={rankQS}
                onChange={(e) => setRankQS(e.target.value)}
                placeholder="Enter university rank"
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
                value={inStudents}
                onChange={(e) => setInStudents(e.target.value)}
                placeholder="No. of international students"
                className="bg-[#F8F9FA] border-gray-400 p-3 border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
              />
            </div>
          </div>

          <br />

          <div className="flex justify-center gap-3 my-8">
            <button className="w-28 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="w-28 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddUniversityElementor;
