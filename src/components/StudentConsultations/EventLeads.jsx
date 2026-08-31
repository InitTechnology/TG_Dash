import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import "../Dashboard/Dashboard.css";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import { FaEdit, FaEye } from "react-icons/fa";
import { MdDelete, MdCancel } from "react-icons/md";
import { exportToCSV } from "../../exportToCSV";
import { API_URL } from "../../Config";

// ─── Config ───────────────────────────────────────────────────────────────────

const OFFICES = [
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
  "Kochi",
  "Kathmandu Nepal",
];

const EVENT_OPTIONS = ["event 1", "event 2", "event 3", "event 4", "event 5"];

const EMPTY_FORM = {
  eventName: "",
  eventCity: "",
  eventDate: "",
  studName: "",
  studEmail: "",
  studPhone: "",
};

// ─── Component ────────────────────────────────────────────────────────────────
const EventLeads = forwardRef((props, ref) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Logged-in user / role resolution ────────────────────────────────────────
  const loggedInUserRaw = localStorage.getItem("user");
  const loggedInUser = loggedInUserRaw ? JSON.parse(loggedInUserRaw) : null;
  const isCounsellor =
    loggedInUser?.role?.toLowerCase().trim() === "counsellor";

  const [staffOffice, setStaffOffice] = useState(loggedInUser?.office || "");

  useEffect(() => {
    if (staffOffice || !loggedInUser?.email) return; // already have it, or no user
    const resolveOffice = async () => {
      try {
        const res = await fetch(`${API_URL}/getAllStaff`);
        const data = await res.json();
        if (data.success) {
          const match = data.data.find(
            (s) =>
              s.email?.toLowerCase().trim() ===
              loggedInUser.email?.toLowerCase().trim(),
          );
          if (match?.office) setStaffOffice(match.office);
        }
      } catch (err) {
        console.error("Error resolving office:", err);
      }
    };
    resolveOffice();
  }, [staffOffice, loggedInUser?.email]);

  const myOffice = staffOffice;

  // Filter (non-counsellors only — client-side, since eventCity can be null
  // and we can't rely on a server-side query param we haven't confirmed exists)
  const [filterCity, setFilterCity] = useState("");

  // Pagination
  const rowsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Panel state: null | "add" | "edit" | "view"
  const [panelMode, setPanelMode] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);

  const dropdownRef = useRef(null);

  // ── Fetch leads ─────────────────────────────────────────────────────────────

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/stulead`);
      const data = await res.json();
      if (data.success) {
        const rows = data.data || [];

        const scoped =
          isCounsellor && myOffice
            ? rows.filter(
                (l) =>
                  (l.eventCity || "").toLowerCase().trim() ===
                  myOffice.toLowerCase().trim(),
              )
            : rows;
        setLeads(scoped);
        setCurrentPage(1);
      } else {
        setError(data.message || "Failed to fetch leads");
      }
    } catch (err) {
      setError("Network error. Could not fetch leads.");
    } finally {
      setLoading(false);
    }
  }, [isCounsellor, myOffice]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Click outside panel backdrop ────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // kept for any future dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Client-side city filter for non-counsellors ─────────────────────────────
  const displayedLeads = filterCity
    ? leads.filter((l) => (l.eventCity || "") === filterCity)
    : leads;

  // ── Pagination helpers ───────────────────────────────────────────────────────
  const totalPages = Math.ceil(displayedLeads.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentLeads = displayedLeads.slice(indexOfFirst, indexOfLast);

  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage > 2) pages.push(1, "…");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        if (i > 0 && i <= totalPages) pages.push(i);
      }
      if (currentPage < totalPages - 1) pages.push("…", totalPages);
    }
    return pages;
  };

  // ── Panel helpers ────────────────────────────────────────────────────────────
  const openView = (lead) => {
    setSelectedLead(lead);
    setForm({
      eventName: lead.eventName || "",
      eventCity: lead.eventCity || "",
      eventDate: lead.eventDate || "",
      studName: lead.studName || "",
      studEmail: lead.studEmail || "",
      studPhone: lead.studPhone || "",
    });
    setFormError("");
    setPanelMode("view");
  };

  const toInputDate = (raw) => {
    if (!raw) return "";
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const d = new Date(raw);
    if (!isNaN(d)) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };

  const openEdit = (lead) => {
    setSelectedLead(lead);
    setForm({
      eventName: lead.eventName || "",
      eventCity: lead.eventCity || "",
      eventDate: toInputDate(lead.eventDate),
      studName: lead.studName || "",
      studEmail: lead.studEmail || "",
      studPhone: lead.studPhone || "",
    });
    setFormError("");
    setPanelMode("edit");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedLead(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  // ── Form change ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Validate ─────────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.studName.trim()) return "Student name is required.";
    if (!form.studEmail.trim()) return "Student email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studEmail))
      return "Enter a valid email address.";
    return "";
  };

  // ── Save (Add / Edit) ────────────────────────────────────────────────────────
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const isEdit = panelMode === "edit";
      const url = isEdit
        ? `${API_URL}/${selectedLead.id}`
        : `${API_URL}/register-event`;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        closePanel();
        fetchLeads();
      } else {
        setFormError(data.message || "Failed to save.");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_URL}/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchLeads();
      } else {
        alert(data.message || "Delete failed.");
      }
    } catch {
      alert("Network error. Delete failed.");
    }
  };

  //--CSV--------------------
  useImperativeHandle(ref, () => ({
    downloadCSV: () => {
      const dataToExport = displayedLeads.map((lead) => ({
        ID: lead.id,
        Name: lead.studName,
        "Email Address": lead.studEmail,
        "Phone Number": lead.studPhone || "-",
        "Event Name": lead.eventName || "-",
        "Event City": lead.eventCity || "-",
      }));
      exportToCSV(dataToExport, "event_leads.csv");
    },
  }));

  // ── Derived panel title ──────────────────────────────────────────────────────
  const panelTitle =
    panelMode === "add"
      ? "Add Event Lead"
      : panelMode === "edit"
        ? "Edit Event Lead"
        : "View Event Lead";

  const isReadOnly = panelMode === "view";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="">
      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Lead?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Controls ── */}
      <div className="mt-8">
        <div className="flex gap-4 w-full justify-between">
          {/* Filter — hidden entirely for counsellors */}
          {!isCounsellor && (
            <select
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              className="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer"
            >
              <option value="">Filter City</option>
              {OFFICES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}

          {/* Add button intentionally omitted for now (was already commented out) */}
        </div>
      </div>

      {/* ── Slide Panel ── */}
      <div className="relative z-50">
        {panelMode && (
          <div
            onClick={closePanel}
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
          />
        )}

        <div
          className={`fixed top-0 right-0 h-full w-[85%] md:w-[680px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
            panelMode ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-4 flex justify-between items-start border-b">
            <div className="flex items-center gap-3">
              <h2 className="text-[#1D2826] text-lg font-semibold">
                {panelTitle}
              </h2>
            </div>
            <button
              onClick={closePanel}
              className="text-gray-500 hover:text-black text-xl"
            >
              <MdCancel />
            </button>
          </div>

          <div className="max-h-[90vh] overflow-y-auto p-5">
            {formError && (
              <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
              {/* Student Name */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="studName"
                  value={form.studName}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter name"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Email */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  name="studEmail"
                  value={form.studEmail}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter email address"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Phone Number
                </label>
                <input
                  name="studPhone"
                  value={form.studPhone}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter phone number"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Event Name */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                  Select Event
                </label>
                {isReadOnly ? (
                  <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-600">
                    {form.eventName || "—"}
                  </p>
                ) : (
                  <select
                    name="eventName"
                    value={form.eventName}
                    onChange={handleChange}
                    className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select</option>
                    {EVENT_OPTIONS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Event City */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                  Event City
                </label>
                {isReadOnly ? (
                  <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-600">
                    {form.eventCity || "—"}
                  </p>
                ) : (
                  <select
                    name="eventCity"
                    value={form.eventCity}
                    onChange={handleChange}
                    className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select</option>
                    {OFFICES.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Event Date */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Event Date
                </label>
                {isReadOnly ? (
                  <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-600">
                    {form.eventDate || "—"}
                  </p>
                ) : (
                  <input
                    type="date"
                    name="eventDate"
                    value={form.eventDate}
                    onChange={handleChange}
                    className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  />
                )}
              </div>
            </div>

            {/* Action buttons */}
            {!isReadOnly && (
              <div className="flex items-center gap-3 mt-10">
                <button
                  onClick={closePanel}
                  className="w-36 px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-36 px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="shadow-md rounded-lg mt-5">
        {error && (
          <p className="text-sm text-red-500 px-4 py-2 bg-red-50 border-b border-red-200">
            {error}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-[#E7E7F8] border-b">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Event Name</th>
                <th className="p-4">Event City</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : currentLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No leads found.
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                  >
                    <td className="px-4 py-4 font-semibold">{lead.id}</td>
                    <td className="px-4 py-4">{lead.studName}</td>
                    <td className="px-4 py-4">{lead.studEmail}</td>
                    <td className="px-4 py-4">{lead.studPhone || "—"}</td>
                    <td className="px-4 py-4">{lead.eventName || "—"}</td>
                    <td className="px-4 py-4">{lead.eventCity || "—"}</td>
                    <td>
                      <div className="flex justify-center">
                        <button
                          onClick={() => openView(lead)}
                          className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
                          title="View"
                        >
                          <FaEye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(lead)}
                          className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        {!isCounsellor && (
                          <button
                            onClick={() => setDeleteId(lead.id)}
                            className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all"
                            title="Delete"
                          >
                            <MdDelete size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
            <span className="font-semibold text-gray-700">
              {displayedLeads.length === 0 ? 0 : indexOfFirst + 1}–
              {Math.min(indexOfLast, displayedLeads.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {displayedLeads.length}
            </span>
          </span>

          <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
            <li>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
              >
                <MdKeyboardDoubleArrowLeft />
              </button>
            </li>

            {generatePageNumbers().map((page, index) =>
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
                    onClick={() => setCurrentPage(page)}
                    className={`flex items-center justify-center px-3 h-8 leading-tight border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
                      currentPage === page
                        ? "text-purple-500 underline underline-offset-2 bg-purple-50"
                        : "text-gray-500 bg-[#f7f7f7]"
                    }`}
                  >
                    {page}
                  </button>
                </li>
              ),
            )}

            <li>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center px-1 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
              >
                <MdKeyboardDoubleArrowRight />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
});

export default EventLeads;
// import React, {
//   forwardRef,
//   useImperativeHandle,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
// } from "react";
// import "../Dashboard/Dashboard.css";
// import {
//   MdKeyboardDoubleArrowLeft,
//   MdKeyboardDoubleArrowRight,
// } from "react-icons/md";
// import { FaEdit, FaEye } from "react-icons/fa";
// import { MdDelete, MdCancel } from "react-icons/md";
// import { exportToCSV } from "../../exportToCSV";
// import { API_URL } from "../../Config";
// // ─── Config ───────────────────────────────────────────────────────────────────

// const OFFICES = [
//   "Ahmedabad",
//   "Anand",
//   "Chandigarh",
//   "Delhi",
//   "Gandhinagar",
//   "Indore",
//   "Jaipur",
//   "Jamnagar",
//   "Junagadh",
//   "Morbi",
//   "Pune",
//   "Rajkot",
//   "Surat",
//   "Vadodara",
//   "Kochi",
//   "Kathmandu Nepal",
// ];

// const EVENT_OPTIONS = ["event 1", "event 2", "event 3", "event 4", "event 5"];

// const EMPTY_FORM = {
//   eventName: "",
//   eventCity: "",
//   eventDate: "",
//   studName: "",
//   studEmail: "",
//   studPhone: "",
// };

// // ─── Component ────────────────────────────────────────────────────────────────
// const EventLeads = forwardRef((props, ref) => {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Filter
//   const [filterOffice, setFilterOffice] = useState("");

//   // Pagination
//   const rowsPerPage = 20;
//   const [currentPage, setCurrentPage] = useState(1);

//   // Panel state: null | "add" | "edit" | "view"
//   const [panelMode, setPanelMode] = useState(null);
//   const [selectedLead, setSelectedLead] = useState(null);

//   // Form state
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Delete confirmation
//   const [deleteId, setDeleteId] = useState(null);

//   const dropdownRef = useRef(null);

//   // ── Fetch leads ─────────────────────────────────────────────────────────────
//   const fetchLeads = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const params = filterOffice
//         ? `?office=${encodeURIComponent(filterOffice)}`
//         : "";
//       const res = await fetch(`${API_URL}${params}`);
//       const data = await res.json();
//       if (data.success) {
//         setLeads(data.data);
//         setCurrentPage(1);
//       } else {
//         setError(data.message || "Failed to fetch leads");
//       }
//     } catch (err) {
//       setError("Network error. Could not fetch leads.");
//     } finally {
//       setLoading(false);
//     }
//   }, [filterOffice]);

//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]);

//   // ── Click outside panel backdrop ────────────────────────────────────────────
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         // kept for any future dropdown
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // ── Pagination helpers ───────────────────────────────────────────────────────
//   const totalPages = Math.ceil(leads.length / rowsPerPage);
//   const indexOfLast = currentPage * rowsPerPage;
//   const indexOfFirst = indexOfLast - rowsPerPage;
//   const currentLeads = leads.slice(indexOfFirst, indexOfLast);

//   const generatePageNumbers = () => {
//     const pages = [];
//     if (totalPages <= 5) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//     } else {
//       if (currentPage > 2) pages.push(1, "…");
//       for (let i = currentPage - 1; i <= currentPage + 1; i++) {
//         if (i > 0 && i <= totalPages) pages.push(i);
//       }
//       if (currentPage < totalPages - 1) pages.push("…", totalPages);
//     }
//     return pages;
//   };

//   // ── Panel helpers ────────────────────────────────────────────────────────────
//   // const openAdd = () => {
//   //   setForm(EMPTY_FORM);
//   //   setFormError("");
//   //   setPanelMode("add");
//   //   setSelectedLead(null);
//   // };

//   const openView = (lead) => {
//     setSelectedLead(lead);
//     setForm({
//       eventName: lead.eventName || "",
//       eventCity: lead.eventCity || "",
//       eventDate: lead.eventDate || "",
//       studName: lead.studName || "",
//       studEmail: lead.studEmail || "",
//       studPhone: lead.studPhone || "",
//     });
//     setFormError("");
//     setPanelMode("view");
//   };
//   const toInputDate = (raw) => {
//     if (!raw) return "";
//     // Already YYYY-MM-DD
//     if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
//     // Try native Date parsing (handles "May 15 2025", "15/05/2025", ISO strings, etc.)
//     const d = new Date(raw);
//     if (!isNaN(d)) {
//       const yyyy = d.getFullYear();
//       const mm = String(d.getMonth() + 1).padStart(2, "0");
//       const dd = String(d.getDate()).padStart(2, "0");
//       return `${yyyy}-${mm}-${dd}`;
//     }
//     return "";
//   };

//   const openEdit = (lead) => {
//     setSelectedLead(lead);
//     setForm({
//       eventName: lead.eventName || "",
//       eventCity: lead.eventCity || "",
//       eventDate: toInputDate(lead.eventDate),
//       studName: lead.studName || "",
//       studEmail: lead.studEmail || "",
//       studPhone: lead.studPhone || "",
//     });
//     setFormError("");
//     setPanelMode("edit");
//   };

//   const closePanel = () => {
//     setPanelMode(null);
//     setSelectedLead(null);
//     setForm(EMPTY_FORM);
//     setFormError("");
//   };

//   // ── Form change ──────────────────────────────────────────────────────────────
//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   // ── Validate ─────────────────────────────────────────────────────────────────
//   const validate = () => {
//     if (!form.studName.trim()) return "Student name is required.";
//     if (!form.studEmail.trim()) return "Student email is required.";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.studEmail))
//       return "Enter a valid email address.";
//     return "";
//   };

//   // ── Save (Add / Edit) ────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     const validationError = validate();
//     if (validationError) {
//       setFormError(validationError);
//       return;
//     }
//     setFormError("");
//     setSaving(true);

//     try {
//       const isEdit = panelMode === "edit";
//       const url = isEdit
//         ? `${API_URL}/${selectedLead.id}`
//         : `${API_URL}/register-event`;
//       const method = isEdit ? "PUT" : "POST";

//       const res = await fetch(url, {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       const data = await res.json();

//       if (data.success) {
//         closePanel();
//         fetchLeads();
//       } else {
//         setFormError(data.message || "Failed to save.");
//       }
//     } catch (err) {
//       setFormError("Network error. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ── Delete ───────────────────────────────────────────────────────────────────
//   const handleDeleteConfirm = async () => {
//     if (!deleteId) return;
//     try {
//       const res = await fetch(`${API_URL}/${deleteId}`, { method: "DELETE" });
//       const data = await res.json();
//       if (data.success) {
//         setDeleteId(null);
//         fetchLeads();
//       } else {
//         alert(data.message || "Delete failed.");
//       }
//     } catch {
//       alert("Network error. Delete failed.");
//     }
//   };
//   //--CSV--------------------
//   useImperativeHandle(ref, () => ({
//     downloadCSV: () => {
//       const dataToExport = leads.map((lead) => ({
//         ID: lead.id,
//         Name: lead.studName,
//         "Email Address": lead.studEmail,
//         "Phone Number": lead.studPhone || "-",
//         "Event Name": lead.eventName || "-",
//         "Event City": lead.eventCity || "-",
//       }));
//       exportToCSV(dataToExport, "event_leads.csv");
//     },
//   }));
//   // ── Derived panel title ──────────────────────────────────────────────────────
//   const panelTitle =
//     panelMode === "add"
//       ? "Add Event Lead"
//       : panelMode === "edit"
//         ? "Edit Event Lead"
//         : "View Event Lead";

//   const isReadOnly = panelMode === "view";

//   // ── Render ───────────────────────────────────────────────────────────────────
//   return (
//     <div className="">
//       {/* ── Delete Confirmation Modal ── */}
//       {deleteId && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               Delete Lead?
//             </h3>
//             <p className="text-sm text-gray-500 mb-6">
//               This action cannot be undone.
//             </p>
//             <div className="flex gap-3 justify-center">
//               <button
//                 onClick={() => setDeleteId(null)}
//                 className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Top Controls ── */}
//       <div className="mt-8">
//         <div className="flex gap-4 w-full justify-between">
//           {/* Filter */}
//           <select
//             value={filterOffice}
//             onChange={(e) => setFilterOffice(e.target.value)}
//             className="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer"
//           >
//             <option value="">Filter City</option>
//             {OFFICES.map((o) => (
//               <option key={o} value={o}>
//                 {o}
//               </option>
//             ))}
//           </select>

//           {/* Add button */}
//           {/* <button
//             onClick={openAdd}
//             className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
//           >
//             + Add Leads
//           </button> */}
//         </div>
//       </div>

//       {/* ── Slide Panel ── */}
//       <div className="relative z-50">
//         {/* Backdrop */}
//         {panelMode && (
//           <div
//             onClick={closePanel}
//             className="fixed inset-0 bg-black bg-opacity-30 z-40"
//           />
//         )}

//         {/* Panel */}
//         <div
//           className={`fixed top-0 right-0 h-full w-[85%] md:w-[680px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
//             panelMode ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           {/* Header */}
//           <div className="p-4 flex justify-between items-start border-b">
//             <div className="flex items-center gap-3">
//               <h2 className="text-[#1D2826] text-lg font-semibold">
//                 {panelTitle}
//               </h2>
//               {/* Toggle View ↔ Edit */}
//               {/* {panelMode === "view" && (
//                 <button
//                   onClick={() => openEdit(selectedLead)}
//                   className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-sky-100 text-sky-600 hover:bg-sky-200 transition-all"
//                 >
//                   <FaEdit size={11} /> Edit
//                 </button>
//               )}
//               {panelMode === "edit" && (
//                 <button
//                   onClick={() => openView(selectedLead)}
//                   className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
//                 >
//                   <FaEye size={11} /> View
//                 </button>
//               )} */}
//             </div>
//             <button
//               onClick={closePanel}
//               className="text-gray-500 hover:text-black text-xl"
//             >
//               <MdCancel />
//             </button>
//           </div>

//           {/* Body */}
//           <div className="max-h-[90vh] overflow-y-auto p-5">
//             {formError && (
//               <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                 {formError}
//               </p>
//             )}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
//               {/* ID (view/edit only) */}
//               {/* {(panelMode === "view" || panelMode === "edit") && (
//                 <div className="flex flex-col w-full">
//                   <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                     ID
//                   </label>
//                   <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-500">
//                     {selectedLead?.id}
//                   </p>
//                 </div>
//               )} */}

//               {/* Student Name */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Name <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   name="studName"
//                   value={form.studName}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter name"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Email */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Email Address <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   name="studEmail"
//                   value={form.studEmail}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter email address"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Phone */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Phone Number
//                 </label>
//                 <input
//                   name="studPhone"
//                   value={form.studPhone}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter phone number"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Event Name */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
//                   Select Event
//                 </label>
//                 {isReadOnly ? (
//                   <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-600">
//                     {form.eventName || "—"}
//                   </p>
//                 ) : (
//                   <select
//                     name="eventName"
//                     value={form.eventName}
//                     onChange={handleChange}
//                     className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
//                   >
//                     <option value="">Select</option>
//                     {EVENT_OPTIONS.map((e) => (
//                       <option key={e} value={e}>
//                         {e}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>

//               {/* Event City */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
//                   Event City
//                 </label>
//                 {isReadOnly ? (
//                   <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-600">
//                     {form.eventCity || "—"}
//                   </p>
//                 ) : (
//                   <select
//                     name="eventCity"
//                     value={form.eventCity}
//                     onChange={handleChange}
//                     className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
//                   >
//                     <option value="">Select</option>
//                     {OFFICES.map((o) => (
//                       <option key={o} value={o}>
//                         {o}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </div>

//               {/* Event Date */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Event Date
//                 </label>
//                 {isReadOnly ? (
//                   <p className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-600">
//                     {form.eventDate || "—"}
//                   </p>
//                 ) : (
//                   <input
//                     type="date"
//                     name="eventDate"
//                     value={form.eventDate}
//                     onChange={handleChange}
//                     className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
//                   />
//                 )}
//               </div>
//             </div>

//             {/* Action buttons */}
//             {!isReadOnly && (
//               <div className="flex items-center gap-3 mt-10">
//                 <button
//                   onClick={closePanel}
//                   className="w-36 px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="w-36 px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
//                 >
//                   {saving ? "Saving…" : "Save"}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Table ── */}
//       <div className="shadow-md rounded-lg mt-5">
//         {error && (
//           <p className="text-sm text-red-500 px-4 py-2 bg-red-50 border-b border-red-200">
//             {error}
//           </p>
//         )}

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm text-left rtl:text-right text-gray-500">
//             <thead className="text-xs text-gray-700 uppercase bg-[#E7E7F8] border-b">
//               <tr>
//                 <th className="p-4">ID</th>
//                 <th className="p-4">Name</th>
//                 <th className="p-4">Email Address</th>
//                 <th className="p-4">Phone Number</th>
//                 <th className="p-4">Event Name</th>
//                 <th className="p-4">Event City</th>
//                 {/* <th className="p-4">Event Date</th> */}
//                 <th className="p-4 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={8} className="text-center py-8 text-gray-400">
//                     Loading…
//                   </td>
//                 </tr>
//               ) : currentLeads.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="text-center py-8 text-gray-400">
//                     No leads found.
//                   </td>
//                 </tr>
//               ) : (
//                 currentLeads.map((lead) => (
//                   <tr
//                     key={lead.id}
//                     className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
//                   >
//                     <td className="px-4 py-4 font-semibold">{lead.id}</td>
//                     <td className="px-4 py-4">{lead.studName}</td>
//                     <td className="px-4 py-4">{lead.studEmail}</td>
//                     <td className="px-4 py-4">{lead.studPhone || "—"}</td>
//                     <td className="px-4 py-4">{lead.eventName || "—"}</td>
//                     <td className="px-4 py-4">{lead.eventCity || "—"}</td>
//                     {/* <td className="px-4 py-4">{lead.eventDate || "—"}</td> */}
//                     <td>
//                       <div className="flex justify-center">
//                         {/* View */}
//                         <button
//                           onClick={() => openView(lead)}
//                           className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
//                           title="View"
//                         >
//                           <FaEye size={15} />
//                         </button>
//                         {/* Edit */}
//                         <button
//                           onClick={() => openEdit(lead)}
//                           className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
//                           title="Edit"
//                         >
//                           <FaEdit size={14} />
//                         </button>
//                         {/* Delete */}
//                         <button
//                           onClick={() => setDeleteId(lead.id)}
//                           className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all"
//                           title="Delete"
//                         >
//                           <MdDelete size={15} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <nav
//           className="flex items-center flex-column flex-wrap md:flex-row justify-between rounded-b-lg px-2 py-1 bg-[#f7f7f7]"
//           aria-label="Table navigation"
//         >
//           <span className="text-xs font-normal text-gray-500 mb-4 md:mb-0 block w-full md:inline md:w-auto">
//             Showing{" "}
//             <span className="font-semibold text-gray-700">
//               {leads.length === 0 ? 0 : indexOfFirst + 1}–
//               {Math.min(indexOfLast, leads.length)}
//             </span>{" "}
//             of{" "}
//             <span className="font-semibold text-gray-700">{leads.length}</span>
//           </span>

//           <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
//             <li>
//               <button
//                 onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
//               >
//                 <MdKeyboardDoubleArrowLeft />
//               </button>
//             </li>

//             {generatePageNumbers().map((page, index) =>
//               page === "…" ? (
//                 <li
//                   key={index}
//                   className="px-1 h-8 flex items-center justify-center text-gray-500 bg-[#f7f7f7]"
//                 >
//                   <span>…</span>
//                 </li>
//               ) : (
//                 <li key={index}>
//                   <button
//                     onClick={() => setCurrentPage(page)}
//                     className={`flex items-center justify-center px-3 h-8 leading-tight border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
//                       currentPage === page
//                         ? "text-purple-500 underline underline-offset-2 bg-purple-50"
//                         : "text-gray-500 bg-[#f7f7f7]"
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 </li>
//               ),
//             )}

//             <li>
//               <button
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(p + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages || totalPages === 0}
//                 className="flex items-center justify-center px-1 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40"
//               >
//                 <MdKeyboardDoubleArrowRight />
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </div>
//   );
// });

// export default EventLeads;
// import React, { useState, useEffect, useRef } from "react";
// import "../Dashboard/Dashboard.css";
// // import { Tooltip } from "antd";
// import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
// import { MdKeyboardDoubleArrowRight } from "react-icons/md";
// import { FaEdit, FaEye } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import { MdCancel } from "react-icons/md";

// const EventLeads = () => {
//   const [eventLeads] = useState([
//     {
//       id: 1,
//       eventName: "event 1",
//       eventCity: "Ahmedabad",
//       name: "John Doe",
//       email: "john.doe@example.com",
//       phone: "9876543210",
//     },
//     {
//       id: 2,
//       eventName: "USA Admission Seminar",
//       eventCity: "Rajkot",
//       name: "Jane Smith",
//       email: "jane.smith@example.com",
//       phone: "9876543211",
//     },
//     {
//       id: 3,
//       eventName: "Australia Education Expo",
//       eventCity: "Surat",
//       name: "Bob Johnson",
//       email: "bob.johnson@example.com",
//       phone: "9876543212",
//     },
//   ]);

//   const rowsPerPage_eventLeads = 5;
//   const [currentPage_eventLeads, setCurrentPage_eventLeads] = useState(1);

//   const totalPages_eventLeads = Math.ceil(
//     eventLeads.length / rowsPerPage_eventLeads,
//   );

//   const indexOfLast_eventLeads =
//     currentPage_eventLeads * rowsPerPage_eventLeads;
//   const indexOfFirst_eventLeads =
//     indexOfLast_eventLeads - rowsPerPage_eventLeads;

//   const current_eventLeads = eventLeads.slice(
//     indexOfFirst_eventLeads,
//     indexOfLast_eventLeads,
//   );

//   const handleNextPage_eventLeads = () => {
//     if (currentPage_eventLeads < totalPages_eventLeads) {
//       setCurrentPage_eventLeads(currentPage_eventLeads + 1);
//     }
//   };

//   const handlePrevPage_eventLeads = () => {
//     if (currentPage_eventLeads > 1) {
//       setCurrentPage_eventLeads(currentPage_eventLeads - 1);
//     }
//   };

//   const handlePageChange_eventLeads = (page) => {
//     setCurrentPage_eventLeads(page);
//   };

//   const generatePageNumbers_eventLeads = () => {
//     const pages = [];

//     if (totalPages_eventLeads <= 5) {
//       for (let i = 1; i <= totalPages_eventLeads; i++) pages.push(i);
//     } else {
//       if (currentPage_eventLeads > 2) pages.push(1, "…");

//       for (
//         let i = currentPage_eventLeads - 1;
//         i <= currentPage_eventLeads + 1;
//         i++
//       ) {
//         if (i > 0 && i <= totalPages_eventLeads) pages.push(i);
//       }

//       if (currentPage_eventLeads < totalPages_eventLeads - 1)
//         pages.push("…", totalPages_eventLeads);
//     }

//     return pages;
//   };

//   const [, setIsOpen] = useState(false);
//   // const [search] = useState("");
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const [isOpen_popupForm_eventLeads, setIsOpen_popupForm_eventLeads] =
//     useState(false);

//   const handleClosePopup_eventLeads = () => {
//     setIsOpen_popupForm_eventLeads(false);
//   };

//   return (
//     <div className="">
//       {/* Button */}
//       <div className="mt-8">
//         <div className="flex gap-4 w-full justify-between">
//           <select class="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 cursor-pointer">
//             <option value="">Filter office</option>
//             <option value="Ahmedabad">Ahmedabad</option>
//             <option value="Anand">Anand</option>
//             <option value="Chandigarh">Chandigarh</option>
//             <option value="Delhi">Delhi</option>
//             <option value="Gandhinagar">Gandhinagar</option>
//             <option value="Indore">Indore</option>
//             <option value="Jaipur">Jaipur</option>
//             <option value="Jamnagar">Jamnagar</option>
//             <option value="Junagadh">Junagadh</option>
//             <option value="Morbi">Morbi</option>
//             <option value="Pune">Pune</option>
//             <option value="Rajkot">Rajkot</option>
//             <option value="Surat">Surat</option>
//             <option value="Vadodara">Vadodara</option>
//             <option value="Kochi">Kochi</option>
//             <option value="Kathmandu Nepal">Kathmandu Nepal</option>
//           </select>

//           <div>
//             <button
//               onClick={() => {
//                 setIsOpen_popupForm_eventLeads(true);
//               }}
//               className="px-6 py-2 bg-indigo-900 rounded-lg font-medium text-sm text-center text-white hover:scale-95 transition-all duration-300 ease-in-out"
//             >
//               + Add Leads
//             </button>

//             <div className="relative z-50">
//               {isOpen_popupForm_eventLeads && (
//                 <div
//                   onClick={handleClosePopup_eventLeads}
//                   className="fixed inset-0 bg-black bg-opacity-30 z-40 backdrop_popupForm"
//                 />
//               )}

//               <div
//                 className={`fixed top-0 right-0 h-full w-[85%] md:w-[680px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
//                   isOpen_popupForm_eventLeads
//                     ? "translate-x-0"
//                     : "translate-x-full"
//                 } panel_popupForm`}
//               >
//                 <div className="p-4 flex justify-between items-start border-b header_popupForm">
//                   <div>
//                     <h2 className="text-[#1D2826] text-lg font-semibold">
//                       Add Event
//                     </h2>
//                   </div>

//                   <button
//                     onClick={handleClosePopup_eventLeads}
//                     className="text-gray-500 hover:text-black text-xl"
//                   >
//                     <MdCancel />
//                   </button>
//                 </div>

//                 <div className="max-h-[90vh] overflow-y-auto p-5">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
//                     {/* ID */}
//                     <div className="flex flex-col w-full">
//                       <label
//                         for="input"
//                         className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                       >
//                         ID
//                       </label>
//                       <p className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md">
//                         01
//                       </p>
//                     </div>

//                     {/* Name */}
//                     <div className="flex flex-col w-full">
//                       <label
//                         for="input"
//                         className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                       >
//                         Name
//                       </label>
//                       <input
//                         placeholder="Enter name"
//                         required
//                         className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                       />
//                     </div>

//                     {/* Email Address */}
//                     <div className="flex flex-col w-full">
//                       <label
//                         for="input"
//                         className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                       >
//                         Email Address
//                       </label>
//                       <input
//                         placeholder="Enter email address"
//                         required
//                         className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                       />
//                     </div>

//                     {/* Phone Number */}
//                     <div className="flex flex-col w-full">
//                       <label
//                         for="input"
//                         className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit"
//                       >
//                         Phone Number
//                       </label>
//                       <input
//                         placeholder="Enter phone number"
//                         required
//                         className="border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//                       />
//                     </div>

//                     {/* Event */}
//                     <div className="flex flex-col w-full">
//                       <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
//                         Select Event
//                       </label>
//                       <select className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md">
//                         <option value="">Select</option>
//                         <option value="">event 1</option>
//                         <option value="">event 2</option>
//                         <option value="">event 3</option>
//                         <option value="">event 4</option>
//                         <option value="">event 5</option>
//                       </select>
//                     </div>

//                     {/* Event City */}
//                     <div className="flex flex-col w-full">
//                       <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
//                         Event City
//                       </label>
//                       <select className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md">
//                         <option value="">Select</option>
//                         <option value="">City 1</option>
//                         <option value="">City 2</option>
//                         <option value="">City 3</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-3 mt-10">
//                     <button
//                       onClick={handleClosePopup_eventLeads}
//                       className="w-36 px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
//                     >
//                       Cancel
//                     </button>

//                     <button className="w-36 px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                       Save
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="shadow-md rounded-lg mt-5">
//         <div className="overflow-x-auto">
//           <table className="w-full text-sm text-left rtl:text-right text-gray-500">
//             <thead className="text-xs text-gray-700 uppercase bg-[#E7E7F8] border-b">
//               <tr>
//                 <th className="p-4">ID</th>
//                 <th className="p-4 w-1/10">Name</th>
//                 <th className="p-4 w-1/10">Email Address</th>
//                 <th className="p-4 w-1/10">Phone Number</th>
//                 <th className="p-4 w-1/10">Event Name</th>
//                 <th className="p-4 w-1/10">Event City</th>
//                 <th className="p-4 w-1/10 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {current_eventLeads.map((event) => (
//                 <tr
//                   key={event.id}
//                   className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
//                 >
//                   <td className="px-4 py-3 font-semibold">{event.id}</td>

//                   <td className="px-4 py-3">{event.name}</td>
//                   <td className="px-4 py-3">{event.email}</td>
//                   <td className="px-4 py-3">{event.phone}</td>
//                   <td className="px-4 py-3">{event.eventName}</td>
//                   <td className="px-4 py-3">{event.eventCity}</td>

//                   {/* Actions */}
//                   <td>
//                     <div className="flex justify-center">
//                       <button
//                         onClick={() => {
//                           setIsOpen_popupForm_eventLeads(true);
//                         }}
//                         className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
//                       >
//                         <FaEye size={15} />
//                       </button>
//                       <>
//                         <button
//                           onClick={() => {
//                             setIsOpen_popupForm_eventLeads(true);
//                           }}
//                           className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
//                         >
//                           <FaEdit size={14} />
//                         </button>
//                         <button className="px-2 py-1 text-gray-400 hover:text-red-500 hover:scale-125 transition-all">
//                           <MdDelete size={15} />
//                         </button>
//                       </>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <nav
//           className="flex items-center flex-column flex-wrap md:flex-row justify-between rounded-b-lg px-2 py-1 bg-[#f7f7f7]"
//           aria-label="Table navigation"
//         >
//           <span className="text-xs font-normal text-gray-500 mb-4 md:mb-0 block w-full md:inline md:w-auto">
//             Showing{" "}
//             <span className="font-semibold text-gray-700 dark:text-white">
//               {indexOfFirst_eventLeads + 1}-
//               {Math.min(indexOfLast_eventLeads, eventLeads.length)}
//             </span>{" "}
//             of{" "}
//             <span className="font-semibold text-gray-700 dark:text-white">
//               {eventLeads.length}
//             </span>
//           </span>

//           <ul className="inline-flex -space-x-px rtl:space-x-reverse text-xs h-8">
//             {/* Prev */}
//             <li>
//               <button
//                 onClick={handlePrevPage_eventLeads}
//                 disabled={currentPage_eventLeads === 1}
//                 className="flex items-center justify-center px-1 h-8 ms-0 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700"
//               >
//                 <MdKeyboardDoubleArrowLeft />
//               </button>
//             </li>

//             {/* Pages */}
//             {generatePageNumbers_eventLeads().map((page, index) =>
//               page === "…" ? (
//                 <li
//                   key={index}
//                   className="px-1 h-8 flex items-center justify-center text-gray-500 bg-[#f7f7f7]"
//                 >
//                   <span>…</span>
//                 </li>
//               ) : (
//                 <li key={index}>
//                   <button
//                     onClick={() => handlePageChange_eventLeads(page)}
//                     className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 hover:bg-purple-100 hover:text-gray-700 ${
//                       currentPage_eventLeads === page
//                         ? "text-purple-400 underline underline-offset-2"
//                         : ""
//                     }`}
//                   >
//                     {page}
//                   </button>
//                 </li>
//               ),
//             )}

//             {/* Next */}
//             <li>
//               <button
//                 onClick={handleNextPage_eventLeads}
//                 disabled={currentPage_eventLeads === totalPages_eventLeads}
//                 className="flex items-center justify-center px-1 h-8 leading-tight text-gray-500 bg-[#f7f7f7] border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700"
//               >
//                 <MdKeyboardDoubleArrowRight />
//               </button>
//             </li>
//           </ul>
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default EventLeads;
