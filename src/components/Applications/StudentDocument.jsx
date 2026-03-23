import React, { useState, useRef, useEffect, useCallback } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";

const BASE = "https://transglobeedu.com/web-backend";
// const BASE = "http://localhost:3000/api/v1";

const fetchStudents = async (office = "") => {
  const url =
    office && office !== "all"
      ? `${BASE}/students?office=${encodeURIComponent(office)}`
      : `${BASE}/students`;

  const res = await axios.get(url);
  return res.data;
};

const fetchOffices = async () => {
  const res = await axios.get(`${BASE}/offices`);
  return res.data;
};

const patchLock = async (studentId, locked) => {
  const res = await axios.patch(`${BASE}/students/${studentId}/lock`, {
    locked,
  });
  return res.data;
};

const fetchStudentDocs = async (studentId) => {
  const res = await axios.get(`${BASE}/documents/${studentId}`);
  return res.data;
};

const uploadDoc = async (studentId, documentType, files, status) => {
  const fd = new FormData();
  fd.append("studentId", studentId);
  fd.append("documentType", documentType);
  fd.append("status", status);

  if (Array.isArray(files)) {
    files.forEach((file) => fd.append("files", file));
  } else {
    fd.append("files", files);
  }

  const res = await axios.post(`${BASE}/upload-doc`, fd);
  return res.data;
};
const DOCUMENTS = [
  { id: "passport", label: "Passport", icon: "🛂", required: true },
  { id: "gmat_gre", label: "GMAT / GRE Scores", icon: "📊", required: false },
  {
    id: "cv-resume",
    label: "CV / Resume / Essays",
    icon: "📄",
    required: true,
  },
  {
    id: "academic-transcripts",
    label: "Academic Transcripts",
    icon: "🎓",
    required: true,
  },
  {
    id: "english-proficiency",
    label: "English Proficiency (TOEFL/IELTS/PTE)",
    icon: "🌐",
    required: true,
  },
  { id: "sop", label: "Statement of Purpose", icon: "✍️", required: true },
  {
    id: "act_sat",
    label: "ACT / SAT / LSAT Scores",
    icon: "📝",
    required: false,
  },
  { id: "lor", label: "Letters of Recommendation", icon: "📬", required: true },
  { id: "funds", label: "Evidence of Funds", icon: "💰", required: true },
];

const AVATAR_COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

export const DOC_PATTERNS = {
  passport: {
    keywords: [
      "passport",
      "nationality",
      "date of birth",
      "place of birth",
      "passport number",
      "authority",
      "expiry",
      "surname",
    ],
    regex: [
      /passport\s*(no|number)/i,
      /date\s*of\s*birth/i,
      /nationality/i,
      /place\s*of\s*birth/i,
    ],
  },

  gmat_gre: {
    keywords: [
      "gmat",
      "gre",
      "graduate record examination",
      "graduate management admission test",
      "verbal reasoning",
      "quantitative reasoning",
      "analytical writing",
    ],
    regex: [
      /\bgre\b/i,
      /\bgmat\b/i,
      /verbal\s*reasoning/i,
      /quantitative\s*reasoning/i,
    ],
  },

  "cv-resume": {
    keywords: [
      "curriculum vitae",
      "resume",
      "experience",
      "skills",
      "education",
      "projects",
      "certifications",
      "professional summary",
    ],
    regex: [/skills/i, /experience/i, /education/i, /projects/i],
  },

  "academic-transcripts": {
    keywords: [
      "transcript",
      "semester",
      "grade",
      "cgpa",
      "gpa",
      "university",
      "course code",
      "marks",
    ],
    regex: [/cgpa/i, /gpa/i, /semester/i, /grade/i],
  },

  "english-proficiency": {
    keywords: [
      "ielts",
      "toefl",
      "pte",
      "test report form",
      "overall band score",
      "listening",
      "reading",
      "writing",
      "speaking",
    ],
    regex: [/ielts/i, /toefl/i, /pte/i, /band\s*score/i],
  },

  sop: {
    keywords: [
      "statement of purpose",
      "personal statement",
      "motivation",
      "academic goals",
      "career goals",
      "why i want to study",
    ],
    regex: [
      /statement\s*of\s*purpose/i,
      /personal\s*statement/i,
      /motivation/i,
    ],
  },

  act_sat: {
    keywords: [
      "SAT Score Report",
      "act",
      "sat",
      "lsat",
      "scholastic assessment test",
      "american college testing",
    ],
    regex: [/\bact\b/i, /\bsat\b/i, /\blsat\b/i],
  },

  lor: {
    keywords: [
      "letter of recommendation",
      "recommendation",
      "referee",
      "reference letter",
      "professor",
      "recommend",
    ],
    regex: [/recommendation/i, /referee/i, /reference\s*letter/i],
  },

  funds: {
    keywords: [
      "bank statement",
      "account balance",
      "financial statement",
      "available balance",
      "bank",
      "funds",
    ],
    regex: [/bank/i, /account\s*number/i, /available\s*balance/i, /financial/i],
  },
};

export const detectDocumentType = (text) => {
  const t = text.toLowerCase();

  const results = [];

  const addResult = (type, score, reason) => {
    results.push({ type, score, reason });
  };

  if (t.includes("p<ind") || /[a-z0-9<]{25,}/i.test(text)) {
    addResult("passport", 100, "MRZ detected");
  } else if (
    t.includes("passport") &&
    t.includes("nationality") &&
    t.includes("date of birth")
  ) {
    addResult("passport", 90, "passport fields match");
  }

  let transcriptScore = 0;
  if (/cgpa|gpa/i.test(text)) transcriptScore += 4;
  if (/semester|grade|marks/i.test(text)) transcriptScore += 3;
  if (/course code|subject/i.test(text)) transcriptScore += 2;

  if (transcriptScore >= 6) {
    addResult("academic-transcripts", transcriptScore * 10, "academic pattern");
  }

  // 🌐 IELTS / TOEFL
  let engScore = 0;
  if (/ielts|toefl|pte/i.test(text)) engScore += 4;
  if (/listening|reading|writing|speaking/i.test(text)) engScore += 4;
  if (/band score/i.test(text)) engScore += 2;

  if (engScore >= 6) {
    addResult("english-proficiency", engScore * 10, "language test pattern");
  }

  // 📊 GRE / GMAT
  let greScore = 0;
  if (/gre|gmat/i.test(text)) greScore += 3;
  if (/verbal|quantitative/i.test(text)) greScore += 3;
  if (/analytical writing|total score/i.test(text)) greScore += 2;

  if (greScore >= 6) {
    addResult("gmat_gre", greScore * 10, "GRE/GMAT pattern");
  }

  // 📝 SAT / ACT
  let satScore = 0;
  if (/\b(sat|act|lsat)\b/i.test(text)) satScore += 3;
  if (/score|percentile/i.test(text)) satScore += 3;
  if (/test date/i.test(text)) satScore += 2;

  if (satScore >= 6) {
    addResult("act_sat", satScore * 10, "SAT/ACT pattern");
  }

  // 💰 FUNDS
  let fundScore = 0;
  if (/bank|account/i.test(text)) fundScore += 3;
  if (/balance|transaction/i.test(text)) fundScore += 3;
  if (/\d{5,}/.test(text)) fundScore += 2;

  if (fundScore >= 6) {
    addResult("funds", fundScore * 10, "bank pattern");
  }

  // 📄 RESUME
  let resumeScore = 0;
  if (/experience|skills|projects/i.test(text)) resumeScore += 3;
  if (/education|certifications/i.test(text)) resumeScore += 3;
  if (text.length > 1000) resumeScore += 2;

  if (resumeScore >= 6) {
    addResult("cv-resume", resumeScore * 10, "resume pattern");
  }

  // 📝 LOR
  let lorScore = 0;
  if (/recommendation|referee/i.test(text)) lorScore += 4;
  if (/professor|reference letter/i.test(text)) lorScore += 3;

  if (lorScore >= 6) {
    addResult("lor", lorScore * 10, "recommendation pattern");
  }

  // ✍️ SOP (LAST)
  if (text.length > 1500 && !/cgpa|passport|bank|score|ielts|gre/i.test(text)) {
    addResult("sop", 70, "long personal text");
  }

  if (results.length === 0) {
    return { detectedType: null, confidence: 0 };
  }

  results.sort((a, b) => b.score - a.score);
  const best = results[0];

  if (best.score < 60) {
    return { detectedType: null, confidence: best.score };
  }

  return {
    detectedType: best.type,
    confidence: best.score,
  };
};

