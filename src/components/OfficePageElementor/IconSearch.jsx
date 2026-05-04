import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { iconMap } from "../../Config";

const ICON_NAMES = Object.keys(iconMap).sort((a, b) => a.localeCompare(b));
const INITIAL_VISIBLE_COUNT = 200;

const IconSearch = ({
  value,
  onChange,
  isActive = false,
  textColor = "text-black",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const selectedIconName = value?.trim() || "";
  const SelectedIcon = iconMap[selectedIconName];

  useEffect(() => {
    if (isOpen) {
      setSearch(selectedIconName);
      setVisibleCount(INITIAL_VISIBLE_COUNT);
    }
  }, [isOpen, selectedIconName]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const filteredIcons = useMemo(() => {
    const query = search.trim().toLowerCase();

    let results;

    if (!query) {
      results = ICON_NAMES;
    } else {
      const startsWithMatches = [];
      const includesMatches = [];

      ICON_NAMES.forEach((name) => {
        const lowerName = name.toLowerCase();

        if (lowerName.startsWith(query)) {
          startsWithMatches.push(name);
        } else if (lowerName.includes(query)) {
          includesMatches.push(name);
        }
      });

      results = [...startsWithMatches, ...includesMatches];
    }

    return results.slice(0, visibleCount);
  }, [search, visibleCount]);

  const handleSelect = (iconName) => {
    onChange(iconName);
    setSearch(iconName);
    setIsOpen(false);
  };

  const modal =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-gray-200 px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-lg font-semibold text-indigo-900">
                    Select Icon
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Search and choose an icon for this card.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                  aria-label="Close icon picker"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setVisibleCount(INITIAL_VISIBLE_COUNT);
                  }}
                  placeholder="Search icon name..."
                  autoFocus
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm text-gray-500 sm:px-6">
                <span>
                  {filteredIcons.length} icon
                  {filteredIcons.length === 1 ? "" : "s"} shown
                </span>
                {selectedIconName ? (
                  <span className="font-medium text-gray-700">
                    Selected: {selectedIconName}
                  </span>
                ) : (
                  <span>No icon selected</span>
                )}
              </div>

              <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-4 pb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {filteredIcons.map((iconName) => {
                  const Icon = iconMap[iconName];
                  const isSelected = iconName === selectedIconName;

                  return (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => handleSelect(iconName)}
                      className={`flex min-h-[84px] flex-col items-center justify-center rounded-2xl border px-2 py-3 text-center transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <Icon size={24} />
                      <span className="mt-3 break-all text-xs font-medium leading-4">
                        {iconName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* <div className="border-t border-gray-100 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((prev) => prev + INITIAL_VISIBLE_COUNT)
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Load More
                  </button>
                </div>
              </div> */}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className="flex flex-col justify-start gap-2"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-[60px] w-full">
          <div className="flex items-center justify-center">
            {SelectedIcon ? (
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#2f2c59] shadow-md">
                <SelectedIcon size={28} className="text-white" />
              </div>
            ) : (
              <span
                className={`text-sm font-medium ${
                  isActive ? textColor : "text-gray-500"
                }`}
              ></span>
            )}
          </div>
          {/* {selectedIconName ? (
            <span className={`mt-2 break-all text-xs font-medium ${textColor}`}>
              {selectedIconName}
            </span>
          ) : null} */}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="shrink-0 text-sm font-medium text-indigo-300"
        >
          (Select Icon)
        </button>
      </div>

      {modal}
    </>
  );
};

export default IconSearch;
