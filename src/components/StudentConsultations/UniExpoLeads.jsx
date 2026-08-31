import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardDoubleArrowRight,
  MdCancel,
  MdQrCodeScanner,
} from "react-icons/md";
import { FaEdit, FaEye, FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { exportToCSV } from "../../exportToCSV";
import { API_URL } from "../../Config";
import { MdOutlinePendingActions } from "react-icons/md";
import { PiStudentFill } from "react-icons/pi";

import { GiCheckMark } from "react-icons/gi";
import { ImCross } from "react-icons/im";
import { FaRegHandshake } from "react-icons/fa";
const BASE_URL = `${API_URL}/expo-registrations`;

// DOM id for the div the html5-qrcode library mounts the camera view into.
const QR_ELEMENT_ID = "expo-ticket-qr-reader";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  mobile: "",
  destination: "",
  expoLocation: "",
  expoDate: "",
  expoTime: "",
  expoVenue: "",
  branchPhone: "",
  branchAddress: "",
  ticketId: "",
  status: "pending",
};

// DB row (snake_case) -> form state (camelCase)
const rowToForm = (row) => ({
  fullName: row.full_name || "",
  email: row.email || "",
  mobile: row.mobile || "",
  destination: row.destination || "",
  expoLocation: row.expo_location || "",
  expoDate: row.expo_date || "",
  expoTime: row.expo_time || "",
  expoVenue: row.expo_venue || "",
  branchPhone: row.branch_phone || "",
  branchAddress: row.branch_address || "",
  ticketId: row.ticket_id || "",
  status: row.status || "pending",
  verifiedAt: row.verified_at || null,
});

// The ticket QR encodes a full multi-line text block, e.g.:
//   GLOBAL UNIEXPO 2026
//
//   Student Name: ...
//   Phone Number: ...
//   Email: ...
//   Expo Date: ...
//   Expo Time: ...
//   Ticket ID: GUE26-CHD-23F55C17
//   Branch Phone: ...
//   Expo Location: ...
//
// This pulls just the ticket ID out of that block. Falls back to the raw
// scanned string if no "Ticket ID:" line is found, in case a differently
// formatted QR is ever scanned.
const extractTicketId = (scannedText) => {
  const match = String(scannedText || "").match(
    /Ticket ID:\s*([A-Za-z0-9-]+)/i,
  );
  return (match ? match[1] : scannedText || "").trim();
};

