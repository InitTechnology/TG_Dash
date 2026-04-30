// StudentDocuments.jsx
// -------------------------------------------------------------------
// Full AI OCR document verification system.
// Drop-in replacement for the original StudentDocuments component.
// Requires: useOCRVerification.js + OCRResultPanel.jsx (same folder)
// -------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import { BiSolidLock } from "react-icons/bi";
import { GiPassport } from "react-icons/gi";
import { MdEditDocument } from "react-icons/md";
import { PiUploadSimpleBold } from "react-icons/pi";
import { X, Loader2 } from "lucide-react";
import { TbRosetteDiscountCheck } from "react-icons/tb";
import { useOCRVerification } from "./useOCRVerification";
import OCRResultPanel from "./OCRResultPanel";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_DOT = {
  verified: "bg-green-500",
  review: "bg-amber-400",
  error: "bg-red-500",
};

// ─── Component ────────────────────────────────────────────────────────────────

const StudentDocuments = () => {
  // ── Sidebar state (unchanged from original) ──────────────────────────────
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("menubarOpen");
    return saved !== null ? JSON.parse(saved) : window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handle = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  // ── Document / upload state ────────────────────────────────────────────
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [checkboxValues, setCheckboxValues] = useState({});

  // ── OCR state: { [docTitle]: resultObject } ────────────────────────────
  const [ocrResults, setOcrResults] = useState({});

  // ── Preview modal state ────────────────────────────────────────────────
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // ── AI OCR hook ────────────────────────────────────────────────────────
  const { verify, isVerifying } = useOCRVerification();

  // ── Derived counters for header ────────────────────────────────────────
  const uploaded = Object.keys(ocrResults).length;
  const verified = Object.values(ocrResults).filter(
    (r) => r.status === "verified",
  ).length;
  const reviewing = Object.values(ocrResults).filter(
    (r) => r.status === "review" || r.status === "error",
  ).length;

  // ─────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const valid = files.filter((f) => allowed.includes(f.type));

    if (valid.length !== files.length) {
      alert("Only image files (JPG, PNG, WEBP) are allowed.");
    }

    const combined = [...uploadedFiles, ...valid].slice(0, 5);
    if (uploadedFiles.length + valid.length > 5) {
      alert("Maximum 5 files allowed per document.");
    }
    setUploadedFiles(combined);
  };

  const removeFile = (idx) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleCheckboxChange = (doc, value) =>
    setCheckboxValues((prev) => ({
      ...prev,
      [doc]: { ...prev[doc], [value]: !prev[doc]?.[value] },
    }));

  // ── Run AI OCR verification ────────────────────────────────────────────
  const handleVerify = async () => {
    if (!selectedDoc || uploadedFiles.length === 0 || isVerifying) return;

    // Close preview modal if open
    setShowPreviewModal(false);

    const result = await verify(selectedDoc, uploadedFiles);
    if (result) {
      setOcrResults((prev) => ({ ...prev, [selectedDoc]: result }));
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // Sub-components (defined inline for colocation)
  // ─────────────────────────────────────────────────────────────────────

  const DocumentCard = ({ title, icon, required = true, children }) => {
    const result = ocrResults[title];
    const isSelected = selectedDoc === title;
    const statusDot = result ? STATUS_DOT[result.status] : null;

    return (
      <div
        onClick={() => {
          if (selectedDoc !== title) {
            setSelectedDoc(title);
            setUploadedFiles([]);
          }
        }}
        className={`relative border p-5 rounded-xl min-h-32 cursor-pointer transition-all
          ${
            isSelected
              ? "border-indigo-400 bg-indigo-50/70 shadow-sm"
              : "border-gray-200 hover:border-indigo-300"
          }`}
      >
        {/* Status / Required badge */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {statusDot && (
            <span
              className={`inline-block w-2 h-2 rounded-full ${statusDot}`}
              title={result.status}
            />
          )}
          {required ? (
            <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
              Required
            </p>
          ) : (
            <p className="bg-gray-100 text-[10px] py-0.5 px-1 rounded text-gray-500 font-medium">
              Optional
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 text-indigo-900 font-medium">
          <div>{icon}</div>
          <p className="text-black text-sm">{title}</p>
        </div>

        <div className="mb-5">{children}</div>

        {/* Verified tick overlay */}
        {result?.status === "verified" && (
          <div className="absolute left-3 bottom-3">
            <TbRosetteDiscountCheck className="text-green-500" size={16} />
          </div>
        )}

        {!result && (
          <div className="absolute left-4 bottom-3">
            <p className="text-[10px] text-gray-400">
              • Click to select &amp; upload
            </p>
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────

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

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex flex-col justify-between items-end gap-5 -mt-1.5">
          {/* Mobile lock button */}
          <div className="lg:hidden">
            <div className="flex gap-2 items-center pl-10 lg:pl-0">
              <button className="w-40 px-3 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 overflow-hidden transition-all duration-700 text-sm">
                <span className="flex items-center justify-center gap-1">
                  <p>Lock&nbsp;Application</p> <BiSolidLock />
                </span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap w-full gap-5 items-center justify-between bg-indigo-50 border border-indigo-200 py-2 px-4 rounded-lg">
            <div>
              <p className="font-semibold text-lg sm:text-xl text-indigo-900">
                Ashish Verma's Documents
              </p>
              <p className="text-xs text-gray-500">Master</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col justify-center items-center text-center">
                <p className="font-semibold">{uploaded}</p>
                <p className="text-[10px] text-gray-500">Uploaded</p>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <p className="text-green-600 font-semibold">{verified}</p>
                <p className="text-[10px] text-gray-500">Verified</p>
              </div>
              <div className="flex flex-col justify-center items-center text-center">
                <p className="text-orange-400 font-semibold">{reviewing}</p>
                <p className="text-[10px] text-gray-500">Review</p>
              </div>

              <div className="hidden lg:block ml-2">
                <button className="w-40 px-3 py-2 bg-indigo-900 rounded-lg text-center text-sm text-white hover:scale-95 overflow-hidden transition-all duration-700">
                  <span className="flex items-center justify-center gap-1">
                    <p>Lock&nbsp;Application</p> <BiSolidLock />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── DOCUMENT GRID ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mt-8">
          <DocumentCard title="Passport" icon={<GiPassport size={30} />} />

          <DocumentCard
            title="Academic Transcripts"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="Statement of Purpose"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="Letter of Recommendation"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="Evidence of Funds"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="GMAT / GRE Scores"
            icon={<MdEditDocument size={30} />}
            required={false}
          >
            <div
              className="text-xs mt-3 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {["GMAT", "GRE"].map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={
                      checkboxValues["GMAT / GRE Scores"]?.[opt] || false
                    }
                    onChange={() =>
                      handleCheckboxChange("GMAT / GRE Scores", opt)
                    }
                    className="scale-90"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </DocumentCard>

          <DocumentCard
            title="CV / RESUME / ESSAY"
            icon={<MdEditDocument size={30} />}
          >
            <div
              className="text-xs mt-3 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {["CV", "RESUME", "ESSAY"].map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={
                      checkboxValues["CV / RESUME / ESSAY"]?.[opt] || false
                    }
                    onChange={() =>
                      handleCheckboxChange("CV / RESUME / ESSAY", opt)
                    }
                    className="scale-90"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </DocumentCard>

          <DocumentCard
            title="English Proficiency"
            icon={<MdEditDocument size={30} />}
          >
            <div
              className="text-xs mt-3 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {["TOEFL", "IELTS", "PTE"].map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={
                      checkboxValues["TOEFL / IELTS / PTE"]?.[opt] || false
                    }
                    onChange={() =>
                      handleCheckboxChange("TOEFL / IELTS / PTE", opt)
                    }
                    className="scale-90"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </DocumentCard>

          <DocumentCard
            title="ACT / SAT / LSAT"
            icon={<MdEditDocument size={30} />}
          >
            <div
              className="text-xs mt-3 space-y-1"
              onClick={(e) => e.stopPropagation()}
            >
              {["ACT", "SAT", "LSAT"].map((opt) => (
                <label key={opt} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={checkboxValues["ACT / SAT / LSAT"]?.[opt] || false}
                    onChange={() =>
                      handleCheckboxChange("ACT / SAT / LSAT", opt)
                    }
                    className="scale-90"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </DocumentCard>
        </div>

        {/* ── OCR RESULT PANEL (inline, below the grid) ─────────────── */}
        {selectedDoc && ocrResults[selectedDoc] && (
          <OCRResultPanel
            result={ocrResults[selectedDoc]}
            docTitle={selectedDoc}
            onClose={() =>
              setOcrResults((prev) => {
                const next = { ...prev };
                delete next[selectedDoc];
                return next;
              })
            }
          />
        )}

        {/* ── UPLOAD BOTTOM BAR ────────────────────────────────────────── */}
        {selectedDoc && (
          <div
            className={`fixed bottom-4 transition-all duration-500 z-40 ${
              isSidebarOpen
                ? "w-[89%] sm:w-[95%] lg:left-72 lg:w-[calc(100%-19.5rem)]"
                : "w-[89%] sm:w-[95%] lg:left-24 lg:w-[calc(100%-7.5rem)]"
            }`}
          >
            {/* Close bar */}
            <div className="absolute -top-3 -right-3">
              <X
                size={25}
                onClick={() => {
                  setSelectedDoc(null);
                  setUploadedFiles([]);
                }}
                className="text-indigo-500 hover:text-black bg-white border hover:border-2 border-indigo-300 rounded-full p-1 hover:p-0.5 cursor-pointer"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3 justify-between items-start border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 rounded-lg shadow-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">Upload: {selectedDoc}</p>

                {uploadedFiles.length > 0 ? (
                  <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-1">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded mt-1"
                      >
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-red-600 text-xs font-semibold"
                        >
                          <X size={13} />
                        </button>
                        <p className="text-xs truncate max-w-[160px]">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    No file(s) selected
                  </p>
                )}
              </div>

              <div className="flex md:flex-col gap-3 shrink-0">
                {/* Upload file input */}
                <label className="flex gap-1 items-center min-w-32 px-3 py-2 border-2 border-indigo-800 rounded-lg text-indigo-800 font-medium cursor-pointer hover:scale-95 transition-all text-sm">
                  Upload File
                  <PiUploadSimpleBold size={16} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Preview button */}
                {uploadedFiles.length > 0 && !isVerifying && (
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="flex gap-1 justify-center items-center min-w-32 px-3 py-2 border border-indigo-500 rounded-lg text-indigo-700 font-medium cursor-pointer hover:scale-95 transition-all text-sm bg-white"
                  >
                    Preview
                  </button>
                )}

                {/* ── AI Verify button ── */}
                {uploadedFiles.length > 0 && (
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="flex gap-1 justify-center items-center w-full min-w-32 px-3 py-2.5 bg-indigo-800 rounded-lg text-white font-medium cursor-pointer hover:scale-95 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        Verify <TbRosetteDiscountCheck size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PREVIEW MODAL (unchanged from original) ─────────────────── */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white w-[95%] max-w-2xl rounded-xl relative shadow-lg">
              <X
                size={24}
                onClick={() => setShowPreviewModal(false)}
                className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-black"
              />

              <p className="font-semibold text-lg ml-5 mt-5">
                Preview: {selectedDoc}
              </p>

              <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto p-5">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-2 flex flex-col gap-2"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 max-w-[320px] mx-auto gap-3 py-3">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="px-6 py-2 bg-gray-800 rounded-lg text-center text-white hover:scale-95 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    handleVerify();
                  }}
                  disabled={isVerifying}
                  className="px-6 py-2 bg-indigo-900 rounded-lg text-center text-white hover:scale-95 transition-all text-sm disabled:opacity-60"
                >
                  {isVerifying ? "Verifying…" : "Verify"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom padding so the fixed bar never covers results */}
        <div className="h-32" />
      </main>
    </div>
  );
};

export default StudentDocuments;
// import React, { useEffect, useState } from "react";
// import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";
// import { BiSolidLock } from "react-icons/bi";
// import { GiPassport } from "react-icons/gi";
// import { MdEditDocument } from "react-icons/md";
// import { PiUploadSimpleBold } from "react-icons/pi";
// import { X } from "lucide-react";
// import { TbRosetteDiscountCheck } from "react-icons/tb";

// const StudentDocuments = () => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

//   const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
//     const savedState = localStorage.getItem("menubarOpen");
//     return savedState !== null
//       ? JSON.parse(savedState)
//       : window.innerWidth >= 1024;
//   });

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);
//       if (mobile) setIsSidebarOpen(false);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const [selectedDoc, setSelectedDoc] = useState(null);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [checkboxValues, setCheckboxValues] = useState({});
//   const [showPreviewModal, setShowPreviewModal] = useState(false);

//   // Upload handler
//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);

//     const validFiles = files.filter((file) => file.type === "image/webp");

//     if (validFiles.length !== files.length) {
//       alert("Only .webp images are allowed");
//     }

//     const totalFiles = [...uploadedFiles, ...validFiles].slice(0, 5);

//     if (uploadedFiles.length + validFiles.length > 5) {
//       alert("Maximum 5 files allowed");
//     }

//     setUploadedFiles(totalFiles);
//   };

//   const handleCheckboxChange = (doc, value) => {
//     setCheckboxValues((prev) => ({
//       ...prev,
//       [doc]: {
//         ...prev[doc],
//         [value]: !prev[doc]?.[value],
//       },
//     }));
//   };

//   const DocumentCard = ({ title, icon, required = true, children }) => (
//     <div
//       onClick={() => {
//         if (selectedDoc !== title) {
//           setSelectedDoc(title);
//           setUploadedFiles([]);
//         }
//       }}
//       className={`relative border p-5 rounded-xl min-h-32 cursor-pointer transition-all
//       ${
//         selectedDoc === title
//           ? "border-indigo-300 bg-indigo-50/60"
//           : "border-gray-200 hover:border-indigo-300"
//       }
//     `}
//     >
//       {required && (
//         <div className="absolute right-3 top-3">
//           <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//             Required
//           </p>
//         </div>
//       )}

//       <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//         <div>{icon}</div>
//         <p className="text-black">{title}</p>
//       </div>

//       <div className="mb-5">{children}</div>

//       <div className="absolute left-4 bottom-3">
//         <p className="text-[10px] text-gray-400">• Click to select & upload</p>
//       </div>
//     </div>
//   );

//   const removeFile = (indexToRemove) => {
//     setUploadedFiles((prev) =>
//       prev.filter((_, index) => index !== indexToRemove),
//     );
//   };

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

//         {/* HEADER */}

//         <div className="flex flex-col justify-between items-end gap-5 -mt-1.5">
//           <div className="lg:hidden">
//             <div className="flex gap-2 items-center pl-10 lg:pl-0">
//               <div>
//                 {/* <button className="w-28 px-3 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                 <span className="flex items-center justify-center gap-1">
//                   Unlock <BiSolidLockOpen />
//                 </span>
//               </button> */}

//                 <button className="w-40 px-3 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                   <span className="flex items-center justify-center gap-1">
//                     <p>Lock&nbsp;Application</p> <BiSolidLock />
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-wrap w-full gap-5 items-center justify-between bg-indigo-50 border border-indigo-200 py-2 px-4 rounded-lg">
//             <div>
//               <p className="font-semibold text-lg sm:text-xl text-indigo-900">
//                 Ashish Verma's Documents
//               </p>
//               <p className="text-xs text-gray-500">Master</p>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="flex flex-col justify-center items-center text-center">
//                 <p className="font-semibold">9</p>
//                 <p className="text-[10px] text-gray-500">Uploaded</p>
//               </div>

//               <div className="flex flex-col justify-center items-center text-center">
//                 <p className="text-green-600 font-semibold">7</p>
//                 <p className="text-[10px] text-gray-500">Verified</p>
//               </div>

//               <div className="flex flex-col justify-center items-center text-center">
//                 <p className="text-orange-400 font-semibold">2</p>
//                 <p className="text-[10px] text-gray-500">Review</p>
//               </div>

//               <div className="hidden lg:block ml-2">
//                 {/* <button className="w-28 px-3 py-2 bg-gray-800 rounded-lg text-center text-sm text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700">
//                   <span className="flex items-center justify-center gap-1">
//                     Unlock <BiSolidLockOpen />
//                   </span>
//                 </button> */}

//                 <button className="w-40 px-3 py-2 bg-indigo-900 rounded-lg text-center text-sm text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700">
//                   <span className="flex items-center justify-center gap-1">
//                     <p>Lock&nbsp;Application</p> <BiSolidLock />
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* DOCUMENT GRID */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mt-8">
//           <DocumentCard title="Passport" icon={<GiPassport size={30} />} />

//           <DocumentCard
//             title="Academic Transcripts"
//             icon={<MdEditDocument size={30} />}
//           />

//           <DocumentCard
//             title="Statement of Purpose"
//             icon={<MdEditDocument size={30} />}
//           />

//           <DocumentCard
//             title="Letter of Recommendation"
//             icon={<MdEditDocument size={30} />}
//           />

//           <DocumentCard
//             title="Evidence of Funds"
//             icon={<MdEditDocument size={30} />}
//           />

//           <DocumentCard
//             title="GMAT / GRE Scores"
//             icon={<MdEditDocument size={30} />}
//             required={false}
//           >
//             <div
//               className="text-xs mt-3 space-y-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["GMAT / GRE Scores"]?.GMAT || false}
//                   onChange={() =>
//                     handleCheckboxChange("GMAT / GRE Scores", "GMAT")
//                   }
//                   className="scale-90"
//                 />
//                 GMAT
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["GMAT / GRE Scores"]?.GRE || false}
//                   onChange={() =>
//                     handleCheckboxChange("GMAT / GRE Scores", "GRE")
//                   }
//                   className="scale-90"
//                 />
//                 GRE
//               </label>
//             </div>
//           </DocumentCard>

//           <DocumentCard
//             title="CV / RESUME / ESSAY"
//             icon={<MdEditDocument size={30} />}
//           >
//             <div
//               className="text-xs mt-3 space-y-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["CV / RESUME / ESSAY"]?.CV || false}
//                   onChange={() =>
//                     handleCheckboxChange("CV / RESUME / ESSAY", "CV")
//                   }
//                   className="scale-90"
//                 />
//                 CV
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={
//                     checkboxValues["CV / RESUME / ESSAY"]?.RESUME || false
//                   }
//                   onChange={() =>
//                     handleCheckboxChange("CV / RESUME / ESSAY", "RESUME")
//                   }
//                   className="scale-90"
//                 />
//                 RESUME
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={
//                     checkboxValues["CV / RESUME / ESSAY"]?.ESSAY || false
//                   }
//                   onChange={() =>
//                     handleCheckboxChange("CV / RESUME / ESSAY", "ESSAY")
//                   }
//                   className="scale-90"
//                 />
//                 ESSAY
//               </label>
//             </div>
//           </DocumentCard>

//           <DocumentCard
//             title="English Proficiency"
//             icon={<MdEditDocument size={30} />}
//           >
//             <div
//               className="text-xs mt-3 space-y-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={
//                     checkboxValues["TOEFL / IELTS / PTE"]?.TOEFL || false
//                   }
//                   onChange={() =>
//                     handleCheckboxChange("TOEFL / IELTS / PTE", "TOEFL")
//                   }
//                   className="scale-90"
//                 />
//                 TOEFL
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={
//                     checkboxValues["TOEFL / IELTS / PTE"]?.IELTS || false
//                   }
//                   onChange={() =>
//                     handleCheckboxChange("TOEFL / IELTS / PTE", "IELTS")
//                   }
//                   className="scale-90"
//                 />
//                 IELTS
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["TOEFL / IELTS / PTE"]?.PTE || false}
//                   onChange={() =>
//                     handleCheckboxChange("TOEFL / IELTS / PTE", "PTE")
//                   }
//                   className="scale-90"
//                 />
//                 PTE
//               </label>
//             </div>
//           </DocumentCard>

//           <DocumentCard
//             title="ACT / SAT / LSAT"
//             icon={<MdEditDocument size={30} />}
//           >
//             <div
//               className="text-xs mt-3 space-y-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["ACT / SAT / LSAT"]?.ACT || false}
//                   onChange={() =>
//                     handleCheckboxChange("ACT / SAT / LSAT", "ACT")
//                   }
//                   className="scale-90"
//                 />
//                 ACT
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["ACT / SAT / LSAT"]?.SAT || false}
//                   onChange={() =>
//                     handleCheckboxChange("ACT / SAT / LSAT", "SAT")
//                   }
//                   className="scale-90"
//                 />
//                 SAT
//               </label>
//               <label className="flex items-center gap-1">
//                 <input
//                   type="checkbox"
//                   checked={checkboxValues["ACT / SAT / LSAT"]?.LSAT || false}
//                   onChange={() =>
//                     handleCheckboxChange("ACT / SAT / LSAT", "LSAT")
//                   }
//                   className="scale-90"
//                 />
//                 LSAT
//               </label>
//             </div>
//           </DocumentCard>
//         </div>

//         {/* UPLOAD SECTION */}
//         {selectedDoc && (
//           <div
//             className={`fixed bottom-4 transition-all duration-500 ${
//               isSidebarOpen
//                 ? "w-[89%] sm:w-[95%] lg:left-72 lg:w-[calc(100%-19.5rem)]"
//                 : "w-[89%] sm:w-[95%] lg:left-24 lg:w-[calc(100%-7.5rem)]"
//             }`}
//           >
//             <div className="absolute -top-3 -right-3">
//               <X
//                 size={25}
//                 onClick={() => {
//                   setSelectedDoc(null);
//                   setUploadedFiles([]);
//                 }}
//                 className="text-indigo-500 hover:text-black bg-white border hover:border-2 border-indigo-300 rounded-full p-1 hover:p-0.5 cursor-pointer"
//               />
//             </div>
//             <div className="flex flex-col md:flex-row gap-3 justify-between items-start border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 rounded-lg">
//               <div>
//                 <p className="font-medium">Upload: {selectedDoc}</p>

//                 {uploadedFiles.length > 0 ? (
//                   <div className="text-sm text-gray-500 mt-1">
//                     {uploadedFiles.map((file, index) => (
//                       <div
//                         key={index}
//                         className="flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded mt-1"
//                       >
//                         <button
//                           onClick={() => removeFile(index)}
//                           className="text-gray-500 hover:text-red-600 text-xs font-semibold"
//                         >
//                           <X size={13} />
//                         </button>

//                         <p className="text-xs truncate max-w-[180px]">
//                           {file.name}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-sm text-gray-500 mt-1">
//                     No file(s) selected
//                   </p>
//                 )}
//               </div>

//               <div className="flex  md:flex-col gap-3">
//                 <label className="flex gap-1 items-center min-w-32 px-3 py-2 border-2 border-indigo-800 rounded-lg text-indigo-800 font-medium cursor-pointer hover:scale-95 transition-all text-sm">
//                   Upload File
//                   <PiUploadSimpleBold size={16} />
//                   <input
//                     type="file"
//                     accept="image/webp"
//                     multiple
//                     onChange={handleFileUpload}
//                     className="hidden"
//                   />
//                 </label>

//                 {uploadedFiles.length > 0 && (
//                   <button
//                     onClick={() => {
//                       setShowPreviewModal(true);
//                     }}
//                     className="flex gap-1 justify-center items-center w-full min-w-32 px-3 py-2.5 bg-indigo-800 rounded-lg text-white font-medium cursor-pointer hover:scale-95 transition-all text-sm"
//                   >
//                     Verify <TbRosetteDiscountCheck size={18} />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {showPreviewModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
//             <div className="bg-white w-[95%] max-w-2xl rounded-xl relative shadow-lg">
//               {/* Close Button */}
//               <X
//                 size={24}
//                 onClick={() => setShowPreviewModal(false)}
//                 className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-black"
//               />

//               <p className="font-semibold text-lg ml-5 mt-5">
//                 Preview: {selectedDoc}
//               </p>

//               {/* Images */}
//               <div className="grid grid-cols-1 gap-4 max-h-[78vh] overflow-y-auto p-5">
//                 {uploadedFiles.map((file, index) => (
//                   <div
//                     key={index}
//                     className="border rounded-lg p-2 flex flex-col gap-2"
//                   >
//                     <img
//                       src={URL.createObjectURL(file)}
//                       alt="preview"
//                       className="w-full h-full object-contain rounded"
//                     />

//                     <div className="flex justify-between gap-2 text-xs">
//                       <button className="border border-indigo-800 text-indigo-800 hover:bg-indigo-800 hover:text-white rounded py-1 px-2 transition-all duration-200 ease-linear">
//                         Review
//                       </button>

//                       <button className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded py-1 px-2 transition-all duration-200 ease-linear">
//                         Force to DB
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="grid grid-cols-2 max-w-[320px] mx-auto gap-3 py-3">
//                 <button
//                   onClick={() => setShowPreviewModal(false)}
//                   className="px-6 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
//                 >
//                   Cancel
//                 </button>

//                 <button className="px-6 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                   Done
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default StudentDocuments;
