// import React, { useState } from "react";
// import Tesseract from "tesseract.js";

// const StudentDocument = () => {
//   const [image, setImage] = useState(null);
//   const [text, setText] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [docType, setDocType] = useState("");
//   const [verification, setVerification] = useState("");

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const imageUrl = URL.createObjectURL(file);
//     setImage(imageUrl);
//     extractText(file);
//   };

//   // smarter document detection
//   const detectDocumentType = (text) => {
//     const t = text.toLowerCase();

//     const scores = {
//       passport: 0,
//       transcript: 0,
//       english: 0,
//       recommendation: 0,
//       resume: 0,
//       sop: 0,
//       finance: 0
//     };

//     // passport
//     if (t.includes("passport")) scores.passport++;
//     if (t.includes("nationality")) scores.passport++;
//     if (t.includes("date of birth")) scores.passport++;

//     // transcript
//     if (t.includes("transcript")) scores.transcript++;
//     if (t.includes("semester")) scores.transcript++;
//     if (t.includes("university")) scores.transcript++;

//     // english tests
//     if (t.includes("ielts") || t.includes("toefl") || t.includes("pte"))
//       scores.english++;

//     // recommendation
//     if (t.includes("recommendation")) scores.recommendation++;

//     // resume
//     if (t.includes("experience")) scores.resume++;
//     if (t.includes("education")) scores.resume++;

//     // sop
//     if (t.includes("statement of purpose")) scores.sop++;

//     // financial proof
//     if (t.includes("financial report") || t.includes("net worth"))
//       scores.finance++;

//     const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

//     if (best[1] === 0) return "Unknown Document";

//     const map = {
//       passport: "Passport",
//       transcript: "Academic Transcript",
//       english: "English Proficiency Test",
//       recommendation: "Recommendation Letter",
//       resume: "Resume / CV",
//       sop: "Statement of Purpose",
//       finance: "Financial Proof"
//     };

//     return map[best[0]];
//   };

//   // basic verification rules
//   const verifyDocument = (type, text) => {
//     const t = text.toLowerCase();

//     if (type === "Passport") {
//       if (
//         t.includes("passport") &&
//         (t.includes("nationality") || t.includes("birth"))
//       )
//         return "✅ Passport Looks Valid";
//       return "⚠️ Passport Needs Review";
//     }

//     if (type === "Academic Transcript") {
//       if (t.includes("semester") || t.includes("grade"))
//         return "✅ Transcript Looks Valid";
//       return "⚠️ Transcript Needs Review";
//     }

//     if (type === "English Proficiency Test") {
//       if (t.includes("ielts") || t.includes("toefl") || t.includes("pte"))
//         return "✅ English Test Score Detected";
//       return "⚠️ Score Not Clear";
//     }

//     if (type === "Financial Proof") {
//       if (t.includes("financial") || t.includes("net worth"))
//         return "✅ Financial Document Detected";
//       return "⚠️ Financial Proof Needs Review";
//     }

//     return "⚠️ Manual Verification Needed";
//   };

//   const extractText = async (file) => {
//     setLoading(true);

//     const result = await Tesseract.recognize(file, "eng", {
//       logger: (m) => console.log(m),
//       tessedit_pageseg_mode: 1
//     });

//     const extractedText = result.data.text;

//     setText(extractedText);

//     const type = detectDocumentType(extractedText);
//     setDocType(type);

//     const verify = verifyDocument(type, extractedText);
//     setVerification(verify);

//     setLoading(false);
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Upload Student Document</h2>

//       <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />

//       {image && (
//         <div style={{ marginTop: "20px" }}>
//           <h4>Preview</h4>
//           <img src={image} alt="preview" width="300" />
//         </div>
//       )}

//       <div style={{ marginTop: "20px" }}>
//         <h3>Document Type</h3>
//         {loading ? "Analyzing..." : <b>{docType}</b>}
//       </div>

//       <div style={{ marginTop: "10px" }}>
//         <h3>Verification</h3>
//         {loading ? "Checking..." : <b>{verification}</b>}
//       </div>

//       <div style={{ marginTop: "20px" }}>
//         <h3>Extracted Text</h3>
//         {loading ? <p>Processing OCR...</p> : <pre>{text}</pre>}
//       </div>
//     </div>
//   );
// };