// ── Status badge, reused in table + view/edit panel ─────────────────────────
const StatusBadge = ({ status }) => {
  const isVerified = status === "verified";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isVerified ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
      }`}
    >
      {isVerified ? (
        <FaCheckCircle size={12} className="text-green-600" />
      ) : (
        <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
      )}
      {isVerified ? "Verified" : "Pending"}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const UniExpoLeads = forwardRef((props, ref) => {
  const { searchQuery = "" } = props;
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loggedInUserRaw = localStorage.getItem("user");
  const loggedInUser = loggedInUserRaw ? JSON.parse(loggedInUserRaw) : null;
  const isCounsellor =
    loggedInUser?.role?.toLowerCase().trim() === "counsellor";
  const [staffOffice, setStaffOffice] = useState(loggedInUser?.office || "");
  const [selectedIds, setSelectedIds] = useState(new Set());

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
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  const myOffice = staffOffice;
  // Filter
  const [filterLocation, setFilterLocation] = useState("");
  const displayedLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const matchesName = (lead.full_name || "").toLowerCase().includes(query);
    const matchesEmail = (lead.email || "").toLowerCase().includes(query);
    const matchesMobile = (lead.mobile || "").toLowerCase().includes(query);
    const matchesStatus = (lead.status || "").toLowerCase().includes(query);

    return matchesName || matchesEmail || matchesMobile || matchesStatus;
  });

  const totalLeadsCount = leads.length;
  const verifiedLeadsCount = leads.filter(
    (l) => l.status === "verified",
  ).length;
  const pendingLeadsCount = leads.filter((l) => l.status === "pending").length;

  // Pagination
  const rowsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Panel: null | "edit" | "view"
  const [panelMode, setPanelMode] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Row-level status toggle in flight (disables the button while patching)
  const [togglingId, setTogglingId] = useState(null);

  // ── QR ticket scanner state ─────────────────────────────────────────────────
  const [showScanner, setShowScanner] = useState(false);
  // idle -> "starting" -> "scanning" -> "verifying" -> "success" | "error"
  const [scanStatus, setScanStatus] = useState("idle");
  const [scanMessage, setScanMessage] = useState("");
  const [scanAttempt, setScanAttempt] = useState(0); // bump to force a fresh camera session
  const qrRef = useRef(null); // holds the current Html5Qrcode instance
  const startPromiseRef = useRef(null); // the in-flight start() promise, if any
  const isProcessingScan = useRef(false); // guards against duplicate scans firing

  // ── Fetch leads ─────────────────────────────────────────────────────────────
  // ── Fetch leads ─────────────────────────────────────────────────────────────
  const normalizeOfficeKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s*-\s*/g, "-")
      .replace(/\s+/g, "-");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filterLocation
        ? `?expo_location=${encodeURIComponent(filterLocation)}`
        : "";
      const res = await fetch(`${BASE_URL}${params}`);
      const data = await res.json();
      if (data.success) {
        const rows = data.data;
        const scoped =
          isCounsellor && myOffice
            ? rows.filter((l) =>
                normalizeOfficeKey(l.expo_location).includes(
                  normalizeOfficeKey(myOffice),
                ),
              )
            : rows;
        setLeads(scoped);
        setCurrentPage(1);
      } else {
        setError(data.message || "Failed to fetch registrations");
      }
    } catch (err) {
      setError("Network error. Could not fetch registrations.");
    } finally {
      setLoading(false);
    }
  }, [filterLocation, isCounsellor, myOffice]);
  // const fetchLeads = useCallback(async () => {
  //   setLoading(true);
  //   setError("");
  //   try {
  //     const params = filterLocation
  //       ? `?expo_location=${encodeURIComponent(filterLocation)}`
  //       : "";
  //     const res = await fetch(`${BASE_URL}${params}`);
  //     const data = await res.json();
  //     if (data.success) {
  //       const rows = data.data;
  //       const scoped =
  //         isCounsellor && myOffice
  //           ? rows.filter((l) =>
  //               (l.expo_location || "")
  //                 .toLowerCase()
  //                 .includes(myOffice.toLowerCase()),
  //             )
  //           : rows;
  //       setLeads(scoped);
  //       setCurrentPage(1);
  //     } else {
  //       setError(data.message || "Failed to fetch registrations");
  //     }
  //   } catch (err) {
  //     setError("Network error. Could not fetch registrations.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [filterLocation, isCounsellor, myOffice]);
  useEffect(() => {
    if (isCounsellor && myOffice) {
      setFilterLocation(myOffice);
    }
  }, [isCounsellor, myOffice]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Pagination helpers ───────────────────────────────────────────────────────
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
    setForm(rowToForm(lead));
    setFormError("");
    setPanelMode("view");
  };

  const openEdit = (lead) => {
    setSelectedLead(lead);
    setForm(rowToForm(lead));
    setFormError("");
    setPanelMode("edit");
  };

  const closePanel = () => {
    setPanelMode(null);
    setSelectedLead(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ── Validate ─────────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.fullName.trim()) return "Full name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address.";
    if (!form.mobile.trim()) return "Mobile number is required.";
    if (!form.expoLocation.trim()) return "Expo location is required.";
    if (!form.expoDate.trim()) return "Expo date is required.";
    return "";
  };

  // ── Save (Edit only — no add flow for this tab yet) ─────────────────────────
  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      const res = await fetch(`${BASE_URL}/${selectedLead.id}`, {
        method: "PUT",
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

  // ── Quick status toggle (from table row, no full edit needed) ──────────────
  const handleToggleStatus = async (lead) => {
    const nextStatus = lead.status === "verified" ? "pending" : "verified";
    setTogglingId(lead.id);
    try {
      const res = await fetch(`${BASE_URL}/${lead.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === lead.id ? { ...l, status: nextStatus } : l,
          ),
        );
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch {
      alert("Network error. Could not update status.");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/${deleteId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchLeads();
      } else {
        alert(data.message || "Delete failed.");
      }
    } catch {
      alert("Network error. Delete failed.");
    } finally {
      setDeleting(false);
    }
  };
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isAllCurrentPageSelected =
    currentLeads.length > 0 &&
    currentLeads.every((lead) => selectedIds.has(lead.id));

  const toggleSelectAllCurrentPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllCurrentPageSelected) {
        // Unselect only this page's rows
        currentLeads.forEach((lead) => next.delete(lead.id));
      } else {
        // Select this page's rows (keeps any selections from other pages)
        currentLeads.forEach((lead) => next.add(lead.id));
      }
      return next;
    });
  };
  useEffect(() => {
    setSelectedIds(new Set());
  }, [searchQuery, filterLocation]);

  // ── QR ticket scan → verify ──────────────────────────────────────────────────
  // Looks up a registration by its ticket_id and, if found, sets its status to
  // "verified". Falls back to searching the currently-loaded `leads` list if the
  // API has no dedicated ticket_id filter, so this keeps working even without
  // backend changes.
  const verifyByTicketId = useCallback(
    async (rawTicketId) => {
      const ticketId = rawTicketId.trim();
      if (!ticketId) return;

      setScanStatus("verifying");
      setScanMessage(`Looking up ticket ${ticketId}…`);

      try {
        let match = null;

        // 1. Try asking the API directly for this ticket (works if the
        //    backend supports a ticket_id query param).
        try {
          const res = await fetch(
            `${BASE_URL}?ticket_id=${encodeURIComponent(ticketId)}`,
          );
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            match = data.data.find(
              (l) =>
                (l.ticket_id || "").trim().toLowerCase() ===
                ticketId.toLowerCase(),
            );
          }
        } catch {
          // ignore, fall through to client-side search
        }

        // 2. Fall back to fetching the full unfiltered list and matching
        //    locally, in case the API doesn't support the ticket_id filter
        //    or the location filter is currently hiding this student.
        if (!match) {
          const res = await fetch(BASE_URL);
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            match = data.data.find(
              (l) =>
                (l.ticket_id || "").trim().toLowerCase() ===
                ticketId.toLowerCase(),
            );
          }
        }

        if (!match) {
          setScanStatus("error");
          setScanMessage(`No registration found for ticket "${ticketId}".`);
          return;
        }

        if (match.status === "verified") {
          setScanStatus("success");
          setScanMessage(`${match.full_name} is already verified.`);
          fetchLeads();
          return;
        }

        const patchRes = await fetch(`${BASE_URL}/${match.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "verified" }),
        });
        const patchData = await patchRes.json();

        if (patchData.success) {
          setScanStatus("success");
          setScanMessage(`${match.full_name} marked as verified ✔`);
          fetchLeads();
        } else {
          setScanStatus("error");
          setScanMessage(patchData.message || "Failed to update status.");
        }
      } catch (err) {
        setScanStatus("error");
        setScanMessage("Network error while verifying ticket.");
      }
    },
    [fetchLeads],
  );

  // Safely stops & releases an Html5Qrcode instance. Waits for any in-flight
  // start() to settle first, and only calls stop() when the camera is
  // actually running. Calling stop()/clear() out of turn (e.g. while start()
  // is still pending, or twice on the same instance) is what causes the
  // "already under transition" and "play() interrupted" errors.
  const teardownScanner = useCallback(async (instance) => {
    if (!instance) return;
    try {
      if (startPromiseRef.current) {
        await startPromiseRef.current.catch(() => {});
      }
      const state = instance.getState ? instance.getState() : null;
      if (
        state === Html5QrcodeScannerState.SCANNING ||
        state === Html5QrcodeScannerState.PAUSED
      ) {
        await instance.stop();
      }
      instance.clear();
    } catch {
      // Camera may already be stopped/torn down — safe to ignore.
    } finally {
      if (qrRef.current === instance) qrRef.current = null;
      startPromiseRef.current = null;
    }
  }, []);

  // FIX: previously this passed the raw multi-line QR text straight into
  // verifyByTicketId(), which then searched for the *entire block* as if it
  // were the ticket_id — guaranteed to never match anything in the DB. Now
  // we extract just the "Ticket ID: GUE26-..." value first.
  const handleScanSuccess = useCallback(
    (decodedText) => {
      if (isProcessingScan.current) return;
      isProcessingScan.current = true;

      const ticketId = extractTicketId(decodedText);

      // Fully stop the camera before we do anything else with this instance.
      teardownScanner(qrRef.current).finally(() => {
        verifyByTicketId(ticketId).finally(() => {
          isProcessingScan.current = false;
        });
      });
    },
    [verifyByTicketId, teardownScanner],
  );

  const startScanner = () => {
    setScanStatus("starting");
    setScanMessage("");
    isProcessingScan.current = false;
    setShowScanner(true);
  };

  // Stops the camera and waits for it to fully release BEFORE unmounting the
  // modal (and its video element) — removing the DOM node while a play()
  // call is still in flight is what triggers the "media removed from
  // document" error.
  const stopScanner = useCallback(async () => {
    await teardownScanner(qrRef.current);
    setShowScanner(false);
    setScanStatus("idle");
    setScanMessage("");
  }, [teardownScanner]);

  const rescan = useCallback(async () => {
    await teardownScanner(qrRef.current);
    setScanStatus("starting");
    setScanMessage("");
    isProcessingScan.current = false;
    setScanAttempt((n) => n + 1);
  }, [teardownScanner]);

  // Boots the camera once the scanner modal + its target div are in the DOM.
  // Only `showScanner` (initial open) and `scanAttempt` (explicit "Scan
  // Another") create a new instance — scanStatus is never a dependency here,
  // so display-only state changes never re-trigger start()/stop().
  useEffect(() => {
    if (!showScanner) return;

    let cancelled = false;
    const html5Qr = new Html5Qrcode(QR_ELEMENT_ID);
    qrRef.current = html5Qr;

    const scanConfig = {
      fps: 10,
      qrbox: { width: 280, height: 280 },
      // Use the browser's built-in barcode detector when the device
      // supports it (most modern Android Chrome, some iOS Safari) — it's
      // notably faster and more reliable on dense QR codes than the
      // pure-JS fallback decoder.
      experimentalFeatures: { useBarCodeDetectorIfSupported: true },
      // Ask for a sharper feed to help decode dense QR codes — this is
      // the correct place for resolution hints; merging width/height into
      // the camera-selection object below breaks getUserMedia on some
      // browsers.
      videoConstraints: {
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };
    const onDecode = (decodedText) => handleScanSuccess(decodedText);
    const onFrameMiss = () => {
      // per-frame "no QR found" callback — ignore, expected while aiming
    };

    // Rear camera first (phones/tablets). Most laptop webcams don't report
    // an "environment" facing mode at all, so this constraint fails there
    // with an OverconstrainedError — in that case fall back to whatever
    // camera is actually available (e.g. the built-in front-facing webcam).
    const startPromise = html5Qr
      .start({ facingMode: "environment" }, scanConfig, onDecode, onFrameMiss)
      .catch(async () => {
        const cameras = await Html5Qrcode.getCameras().catch(() => []);
        if (!cameras.length) {
          throw new Error("No camera devices found.");
        }
        return html5Qr.start(
          { deviceId: { exact: cameras[0].id } },
          scanConfig,
          onDecode,
          onFrameMiss,
        );
      });
    startPromiseRef.current = startPromise;

    startPromise
      .then(() => {
        startPromiseRef.current = null;
        if (!cancelled) setScanStatus("scanning");
      })
      .catch(() => {
        startPromiseRef.current = null;
        if (!cancelled) {
          setScanStatus("error");
          setScanMessage(
            "Could not access the camera. Check camera permissions and try again.",
          );
        }
      });

    return () => {
      cancelled = true;
      // handleScanSuccess/stopScanner/rescan already tear down explicitly
      // before they trigger the state change that leads to this cleanup
      // (e.g. before setShowScanner(false)). This only fires for real when
      // the component unmounts outright while a scan is still active.
      if (qrRef.current === html5Qr) {
        teardownScanner(html5Qr);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showScanner, scanAttempt]);

  // ── CSV export, exposed to parent via ref ───────────────────────────────────
  useImperativeHandle(ref, () => ({
    downloadCSV: () => {
      const rowsToExport =
        selectedIds.size > 0
          ? displayedLeads.filter((lead) => selectedIds.has(lead.id))
          : displayedLeads;

      const dataToExport = rowsToExport.map((lead) => ({
        ID: lead.id,
        "Full Name": lead.full_name,
        Email: lead.email,
        Mobile: lead.mobile,
        Destination: lead.destination || "-",
        "Expo Location": lead.expo_location || "-",
        "Expo Date": lead.expo_date || "-",
        "Expo Time": lead.expo_time || "-",
        "Expo Venue": lead.expo_venue || "-",
        "Ticket ID": lead.ticket_id || "-",
        Status: lead.status || "pending",
        "Sheet Sync": lead.sheet_sync_status || "-",
        "Student Email": lead.student_email_status || "-",
        "Branch Email": lead.branch_email_status || "-",
        "Created At": lead.created_at
          ? new Date(lead.created_at).toLocaleString()
          : "-",
        "Verified At": lead.verified_at
          ? new Date(lead.verified_at).toLocaleString()
          : "-",
      }));
      exportToCSV(dataToExport, "global_uniexpo_leads.csv");
    },
  }));

  const isReadOnly = panelMode === "view";
  const panelTitle =
    panelMode === "edit"
      ? "Edit Uni-Expo Registration"
      : "View Uni-Expo Registration";

  return (
    <div className="">
      {/* ── Delete Confirmation Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Delete Registration?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── QR Scanner Modal ── */}
      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm text-center">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-gray-800">
                Scan Ticket QR
              </h3>
              <button
                onClick={stopScanner}
                className="text-gray-400 hover:text-black text-xl"
              >
                <MdCancel />
              </button>
            </div>

            {/* Camera preview target — html5-qrcode injects the <video> here */}
            <div
              id={QR_ELEMENT_ID}
              className="w-full rounded-lg overflow-hidden bg-black min-h-[250px]"
            />

            <div className="mt-4 min-h-[40px]">
              {scanStatus === "starting" && (
                <p className="text-xs text-gray-500">Starting camera…</p>
              )}
              {scanStatus === "scanning" && (
                <p className="text-xs text-gray-500">
                  Point the camera at the ticket's QR code.
                </p>
              )}
              {scanStatus === "verifying" && (
                <p className="text-xs text-indigo-600 font-medium">
                  {scanMessage}
                </p>
              )}
              {scanStatus === "success" && (
                <p className="text-xs text-green-600 font-semibold flex items-center justify-center gap-1">
                  <FaCheckCircle size={12} />
                  {scanMessage}
                </p>
              )}
              {scanStatus === "error" && (
                <p className="text-xs text-red-500 font-medium">
                  {scanMessage}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center mt-3">
              {(scanStatus === "success" || scanStatus === "error") && (
                <button
                  onClick={rescan}
                  className="px-5 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition-all"
                >
                  Scan Another
                </button>
              )}
              <button
                onClick={stopScanner}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── Top Controls ── */}
      {/* <div className="mt-8">
        <div className="flex gap-4 w-full justify-between items-center">
          <div className="flex gap-3 items-center">
            
            <button
              onClick={startScanner}
              title="Scan a ticket QR code to verify a student"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 hover:scale-95 transition-all duration-300"
            >
              <MdQrCodeScanner size={16} />
              Scan
            </button>
          </div>
        </div>
      </div> */}
      {/* Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 items-center gap-8 text-gray-700 font-semibold mt-5">
        <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
          <div>
            <p className="text-sm font-normal">Total Student Leads</p>
            <p className="mt-2 text-lg text-black">{totalLeadsCount}</p>
          </div>

          <div>
            <PiStudentFill className="bg-indigo-900 text-white text-3xl p-1.5 rounded-md" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
          <div>
            <p className="text-sm font-normal">Approved/Verified Leads</p>
            <p className="mt-2 text-lg text-black">{verifiedLeadsCount}</p>
          </div>

          <div>
            <GiCheckMark className="bg-indigo-900 text-3xl text-white p-1.5 rounded-md" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-5 border border-[#E7E7F8] py-2 px-4 rounded-lg h-full">
          <div>
            <p className="text-sm font-normal">Pending Leads</p>
            <p className="mt-2 text-lg text-black">{pendingLeadsCount}</p>
          </div>

          <div>
            <MdOutlinePendingActions className="bg-indigo-900 text-3xl text-white p-1.5 rounded-md" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex gap-4 w-full justify-between items-center">
          <div className="flex gap-3 items-center">
            <button
              onClick={startScanner}
              title="Scan a ticket QR code to verify a student"
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 hover:scale-95 transition-all duration-300"
            >
              <MdQrCodeScanner size={16} />
              Scan
            </button>
            {selectedIds.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedIds.size} selected
              </span>
            )}
          </div>
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
              {selectedLead && <StatusBadge status={form.status} />}
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

            {/* Read-only meta, shown for both view and edit */}
            {selectedLead && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
                <div className="border rounded-lg px-3 py-2 bg-gray-50">
                  <p className="text-[10px] text-gray-400 font-semibold">
                    SHEET SYNC
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedLead.sheet_sync_status}
                  </p>
                </div>
                <div className="border rounded-lg px-3 py-2 bg-gray-50">
                  <p className="text-[10px] text-gray-400 font-semibold">
                    STUDENT EMAIL
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedLead.student_email_status}
                  </p>
                </div>
                <div className="border rounded-lg px-3 py-2 bg-gray-50">
                  <p className="text-[10px] text-gray-400 font-semibold">
                    BRANCH EMAIL
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedLead.branch_email_status}
                  </p>
                </div>
                <div className="border rounded-lg px-3 py-2 bg-gray-50">
                  <p className="text-[10px] text-gray-400 font-semibold">
                    CREATED
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedLead.created_at
                      ? new Date(selectedLead.created_at).toLocaleDateString(
                          "en-GB",
                        )
                      : "-"}
                  </p>
                </div>
                <div className="border rounded-lg px-3 py-2 bg-gray-50">
                  <p className="text-[10px] text-gray-400 font-semibold">
                    VERIFIED AT
                  </p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedLead.verified_at
                      ? new Date(selectedLead.verified_at).toLocaleString(
                          "en-GB",
                        )
                      : "—"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
              {/* Full Name */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter full name"
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
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter email address"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Mobile */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Mobile Number <span className="text-red-400">*</span>
                </label>
                <input
                  name="mobile"
                  maxLength={15}
                  value={form.mobile}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    handleChange({
                      target: { name: "mobile", value: digitsOnly },
                    });
                  }}
                  readOnly={isReadOnly}
                  placeholder="Enter mobile number"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Destination */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Study Destination
                </label>
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter study destination"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Expo Location */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Expo Location <span className="text-red-400">*</span>
                </label>
                <input
                  name="expoLocation"
                  value={form.expoLocation}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="e.g. rajkot"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Expo Date */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Expo Date <span className="text-red-400">*</span>
                </label>
                <input
                  name="expoDate"
                  value={form.expoDate}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="e.g. 24th sept 2026"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Expo Time */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Expo Time
                </label>
                <input
                  name="expoTime"
                  value={form.expoTime}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="e.g. 09:00 AM - 04:00 PM"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Expo Venue */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Expo Venue
                </label>
                <input
                  name="expoVenue"
                  value={form.expoVenue}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter venue"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Branch Phone */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Branch Phone
                </label>
                <input
                  name="branchPhone"
                  value={form.branchPhone}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter branch phone"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>

              {/* Ticket ID */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Ticket ID
                </label>
                <input
                  name="ticketId"
                  value={form.ticketId}
                  readOnly
                  disabled
                  className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-500 cursor-default"
                />
              </div>

              {/* Status — editable only in edit mode */}
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
                  Status
                </label>
                {isReadOnly ? (
                  <div className="border-gray-400 p-3 border rounded-lg w-full bg-gray-50">
                    <StatusBadge status={form.status} />
                  </div>
                ) : (
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                  </select>
                )}
              </div>

              {/* Branch Address */}
              <div className="flex flex-col w-full sm:col-span-2">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
                  Branch Address
                </label>
                <input
                  name="branchAddress"
                  value={form.branchAddress}
                  onChange={handleChange}
                  readOnly={isReadOnly}
                  placeholder="Enter branch address"
                  className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
                    isReadOnly ? "bg-gray-50 cursor-default" : ""
                  }`}
                />
              </div>
            </div>

            {/* Action buttons — edit mode only */}
            {!isReadOnly && (
              <div className="flex items-center gap-3 mt-10">
                <button
                  onClick={closePanel}
                  className="w-36 px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 transition-all duration-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-36 px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 transition-all duration-300 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
                <th className="p-4">
                  <input
                    type="checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={toggleSelectAllCurrentPage}
                    className="cursor-pointer"
                  />{" "}
                </th>
                <th className="p-4">ID</th>
                <th className="p-4">Full Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Mobile</th>
                <th className="p-4">Expo Location</th>
                <th className="p-4">Expo Date</th>
                <th className="p-4">Ticket ID</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : currentLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">
                    No registrations found.
                  </td>
                </tr>
              ) : (
                currentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelectOne(lead.id)}
                        className="cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-4 font-semibold">{lead.id}</td>
                    <td className="px-4 py-4">{lead.full_name}</td>
                    <td className="px-4 py-4">{lead.email}</td>
                    <td className="px-4 py-4">{lead.mobile}</td>
                    <td className="px-4 py-4">{lead.expo_location || "—"}</td>
                    <td className="px-4 py-4">{lead.expo_date || "—"}</td>
                    <td className="px-4 py-4">{lead.ticket_id || "—"}</td>

                    {/* Status column */}
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(lead)}
                        disabled={togglingId === lead.id}
                        title={
                          lead.status === "verified"
                            ? "Click to mark as pending"
                            : "Click to mark as verified"
                        }
                        className="disabled:opacity-50 disabled:cursor-wait"
                      >
                        <StatusBadge status={lead.status} />
                      </button>
                    </td>

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

export default UniExpoLeads;
// import React, {
//   forwardRef,
//   useImperativeHandle,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
// } from "react";
// import {
//   MdKeyboardDoubleArrowLeft,
//   MdKeyboardDoubleArrowRight,
//   MdCancel,
//   MdQrCodeScanner,
// } from "react-icons/md";
// import { FaEdit, FaEye, FaCheckCircle } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
// import { exportToCSV } from "../../exportToCSV";
// import { L_API_URL } from "../../Config";

// const BASE_URL = `${L_API_URL}/api/expo-registrations`;

// // DOM id for the div the html5-qrcode library mounts the camera view into.
// const QR_ELEMENT_ID = "expo-ticket-qr-reader";

// const EMPTY_FORM = {
//   fullName: "",
//   email: "",
//   mobile: "",
//   destination: "",
//   expoLocation: "",
//   expoDate: "",
//   expoTime: "",
//   expoVenue: "",
//   branchPhone: "",
//   branchAddress: "",
//   ticketId: "",
//   status: "pending",
// };

// // DB row (snake_case) -> form state (camelCase)
// const rowToForm = (row) => ({
//   fullName: row.full_name || "",
//   email: row.email || "",
//   mobile: row.mobile || "",
//   destination: row.destination || "",
//   expoLocation: row.expo_location || "",
//   expoDate: row.expo_date || "",
//   expoTime: row.expo_time || "",
//   expoVenue: row.expo_venue || "",
//   branchPhone: row.branch_phone || "",
//   branchAddress: row.branch_address || "",
//   ticketId: row.ticket_id || "",
//   status: row.status || "pending",
// });

// // ── Status badge, reused in table + view/edit panel ─────────────────────────
// const StatusBadge = ({ status }) => {
//   const isVerified = status === "verified";
//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
//         isVerified ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
//       }`}
//     >
//       {isVerified ? (
//         <FaCheckCircle size={12} className="text-green-600" />
//       ) : (
//         <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
//       )}
//       {isVerified ? "Verified" : "Pending"}
//     </span>
//   );
// };

// // ─── Component ────────────────────────────────────────────────────────────────
// const UniExpoLeads = forwardRef((props, ref) => {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Filter
//   const [filterLocation, setFilterLocation] = useState("");

//   // Pagination
//   const rowsPerPage = 20;
//   const [currentPage, setCurrentPage] = useState(1);

//   // Panel: null | "edit" | "view"
//   const [panelMode, setPanelMode] = useState(null);
//   const [selectedLead, setSelectedLead] = useState(null);

//   // Form state
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [formError, setFormError] = useState("");
//   const [saving, setSaving] = useState(false);

//   // Delete confirmation
//   const [deleteId, setDeleteId] = useState(null);
//   const [deleting, setDeleting] = useState(false);

//   // Row-level status toggle in flight (disables the button while patching)
//   const [togglingId, setTogglingId] = useState(null);

//   // ── QR ticket scanner state ─────────────────────────────────────────────────
//   const [showScanner, setShowScanner] = useState(false);
//   // idle -> "starting" -> "scanning" -> "verifying" -> "success" | "error"
//   const [scanStatus, setScanStatus] = useState("idle");
//   const [scanMessage, setScanMessage] = useState("");
//   const [scanAttempt, setScanAttempt] = useState(0); // bump to force a fresh camera session
//   const qrRef = useRef(null); // holds the current Html5Qrcode instance
//   const startPromiseRef = useRef(null); // the in-flight start() promise, if any
//   const isProcessingScan = useRef(false); // guards against duplicate scans firing

//   // ── Fetch leads ─────────────────────────────────────────────────────────────
//   const fetchLeads = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const params = filterLocation
//         ? `?expo_location=${encodeURIComponent(filterLocation)}`
//         : "";
//       const res = await fetch(`${BASE_URL}${params}`);
//       const data = await res.json();
//       if (data.success) {
//         setLeads(data.data);
//         setCurrentPage(1);
//       } else {
//         setError(data.message || "Failed to fetch registrations");
//       }
//     } catch (err) {
//       setError("Network error. Could not fetch registrations.");
//     } finally {
//       setLoading(false);
//     }
//   }, [filterLocation]);

//   useEffect(() => {
//     fetchLeads();
//   }, [fetchLeads]);

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
//   const openView = (lead) => {
//     setSelectedLead(lead);
//     setForm(rowToForm(lead));
//     setFormError("");
//     setPanelMode("view");
//   };

//   const openEdit = (lead) => {
//     setSelectedLead(lead);
//     setForm(rowToForm(lead));
//     setFormError("");
//     setPanelMode("edit");
//   };

//   const closePanel = () => {
//     setPanelMode(null);
//     setSelectedLead(null);
//     setForm(EMPTY_FORM);
//     setFormError("");
//   };

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   // ── Validate ─────────────────────────────────────────────────────────────────
//   const validate = () => {
//     if (!form.fullName.trim()) return "Full name is required.";
//     if (!form.email.trim()) return "Email is required.";
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
//       return "Enter a valid email address.";
//     if (!form.mobile.trim()) return "Mobile number is required.";
//     if (!form.expoLocation.trim()) return "Expo location is required.";
//     if (!form.expoDate.trim()) return "Expo date is required.";
//     return "";
//   };

//   // ── Save (Edit only — no add flow for this tab yet) ─────────────────────────
//   const handleSave = async () => {
//     const validationError = validate();
//     if (validationError) {
//       setFormError(validationError);
//       return;
//     }
//     setFormError("");
//     setSaving(true);

//     try {
//       const res = await fetch(`${BASE_URL}/${selectedLead.id}`, {
//         method: "PUT",
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

//   // ── Quick status toggle (from table row, no full edit needed) ──────────────
//   const handleToggleStatus = async (lead) => {
//     const nextStatus = lead.status === "verified" ? "pending" : "verified";
//     setTogglingId(lead.id);
//     try {
//       const res = await fetch(`${BASE_URL}/${lead.id}/status`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: nextStatus }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         setLeads((prev) =>
//           prev.map((l) =>
//             l.id === lead.id ? { ...l, status: nextStatus } : l,
//           ),
//         );
//       } else {
//         alert(data.message || "Failed to update status.");
//       }
//     } catch {
//       alert("Network error. Could not update status.");
//     } finally {
//       setTogglingId(null);
//     }
//   };

//   // ── Delete ───────────────────────────────────────────────────────────────────
//   const handleDeleteConfirm = async () => {
//     if (!deleteId) return;
//     setDeleting(true);
//     try {
//       const res = await fetch(`${BASE_URL}/${deleteId}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       if (data.success) {
//         setDeleteId(null);
//         fetchLeads();
//       } else {
//         alert(data.message || "Delete failed.");
//       }
//     } catch {
//       alert("Network error. Delete failed.");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ── QR ticket scan → verify ──────────────────────────────────────────────────
//   // Looks up a registration by its ticket_id and, if found, sets its status to
//   // "verified". Falls back to searching the currently-loaded `leads` list if the
//   // API has no dedicated ticket_id filter, so this keeps working even without
//   // backend changes.
//   const verifyByTicketId = useCallback(
//     async (rawTicketId) => {
//       const ticketId = rawTicketId.trim();
//       if (!ticketId) return;

//       setScanStatus("verifying");
//       setScanMessage(`Looking up ticket ${ticketId}…`);

//       try {
//         let match = null;

//         // 1. Try asking the API directly for this ticket (works if the
//         //    backend supports a ticket_id query param).
//         try {
//           const res = await fetch(
//             `${BASE_URL}?ticket_id=${encodeURIComponent(ticketId)}`,
//           );
//           const data = await res.json();
//           if (data.success && Array.isArray(data.data)) {
//             match = data.data.find(
//               (l) =>
//                 (l.ticket_id || "").trim().toLowerCase() ===
//                 ticketId.toLowerCase(),
//             );
//           }
//         } catch {
//           // ignore, fall through to client-side search
//         }

//         // 2. Fall back to fetching the full unfiltered list and matching
//         //    locally, in case the API doesn't support the ticket_id filter
//         //    or the location filter is currently hiding this student.
//         if (!match) {
//           const res = await fetch(BASE_URL);
//           const data = await res.json();
//           if (data.success && Array.isArray(data.data)) {
//             match = data.data.find(
//               (l) =>
//                 (l.ticket_id || "").trim().toLowerCase() ===
//                 ticketId.toLowerCase(),
//             );
//           }
//         }

//         if (!match) {
//           setScanStatus("error");
//           setScanMessage(`No registration found for ticket "${ticketId}".`);
//           return;
//         }

//         if (match.status === "verified") {
//           setScanStatus("success");
//           setScanMessage(`${match.full_name} is already verified.`);
//           fetchLeads();
//           return;
//         }

//         const patchRes = await fetch(`${BASE_URL}/${match.id}/status`, {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ status: "verified" }),
//         });
//         const patchData = await patchRes.json();

//         if (patchData.success) {
//           setScanStatus("success");
//           setScanMessage(`${match.full_name} marked as verified ✔`);
//           fetchLeads();
//         } else {
//           setScanStatus("error");
//           setScanMessage(patchData.message || "Failed to update status.");
//         }
//       } catch (err) {
//         setScanStatus("error");
//         setScanMessage("Network error while verifying ticket.");
//       }
//     },
//     [fetchLeads],
//   );

//   // Safely stops & releases an Html5Qrcode instance. Waits for any in-flight
//   // start() to settle first, and only calls stop() when the camera is
//   // actually running. Calling stop()/clear() out of turn (e.g. while start()
//   // is still pending, or twice on the same instance) is what causes the
//   // "already under transition" and "play() interrupted" errors.
//   const teardownScanner = useCallback(async (instance) => {
//     if (!instance) return;
//     try {
//       if (startPromiseRef.current) {
//         await startPromiseRef.current.catch(() => {});
//       }
//       const state = instance.getState ? instance.getState() : null;
//       if (
//         state === Html5QrcodeScannerState.SCANNING ||
//         state === Html5QrcodeScannerState.PAUSED
//       ) {
//         await instance.stop();
//       }
//       instance.clear();
//     } catch {
//       // Camera may already be stopped/torn down — safe to ignore.
//     } finally {
//       if (qrRef.current === instance) qrRef.current = null;
//       startPromiseRef.current = null;
//     }
//   }, []);

//   const handleScanSuccess = useCallback(
//     (decodedText) => {
//       if (isProcessingScan.current) return;
//       isProcessingScan.current = true;

//       // Fully stop the camera before we do anything else with this instance.
//       teardownScanner(qrRef.current).finally(() => {
//         verifyByTicketId(decodedText).finally(() => {
//           isProcessingScan.current = false;
//         });
//       });
//     },
//     [verifyByTicketId, teardownScanner],
//   );

//   const startScanner = () => {
//     setScanStatus("starting");
//     setScanMessage("");
//     isProcessingScan.current = false;
//     setShowScanner(true);
//   };

//   // Stops the camera and waits for it to fully release BEFORE unmounting the
//   // modal (and its video element) — removing the DOM node while a play()
//   // call is still in flight is what triggers the "media removed from
//   // document" error.
//   const stopScanner = useCallback(async () => {
//     await teardownScanner(qrRef.current);
//     setShowScanner(false);
//     setScanStatus("idle");
//     setScanMessage("");
//   }, [teardownScanner]);

//   const rescan = useCallback(async () => {
//     await teardownScanner(qrRef.current);
//     setScanStatus("starting");
//     setScanMessage("");
//     isProcessingScan.current = false;
//     setScanAttempt((n) => n + 1);
//   }, [teardownScanner]);

//   // Boots the camera once the scanner modal + its target div are in the DOM.
//   // Only `showScanner` (initial open) and `scanAttempt` (explicit "Scan
//   // Another") create a new instance — scanStatus is never a dependency here,
//   // so display-only state changes never re-trigger start()/stop().
//   useEffect(() => {
//     if (!showScanner) return;

//     let cancelled = false;
//     const html5Qr = new Html5Qrcode(QR_ELEMENT_ID);
//     qrRef.current = html5Qr;

//     const scanConfig = { fps: 10, qrbox: { width: 250, height: 250 } };
//     const onDecode = (decodedText) => handleScanSuccess(decodedText);
//     const onFrameMiss = () => {
//       // per-frame "no QR found" callback — ignore, expected while aiming
//     };

//     // Rear camera first (phones/tablets). Most laptop webcams don't report
//     // an "environment" facing mode at all, so this constraint fails there
//     // with an OverconstrainedError — in that case fall back to whatever
//     // camera is actually available (e.g. the built-in front-facing webcam).
//     const startPromise = html5Qr
//       .start({ facingMode: "environment" }, scanConfig, onDecode, onFrameMiss)
//       .catch(async () => {
//         const cameras = await Html5Qrcode.getCameras().catch(() => []);
//         if (!cameras.length) {
//           throw new Error("No camera devices found.");
//         }
//         return html5Qr.start(
//           { deviceId: { exact: cameras[0].id } },
//           scanConfig,
//           onDecode,
//           onFrameMiss,
//         );
//       });
//     startPromiseRef.current = startPromise;

//     startPromise
//       .then(() => {
//         startPromiseRef.current = null;
//         if (!cancelled) setScanStatus("scanning");
//       })
//       .catch(() => {
//         startPromiseRef.current = null;
//         if (!cancelled) {
//           setScanStatus("error");
//           setScanMessage(
//             "Could not access the camera. Check camera permissions and try again.",
//           );
//         }
//       });

//     return () => {
//       cancelled = true;
//       // handleScanSuccess/stopScanner/rescan already tear down explicitly
//       // before they trigger the state change that leads to this cleanup
//       // (e.g. before setShowScanner(false)). This only fires for real when
//       // the component unmounts outright while a scan is still active.
//       if (qrRef.current === html5Qr) {
//         teardownScanner(html5Qr);
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [showScanner, scanAttempt]);

