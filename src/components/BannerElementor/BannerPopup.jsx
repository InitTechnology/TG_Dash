import React from "react";
import { RiGalleryFill } from "react-icons/ri";

const BannerPopup = ({ setShowBannerPopup }) => {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => setShowBannerPopup(false)}
    >
      {/* Popup Container */}
      <div
        className="relative bg-white w-[90%] max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowBannerPopup(false)}
          className="absolute top-1.5 right-3 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>

        {/* title */}
        <h2 className="text-lg font-semibold mb-4">Select Layout</h2>

        {/* Grid Layout Options */}
        <div className="grid grid-cols-2 gap-4">
          {/* Layout 1 */}
          <div className="border rounded-xl p-3 cursor-pointer hover:border-black transition">
            <div className="flex flex-col gap-2">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-2">
                {/* Text Skeleton */}
                <div className="bg-gray-100 h-16 rounded-md p-2 flex flex-col justify-center gap-1">
                  <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-1 bg-gray-300 rounded w-full"></div>
                  <div className="h-1 bg-gray-300 rounded w-5/6"></div>
                  <div className="h-1 bg-gray-300 rounded w-full"></div>
                </div>

                {/* Image Skeleton */}
                <div className="bg-gray-100 h-16 rounded-md flex items-center justify-center text-xs text-gray-500">
                  <RiGalleryFill size={20} className="text-gray-400" />
                </div>
              </div>

              {/* Row 2 Text Skeleton */}
              <div className="bg-gray-100 h-10 rounded-md p-2 flex flex-col justify-center gap-1">
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                <div className="h-1 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>

          {/* Layout 2 */}
          <div className="border rounded-xl p-3 flex items-center justify-center text-gray-400 text-sm">
            <div className="bg-gray-100 rounded-md p-2 flex flex-col w-full h-full justify-center items-center gap-1">
              <RiGalleryFill size={20} className="text-gray-400" />
            </div>
          </div>

          {/* Layout 3 */}
          <div className="border rounded-xl p-3 flex items-center justify-center text-gray-400 text-sm">
            Coming Soon
          </div>

          {/* Layout 4 */}
          <div className="border rounded-xl p-3 flex items-center justify-center text-gray-400 text-sm">
            Coming Soon
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6">
          <button className="px-4 py-2 text-sm bg-black text-white rounded-lg">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerPopup;
