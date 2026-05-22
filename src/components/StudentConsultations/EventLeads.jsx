import React, { useState, useEffect, useRef } from "react";
import "../Dashboard/Dashboard.css";
// import { Tooltip } from "antd";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { MdCancel } from "react-icons/md";

const EventLeads = () => {
  const [eventLeads] = useState([
    {
      id: 1,
      eventName: "event 1",
      eventCity: "Ahmedabad",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "9876543210",
    },
    {
      id: 2,
      eventName: "USA Admission Seminar",
      eventCity: "Rajkot",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "9876543211",
    },
    {
      id: 3,
      eventName: "Australia Education Expo",
      eventCity: "Surat",
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      phone: "9876543212",
    },
  ]);

  const rowsPerPage_eventLeads = 5;
  const [currentPage_eventLeads, setCurrentPage_eventLeads] = useState(1);

  const totalPages_eventLeads = Math.ceil(
    eventLeads.length / rowsPerPage_eventLeads,
  );

  const indexOfLast_eventLeads =
    currentPage_eventLeads * rowsPerPage_eventLeads;
  const indexOfFirst_eventLeads =
    indexOfLast_eventLeads - rowsPerPage_eventLeads;

  const current_eventLeads = eventLeads.slice(
    indexOfFirst_eventLeads,
    indexOfLast_eventLeads,
  );

  const handleNextPage_eventLeads = () => {
    if (currentPage_eventLeads < totalPages_eventLeads) {
      setCurrentPage_eventLeads(currentPage_eventLeads + 1);
    }
  };

  const handlePrevPage_eventLeads = () => {
    if (currentPage_eventLeads > 1) {
      setCurrentPage_eventLeads(currentPage_eventLeads - 1);
    }
  };

  const handlePageChange_eventLeads = (page) => {
    setCurrentPage_eventLeads(page);
  };

  const generatePageNumbers_eventLeads = () => {
    const pages = [];

    if (totalPages_eventLeads <= 5) {
      for (let i = 1; i <= totalPages_eventLeads; i++) pages.push(i);
    } else {
      if (currentPage_eventLeads > 2) pages.push(1, "…");

      for (
        let i = currentPage_eventLeads - 1;
        i <= currentPage_eventLeads + 1;
        i++
      ) {
        if (i > 0 && i <= totalPages_eventLeads) pages.push(i);
      }

      if (currentPage_eventLeads < totalPages_eventLeads - 1)
        pages.push("…", totalPages_eventLeads);
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

  const [isOpen_popupForm_eventLeads, setIsOpen_popupForm_eventLeads] =
    useState(false);

  const handleClosePopup_eventLeads = () => {
    setIsOpen_popupForm_eventLeads(false);
  };

  return (
    <div className="">
      {/* Button */}
      <div className="mt-8">
        <div className="flex gap-4 w-full justify-between">
          <select class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer">
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

          <div>
            <button
              onClick={() => {
                setIsOpen_popupForm_eventLeads(true);
              }}
              className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
            >
              + Add Leads
            </button>

            <div className="relative z-50">
              {isOpen_popupForm_eventLeads && (
                <div
                  onClick={handleClosePopup_eventLeads}
                  className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop_popupForm"
                />
              )}

              <div
                className={`fixed top-0 right-0 h-full w-[85%] md:w-[680px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
                  isOpen_popupForm_eventLeads
                    ? "translate-x-0"
                    : "translate-x-full"
                } panel_popupForm`}
              >
                <div className="p-4 flex justify-between items-start border-b header_popupForm">
                  <div>
                    <h2 className="text-[#1D2826] text-lg font-semibold">
                      Add Event
                    </h2>
                  </div>

                  <button
                    onClick={handleClosePopup_eventLeads}
                    className="text-gray-500 hover:text-black text-xl"
                  >
                    <MdCancel />
                  </button>
                </div>

                <div className="max-h-[90vh] overflow-y-auto p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
                    {/* ID */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        ID
                      </label>
                      <p className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md">
                        01
                      </p>
                    </div>

                    {/* Name */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        Name
                      </label>
                      <input
                        placeholder="Enter name"
                        required
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>

                    {/* Email Address */}
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
                      >
                        Email Address
                      </label>
                      <input
                        placeholder="Enter email address"
                        required
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>

                    {/* Phone Number */}
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
                        className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>

                    {/* Event */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Select Event
                      </label>
                      <select className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md">
                        <option value="">Select</option>
                        <option value="">event 1</option>
                        <option value="">event 2</option>
                        <option value="">event 3</option>
                        <option value="">event 4</option>
                        <option value="">event 5</option>
                      </select>
                    </div>

                    {/* Event City */}
                    <div className="flex flex-col w-full">
                      <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                        Event City
                      </label>
                      <select className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md">
                        <option value="">Select</option>
                        <option value="">City 1</option>
                        <option value="">City 2</option>
                        <option value="">City 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-10">
                    <button
                      onClick={handleClosePopup_eventLeads}
                      className="w-36 px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                    >
                      Cancel
                    </button>

                    <button className="w-36 px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
                      Save
                    </button>
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
                <th className="p-4">ID</th>
                <th className="p-4 w-1/10">Name</th>
                <th className="p-4 w-1/10">Email Address</th>
                <th className="p-4 w-1/10">Phone Number</th>
                <th className="p-4 w-1/10">Event Name</th>
                <th className="p-4 w-1/10">Event City</th>
                <th className="p-4 w-1/10 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {current_eventLeads.map((event) => (
                <tr
                  key={event.id}
                  className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                >
                  <td className="px-4 py-3 font-semibold">{event.id}</td>

                  <td className="px-4 py-3">{event.name}</td>
                  <td className="px-4 py-3">{event.email}</td>
                  <td className="px-4 py-3">{event.phone}</td>
                  <td className="px-4 py-3">{event.eventName}</td>
                  <td className="px-4 py-3">{event.eventCity}</td>

                  {/* Actions */}
                  <td>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setIsOpen_popupForm_eventLeads(true);
                        }}
                        className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                      >
                        <FaEye size={15} />
                      </button>
                      <>
                        <button
                          onClick={() => {
                            setIsOpen_popupForm_eventLeads(true);
                          }}
                          className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                        >
                          <FaEdit size={14} />
                        </button>
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
              {indexOfFirst_eventLeads + 1}-
              {Math.min(indexOfLast_eventLeads, eventLeads.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700 dark:text-white">
              {eventLeads.length}
            </span>
          </span>

          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
            {/* Prev */}
            <li>
              <button
                onClick={handlePrevPage_eventLeads}
                disabled={currentPage_eventLeads === 1}
                className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
              >
                <MdKeyboardDoubleArrowLeft />
              </button>
            </li>

            {/* Pages */}
            {generatePageNumbers_eventLeads().map((page, index) =>
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
                    onClick={() => handlePageChange_eventLeads(page)}
                    className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
                      currentPage_eventLeads === page
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
                onClick={handleNextPage_eventLeads}
                disabled={currentPage_eventLeads === totalPages_eventLeads}
                className="flex items-center justify-center px-1 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
              >
                <MdKeyboardDoubleArrowRight />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default EventLeads;