//   // ── CSV export, exposed to parent via ref ───────────────────────────────────
//   useImperativeHandle(ref, () => ({
//     downloadCSV: () => {
//       const dataToExport = leads.map((lead) => ({
//         ID: lead.id,
//         "Full Name": lead.full_name,
//         Email: lead.email,
//         Mobile: lead.mobile,
//         Destination: lead.destination || "-",
//         "Expo Location": lead.expo_location || "-",
//         "Expo Date": lead.expo_date || "-",
//         "Expo Time": lead.expo_time || "-",
//         "Expo Venue": lead.expo_venue || "-",
//         "Ticket ID": lead.ticket_id || "-",
//         Status: lead.status || "pending",
//         "Sheet Sync": lead.sheet_sync_status || "-",
//         "Student Email": lead.student_email_status || "-",
//         "Branch Email": lead.branch_email_status || "-",
//         "Created At": lead.created_at
//           ? new Date(lead.created_at).toLocaleString()
//           : "-",
//       }));
//       exportToCSV(dataToExport, "global_uniexpo_leads.csv");
//     },
//   }));

//   const isReadOnly = panelMode === "view";
//   const panelTitle =
//     panelMode === "edit"
//       ? "Edit Uni-Expo Registration"
//       : "View Uni-Expo Registration";