export const verifyDocument = (selectedDoc, detectedDoc, confidence = 0) => {
  if (!detectedDoc) {
    return {
      status: "rejected",
      reason: "Document not recognized",
    };
  }

  if (confidence < 60) {
    return {
      status: "review",
      reason: "Low confidence — manual review needed",
    };
  }

  if (selectedDoc !== detectedDoc) {
    return {
      status: "rejected",
      reason: `Detected ${detectedDoc}, expected ${selectedDoc}`,
    };
  }

  return {
    status: "verified",
    reason: "Document verified successfully",
  };
};

const processDocument = async (file, selectedDoc) => {
  try {
    const result = await Tesseract.recognize(file, "eng", {
      tessedit_pageseg_mode: 1,
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    });

    const extractedText = result.data.text;

    const detectedType = detectDocumentType(extractedText);

    const verification = verifyDocument(
      selectedDoc,
      detectedType?.detectedType,
    );

    return {
      extractedText,
      detectedType: detectedType?.detectedType,
      status: verification.status,
      reason: verification.reason,
    };
  } catch (error) {
    console.error("OCR processing failed:", error);

    return {
      extractedText: "",
      detectedType: null,
      status: "error",
      reason: "OCR processing failed",
    };
  }
};

const StudentDocument = () => {
  const [students, setStudents] = useState([]);
  const [selectedStu, setSelectedStu] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [offices, setOffices] = useState([]);
  const [activeOffice, setActiveOffice] = useState("all");

  // const [saving, setSaving] = useState(false);
  const [forceSaving, setForceSaving] = useState(false);

  const fileInputRef = useRef();
  const student = students.find((s) => s.id === selectedStu) || null;
  const loadStudents = useCallback(
    async (office = activeOffice) => {
      try {
        const data = await fetchStudents(office === "all" ? "" : office);
        const formatted = data.students.map((s) => ({
          id: s.student_id,
          name: s.student_name,
          program: s.study_level || "Program TBD",
          avatar:
            s.avatar ||
            s.student_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
          locked: !!s.locked,
          progress: s.progress || 0,
          verified_docs: s.verified_docs || 0,
          docs: {},
        }));
        setStudents(formatted);
      } catch (err) {
        console.error("loadStudents:", err);
      }
    },
    [activeOffice],
  );
  const loadStudentDocs = useCallback(async (stuId) => {
    try {
      const data = await fetchStudentDocs(stuId);

      setStudents((prev) =>
        prev.map((s) =>
          s.id === stuId ? { ...s, docs: convertDbDocs(data.documents) } : s,
        ),
      );
    } catch (err) {
      console.error("loadStudentDocs:", err);
    }
  }, []);
  useEffect(() => {
    loadStudents();
    loadOffices();
  }, [loadStudents]);

  // useEffect(() => {
  //   if (selectedStu) loadStudentDocs(selectedStu);
  // }, [selectedStu]);
  useEffect(() => {
    if (selectedStu) loadStudentDocs(selectedStu);
  }, [selectedStu, loadStudentDocs]);
  const loadOffices = async () => {
    try {
      const data = await fetchOffices();
      setOffices(data.offices || []);
    } catch (err) {
      console.error("loadOffices:", err);
    }
  };

  // const loadStudentDocs = async (stuId) => {
  //   try {
  //     const data = await fetchStudentDocs(stuId);
  //     console.log("PRINTING :: ", data.documents);

  //     setStudents((prev) =>
  //       prev.map((s) =>
  //         s.id === stuId ? { ...s, docs: convertDbDocs(data.documents) } : s,
  //       ),
  //     );
  //   } catch (err) {
  //     console.error("loadStudentDocs:", err);
  //   }
  // };

  const convertDbDocs = (dbDocs) => {
    const result = {};

    Object.entries(dbDocs || {}).forEach(([type, doc]) => {
      result[type] = {
        fileName: `Pages: ${doc.pages.length}`,
        status: doc.status,

        // ✅ MULTIPLE PREVIEW SUPPORT
        preview: doc.pages.map((p) => ({
          url: p.url,
          page: p.page,
        })),

        text: null,
        detectedType: null,
        files: null,
        fromDb: true,
      };
    });

    return result;
  };

  const applyOfficeFilter = (office) => {
    setActiveOffice(office);
    setFilterOpen(false);
    loadStudents(office === "all" ? "" : office);
    setSelectedStu(null);
  };

  const toggleLock = async (stuId) => {
    const stu = students.find((s) => s.id === stuId);
    if (!stu) return;
    const newLocked = !stu.locked;
    try {
      await patchLock(stuId, newLocked);
      setStudents((prev) =>
        prev.map((s) => (s.id === stuId ? { ...s, locked: newLocked } : s)),
      );
    } catch (err) {
      alert("Failed to update lock status. Please try again.");
      console.error(err);
    }
  };

  // const handleFileChange = async (e) => {
  //   const file = e.target.files[0];

  //   if (!file || !selectedStu || !selectedDoc) return;

  //   setUploading(true);

  //   const previewUrl = URL.createObjectURL(file);

  //   let extractedText = "";
  //   let detectedType = null;
  //   let status = "review";
  //   let reason = "";

  //   try {

  //     const result = await processDocument(file, selectedDoc);

  //     extractedText = result.extractedText;
  //     console.log("EXTRACTED TEXT :: ",result.extractedText)
  //     detectedType = result.detectedType;
  //     console.log("DETECTED TYPE  :: ", result.detectedType);
  //     status = result.status;
  //     console.log("STATUS :: ", result.status);
  //     reason = result.reason;
  //     console.log("REASON :: ",result.reason)
  //   } catch (err) {
  //     console.error("Document processing error:", err);
  //     status = "error";
  //   }
  // const docData = {
  //   preview: previewUrl,
  //   text: extractedText,
  //   detectedType,
  //   status,
  //   reason,
  //   fileName: file.name,
  //   file,
  //   docType: selectedDoc,
  // };

  //   setStudents((prev) =>
  //     prev.map((s) =>
  //       s.id === selectedStu
  //         ? {
  //             ...s,
  //             docs: {
  //               ...s.docs,
  //               [selectedDoc]: docData,
  //             },
  //           }
  //         : s,
  //     ),
  //   );
  //   setPreviewModal(docData);

  //   try {

  //     await uploadDoc(selectedStu, selectedDoc, file, status);

  //     await loadStudents(activeOffice === "all" ? "" : activeOffice);
  //   } catch (err) {
  //     console.error("Backend upload error:", err);
  //   }

  //   setUploading(false);
  //   setSelectedDoc(null);
  //   e.target.value = "";
  // };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length || !selectedStu || !selectedDoc) return;

    setUploading(true);

    try {
      let combinedText = "";
      let previews = [];

      // ✅ OCR ALL PAGES
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const previewUrl = URL.createObjectURL(file);

        previews.push({
          url: previewUrl,
          name: file.name,
          page: i + 1,
        });

        try {
          const result = await processDocument(file, selectedDoc);
          combinedText += "\n" + result.extractedText;
        } catch (err) {
          console.error(`OCR failed for page ${i + 1}`, err);
        }
      }

      const detectedType = detectDocumentType(combinedText);
      const verification = verifyDocument(
        selectedDoc,
        detectedType?.detectedType,
      );

      const docData = {
        preview: previews,
        text: combinedText,
        detectedType: detectedType?.detectedType,
        status: verification.status,
        reason: verification.reason,
        fileName: files.map((f) => f.name).join(", "),
        files,
        docType: selectedDoc,
      };

      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStu
            ? {
                ...s,
                docs: {
                  ...s.docs,
                  [selectedDoc]: docData,
                },
              }
            : s,
        ),
      );

      setPreviewModal(docData);

      await uploadDoc(selectedStu, selectedDoc, files, verification.status);

      await loadStudents(activeOffice === "all" ? "" : activeOffice);
      await loadStudentDocs(selectedStu);
    } catch (err) {
      console.error("Multi upload error:", err);
    }

    setUploading(false);
    setSelectedDoc(null);
    e.target.value = "";
  };

  const handleForceSave = async () => {
    if (
      forceSaving ||
      !previewModal?.files ||
      !previewModal?.docType ||
      !selectedStu ||
      student?.locked
    )
      return;

    setForceSaving(true);
    try {
      await uploadDoc(
        selectedStu,
        previewModal.docType,
        previewModal.files,
        previewModal.status,
      );
      await loadStudents(activeOffice === "all" ? "" : activeOffice);
      await loadStudentDocs(selectedStu);
      setPreviewModal((prev) => (prev ? { ...prev, fromDb: true } : prev));
    } catch (err) {
      console.error("Force save failed:", err);
    }
    setForceSaving(false);
  };
  // const saveDocuments = async () => {
  //   if (!student) return;
  //   const unsaved = Object.entries(student.docs).filter(
  //     ([, d]) => d.file && !d.fromDb,
  //   );
  //   if (unsaved.length === 0) {
  //     alert("Nothing new to save.");
  //     return;
  //   }

  //   setSaving(true);
  //   try {
  //     for (const [docType, doc] of unsaved) {
  //       await uploadDoc(student.id, docType, doc.file, doc.status);
  //     }
  //     await loadStudents(activeOffice === "all" ? "" : activeOffice);
  //     await loadStudentDocs(student.id);
  //     alert("Documents saved successfully!");
  //   } catch (err) {
  //     alert("Save failed. Check console.");
  //     console.error(err);
  //   }
  //   setSaving(false);
  // };

  const getProgress = (stu) => {
    if (!stu) return 0;
    console.log("IN GETPROGRESS FUNCTION STUDENT :: ", stu);
    if (typeof stu.progress === "number" && stu.verified_docs !== undefined)
      return stu.progress;
    const verified = DOCUMENTS.filter(
      (d) => stu.docs[d.id]?.status === "verified",
    ).length;
    return Math.round((verified / DOCUMENTS.length) * 100);
  };

  const getVerifiedCount = (stu) => {
    if (!stu) return 0;
    if (typeof stu.verified_docs === "number") return stu.verified_docs;
    return DOCUMENTS.filter((d) => stu.docs[d.id]?.status === "verified")
      .length;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .sdv * { box-sizing:border-box; font-family:'DM Sans',system-ui,sans-serif; }
        .sdv ::-webkit-scrollbar { width:4px; }
        .sdv ::-webkit-scrollbar-thumb { background:#334155; border-radius:10px; }
        .sdv ::-webkit-scrollbar-track { background:transparent; }
        .stu-card { transition:background 0.15s,border-color 0.15s; }
        .stu-card:hover { background:#263347 !important; }
        .doc-card { transition:border-color 0.15s,transform 0.15s; }
        .doc-card:hover:not(.locked-card) { border-color:#6366f1 !important; transform:translateY(-1px); }
        .btn-hover { transition:opacity 0.15s,transform 0.15s; }
        .btn-hover:hover { opacity:0.86; transform:translateY(-1px); }
        @keyframes sdv-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .sdv-fadein { animation:sdv-fadein 0.22s ease forwards; }
        @keyframes sdv-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .sdv-pulse { animation:sdv-pulse 1.4s infinite; }
        .filter-modal-overlay { position:fixed;inset:0;z-index:200;display:flex;align-items:flex-start;justify-content:flex-start; }
        .filter-modal { position:absolute;top:52px;left:14px;background:#1e293b;border:1px solid #475569;border-radius:12px;padding:16px;min-width:220px;box-shadow:0 10px 30px rgba(0,0,0,0.4); }
        .office-btn { width:100%;text-align:left;padding:8px 12px;border:none;background:transparent;color:#94a3b8;font-size:13px;border-radius:8px;cursor:pointer;transition:background 0.12s,color 0.12s; }
        .office-btn:hover,.office-btn.active { background:#334155;color:#f1f5f9; }
      `}</style>

      <div
        className="sdv"
        style={{
          background: "#0f172a",
          color: "#e2e8f0",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#1e293b",
            borderBottom: "1px solid #334155",
            padding: "13px 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "linear-gradient(135deg,#6366f1,#0ea5e9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            🎓
          </div>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 15,
                color: "#f1f5f9",
                lineHeight: 1.1,
              }}
            >
              Trans Globe
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              Student Visa Application
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 22 }}>
            {[
              ["Total", students.length, "#94a3b8"],
              ["Locked", students.filter((s) => s.locked).length, "#f87171"],
              [
                "Complete",
                students.filter((s) => getProgress(s) === 100).length,
                "#34d399",
              ],
            ].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: c,
                    lineHeight: 1,
                  }}
                >
                  {v}
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div
            style={{
              width: 285,
              background: "#1e293b",
              borderRight: "1px solid #334155",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <div
              style={{
                padding: "13px 14px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #334155",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Students
                </span>

                <button
                  title="Filter by office"
                  onClick={() => {
                    setFilterOpen((v) => !v);
                    if (!filterOpen) loadOffices();
                  }}
                  style={{
                    background:
                      activeOffice !== "all"
                        ? "rgba(99,102,241,0.2)"
                        : "transparent",
                    border:
                      "1px solid " +
                      (activeOffice !== "all" ? "#6366f1" : "#334155"),
                    borderRadius: 6,
                    padding: "3px 7px",
                    cursor: "pointer",
                    fontSize: 13,
                    color: activeOffice !== "all" ? "#818cf8" : "#64748b",
                  }}
                >
                  {activeOffice !== "all" ? `📍 ${activeOffice}` : "⚙️"}
                </button>
              </div>
            </div>

            {filterOpen && (
              <>
                <div
                  className="filter-modal-overlay z-150"
                  onClick={() => setFilterOpen(false)}
                />
                <div className="filter-modal sdv-fadein">
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Filter by Office
                  </div>
                  <button
                    className={`office-btn${activeOffice === "all" ? " active" : ""}`}
                    onClick={() => applyOfficeFilter("all")}
                  >
                    🌐 All Offices
                  </button>
                  {offices.length === 0 && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "#475569",
                        padding: "6px 12px",
                      }}
                    >
                      No offices found
                    </div>
                  )}
                  {offices.map((o) => (
                    <button
                      key={o}
                      className={`office-btn${activeOffice === o ? " active" : ""}`}
                      onClick={() => applyOfficeFilter(o)}
                    >
                      📍 {o}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div
              style={{ flex: 1, overflowY: "auto", padding: "8px 8px 10px" }}
            >
              {students.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 10px",
                    color: "#475569",
                    fontSize: 13,
                  }}
                >
                  No students found
                </div>
              )}
              {students.map((s, i) => {
                const prog = getProgress(s);
                const verified = getVerifiedCount(s);
                const isActive = selectedStu === s.id;
                return (
                  <div
                    key={s.id}
                    className="stu-card"
                    onClick={() => {
                      setSelectedStu(s.id);
                      setSelectedDoc(null);
                    }}
                    style={{
                      padding: "11px 12px",
                      borderRadius: 10,
                      marginBottom: 5,
                      cursor: "pointer",
                      background: isActive ? "#2d3f55" : "transparent",
                      border: `1px solid ${isActive ? "#475569" : "transparent"}`,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        {s.avatar}
                        {s.locked && (
                          <div
                            style={{
                              position: "absolute",
                              bottom: -2,
                              right: -2,
                              background: "#1e293b",
                              borderRadius: "50%",
                              width: 14,
                              height: 14,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 8,
                            }}
                          >
                            🔒
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#f1f5f9",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.name}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {s.program}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 3,
                        }}
                      >
                        <span style={{ fontSize: 10, color: "#64748b" }}>
                          {verified}/{DOCUMENTS.length} verified
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: prog === 100 ? "#10b981" : "#94a3b8",
                          }}
                        >
                          {prog}%
                        </span>
                      </div>
                      <div
                        style={{
                          height: 3,
                          background: "#334155",
                          borderRadius: 2,
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${prog}%`,
                            background:
                              prog === 100
                                ? "#10b981"
                                : "linear-gradient(90deg,#6366f1,#0ea5e9)",
                            borderRadius: 2,
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── MAIN PANEL ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {!student ? (
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 52 }}>👈</div>
                <div
                  style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}
                >
                  Select a student to manage their documents
                </div>
                <div style={{ fontSize: 12, color: "#334155" }}>
                  Choose from the sidebar on the left
                </div>
              </div>
            ) : (
              <div
                className="sdv-fadein"
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* ── STUDENT HEADER ── */}
                <div
                  style={{
                    padding: "16px 22px",
                    borderBottom: "1px solid #334155",
                    background: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        background:
                          AVATAR_COLORS[
                            students.findIndex((s) => s.id === student.id) %
                              AVATAR_COLORS.length
                          ],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                      }}
                    >
                      {student.avatar}
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            color: "#f1f5f9",
                          }}
                        >
                          {student.name}
                        </span>
                        {student.locked && (
                          <span
                            style={{
                              background: "rgba(239,68,68,0.12)",
                              color: "#f87171",
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 9px",
                              borderRadius: 20,
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                          >
                            🔒 LOCKED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {student.program}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 18 }}
                  >
                    {[
                      [
                        "Uploaded",
                        DOCUMENTS.filter((d) => student.docs[d.id]).length,
                        "#94a3b8",
                      ],
                      [
                        "Verified",
                        DOCUMENTS.filter(
                          (d) => student.docs[d.id]?.status === "verified",
                        ).length,
                        "#10b981",
                      ],
                      [
                        "Review",
                        DOCUMENTS.filter(
                          (d) => student.docs[d.id]?.status === "review",
                        ).length,
                        "#f59e0b",
                      ],
                    ].map(([l, v, c]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: 19,
                            fontWeight: 700,
                            color: c,
                            lineHeight: 1,
                          }}
                        >
                          {v}
                        </div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>
                          {l}
                        </div>
                      </div>
                    ))}
                    <button
                      className="btn-hover"
                      onClick={() => toggleLock(student.id)}
                      style={{
                        marginLeft: 6,
                        padding: "9px 18px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: student.locked
                          ? "linear-gradient(135deg,#f59e0b,#ef4444)"
                          : "linear-gradient(135deg,#6366f1,#0ea5e9)",
                        color: "#fff",
                        boxShadow: student.locked
                          ? "0 4px 14px rgba(239,68,68,0.25)"
                          : "0 4px 14px rgba(99,102,241,0.25)",
                      }}
                    >
                      {student.locked ? "🔓 Unlock" : "🔒 Lock Application"}
                    </button>
                  </div>
                </div>

                {student.locked && (
                  <div
                    style={{
                      margin: "14px 22px 0",
                      padding: "12px 16px",
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>🔒</span>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: "#fca5a5",
                          fontSize: 13,
                        }}
                      >
                        Application Locked
                      </div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>
                        No uploads or changes allowed. Click "Unlock" to
                        re-open.
                      </div>
                    </div>
                  </div>
                )}

                <div
                  style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill,minmax(265px,1fr))",
                      gap: 12,
                    }}
                  >
                    {DOCUMENTS.map((doc) => {
                      const uploaded = student?.docs?.[doc.id] || null;
                      const isActive = selectedDoc === doc.id;
                      const sc =
                        uploaded?.status === "verified"
                          ? "#10b981"
                          : uploaded?.status === "review"
                            ? "#f59e0b"
                            : null;
                      return (
                        <div
                          key={doc.id}
                          className={`doc-card${student.locked ? " locked-card" : ""}`}
                          onClick={() => {
                            if (student.locked) return;
                            setSelectedDoc(isActive ? null : doc.id);
                          }}
                          style={{
                            background: "#1e293b",
                            border: `1.5px solid ${isActive ? "#6366f1" : sc ? sc + "44" : "#334155"}`,
                            borderRadius: 12,
                            padding: "14px",
                            cursor: student.locked ? "not-allowed" : "pointer",
                            opacity: student.locked && !uploaded ? 0.55 : 1,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 9,
                            }}
                          >
                            <span style={{ fontSize: 24 }}>{doc.icon}</span>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 4,
                              }}
                            >
                              {doc.required && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    color: "#f59e0b",
                                    background: "rgba(245,158,11,0.1)",
                                    padding: "2px 7px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                  }}
                                >
                                  Required
                                </span>
                              )}
                              {uploaded && (
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                    color:
                                      uploaded.status === "verified"
                                        ? "#10b981"
                                        : "#f59e0b",
                                    background:
                                      uploaded.status === "verified"
                                        ? "rgba(16,185,129,0.1)"
                                        : "rgba(245,158,11,0.1)",
                                  }}
                                >
                                  {uploaded.status === "verified"
                                    ? "✓ Verified"
                                    : "⚠ Review"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 13,
                              color: "#f1f5f9",
                              marginBottom: 5,
                            }}
                          >
                            {doc.label}
                          </div>
                          {uploaded ? (
                            <div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "#64748b",
                                  marginBottom: 8,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                📎 {uploaded.fileName}
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewModal({
                                      ...uploaded,
                                      docType: doc.id,
                                    });
                                  }}
                                  style={{
                                    flex: 1,
                                    background: "#334155",
                                    border: "none",
                                    color: "#94a3b8",
                                    padding: "6px",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  🔍 Preview
                                </button>
                                {!student.locked && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedDoc(doc.id);
                                      setTimeout(
                                        () => fileInputRef.current?.click(),
                                        50,
                                      );
                                    }}
                                    style={{
                                      flex: 1,
                                      background: "#334155",
                                      border: "none",
                                      color: "#94a3b8",
                                      padding: "6px",
                                      borderRadius: 6,
                                      fontSize: 11,
                                      cursor: "pointer",
                                      fontWeight: 600,
                                    }}
                                  >
                                    🔄 Replace
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: 11,
                                color: isActive ? "#818cf8" : "#475569",
                                fontWeight: isActive ? 600 : 400,
                              }}
                            >
                              {isActive ? (
                                <span className="sdv-pulse">
                                  ● Ready to upload…
                                </span>
                              ) : (
                                "Click to select & upload"
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Upload bar */}
                  {selectedDoc && !student.locked && (
                    <div
                      className="sdv-fadein"
                      style={{
                        marginTop: 16,
                        background: "#1e293b",
                        border: "2px dashed #6366f1",
                        borderRadius: 12,
                        padding: "16px 20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#f1f5f9",
                            fontSize: 14,
                            marginBottom: 3,
                          }}
                        >
                          Uploading:{" "}
                          {DOCUMENTS.find((d) => d.id === selectedDoc)?.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Image or PDF · OCR auto-detects & verifies · saved to
                          backend immediately
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn-hover"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          style={{
                            background:
                              "linear-gradient(135deg,#6366f1,#0ea5e9)",
                            border: "none",
                            color: "#fff",
                            padding: "9px 20px",
                            borderRadius: 8,
                            cursor: uploading ? "not-allowed" : "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                            opacity: uploading ? 0.7 : 1,
                          }}
                        >
                          {uploading ? "⏳ Processing…" : "📁 Choose File"}
                        </button>
                        <button
                          onClick={() => setSelectedDoc(null)}
                          style={{
                            background: "#334155",
                            border: "none",
                            color: "#94a3b8",
                            padding: "9px 14px",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}

                  {/* <div style={{ marginTop: 16 }}>
                    <button
                      onClick={saveDocuments}
                      disabled={saving}
                      style={{
                        background: saving ? "#475569" : "#10b981",
                        color: "#fff",
                        padding: "10px 24px",
                        border: "none",
                        borderRadius: 8,
                        cursor: saving ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: 13,
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      {saving ? "⏳ Saving…" : "💾 Save Documents"}
                    </button>
                  </div> */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {previewModal && (
        <div
          onClick={() => setPreviewModal(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 20,
          }}
        >
          <div
            className="sdv-fadein"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1e293b",
              borderRadius: 16,
              padding: 24,
              maxWidth: 640,
              width: "100%",
              maxHeight: "88vh",
              overflowY: "auto",
              border: "1px solid #334155",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>
                Document Preview
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                style={{
                  background: "#334155",
                  border: "none",
                  color: "#94a3b8",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>
            {Array.isArray(previewModal.preview) ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {previewModal.preview.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`page-${idx}`}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                    }}
                  />
                ))}
              </div>
            ) : (
              previewModal.preview && (
                <img
                  src={previewModal.preview}
                  alt="document preview"
                  style={{ width: "100%", borderRadius: 8 }}
                />
              )
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 14,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontWeight: 700,
                  color:
                    previewModal.status === "verified"
                      ? "#10b981"
                      : previewModal.status === "rejected"
                        ? "#ef4444"
                        : "#f59e0b",
                  background:
                    previewModal.status === "verified"
                      ? "rgba(16,185,129,0.1)"
                      : "rgba(245,158,11,0.1)",
                }}
              >
                {previewModal.status === "verified"
                  ? "✓ Verified"
                  : previewModal.status === "rejected"
                    ? "✕ Rejected"
                    : "⚠ Needs Review"}
              </span>
              {previewModal.detectedType?.detectedType && (
                <span
                  style={{
                    fontSize: 12,
                    padding: "4px 10px",
                    borderRadius: 20,
                    color: "#60a5fa",
                    background: "rgba(96,165,250,0.1)",
                  }}
                >
                  Auto-detected:{" "}
                  {DOCUMENTS.find(
                    (d) => d.id === previewModal.detectedType?.detectedType,
                  )?.label || previewModal.detectedType?.detectedType}
                </span>
              )}
              <span>
                <button
                  onClick={handleForceSave}
                  disabled={
                    forceSaving ||
                    !previewModal?.files ||
                    !previewModal?.docType ||
                    student?.locked
                  }
                  style={{
                    background: forceSaving
                      ? "#475569"
                      : "linear-gradient(135deg,#f97316,#ef4444)",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor:
                      forceSaving ||
                      !previewModal?.files ||
                      !previewModal?.docType ||
                      student?.locked
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      forceSaving ||
                      !previewModal?.files ||
                      !previewModal?.docType ||
                      student?.locked
                        ? 0.7
                        : 1,
                  }}
                  title={
                    !previewModal?.files
                      ? "No local file to save."
                      : student?.locked
                        ? "Student is locked."
                        : "Force save to database"
                  }
                >
                  {forceSaving ? "⏳ Saving…" : "Force fully save in DB"}
                </button>
              </span>
            </div>
            {previewModal.text && (
              <>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  OCR Extracted Text
                </div>
                <pre
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 11,
                    color: "#94a3b8",
                    maxHeight: 180,
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {previewModal.text}
                </pre>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default StudentDocument;

// import React, { useState, useRef } from "react";
// import Tesseract from "tesseract.js";

// const DOCUMENTS = [
//   { id: "passport",     label: "Passport",                              icon: "🛂", required: true  },
//   { id: "gmat_gre",    label: "GMAT / GRE Scores",                     icon: "📊", required: false },
//   { id: "cv",          label: "CV / Resume / Essays",                   icon: "📄", required: true  },
//   { id: "transcripts", label: "Academic Transcripts",                   icon: "🎓", required: true  },
//   { id: "english",     label: "English Proficiency (TOEFL/IELTS/PTE)", icon: "🌐", required: true  },
//   { id: "sop",         label: "Statement of Purpose",                   icon: "✍️", required: true  },
//   { id: "act_sat",     label: "ACT / SAT / LSAT Scores",               icon: "📝", required: false },
//   { id: "lor",         label: "Letters of Recommendation",             icon: "📬", required: true  },
//   { id: "funds",       label: "Evidence of Funds",                      icon: "💰", required: true  },
// ];

// const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

// const INITIAL_STUDENTS = [
//   { id: 1, name: "Aryan Mehta",  program: "MSc Computer Science", avatar: "AM", locked: false, docs: {} },
//   { id: 2, name: "Priya Nair",   program: "MBA Finance",          avatar: "PN", locked: false, docs: {} },
//   { id: 3, name: "Rajan Patel",  program: "BSc Engineering",      avatar: "RP", locked: true,  docs: {} },
//   { id: 4, name: "Sneha Verma",  program: "PhD Biotechnology",    avatar: "SV", locked: false, docs: {} },
// ];

// const detectDocumentType = (text) => {
//   const t = text.toLowerCase();
//   const s = { passport:0,gmat_gre:0,cv:0,transcripts:0,english:0,sop:0,act_sat:0,lor:0,funds:0 };
//   if (t.includes("passport")||t.includes("nationality")||t.includes("date of birth")) s.passport+=2;
//   if (t.includes("gmat")||t.includes("gre")||t.includes("verbal")||t.includes("quantitative")) s.gmat_gre+=2;
//   if (t.includes("experience")||t.includes("skills")||t.includes("curriculum vitae")) s.cv+=2;
//   if (t.includes("transcript")||t.includes("semester")||t.includes("grade")||t.includes("cgpa")) s.transcripts+=2;
//   if (t.includes("ielts")||t.includes("toefl")||t.includes("pte")||t.includes("band score")) s.english+=2;
//   if (t.includes("statement of purpose")||t.includes("motivat")) s.sop+=2;
//   if (t.includes(" act ")||t.includes("sat ")||t.includes("lsat")) s.act_sat+=2;
//   if (t.includes("recommendation")||t.includes("recommend")||t.includes("referee")) s.lor+=2;
//   if (t.includes("financial")||t.includes("net worth")||t.includes("bank statement")||t.includes("funds")) s.funds+=2;
//   const best = Object.entries(s).sort((a,b)=>b[1]-a[1])[0];
//   return best[1]>0 ? best[0] : null;
// };

// const verifyDocument = (docId, text) => {
//   const t = text.toLowerCase();
//   const rules = {
//     passport:    t.includes("passport")&&(t.includes("nationality")||t.includes("birth")),
//     gmat_gre:    t.includes("gmat")||t.includes("gre"),
//     cv:          t.includes("experience")||t.includes("education")||t.includes("skills"),
//     transcripts: t.includes("semester")||t.includes("grade")||t.includes("cgpa"),
//     english:     t.includes("ielts")||t.includes("toefl")||t.includes("pte"),
//     sop:         t.includes("statement")||t.includes("purpose")||t.includes("motivat"),
//     act_sat:     t.includes("act")||t.includes("sat")||t.includes("lsat"),
//     lor:         t.includes("recommend")||t.includes("referee"),
//     funds:       t.includes("financial")||t.includes("bank")||t.includes("funds"),
//   };
//   return rules[docId] ? "verified" : "review";
// };

// const getProgress = (docs) =>
//   Math.round((DOCUMENTS.filter(d => docs[d.id]?.status).length / DOCUMENTS.length) * 100);

// const StudentDocument = () => {
//   const [students,      setStudents]      = useState(INITIAL_STUDENTS);
//   const [selectedStu,   setSelectedStu]   = useState(null);
//   const [selectedDoc,   setSelectedDoc]   = useState(null);
//   const [uploading,     setUploading]     = useState(false);
//   const [previewModal,  setPreviewModal]  = useState(null);
//   const [addingStudent, setAddingStudent] = useState(false);
//   const [newName,       setNewName]       = useState("");
//   const [newProgram,    setNewProgram]    = useState("");
//   const fileInputRef = useRef();

//   const student = students.find(s => s.id === selectedStu);

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file || !selectedStu || !selectedDoc) return;
//     setUploading(true);
//     const previewUrl = URL.createObjectURL(file);
//     let extractedText = "", detected = null, status = "review";
//     try {
//       const result = await Tesseract.recognize(file, "eng", { logger: () => {}, tessedit_pageseg_mode: 1 });
//       extractedText = result.data.text;
//       detected = detectDocumentType(extractedText);
//       status = verifyDocument(selectedDoc, extractedText);
//     } catch {}
//     setStudents(prev => prev.map(s =>
//       s.id === selectedStu
//         ? { ...s, docs: { ...s.docs, [selectedDoc]: { status, preview: previewUrl, text: extractedText, detectedType: detected, fileName: file.name } } }
//         : s
//     ));
//     setUploading(false);
//     setSelectedDoc(null);
//     e.target.value = "";
//   };

//   const toggleLock = (id) => setStudents(prev => prev.map(s => s.id === id ? { ...s, locked: !s.locked } : s));

//   const addStudent = () => {
//     if (!newName.trim()) return;
//     const initials = newName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
//     setStudents(prev => [...prev, { id: Date.now(), name: newName.trim(), program: newProgram || "Program TBD", avatar: initials, locked: false, docs: {} }]);
//     setNewName(""); setNewProgram(""); setAddingStudent(false);
//   };

//   return (
//     <>

//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
//         .sdv * { box-sizing: border-box; font-family: 'DM Sans', system-ui, sans-serif; }
//         .sdv ::-webkit-scrollbar { width: 4px; }
//         .sdv ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
//         .sdv ::-webkit-scrollbar-track { background: transparent; }
//         .stu-card { transition: background 0.15s, border-color 0.15s; }
//         .stu-card:hover { background: #263347 !important; }
//         .doc-card { transition: border-color 0.15s, transform 0.15s; }
//         .doc-card:hover:not(.locked-card) { border-color: #6366f1 !important; transform: translateY(-1px); }
//         .btn-hover { transition: opacity 0.15s, transform 0.15s; }
//         .btn-hover:hover { opacity: 0.86; transform: translateY(-1px); }
//         @keyframes sdv-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
//         .sdv-fadein { animation: sdv-fadein 0.22s ease forwards; }
//         @keyframes sdv-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
//         .sdv-pulse { animation: sdv-pulse 1.4s infinite; }
//       `}</style>

//       <div className="sdv" style={{ background: "#0f172a", color: "#e2e8f0", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

//         {/* ── TOP BAR ── */}
//         <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "13px 24px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//           <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎓</div>
//           <div>
//             <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", lineHeight: 1.1 }}>Trans Globe</div>
//             <div style={{ fontSize: 11, color: "#64748b" }}>Student Visa Application</div>
//           </div>
//           <div style={{ marginLeft: "auto", display: "flex", gap: 22 }}>
//             {[["Total", students.length, "#94a3b8"], ["Locked", students.filter(s=>s.locked).length, "#f87171"], ["Complete", students.filter(s=>getProgress(s.docs)===100).length, "#34d399"]].map(([l,v,c]) => (
//               <div key={l} style={{ textAlign: "center" }}>
//                 <div style={{ fontSize: 18, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
//                 <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* ── BODY ── */}
//         <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

//           {/* SIDEBAR */}
//           <div style={{ width: 285, background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column", flexShrink: 0 }}>
//             <div style={{ padding: "13px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
//               <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Students</span>
//               <button className="btn-hover" onClick={() => setAddingStudent(v => !v)}
//                 style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
//                 + Add
//               </button>
//             </div>

//             {addingStudent && (
//               <div className="sdv-fadein" style={{ margin: "10px 10px 0", background: "#0f172a", borderRadius: 10, padding: 12, border: "1px solid #334155" }}>
//                 <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name *"
//                   style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "7px 10px", color: "#e2e8f0", fontSize: 13, marginBottom: 6, outline: "none" }} />
//                 <input value={newProgram} onChange={e => setNewProgram(e.target.value)} placeholder="Program"
//                   style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "7px 10px", color: "#e2e8f0", fontSize: 13, marginBottom: 8, outline: "none" }} />
//                 <div style={{ display: "flex", gap: 6 }}>
//                   <button onClick={addStudent} className="btn-hover" style={{ flex: 1, background: "#6366f1", border: "none", color: "#fff", borderRadius: 6, padding: "7px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Save</button>
//                   <button onClick={() => setAddingStudent(false)} style={{ flex: 1, background: "#334155", border: "none", color: "#94a3b8", borderRadius: 6, padding: "7px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
//                 </div>
//               </div>
//             )}

//             <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 10px" }}>
//               {students.map((s, i) => {
//                 const prog = getProgress(s.docs);
//                 const verified = DOCUMENTS.filter(d => s.docs[d.id]?.status === "verified").length;
//                 const isActive = selectedStu === s.id;
//                 return (
//                   <div key={s.id} className="stu-card"
//                     onClick={() => { setSelectedStu(s.id); setSelectedDoc(null); }}
//                     style={{ padding: "11px 12px", borderRadius: 10, marginBottom: 5, cursor: "pointer", background: isActive ? "#2d3f55" : "transparent", border: `1px solid ${isActive ? "#475569" : "transparent"}` }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                       <div style={{ width: 36, height: 36, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0, position: "relative" }}>
//                         {s.avatar}
//                         {s.locked && <div style={{ position: "absolute", bottom: -2, right: -2, background: "#1e293b", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>🔒</div>}
//                       </div>
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
//                         <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.program}</div>
//                       </div>
//                     </div>
//                     <div style={{ marginTop: 8 }}>
//                       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
//                         <span style={{ fontSize: 10, color: "#64748b" }}>{verified}/{DOCUMENTS.length} verified</span>
//                         <span style={{ fontSize: 10, fontWeight: 700, color: prog === 100 ? "#10b981" : "#94a3b8" }}>{prog}%</span>
//                       </div>
//                       <div style={{ height: 3, background: "#334155", borderRadius: 2 }}>
//                         <div style={{ height: "100%", width: `${prog}%`, background: prog === 100 ? "#10b981" : "linear-gradient(90deg,#6366f1,#0ea5e9)", borderRadius: 2, transition: "width 0.4s ease" }} />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* MAIN PANEL */}
//           <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
//             {!student ? (
//               <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
//                 <div style={{ fontSize: 52 }}>👈</div>
//                 <div style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>Select a student to manage their documents</div>
//                 <div style={{ fontSize: 12, color: "#334155" }}>Choose from the sidebar or add a new student</div>
//               </div>
//             ) : (
//               <div className="sdv-fadein" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

//                 {/* STUDENT HEADER */}
//                 <div style={{ padding: "16px 22px", borderBottom: "1px solid #334155", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
//                   <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
//                     <div style={{ width: 44, height: 44, borderRadius: "50%", background: AVATAR_COLORS[students.findIndex(s=>s.id===student.id) % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>
//                       {student.avatar}
//                     </div>
//                     <div>
//                       <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//                         <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>{student.name}</span>
//                         {student.locked && (
//                           <span style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.3)" }}>
//                             🔒 LOCKED
//                           </span>
//                         )}
//                       </div>
//                       <div style={{ fontSize: 12, color: "#64748b" }}>{student.program}</div>
//                     </div>
//                   </div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
//                     {[
//                       ["Uploaded", DOCUMENTS.filter(d=>student.docs[d.id]).length, "#94a3b8"],
//                       ["Verified",  DOCUMENTS.filter(d=>student.docs[d.id]?.status==="verified").length, "#10b981"],
//                       ["Review",    DOCUMENTS.filter(d=>student.docs[d.id]?.status==="review").length, "#f59e0b"],
//                     ].map(([l,v,c]) => (
//                       <div key={l} style={{ textAlign: "center" }}>
//                         <div style={{ fontSize: 19, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
//                         <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
//                       </div>
//                     ))}
//                     <button className="btn-hover" onClick={() => toggleLock(student.id)}
//                       style={{ marginLeft: 6, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
//                         background: student.locked ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "linear-gradient(135deg,#6366f1,#0ea5e9)",
//                         color: "#fff", boxShadow: student.locked ? "0 4px 14px rgba(239,68,68,0.25)" : "0 4px 14px rgba(99,102,241,0.25)" }}>
//                       {student.locked ? "🔓 Unlock" : "🔒 Lock Application"}
//                     </button>
//                   </div>
//                 </div>

//                 {/* LOCK BANNER */}
//                 {student.locked && (
//                   <div style={{ margin: "14px 22px 0", padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
//                     <span style={{ fontSize: 20 }}>🔒</span>
//                     <div>
//                       <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 13 }}>Application Locked</div>
//                       <div style={{ fontSize: 12, color: "#94a3b8" }}>No uploads or changes allowed. Click "Unlock" to re-open this application.</div>
//                     </div>
//                   </div>
//                 )}

//                 {/* DOCUMENT GRID */}
//                 <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
//                   <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 12 }}>
//                     {DOCUMENTS.map((doc) => {
//                       const uploaded = student.docs[doc.id];
//                       const isActive = selectedDoc === doc.id;
//                       const sc = uploaded?.status === "verified" ? "#10b981" : uploaded?.status === "review" ? "#f59e0b" : null;

//                       return (
//                         <div key={doc.id} className={`doc-card${student.locked ? " locked-card" : ""}`}
//                           onClick={() => { if (student.locked) return; setSelectedDoc(isActive ? null : doc.id); }}
//                           style={{ background: "#1e293b", border: `1.5px solid ${isActive ? "#6366f1" : sc ? sc+"44" : "#334155"}`, borderRadius: 12, padding: "14px", cursor: student.locked ? "not-allowed" : "pointer", opacity: student.locked && !uploaded ? 0.55 : 1 }}>

//                           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
//                             <span style={{ fontSize: 24 }}>{doc.icon}</span>
//                             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
//                               {doc.required && <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>Required</span>}
//                               {uploaded && (
//                                 <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
//                                   color: uploaded.status==="verified" ? "#10b981" : "#f59e0b",
//                                   background: uploaded.status==="verified" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
//                                   {uploaded.status==="verified" ? "✓ Verified" : "⚠ Review"}
//                                 </span>
//                               )}
//                             </div>
//                           </div>

//                           <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginBottom: 5 }}>{doc.label}</div>

//                           {uploaded ? (
//                             <div>
//                               <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📎 {uploaded.fileName}</div>
//                               <div style={{ display: "flex", gap: 6 }}>
//                                 <button onClick={e => { e.stopPropagation(); setPreviewModal(uploaded); }}
//                                   style={{ flex: 1, background: "#334155", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
//                                   🔍 Preview
//                                 </button>
//                                 {!student.locked && (
//                                   <button onClick={e => { e.stopPropagation(); setSelectedDoc(doc.id); setTimeout(() => fileInputRef.current?.click(), 50); }}
//                                     style={{ flex: 1, background: "#334155", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
//                                     🔄 Replace
//                                   </button>
//                                 )}
//                               </div>
//                             </div>
//                           ) : (
//                             <div style={{ fontSize: 11, color: isActive ? "#818cf8" : "#475569", fontWeight: isActive ? 600 : 400 }}>
//                               {isActive ? <span className="sdv-pulse">● Ready to upload…</span> : "Click to select & upload"}
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>

//                   {/* UPLOAD BAR */}
//                   {selectedDoc && !student.locked && (
//                     <div className="sdv-fadein" style={{ marginTop: 16, background: "#1e293b", border: "2px dashed #6366f1", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
//                       <div>
//                         <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14, marginBottom: 3 }}>
//                           Uploading: {DOCUMENTS.find(d => d.id === selectedDoc)?.label}
//                         </div>
//                         <div style={{ fontSize: 12, color: "#64748b" }}>Image or PDF · OCR will auto-detect & verify content</div>
//                       </div>
//                       <div style={{ display: "flex", gap: 8 }}>
//                         <button className="btn-hover" onClick={() => fileInputRef.current?.click()} disabled={uploading}
//                           style={{ background: "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", color: "#fff", padding: "9px 20px", borderRadius: 8, cursor: uploading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, opacity: uploading ? 0.7 : 1 }}>
//                           {uploading ? "⏳ Processing…" : "📁 Choose File"}
//                         </button>
//                         <button onClick={() => setSelectedDoc(null)}
//                           style={{ background: "#334155", border: "none", color: "#94a3b8", padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>✕</button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* HIDDEN FILE INPUT */}
//       <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />

//       {/* PREVIEW MODAL */}
//       {previewModal && (
//         <div onClick={() => setPreviewModal(null)}
//           style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
//           <div className="sdv-fadein" onClick={e => e.stopPropagation()}
//             style={{ background: "#1e293b", borderRadius: 16, padding: 24, maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto", border: "1px solid #334155" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//               <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Document Preview</div>
//               <button onClick={() => setPreviewModal(null)}
//                 style={{ background: "#334155", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
//             </div>
//             <img src={previewModal.preview} alt="preview" style={{ width: "100%", borderRadius: 8, marginBottom: 14 }} />
//             <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
//               <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 700,
//                 color: previewModal.status==="verified" ? "#10b981" : "#f59e0b",
//                 background: previewModal.status==="verified" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
//                 {previewModal.status==="verified" ? "✓ Verified" : "⚠ Needs Review"}
//               </span>
//               {previewModal.detectedType && (
//                 <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, color: "#60a5fa", background: "rgba(96,165,250,0.1)" }}>
//                   Auto-detected: {DOCUMENTS.find(d=>d.id===previewModal.detectedType)?.label || previewModal.detectedType}
//                 </span>
//               )}
//             </div>
//             {previewModal.text && (
//               <>
//                 <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>OCR Extracted Text</div>
//                 <pre style={{ background: "#0f172a", borderRadius: 8, padding: 12, fontSize: 11, color: "#94a3b8", maxHeight: 180, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
//                   {previewModal.text}
//                 </pre>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default StudentDocument;
// // import React, { useState } from "react";
// // import Tesseract from "tesseract.js";

// // const StudentDocument = () => {
// //   const [image, setImage] = useState(null);
// //   const [text, setText] = useState("");
// //   const [loading, setLoading] = useState(false);
// //   const [docType, setDocType] = useState("");
// //   const [verification, setVerification] = useState("");

// //   const handleFileChange = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;

// //     const imageUrl = URL.createObjectURL(file);
// //     setImage(imageUrl);
// //     extractText(file);
// //   };

// //   // smarter document detection
// //   const detectDocumentType = (text) => {
// //     const t = text.toLowerCase();

// //     const scores = {
// //       passport: 0,
// //       transcript: 0,
// //       english: 0,
// //       recommendation: 0,
// //       resume: 0,
// //       sop: 0,
// //       finance: 0
// //     };

// //     // passport
// //     if (t.includes("passport")) scores.passport++;
// //     if (t.includes("nationality")) scores.passport++;
// //     if (t.includes("date of birth")) scores.passport++;

// //     // transcript
// //     if (t.includes("transcript")) scores.transcript++;
// //     if (t.includes("semester")) scores.transcript++;
// //     if (t.includes("university")) scores.transcript++;

// //     // english tests
// //     if (t.includes("ielts") || t.includes("toefl") || t.includes("pte"))
// //       scores.english++;

// //     // recommendation
// //     if (t.includes("recommendation")) scores.recommendation++;

// //     // resume
// //     if (t.includes("experience")) scores.resume++;
// //     if (t.includes("education")) scores.resume++;

// //     // sop
// //     if (t.includes("statement of purpose")) scores.sop++;

// //     // financial proof
// //     if (t.includes("financial report") || t.includes("net worth"))
// //       scores.finance++;

// //     const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

// //     if (best[1] === 0) return "Unknown Document";

// //     const map = {
// //       passport: "Passport",
// //       transcript: "Academic Transcript",
// //       english: "English Proficiency Test",
// //       recommendation: "Recommendation Letter",
// //       resume: "Resume / CV",
// //       sop: "Statement of Purpose",
// //       finance: "Financial Proof"
// //     };

// //     return map[best[0]];
// //   };

// //   // basic verification rules
// //   const verifyDocument = (type, text) => {
// //     const t = text.toLowerCase();

// //     if (type === "Passport") {
// //       if (
// //         t.includes("passport") &&
// //         (t.includes("nationality") || t.includes("birth"))
// //       )
// //         return "✅ Passport Looks Valid";
// //       return "⚠️ Passport Needs Review";
// //     }

// //     if (type === "Academic Transcript") {
// //       if (t.includes("semester") || t.includes("grade"))
// //         return "✅ Transcript Looks Valid";
// //       return "⚠️ Transcript Needs Review";
// //     }

// //     if (type === "English Proficiency Test") {
// //       if (t.includes("ielts") || t.includes("toefl") || t.includes("pte"))
// //         return "✅ English Test Score Detected";
// //       return "⚠️ Score Not Clear";
// //     }

// //     if (type === "Financial Proof") {
// //       if (t.includes("financial") || t.includes("net worth"))
// //         return "✅ Financial Document Detected";
// //       return "⚠️ Financial Proof Needs Review";
// //     }

// //     return "⚠️ Manual Verification Needed";
// //   };

// //   const extractText = async (file) => {
// //     setLoading(true);

// //     const result = await Tesseract.recognize(file, "eng", {
// //       logger: (m) => console.log(m),
// //       tessedit_pageseg_mode: 1
// //     });

// //     const extractedText = result.data.text;

// //     setText(extractedText);

// //     const type = detectDocumentType(extractedText);
// //     setDocType(type);

// //     const verify = verifyDocument(type, extractedText);
// //     setVerification(verify);

// //     setLoading(false);
// //   };

// //   return (
// //     <div style={{ padding: "20px" }}>
// //       <h2>Upload Student Document</h2>

// //       <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />

// //       {image && (
// //         <div style={{ marginTop: "20px" }}>
// //           <h4>Preview</h4>
// //           <img src={image} alt="preview" width="300" />
// //         </div>
// //       )}

// //       <div style={{ marginTop: "20px" }}>
// //         <h3>Document Type</h3>
// //         {loading ? "Analyzing..." : <b>{docType}</b>}
// //       </div>

// //       <div style={{ marginTop: "10px" }}>
// //         <h3>Verification</h3>
// //         {loading ? "Checking..." : <b>{verification}</b>}
// //       </div>

// //       <div style={{ marginTop: "20px" }}>
// //         <h3>Extracted Text</h3>
// //         {loading ? <p>Processing OCR...</p> : <pre>{text}</pre>}
// //       </div>
// //     </div>
// //   );
// // };

// // export default StudentDocument;