// export default StudentDocument;

import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";

const DOCUMENTS = [
  { id: "passport",     label: "Passport",                              icon: "🛂", required: true  },
  { id: "gmat_gre",    label: "GMAT / GRE Scores",                     icon: "📊", required: false },
  { id: "cv",          label: "CV / Resume / Essays",                   icon: "📄", required: true  },
  { id: "transcripts", label: "Academic Transcripts",                   icon: "🎓", required: true  },
  { id: "english",     label: "English Proficiency (TOEFL/IELTS/PTE)", icon: "🌐", required: true  },
  { id: "sop",         label: "Statement of Purpose",                   icon: "✍️", required: true  },
  { id: "act_sat",     label: "ACT / SAT / LSAT Scores",               icon: "📝", required: false },
  { id: "lor",         label: "Letters of Recommendation",             icon: "📬", required: true  },
  { id: "funds",       label: "Evidence of Funds",                      icon: "💰", required: true  },
];

const AVATAR_COLORS = ["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

const INITIAL_STUDENTS = [
  { id: 1, name: "Aryan Mehta",  program: "MSc Computer Science", avatar: "AM", locked: false, docs: {} },
  { id: 2, name: "Priya Nair",   program: "MBA Finance",          avatar: "PN", locked: false, docs: {} },
  { id: 3, name: "Rajan Patel",  program: "BSc Engineering",      avatar: "RP", locked: true,  docs: {} },
  { id: 4, name: "Sneha Verma",  program: "PhD Biotechnology",    avatar: "SV", locked: false, docs: {} },
];

const detectDocumentType = (text) => {
  const t = text.toLowerCase();
  const s = { passport:0,gmat_gre:0,cv:0,transcripts:0,english:0,sop:0,act_sat:0,lor:0,funds:0 };
  if (t.includes("passport")||t.includes("nationality")||t.includes("date of birth")) s.passport+=2;
  if (t.includes("gmat")||t.includes("gre")||t.includes("verbal")||t.includes("quantitative")) s.gmat_gre+=2;
  if (t.includes("experience")||t.includes("skills")||t.includes("curriculum vitae")) s.cv+=2;
  if (t.includes("transcript")||t.includes("semester")||t.includes("grade")||t.includes("cgpa")) s.transcripts+=2;
  if (t.includes("ielts")||t.includes("toefl")||t.includes("pte")||t.includes("band score")) s.english+=2;
  if (t.includes("statement of purpose")||t.includes("motivat")) s.sop+=2;
  if (t.includes(" act ")||t.includes("sat ")||t.includes("lsat")) s.act_sat+=2;
  if (t.includes("recommendation")||t.includes("recommend")||t.includes("referee")) s.lor+=2;
  if (t.includes("financial")||t.includes("net worth")||t.includes("bank statement")||t.includes("funds")) s.funds+=2;
  const best = Object.entries(s).sort((a,b)=>b[1]-a[1])[0];
  return best[1]>0 ? best[0] : null;
};

const verifyDocument = (docId, text) => {
  const t = text.toLowerCase();
  const rules = {
    passport:    t.includes("passport")&&(t.includes("nationality")||t.includes("birth")),
    gmat_gre:    t.includes("gmat")||t.includes("gre"),
    cv:          t.includes("experience")||t.includes("education")||t.includes("skills"),
    transcripts: t.includes("semester")||t.includes("grade")||t.includes("cgpa"),
    english:     t.includes("ielts")||t.includes("toefl")||t.includes("pte"),
    sop:         t.includes("statement")||t.includes("purpose")||t.includes("motivat"),
    act_sat:     t.includes("act")||t.includes("sat")||t.includes("lsat"),
    lor:         t.includes("recommend")||t.includes("referee"),
    funds:       t.includes("financial")||t.includes("bank")||t.includes("funds"),
  };
  return rules[docId] ? "verified" : "review";
};

const getProgress = (docs) =>
  Math.round((DOCUMENTS.filter(d => docs[d.id]?.status).length / DOCUMENTS.length) * 100);

const StudentDocument = () => {
  const [students,      setStudents]      = useState(INITIAL_STUDENTS);
  const [selectedStu,   setSelectedStu]   = useState(null);
  const [selectedDoc,   setSelectedDoc]   = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [previewModal,  setPreviewModal]  = useState(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [newName,       setNewName]       = useState("");
  const [newProgram,    setNewProgram]    = useState("");
  const fileInputRef = useRef();

  const student = students.find(s => s.id === selectedStu);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedStu || !selectedDoc) return;
    setUploading(true);
    const previewUrl = URL.createObjectURL(file);
    let extractedText = "", detected = null, status = "review";
    try {
      const result = await Tesseract.recognize(file, "eng", { logger: () => {}, tessedit_pageseg_mode: 1 });
      extractedText = result.data.text;
      detected = detectDocumentType(extractedText);
      status = verifyDocument(selectedDoc, extractedText);
    } catch {}
    setStudents(prev => prev.map(s =>
      s.id === selectedStu
        ? { ...s, docs: { ...s.docs, [selectedDoc]: { status, preview: previewUrl, text: extractedText, detectedType: detected, fileName: file.name } } }
        : s
    ));
    setUploading(false);
    setSelectedDoc(null);
    e.target.value = "";
  };

  const toggleLock = (id) => setStudents(prev => prev.map(s => s.id === id ? { ...s, locked: !s.locked } : s));

  const addStudent = () => {
    if (!newName.trim()) return;
    const initials = newName.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    setStudents(prev => [...prev, { id: Date.now(), name: newName.trim(), program: newProgram || "Program TBD", avatar: initials, locked: false, docs: {} }]);
    setNewName(""); setNewProgram(""); setAddingStudent(false);
  };

  return (
    <>
    
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        .sdv * { box-sizing: border-box; font-family: 'DM Sans', system-ui, sans-serif; }
        .sdv ::-webkit-scrollbar { width: 4px; }
        .sdv ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .sdv ::-webkit-scrollbar-track { background: transparent; }
        .stu-card { transition: background 0.15s, border-color 0.15s; }
        .stu-card:hover { background: #263347 !important; }
        .doc-card { transition: border-color 0.15s, transform 0.15s; }
        .doc-card:hover:not(.locked-card) { border-color: #6366f1 !important; transform: translateY(-1px); }
        .btn-hover { transition: opacity 0.15s, transform 0.15s; }
        .btn-hover:hover { opacity: 0.86; transform: translateY(-1px); }
        @keyframes sdv-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        .sdv-fadein { animation: sdv-fadein 0.22s ease forwards; }
        @keyframes sdv-pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
        .sdv-pulse { animation: sdv-pulse 1.4s infinite; }
      `}</style>

      <div className="sdv" style={{ background: "#0f172a", color: "#e2e8f0", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── TOP BAR ── */}
        <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "13px 24px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", lineHeight: 1.1 }}>Trans Globe</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>Student Visa Application</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 22 }}>
            {[["Total", students.length, "#94a3b8"], ["Locked", students.filter(s=>s.locked).length, "#f87171"], ["Complete", students.filter(s=>getProgress(s.docs)===100).length, "#34d399"]].map(([l,v,c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* SIDEBAR */}
          <div style={{ width: 285, background: "#1e293b", borderRight: "1px solid #334155", display: "flex", flexDirection: "column", flexShrink: 0 }}>
            <div style={{ padding: "13px 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #334155" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: "0.08em", textTransform: "uppercase" }}>Students</span>
              <button className="btn-hover" onClick={() => setAddingStudent(v => !v)}
                style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
                + Add
              </button>
            </div>

            {addingStudent && (
              <div className="sdv-fadein" style={{ margin: "10px 10px 0", background: "#0f172a", borderRadius: 10, padding: 12, border: "1px solid #334155" }}>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name *"
                  style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "7px 10px", color: "#e2e8f0", fontSize: 13, marginBottom: 6, outline: "none" }} />
                <input value={newProgram} onChange={e => setNewProgram(e.target.value)} placeholder="Program"
                  style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "7px 10px", color: "#e2e8f0", fontSize: 13, marginBottom: 8, outline: "none" }} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={addStudent} className="btn-hover" style={{ flex: 1, background: "#6366f1", border: "none", color: "#fff", borderRadius: 6, padding: "7px", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>Save</button>
                  <button onClick={() => setAddingStudent(false)} style={{ flex: 1, background: "#334155", border: "none", color: "#94a3b8", borderRadius: 6, padding: "7px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 10px" }}>
              {students.map((s, i) => {
                const prog = getProgress(s.docs);
                const verified = DOCUMENTS.filter(d => s.docs[d.id]?.status === "verified").length;
                const isActive = selectedStu === s.id;
                return (
                  <div key={s.id} className="stu-card"
                    onClick={() => { setSelectedStu(s.id); setSelectedDoc(null); }}
                    style={{ padding: "11px 12px", borderRadius: 10, marginBottom: 5, cursor: "pointer", background: isActive ? "#2d3f55" : "transparent", border: `1px solid ${isActive ? "#475569" : "transparent"}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0, position: "relative" }}>
                        {s.avatar}
                        {s.locked && <div style={{ position: "absolute", bottom: -2, right: -2, background: "#1e293b", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8 }}>🔒</div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.program}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#64748b" }}>{verified}/{DOCUMENTS.length} verified</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: prog === 100 ? "#10b981" : "#94a3b8" }}>{prog}%</span>
                      </div>
                      <div style={{ height: 3, background: "#334155", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${prog}%`, background: prog === 100 ? "#10b981" : "linear-gradient(90deg,#6366f1,#0ea5e9)", borderRadius: 2, transition: "width 0.4s ease" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MAIN PANEL */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {!student ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <div style={{ fontSize: 52 }}>👈</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#475569" }}>Select a student to manage their documents</div>
                <div style={{ fontSize: 12, color: "#334155" }}>Choose from the sidebar or add a new student</div>
              </div>
            ) : (
              <div className="sdv-fadein" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* STUDENT HEADER */}
                <div style={{ padding: "16px 22px", borderBottom: "1px solid #334155", background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: AVATAR_COLORS[students.findIndex(s=>s.id===student.id) % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff" }}>
                      {student.avatar}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>{student.name}</span>
                        {student.locked && (
                          <span style={{ background: "rgba(239,68,68,0.12)", color: "#f87171", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.3)" }}>
                            🔒 LOCKED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{student.program}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    {[
                      ["Uploaded", DOCUMENTS.filter(d=>student.docs[d.id]).length, "#94a3b8"],
                      ["Verified",  DOCUMENTS.filter(d=>student.docs[d.id]?.status==="verified").length, "#10b981"],
                      ["Review",    DOCUMENTS.filter(d=>student.docs[d.id]?.status==="review").length, "#f59e0b"],
                    ].map(([l,v,c]) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 19, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                        <div style={{ fontSize: 10, color: "#64748b" }}>{l}</div>
                      </div>
                    ))}
                    <button className="btn-hover" onClick={() => toggleLock(student.id)}
                      style={{ marginLeft: 6, padding: "9px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                        background: student.locked ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "linear-gradient(135deg,#6366f1,#0ea5e9)",
                        color: "#fff", boxShadow: student.locked ? "0 4px 14px rgba(239,68,68,0.25)" : "0 4px 14px rgba(99,102,241,0.25)" }}>
                      {student.locked ? "🔓 Unlock" : "🔒 Lock Application"}
                    </button>
                  </div>
                </div>

                {/* LOCK BANNER */}
                {student.locked && (
                  <div style={{ margin: "14px 22px 0", padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>🔒</span>
                    <div>
                      <div style={{ fontWeight: 700, color: "#fca5a5", fontSize: 13 }}>Application Locked</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>No uploads or changes allowed. Click "Unlock" to re-open this application.</div>
                    </div>
                  </div>
                )}

                {/* DOCUMENT GRID */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 22px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 12 }}>
                    {DOCUMENTS.map((doc) => {
                      const uploaded = student.docs[doc.id];
                      const isActive = selectedDoc === doc.id;
                      const sc = uploaded?.status === "verified" ? "#10b981" : uploaded?.status === "review" ? "#f59e0b" : null;

                      return (
                        <div key={doc.id} className={`doc-card${student.locked ? " locked-card" : ""}`}
                          onClick={() => { if (student.locked) return; setSelectedDoc(isActive ? null : doc.id); }}
                          style={{ background: "#1e293b", border: `1.5px solid ${isActive ? "#6366f1" : sc ? sc+"44" : "#334155"}`, borderRadius: 12, padding: "14px", cursor: student.locked ? "not-allowed" : "pointer", opacity: student.locked && !uploaded ? 0.55 : 1 }}>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                            <span style={{ fontSize: 24 }}>{doc.icon}</span>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                              {doc.required && <span style={{ fontSize: 10, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 7px", borderRadius: 4, fontWeight: 700 }}>Required</span>}
                              {uploaded && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                                  color: uploaded.status==="verified" ? "#10b981" : "#f59e0b",
                                  background: uploaded.status==="verified" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
                                  {uploaded.status==="verified" ? "✓ Verified" : "⚠ Review"}
                                </span>
                              )}
                            </div>
                          </div>

                          <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9", marginBottom: 5 }}>{doc.label}</div>

                          {uploaded ? (
                            <div>
                              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📎 {uploaded.fileName}</div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={e => { e.stopPropagation(); setPreviewModal(uploaded); }}
                                  style={{ flex: 1, background: "#334155", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                                  🔍 Preview
                                </button>
                                {!student.locked && (
                                  <button onClick={e => { e.stopPropagation(); setSelectedDoc(doc.id); setTimeout(() => fileInputRef.current?.click(), 50); }}
                                    style={{ flex: 1, background: "#334155", border: "none", color: "#94a3b8", padding: "6px", borderRadius: 6, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                                    🔄 Replace
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 11, color: isActive ? "#818cf8" : "#475569", fontWeight: isActive ? 600 : 400 }}>
                              {isActive ? <span className="sdv-pulse">● Ready to upload…</span> : "Click to select & upload"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* UPLOAD BAR */}
                  {selectedDoc && !student.locked && (
                    <div className="sdv-fadein" style={{ marginTop: 16, background: "#1e293b", border: "2px dashed #6366f1", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14, marginBottom: 3 }}>
                          Uploading: {DOCUMENTS.find(d => d.id === selectedDoc)?.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Image or PDF · OCR will auto-detect & verify content</div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn-hover" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                          style={{ background: "linear-gradient(135deg,#6366f1,#0ea5e9)", border: "none", color: "#fff", padding: "9px 20px", borderRadius: 8, cursor: uploading ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, opacity: uploading ? 0.7 : 1 }}>
                          {uploading ? "⏳ Processing…" : "📁 Choose File"}
                        </button>
                        <button onClick={() => setSelectedDoc(null)}
                          style={{ background: "#334155", border: "none", color: "#94a3b8", padding: "9px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>✕</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* HIDDEN FILE INPUT */}
      <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />

      {/* PREVIEW MODAL */}
      {previewModal && (
        <div onClick={() => setPreviewModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div className="sdv-fadein" onClick={e => e.stopPropagation()}
            style={{ background: "#1e293b", borderRadius: 16, padding: 24, maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>Document Preview</div>
              <button onClick={() => setPreviewModal(null)}
                style={{ background: "#334155", border: "none", color: "#94a3b8", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <img src={previewModal.preview} alt="preview" style={{ width: "100%", borderRadius: 8, marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, fontWeight: 700,
                color: previewModal.status==="verified" ? "#10b981" : "#f59e0b",
                background: previewModal.status==="verified" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)" }}>
                {previewModal.status==="verified" ? "✓ Verified" : "⚠ Needs Review"}
              </span>
              {previewModal.detectedType && (
                <span style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, color: "#60a5fa", background: "rgba(96,165,250,0.1)" }}>
                  Auto-detected: {DOCUMENTS.find(d=>d.id===previewModal.detectedType)?.label || previewModal.detectedType}
                </span>
              )}
            </div>
            {previewModal.text && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>OCR Extracted Text</div>
                <pre style={{ background: "#0f172a", borderRadius: 8, padding: 12, fontSize: 11, color: "#94a3b8", maxHeight: 180, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0 }}>
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