//   return (
//     <div className="">
//       {/* ── Delete Confirmation Modal ── */}
//       {deleteId && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-xl shadow-xl p-6 w-80 text-center">
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               Delete Registration?
//             </h3>
//             <p className="text-sm text-gray-500 mb-6">
//               This action cannot be undone.
//             </p>
//             <div className="flex gap-3 justify-center">
//               <button
//                 onClick={() => setDeleteId(null)}
//                 disabled={deleting}
//                 className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all disabled:opacity-60"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleDeleteConfirm}
//                 disabled={deleting}
//                 className="px-5 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-60"
//               >
//                 {deleting ? "Deleting…" : "Delete"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── QR Scanner Modal ── */}
//       {showScanner && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-sm text-center">
//             <div className="flex justify-between items-center mb-3">
//               <h3 className="text-base font-semibold text-gray-800">
//                 Scan Ticket QR
//               </h3>
//               <button
//                 onClick={stopScanner}
//                 className="text-gray-400 hover:text-black text-xl"
//               >
//                 <MdCancel />
//               </button>
//             </div>

//             {/* Camera preview target — html5-qrcode injects the <video> here */}
//             <div
//               id={QR_ELEMENT_ID}
//               className="w-full rounded-lg overflow-hidden bg-black min-h-[250px]"
//             />

