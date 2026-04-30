// components/OCRResultPanel/OCRResultPanel.jsx
// -------------------------------------------------------------------
// Displays the structured OCR extraction result returned by the AI.
// Shows per-field values, confidence bars, flags, and overall status.
// -------------------------------------------------------------------

import React, { useState } from "react";
import { TbRosetteDiscountCheck, TbAlertTriangle, TbX } from "react-icons/tb";
import { ChevronDown, ChevronUp } from "lucide-react";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  verified: {
    label: "Verified",
    icon: <TbRosetteDiscountCheck size={14} />,
    containerClass: "bg-green-50 border-green-200 text-green-800",
    badgeClass: "bg-green-100 text-green-800",
  },
  review: {
    label: "Needs Review",
    icon: <TbAlertTriangle size={14} />,
    containerClass: "bg-amber-50 border-amber-200 text-amber-800",
    badgeClass: "bg-amber-100 text-amber-800",
  },
  error: {
    label: "Issues Found",
    icon: <TbX size={14} />,
    containerClass: "bg-red-50 border-red-200 text-red-800",
    badgeClass: "bg-red-100 text-red-800",
  },
};

// ─── Confidence bar ───────────────────────────────────────────────────────────
function ConfidenceBar({ value }) {
  const color =
    value >= 90 ? "bg-green-500" : value >= 70 ? "bg-amber-400" : "bg-red-400";
  const textColor =
    value >= 90
      ? "text-green-700"
      : value >= 70
        ? "text-amber-600"
        : "text-red-500";
  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-[10px] font-medium ${textColor}`}>
          {value}% confidence
        </span>
      </div>
      <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Single field card ────────────────────────────────────────────────────────
function FieldCard({ field }) {
  const isEmpty =
    field.value === null || field.value === undefined || field.value === "";
  return (
    <div
      className={`rounded-lg p-3 border transition-all ${
        isEmpty
          ? "bg-gray-50 border-gray-200"
          : field.confidence >= 90
            ? "bg-white border-gray-200"
            : field.confidence >= 70
              ? "bg-amber-50 border-amber-100"
              : "bg-red-50 border-red-100"
      }`}
    >
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-medium">
        {field.label}
      </p>
      <p
        className={`text-sm font-medium leading-snug break-words ${
          isEmpty ? "text-gray-400 italic font-normal" : "text-gray-900"
        }`}
      >
        {isEmpty ? "Not detected" : field.value}
      </p>
      {field.note && (
        <p className="text-[10px] text-amber-600 mt-1">{field.note}</p>
      )}
      {!isEmpty && <ConfidenceBar value={field.confidence} />}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const OCRResultPanel = ({ result, docTitle, onClose }) => {
  const [showRaw, setShowRaw] = useState(false);

  if (!result) return null;

  const cfg = STATUS_CONFIG[result.status] || STATUS_CONFIG.review;
  const processedAt = result.processedAt
    ? new Date(result.processedAt).toLocaleString()
    : "";

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* ── Header ── */}
      <div
        className={`border-b px-5 py-4 flex items-start justify-between ${cfg.containerClass}`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}
            >
              {cfg.icon}
              {cfg.label}
            </span>
            <span className="text-xs text-gray-500">
              {result.fileCount} file(s) · {processedAt}
            </span>
          </div>
          <p className="text-xs leading-relaxed max-w-xl">{result.summary}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <TbX size={18} />
          </button>
        )}
      </div>

      {/* ── Confidence meter ── */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
        <span className="text-xs text-gray-500 shrink-0">
          Overall confidence
        </span>
        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              result.overallConfidence >= 90
                ? "bg-green-500"
                : result.overallConfidence >= 70
                  ? "bg-amber-400"
                  : "bg-red-400"
            }`}
            style={{ width: `${result.overallConfidence}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-gray-700 w-10 text-right shrink-0">
          {result.overallConfidence}%
        </span>
      </div>

      {/* ── Flags ── */}
      {result.flags && result.flags.length > 0 && (
        <div className="px-5 py-3 border-b border-amber-100 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 mb-1.5">
            ⚠ Flags detected
          </p>
          <ul className="space-y-0.5">
            {result.flags.map((flag, i) => (
              <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                <span>•</span> {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Fields grid ── */}
      <div className="p-5">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">
          Extracted fields
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {(result.fields || []).map((field, i) => (
            <FieldCard key={i} field={field} />
          ))}
        </div>
      </div>

      {/* ── Raw AI response (collapsible) ── */}
      {result.rawResponse && (
        <div className="px-5 pb-5">
          <button
            onClick={() => setShowRaw((v) => !v)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-900 font-medium transition-colors"
          >
            {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showRaw ? "Hide" : "Show"} raw AI response
          </button>
          {showRaw && (
            <pre className="mt-2 text-[10px] font-mono bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
              {result.rawResponse}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRResultPanel;
