import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { iconMap } from "../../Config";

const ICON_NAMES = Object.keys(iconMap).sort((a, b) => a.localeCompare(b));

const IconSearch = ({
  value,
  onChange,
  placeholder = "Icon",
  isActive = false,
  textColor = "text-black",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIconName = value?.trim() || "";
  const SelectedIcon = iconMap[selectedIconName];

  useEffect(() => {
    if (isOpen) {
      setSearch(selectedIconName);
    }
  }, [isOpen, selectedIconName]);

  const [visibleCount, setVisibleCount] = useState(200);

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

    return results.slice(0, visibleCount); // ✅ controlled rendering
  }, [search, visibleCount]);
  const handleSelect = (iconName) => {
    onChange(iconName);
    setSearch(iconName);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className="flex items-center justify-center gap-2"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full appearance-none rounded-none border-0 border-b bg-transparent px-1 py-2 pr-10 text-sm shadow-none transition-colors duration-200 placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-none ${
              isActive ? "border-b-gray-300" : "border-b-transparent"
            } ${textColor}`}
          />
          <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
            {SelectedIcon ? (
              <SelectedIcon
                size={18}
                className={
                  textColor === "text-white" ? "text-white" : "text-gray-600"
                }
              />
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="shrink-0 text-sm font-medium text-blue-600"
        >
          Select Icon
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Icon
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-gray-100 px-5 py-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icon name..."
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between px-5 py-3 text-sm text-gray-500">
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

            <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto px-2 pb-2 sm:grid-cols-3 lg:grid-cols-6">
              {filteredIcons.map((iconName) => {
                const Icon = iconMap[iconName];
                const isSelected = iconName === selectedIconName;

                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelect(iconName)}
                    className={`flex min-h-[72px] flex-col items-center justify-center rounded-xl border px-1 py-2 text-center transition ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <Icon size={22} />
                    <span className="mt-3 text-xs font-medium leading-2">
                      {iconName}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center py-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 200)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IconSearch;