//             <div className="mt-4 min-h-[40px]">
//               {scanStatus === "starting" && (
//                 <p className="text-xs text-gray-500">Starting camera…</p>
//               )}
//               {scanStatus === "scanning" && (
//                 <p className="text-xs text-gray-500">
//                   Point the camera at the ticket's QR code.
//                 </p>
//               )}
//               {scanStatus === "verifying" && (
//                 <p className="text-xs text-indigo-600 font-medium">
//                   {scanMessage}
//                 </p>
//               )}
//               {scanStatus === "success" && (
//                 <p className="text-xs text-green-600 font-semibold flex items-center justify-center gap-1">
//                   <FaCheckCircle size={12} />
//                   {scanMessage}
//                 </p>
//               )}
//               {scanStatus === "error" && (
//                 <p className="text-xs text-red-500 font-medium">
//                   {scanMessage}
//                 </p>
//               )}
//             </div>

//             <div className="flex gap-3 justify-center mt-3">
//               {(scanStatus === "success" || scanStatus === "error") && (
//                 <button
//                   onClick={rescan}
//                   className="px-5 py-2 rounded-lg bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 transition-all"
//                 >
//                   Scan Another
//                 </button>
//               )}
//               <button
//                 onClick={stopScanner}
//                 className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-all"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Top Controls ── */}
//       <div className="mt-8">
//         <div className="flex gap-4 w-full justify-between items-center">
//           <div className="flex gap-3 items-center">
//             <input
//               type="text"
//               placeholder="Filter by expo location (e.g. rajkot)"
//               value={filterLocation}
//               onChange={(e) => setFilterLocation(e.target.value)}
//               className="px-3 py-2 font-medium text-sm text-indigo-900 rounded-md bg-transparent focus:outline-none focus:ring-0 border border-indigo-900 transition-all duration-300 w-72"
//             />
//             <button
//               onClick={startScanner}
//               title="Scan a ticket QR code to verify a student"
//               className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-900 text-white text-sm font-medium hover:bg-indigo-800 hover:scale-95 transition-all duration-300"
//             >
//               <MdQrCodeScanner size={16} />
//               Scan
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Slide Panel ── */}
//       <div className="relative z-50">
//         {panelMode && (
//           <div
//             onClick={closePanel}
//             className="fixed inset-0 bg-black bg-opacity-30 z-40"
//           />
//         )}

//         <div
//           className={`fixed top-0 right-0 h-full w-[85%] md:w-[680px] bg-white z-50 shadow-lg transform transition-transform duration-500 ease-in-out ${
//             panelMode ? "translate-x-0" : "translate-x-full"
//           }`}
//         >
//           <div className="p-4 flex justify-between items-start border-b">
//             <div className="flex items-center gap-3">
//               <h2 className="text-[#1D2826] text-lg font-semibold">
//                 {panelTitle}
//               </h2>
//               {selectedLead && <StatusBadge status={form.status} />}
//             </div>
//             <button
//               onClick={closePanel}
//               className="text-gray-500 hover:text-black text-xl"
//             >
//               <MdCancel />
//             </button>
//           </div>

//           <div className="max-h-[90vh] overflow-y-auto p-5">
//             {formError && (
//               <p className="mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                 {formError}
//               </p>
//             )}

//             {/* Read-only meta, shown for both view and edit */}
//             {selectedLead && (
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
//                 <div className="border rounded-lg px-3 py-2 bg-gray-50">
//                   <p className="text-[10px] text-gray-400 font-semibold">
//                     SHEET SYNC
//                   </p>
//                   <p className="text-xs font-medium text-gray-700">
//                     {selectedLead.sheet_sync_status}
//                   </p>
//                 </div>
//                 <div className="border rounded-lg px-3 py-2 bg-gray-50">
//                   <p className="text-[10px] text-gray-400 font-semibold">
//                     STUDENT EMAIL
//                   </p>
//                   <p className="text-xs font-medium text-gray-700">
//                     {selectedLead.student_email_status}
//                   </p>
//                 </div>
//                 <div className="border rounded-lg px-3 py-2 bg-gray-50">
//                   <p className="text-[10px] text-gray-400 font-semibold">
//                     BRANCH EMAIL
//                   </p>
//                   <p className="text-xs font-medium text-gray-700">
//                     {selectedLead.branch_email_status}
//                   </p>
//                 </div>
//                 <div className="border rounded-lg px-3 py-2 bg-gray-50">
//                   <p className="text-[10px] text-gray-400 font-semibold">
//                     CREATED
//                   </p>
//                   <p className="text-xs font-medium text-gray-700">
//                     {selectedLead.created_at
//                       ? new Date(selectedLead.created_at).toLocaleDateString(
//                           "en-GB",
//                         )
//                       : "-"}
//                   </p>
//                 </div>
//               </div>
//             )}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2 items-center">
//               {/* Full Name */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Full Name <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   name="fullName"
//                   value={form.fullName}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter full name"
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
//                   name="email"
//                   value={form.email}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter email address"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Mobile */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Mobile Number <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   name="mobile"
//                   maxLength={15}
//                   value={form.mobile}
//                   onChange={(e) => {
//                     const digitsOnly = e.target.value.replace(/\D/g, "");
//                     handleChange({
//                       target: { name: "mobile", value: digitsOnly },
//                     });
//                   }}
//                   readOnly={isReadOnly}
//                   placeholder="Enter mobile number"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Destination */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Study Destination
//                 </label>
//                 <input
//                   name="destination"
//                   value={form.destination}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter study destination"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Expo Location */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Expo Location <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   name="expoLocation"
//                   value={form.expoLocation}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="e.g. rajkot"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Expo Date */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Expo Date <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   name="expoDate"
//                   value={form.expoDate}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="e.g. 24th sept 2026"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Expo Time */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Expo Time
//                 </label>
//                 <input
//                   name="expoTime"
//                   value={form.expoTime}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="e.g. 09:00 AM - 04:00 PM"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Expo Venue */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Expo Venue
//                 </label>
//                 <input
//                   name="expoVenue"
//                   value={form.expoVenue}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter venue"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Branch Phone */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Branch Phone
//                 </label>
//                 <input
//                   name="branchPhone"
//                   value={form.branchPhone}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter branch phone"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>

//               {/* Ticket ID */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Ticket ID
//                 </label>
//                 <input
//                   name="ticketId"
//                   value={form.ticketId}
//                   readOnly
//                   disabled
//                   className="border-gray-400 p-3 text-sm border rounded-lg w-full bg-gray-50 text-gray-500 cursor-default"
//                 />
//               </div>

//               {/* Status — editable only in edit mode */}
//               <div className="flex flex-col w-full">
//                 <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-white w-fit">
//                   Status
//                 </label>
//                 {isReadOnly ? (
//                   <div className="border-gray-400 p-3 border rounded-lg w-full bg-gray-50">
//                     <StatusBadge status={form.status} />
//                   </div>
//                 ) : (
//                   <select
//                     name="status"
//                     value={form.status}
//                     onChange={handleChange}
//                     className="border-gray-400 h-11 p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="verified">Verified</option>
//                   </select>
//                 )}
//               </div>

//               {/* Branch Address */}
//               <div className="flex flex-col w-full sm:col-span-2">
//                 <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-white w-fit">
//                   Branch Address
//                 </label>
//                 <input
//                   name="branchAddress"
//                   value={form.branchAddress}
//                   onChange={handleChange}
//                   readOnly={isReadOnly}
//                   placeholder="Enter branch address"
//                   className={`border-gray-400 p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md ${
//                     isReadOnly ? "bg-gray-50 cursor-default" : ""
//                   }`}
//                 />
//               </div>
//             </div>

//             {/* Action buttons — edit mode only */}
//             {!isReadOnly && (
//               <div className="flex items-center gap-3 mt-10">
//                 <button
//                   onClick={closePanel}
//                   className="w-36 px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 transition-all duration-300 text-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSave}
//                   disabled={saving}
//                   className="w-36 px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 transition-all duration-300 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
//                 <th className="p-4">Full Name</th>
//                 <th className="p-4">Email</th>
//                 <th className="p-4">Mobile</th>
//                 <th className="p-4">Expo Location</th>
//                 <th className="p-4">Expo Date</th>
//                 <th className="p-4">Ticket ID</th>
//                 <th className="p-4 text-center">Status</th>
//                 <th className="p-4 text-center">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={9} className="text-center py-8 text-gray-400">
//                     Loading…
//                   </td>
//                 </tr>
//               ) : currentLeads.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="text-center py-8 text-gray-400">
//                     No registrations found.
//                   </td>
//                 </tr>
//               ) : (
//                 currentLeads.map((lead) => (
//                   <tr
//                     key={lead.id}
//                     className="bg-white even:bg-gray-50 border-b border-gray-200 hover:bg-gray-100 text-gray-800"
//                   >
//                     <td className="px-4 py-4 font-semibold">{lead.id}</td>
//                     <td className="px-4 py-4">{lead.full_name}</td>
//                     <td className="px-4 py-4">{lead.email}</td>
//                     <td className="px-4 py-4">{lead.mobile}</td>
//                     <td className="px-4 py-4">{lead.expo_location || "—"}</td>
//                     <td className="px-4 py-4">{lead.expo_date || "—"}</td>
//                     <td className="px-4 py-4">{lead.ticket_id || "—"}</td>

//                     {/* Status column */}
//                     <td className="px-4 py-4 text-center">
//                       <button
//                         onClick={() => handleToggleStatus(lead)}
//                         disabled={togglingId === lead.id}
//                         title={
//                           lead.status === "verified"
//                             ? "Click to mark as pending"
//                             : "Click to mark as verified"
//                         }
//                         className="disabled:opacity-50 disabled:cursor-wait"
//                       >
//                         <StatusBadge status={lead.status} />
//                       </button>
//                     </td>

//                     <td>
//                       <div className="flex justify-center">
//                         <button
//                           onClick={() => openView(lead)}
//                           className="px-2 py-1 text-gray-400 hover:text-black hover:scale-125 transition-all"
//                           title="View"
//                         >
//                           <FaEye size={15} />
//                         </button>
//                         <button
//                           onClick={() => openEdit(lead)}
//                           className="px-2 py-1 text-gray-400 hover:text-sky-500 hover:scale-125 transition-all"
//                           title="Edit"
//                         >
//                           <FaEdit size={14} />
//                         </button>
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

// export default UniExpoLeads;
