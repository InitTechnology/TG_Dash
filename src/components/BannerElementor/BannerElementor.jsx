import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { RiGalleryFill } from "react-icons/ri";
import { IoIosArrowForward } from "react-icons/io";
import { IoIosArrowBack } from "react-icons/io";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import { MdDelete } from "react-icons/md";

const BannerElementor = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    fetch("https://transglobeedu.com/web-backend/getBanners")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const normalized = data.banners.map((b) => {
            const d = b.data;

            return {
              ...b,
              data: {
                ...d,

                // 👇 add preview fallback automatically
                img1_preview: d.img1,
                img2_preview: d.img2,
                img3_preview: d.img3,
                image_preview: d.image,
                bg_img_preview: d.bg_img,
              },
            };
          });

          setBanners(normalized);
        }
      });
  }, []);
  const [banners, setBanners] = useState([]);
  const [selectedLayout, setSelectedLayout] = useState(null);
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const [form, setForm] = useState({});

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  //  image validation function
  const handleImageChange = (e, key, requiredWidth, requiredHeight) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/webp") {
      alert("Only WEBP images are allowed");
      e.target.value = "";
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;

      if (width !== requiredWidth || height !== requiredHeight) {
        alert(
          `Invalid size for ${key}. Required: ${requiredHeight}h × ${requiredWidth}w`,
        );
        URL.revokeObjectURL(objectUrl);
        e.target.value = "";
        return;
      }

      setForm((prev) => ({
        ...prev,
        [key]: file,
        [`${key}_preview`]: objectUrl,
      }));
    };

    img.src = objectUrl;
  };

  const handleImageRatioChange = (e, key, requiredRatio) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/webp") {
      alert("Only WEBP images are allowed");
      e.target.value = "";
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const ratio = width / height;

      const expected = requiredRatio[0] / requiredRatio[1];

      // allow small tolerance
      if (Math.abs(ratio - expected) > 0.05) {
        alert(
          `Image ratio invalid! Requires ${requiredRatio[0]}:${requiredRatio[1]} ratio image.`,
        );
        URL.revokeObjectURL(objectUrl);
        e.target.value = "";
        return;
      }

      //   setForm((prev) => ({
      //     ...prev,
      //     [key]: objectUrl,
      //   }));
      // };
      setForm((prev) => ({
        ...prev,
        [key]: file, // ✅ actual file (IMPORTANT)
        [`${key}_preview`]: objectUrl, // ✅ preview
      }));
    };

    img.src = objectUrl;
  };

  const handleBgImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only WEBP check (same as your main function)
    if (file.type !== "image/webp") {
      alert("Only WEBP images are allowed");
      e.target.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    // setForm((prev) => ({
    //   ...prev,
    //   bg_img: objectUrl,
    // }));
    setForm((prev) => ({
      ...prev,
      bg_img: file, // ✅ actual file
      bg_img_preview: objectUrl, // ✅ preview
    }));
  };

  const handleSave = async () => {
    // ===== VALIDATION (keep as it is) =====
    if (selectedLayout === "layout1") {
      if (!form.img1 || !form.img2 || !form.img3) {
        alert("All 3 images are required");
        return;
      }
    }

    if (selectedLayout === "layout2") {
      if (!form.image || !form.heading || !form.subheading) {
        alert("Image and all fields are required");
        return;
      }
      if (!form.bg_color) {
        alert("Background color is required");
        return;
      }
    }

    if (selectedLayout === "layout3") {
      if (!form.image || !form.heading || !form.subheading) {
        alert("Image, heading and subheading are required");
        return;
      }
      if (!form.bg_color) {
        alert("Background color is required");
        return;
      }
    }

    if (selectedLayout === "layout4") {
      if (!form.heading) {
        alert("Main heading is required");
        return;
      }

      for (let i = 1; i <= 4; i++) {
        if (!form[`card${i}_title`] || !form[`card${i}_desc`]) {
          alert(`Card ${i}: title and description are required`);
          return;
        }
      }

      if (!form.bg_img && !form.bg_color) {
        alert("Either background image or background color is required");
        return;
      }
    }

    // ===== CREATE FORMDATA =====
    const formData = new FormData();
    formData.append("layout_type", selectedLayout);

    // If editing an existing banner, send its DB id
    const existingBanner = banners[activeIndex];
    const isEdit = existingBanner && existingBanner.id;
    if (isEdit) formData.append("layout_id", existingBanner.id);

    Object.keys(form).forEach((key) => {
      if (key.includes("_preview")) return;
      // Skip string URLs for images (unchanged) — only append File objects
      if (form[key] instanceof File) {
        formData.append(key, form[key]);
      } else if (
        !(form[key] instanceof String) &&
        typeof form[key] === "string" &&
        form[key].startsWith("http")
      ) {
        // existing CDN URL — skip, backend keeps it
      } else {
        formData.append(key, form[key]);
      }
    });

    const endpoint = isEdit
      ? "https://transglobeedu.com/web-backend/updateBanner"
      : "https://transglobeedu.com/web-backend/createBanner";

    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      if (!data.success) {
        alert("Failed to save");
        return;
      }

      // Refresh banners from server to get latest state
      const refreshed = await fetch(
        "https://transglobeedu.com/web-backend/getBanners",
      ).then((r) => r.json());
      if (refreshed.success) {
        const normalized = refreshed.banners.map((b) => ({
          ...b,
          data: {
            ...b.data,
            img1_preview: b.data.img1,
            img2_preview: b.data.img2,
            img3_preview: b.data.img3,
            image_preview: b.data.image,
            bg_img_preview: b.data.bg_img,
          },
        }));
        setBanners(normalized);
      }

      setForm({});
      setSelectedLayout(null);
      setActiveIndex(null);
      setShowFormPopup(false);
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  const handleResetLayout = async () => {
    const confirmReset = window.confirm(
      "Change layout? This will delete the current banner permanently.",
    );
    if (!confirmReset) return;

    const existingBanner = banners[activeIndex];

    // If it's a saved banner (has DB id), delete it from the server
    if (existingBanner && existingBanner.id) {
      try {
        const res = await fetch(
          "https://transglobeedu.com/web-backend/deleteBanner",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              layout_id: existingBanner.id,
              layout_type: existingBanner.layout,
            }),
          },
        );
        const data = await res.json();
        if (!data.success) {
          alert("Failed to delete banner");
          return;
        }
      } catch (err) {
        console.error(err);
        alert("Server error during delete");
        return;
      }
    }

    const updated = [...banners];
    updated[activeIndex] = null;
    setBanners(updated);

    setForm({});
    setSelectedLayout(null);
    setActiveIndex(null);
    setShowFormPopup(false);
  };

  // const handleDeleteBanner = (index) => {
  //   const confirmDelete = window.confirm(
  //     "Are you sure you want to delete this banner?",
  //   );
  //   if (!confirmDelete) return;

  //   setBanners((prev) => {
  //     const updated = [...prev];
  //     updated.splice(index, 1); // remove
  //     return updated;
  //   });
  // };
  const handleDeleteBanner = async (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this banner?",
    );
    if (!confirmDelete) return;

    const banner = filledBanners[index];

    if (banner && banner.id) {
      try {
        const res = await fetch(
          "https://transglobeedu.com/web-backend/deleteBanner",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              layout_id: banner.id,
              layout_type: banner.layout,
            }),
          },
        );
        const data = await res.json();
        if (!data.success) {
          alert("Failed to delete banner");
          return;
        }
      } catch (err) {
        console.error(err);
        alert("Server error during delete");
        return;
      }
    }

    setBanners((prev) => prev.filter((b) => b !== null && b.id !== banner.id));
  };
  const responsive = {
    all: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
    },
  };

  // Layout Renderer
  const renderLayout = (banner) => {
    if (!banner) return null;

    const { layout, data } = banner;

    if (layout === "layout1") {
      return (
        <div
          className="p-2"
          style={{ backgroundColor: data.bg_color || "transparent" }}
        >
          {/* Mobile (default) */}
          <img
            src={data.img1_preview || data.img1}
            alt="img1"
            className="w-full h-[80vh] max-h-[1000px] object-contain rounded-lg block sm:hidden"
          />

          {/* Small screens (sm → lg) */}
          <img
            src={data.img2_preview || data.img2}
            alt="img2"
            className="w-full h-[80vh] max-h-[1000px] object-contain rounded-lg hidden sm:block lg:hidden"
          />

          {/* Large screens (lg and above) */}
          <img
            src={data.img3_preview || data.img3}
            alt="img3"
            className="w-full h-[80vh] max-h-[1000px] object-contain rounded-lg hidden lg:block"
          />
        </div>
      );
    }

    if (layout === "layout2") {
      return (
        <div
          className="flex flex-col justify-center items-center h-[80vh] max-h-[1000px] p-8"
          style={{ backgroundColor: data.bg_color || "transparent" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
            <div className="">
              <h1
                className="font-bold text-3xl md:text-4xl 2xl:text-6xl"
                style={{ color: data.main_text_color || "#000" }}
              >
                {data.heading}
              </h1>
              <p
                className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl mt-3"
                style={{ color: data.content_text_color || "#333" }}
              >
                {data.subheading}
              </p>
            </div>

            <img
              src={data.image_preview || data.image}
              alt="Img"
              className="w-full h-full object-contain"
            />
          </div>

          <p
            className="mt-5 text-center"
            style={{ color: data.content_text_color || "#333" }}
          >
            {data.description}
          </p>
        </div>
      );
    }

    if (layout === "layout3") {
      return (
        <div
          className="flex flex-col justify-center items-center h-[80vh] max-h-[1000px] p-8"
          style={{ backgroundColor: data.bg_color || "transparent" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <img
              src={data.image_preview || data.image}
              alt="Img"
              className="w-full h-full object-contain"
            />

            <div className="text-center">
              <h1
                className="font-bold text-3xl md:text-4xl 2xl:text-6xl"
                style={{ color: data.main_text_color || "#000" }}
              >
                {data.heading}
              </h1>
              <p
                className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl mt-3"
                style={{ color: data.content_text_color || "#333" }}
              >
                {data.subheading}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (layout === "layout4") {
      const isImage = !!data.bg_img;

      const mainColor = data.main_text_color || (isImage ? "#fff" : "#000");

      const contentColor =
        data.content_text_color || (isImage ? "#e5e5e5" : "#333");

      return (
        <div
          className="relative flex flex-col justify-center items-center h-[80vh] max-h-[1000px] overflow-hidden"
          style={{ backgroundColor: data.bg_color || "transparent" }}
        >
          {/* Background Image */}
          {data.bg_img && (
            <img
              src={data.bg_img_preview || data.bg_img}
              alt="bg"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Overlay */}
          <div
            className={`absolute inset-0 p-8 flex flex-col justify-center ${
              data.bg_img ? "bg-black/60" : ""
            }`}
          >
            {/* Heading */}
            <h1
              className="font-bold text-3xl md:text-4xl 2xl:text-6xl text-center mb-8 rounded-xl backdrop-blur-sm p-3"
              style={{ color: mainColor }}
            >
              {data.heading}
            </h1>

            {/* Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="backdrop-blur-sm rounded-xl p-3 text-center"
                  style={{ color: contentColor }}
                >
                  <h2 className="font-semibold text-lg md:text-xl xl:text-2xl 2xl:text-3xl mb-1">
                    {data[`card${item}_title`] || "Title"}
                  </h2>
                  <p
                    className="md:text-lg xl:text-xl 2xl:text-2xl"
                    style={{ color: contentColor }}
                  >
                    {data[`card${item}_desc`] || "Description"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
  };

  // Always 5 slots
  // const slots = [...banners];
  // while (slots.length < 15) slots.push(null);

  const maxBanners = 15;

  const remainingSlots = maxBanners - banners.filter((b) => b !== null).length;

  const slots = Array.from({ length: remainingSlots }, () => null);

  const filledBanners = banners.filter((b) => b !== null);

  // const handleReorder = (currentIndex, newPosition) => {
  //   const updated = [...filledBanners];

  //   // remove current item
  //   const [movedItem] = updated.splice(currentIndex, 1);

  //   // inserting at new position (index = position - 1)
  //   updated.splice(newPosition - 1, 0, movedItem);

  //   // merge back with empty slots logic
  //   const merged = [...updated];

  //   setBanners(merged);
  // };
  const handleReorder = async (currentIndex, newPosition) => {
    const updated = [...filledBanners];
    const [movedItem] = updated.splice(currentIndex, 1);
    updated.splice(newPosition - 1, 0, movedItem);

    // Optimistic UI update
    setBanners(updated);

    // Persist new order to DB
    try {
      const orderedIds = updated.map((b) => b.id);
      await fetch("https://transglobeedu.com/web-backend/reorderBanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
    } catch (err) {
      console.error("Failed to save order:", err);
    }
  };
  const renderLayoutPreview = (layout) => {
    // small skeleton blocks
    const box = "bg-gray-300 rounded";
    const line = "h-2 bg-gray-300 rounded";

    // ===================== LAYOUT 1  =====================
    if (layout === "layout1") {
      return (
        <div
          className={`flex justify-center items-center w-full min-h-20 h-full ${box}`}
        >
          <RiGalleryFill size={18} className="text-gray-500" />
        </div>
      );
    }

    // ===================== LAYOUT 2  =====================
    if (layout === "layout2") {
      return (
        <div className="w-full h-full p-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2 h-full items-center">
            <div className="flex flex-col gap-1">
              <div className={`${line} w-3/4`} />
              <div className={`${line} w-2/4`} />
              <div className={`${line} w-4/5`} />
              <div className={`${line} w-2/4`} />
            </div>
            <div
              className={`flex justify-center items-center min-h-16 h-full ${box}`}
            >
              <RiGalleryFill size={16} className="text-gray-500" />
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center items-center">
            <div className={`${line} w-4/5`} />
            <div className={`${line} w-2/3`} />
          </div>
        </div>
      );
    }

    // ===================== LAYOUT 3  =====================
    if (layout === "layout3") {
      return (
        <div className="grid grid-cols-2 gap-2 p-2 h-full w-full">
          {/* Image */}
          <div
            className={`${box} min-h-16  h-full flex justify-center items-center`}
          >
            <RiGalleryFill size={16} className="text-gray-500" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center gap-2 h-full">
            <div className={`${line} h-2`} />
            <div className={`${line} w-3/4 h-2`} />
            <div className={`${line} w-1/2`} />
          </div>
        </div>
      );
    }
    // ===================== LAYOUT 4  =====================
    if (layout === "layout4") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
          <div className={`${line} w-1/2`} />
          <div className={`${line} w-2/3`} />
          <div className={`${line} w-1/3`} />

          <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-x-2 gap-y-3 mt-3 justify-center items-center">
            <div className="flex flex-col justify-center items-center gap-2">
              <div className={`${line} w-2/3`} />
              <div className={`${line} w-1/3`} />
            </div>

            <div className="flex flex-col justify-center items-center gap-2">
              <div className={`${line} w-2/3`} />
              <div className={`${line} w-1/3`} />
            </div>

            <div className="flex flex-col justify-center items-center gap-2">
              <div className={`${line} w-2/3`} />
              <div className={`${line} w-1/3`} />
            </div>

            <div className="flex flex-col justify-center items-center gap-2">
              <div className={`${line} w-2/3`} />
              <div className={`${line} w-1/3`} />
            </div>
          </div>
        </div>
      );
    }
  };

  const CustomLeftArrow = ({ onClick }) => {
    return (
      <button
        onClick={onClick}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-0 bg-black/30 hover:bg-indigo-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
      >
        <IoIosArrowBack />
      </button>
    );
  };

  const CustomRightArrow = ({ onClick }) => {
    return (
      <button
        onClick={onClick}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-0 bg-black/30 hover:bg-indigo-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
      >
        <IoIosArrowForward />
      </button>
    );
  };

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

        {/* Header */}
        <div className="flex justify-between gap-5 items-start lg:items-center">
          <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
            <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
              Banner Elementor
            </p>
          </div>

          <div className="flex items-center gap-1"></div>
        </div>

        {/* Banner Content */}
        <div
          className={`mt-3 transition-all ease-linear duration-300 ${
            isSidebarOpen ? "lg:max-w-[72vw]" : "lg:max-w-[90vw]"
          }`}
        >
          {/* BANNER PREVIEW CAROUSEL */}
          {filledBanners.length > 0 && (
            <div className="mb-6 border rounded-xl p-2 bg-white shadow-sm">
              <p className="text-center font-semibold text-gray-500 mb-2">
                Banner Preview
              </p>

              <Carousel
                responsive={responsive}
                customLeftArrow={<CustomLeftArrow />}
                customRightArrow={<CustomRightArrow />}
                infinite
                showDots
                autoPlay={true}
                shouldResetAutoplay={false}
                pauseOnHover={true}
                autoPlaySpeed={3000}
              >
                {filledBanners.map((banner, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setActiveIndex(index);
                      setSelectedLayout(banner.layout);
                      setForm(banner.data);
                      setShowFormPopup(true);
                    }}
                  >
                    {renderLayout(banner)}

                    {/* POSITION DROPDOWN */}
                    <select
                      value={index + 1}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleReorder(index, Number(e.target.value));
                      }}
                      className="absolute bottom-3 left-3 z-30 bg-black text-white text-sm px-2 py-1 rounded outline-none cursor-pointer"
                    >
                      {Array.from({ length: filledBanners.length }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent edit popup
                        handleDeleteBanner(index);
                      }}
                      className="absolute bottom-3 right-3 z-30 bg-black hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          <div className="mt-5">
            <p className="text-center font-semibold text-gray-600 mb-2">
              Add New Banner
            </p>
            <Carousel
              responsive={responsive}
              customLeftArrow={<CustomLeftArrow />}
              customRightArrow={<CustomRightArrow />}
              infinite={false}
              showDots
            >
              {slots.map((banner, index) => (
                <div key={index} className="p-0">
                  {/* {banner ? (
                  <div
                    onClick={() => {
                      setActiveIndex(index);
                      setSelectedLayout(banner.layout);
                      setForm(banner.data);
                      setShowFormPopup(true);
                    }}
                    className="cursor-pointer border rounded-2xl overflow-hidden"
                  >
                    {renderLayout(banner)}
                  </div>
                ) : ( */}

                  {/* // EMPTY SLOT → SHOW 2x2 GRID */}
                  <div className="h-[80vh] max-h-[1000px] border-2 border-dashed rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["layout1", "layout2", "layout3", "layout4"].map(
                      (layout) => (
                        <div
                          key={layout}
                          onClick={() => {
                            if (
                              banners.filter((b) => b !== null).length >= 15
                            ) {
                              alert("Maximum 15 banners allowed");
                              return;
                            }

                            setActiveIndex(index);
                            setSelectedLayout(layout);
                            setForm({});
                            setShowFormPopup(true);
                          }}
                          className="flex items-center justify-center border rounded cursor-pointer hover:bg-gray-100 text-xs text-center"
                        >
                          {renderLayoutPreview(layout)}
                        </div>
                      ),
                    )}
                  </div>
                  {/* )} */}
                </div>
              ))}
            </Carousel>
          </div>

          {/* SINGLE POPUP */}
          {showFormPopup && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="relative bg-white py-3 rounded-xl w-auto max-w-[95%] md::max-w-[900px]">
                <h2 className="font-bold pl-5">Fill Banner Data</h2>
                <button
                  onClick={() => setShowFormPopup(false)}
                  className="absolute top-1.5 right-3 text-gray-400 hover:text-black text-lg font-bold"
                >
                  ✕
                </button>

                {/* Layout1 images */}
                {selectedLayout === "layout1" && (
                  <div className="max-h-[75vh] overflow-y-auto p-5">
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
                        {/* Image 1 */}
                        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
                          <p className="text-xs font-semibold text-indigo-800 mb-2">
                            Image 1 (550 × 350)
                          </p>

                          <input
                            type="file"
                            accept="image/webp"
                            onChange={(e) =>
                              handleImageChange(e, "img1", 350, 550)
                            }
                            className="mb-2"
                          />

                          {(form.img1_preview || form.img1) && (
                            <img
                              src={form.img1_preview || form.img1}
                              className="w-full h-[38vh] object-contain p-2"
                              alt="img1"
                            />
                          )}
                        </div>

                        {/* Image 2 */}
                        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
                          <p className="text-xs font-semibold text-indigo-800 mb-2">
                            Image 2 (550 × 550)
                          </p>

                          <input
                            type="file"
                            accept="image/webp"
                            onChange={(e) =>
                              handleImageChange(e, "img2", 550, 550)
                            }
                            className="mb-2"
                          />

                          {(form.img2_preview || form.img2) && (
                            <img
                              src={form.img2_preview || form.img2}
                              className="w-full h-[38vh] object-contain p-2"
                              alt="img2"
                            />
                          )}
                        </div>
                      </div>

                      {/* Image 3 */}
                      <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-2">
                          Image 3 (650 × 1850)
                        </p>

                        <input
                          type="file"
                          accept="image/webp"
                          onChange={(e) =>
                            handleImageChange(e, "img3", 1850, 650)
                          }
                          className="mb-2"
                        />

                        {(form.img3_preview || form.img3) && (
                          <img
                            src={form.img3_preview || form.img3}
                            className="w-full h-[37vh] object-contain p-2"
                            alt="img3"
                          />
                        )}
                      </div>
                    </div>

                    {/* BACKGROUND COLOR */}
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-indigo-800 mb-1">
                        Background Color (optional)
                      </p>

                      <input
                        type="color"
                        name="bg_color"
                        value={form.bg_color || ""}
                        onChange={handleChange}
                        className="w-20 h-10 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Layout 2 */}
                {selectedLayout === "layout2" && (
                  <div className="max-h-[75vh] overflow-y-auto p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-3 justify-center w-full">
                        <input
                          name="heading"
                          placeholder="Heading"
                          onChange={handleChange}
                          value={form.heading || ""}
                          className="border p-2 rounded"
                        />

                        <input
                          name="subheading"
                          placeholder="Subheading"
                          onChange={handleChange}
                          value={form.subheading || ""}
                          className="border p-2 rounded"
                        />
                      </div>

                      <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
                        <p className="text-xs font-semibold text-indigo-800 mb-2">
                          Banner Image (4:3 Ratio)
                        </p>

                        <input
                          type="file"
                          accept="image/webp"
                          onChange={(e) =>
                            handleImageRatioChange(e, "image", [4, 3])
                          }
                          className="mb-2"
                        />

                        {/* {form.image_preview && (
                          <img
                            src={form.image_preview}
                            className="w-full h-[35vh] object-contain p-2"
                            alt="layout2"
                          />
                        )} */}
                        {(form.image_preview || form.image) && (
                          <img
                            src={form.image_preview || form.image}
                            className="w-full h-[35vh] object-contain p-2"
                            alt="layout2"
                          />
                        )}
                      </div>
                    </div>

                    {/* BOTTOM TEXT */}
                    <div className="mt-4">
                      <textarea
                        name="description"
                        placeholder="Description (Bottom Text)"
                        onChange={handleChange}
                        value={form.description || ""}
                        className="border p-2 w-full rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      {/* BACKGROUND COLOR */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Choose Background Color
                        </p>

                        <input
                          type="color"
                          name="bg_color"
                          value={form.bg_color || ""}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>

                      {/* TEXT COLOR */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Text Color (Heading & Subheading)
                        </p>
                        <input
                          type="color"
                          name="main_text_color"
                          value={form.main_text_color || "#000000"}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Text Color (Content)
                        </p>
                        <input
                          type="color"
                          name="content_text_color"
                          value={form.content_text_color || "#333333"}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Layout 3 */}
                {selectedLayout === "layout3" && (
                  <div className="max-h-[75vh] overflow-y-auto p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* IMAGE */}
                      <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
                        <p className="text-xs font-semibold text-indigo-800 mb-2">
                          Image (4:3 Ratio)
                        </p>

                        <input
                          type="file"
                          accept="image/webp"
                          onChange={(e) =>
                            handleImageRatioChange(e, "image", [4, 3])
                          }
                          className="mb-2"
                        />

                        {/* {form.image_preview && (
                          <img
                            src={form.image_preview}
                            className="w-full h-[35vh] object-contain p-2"
                            alt="layout3"
                          />
                        )} */}
                        {(form.image_preview || form.image) && (
                          <img
                            src={form.image_preview || form.image}
                            className="w-full h-[35vh] object-contain p-2"
                            alt="layout3"
                          />
                        )}
                      </div>

                      {/* TEXT */}
                      <div className="flex flex-col gap-3 justify-center">
                        <input
                          name="heading"
                          placeholder="Heading"
                          onChange={handleChange}
                          value={form.heading || ""}
                          className="border p-2 rounded"
                        />

                        <input
                          name="subheading"
                          placeholder="Subheading"
                          onChange={handleChange}
                          value={form.subheading || ""}
                          className="border p-2 rounded"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      {/* BACKGROUND COLOR */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Choose Background Color
                        </p>

                        <input
                          type="color"
                          name="bg_color"
                          value={form.bg_color || ""}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>

                      {/* TEXT COLOR */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Text Color (Heading)
                        </p>
                        <input
                          type="color"
                          name="main_text_color"
                          value={form.main_text_color || "#000000"}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Text Color (Content)
                        </p>
                        <input
                          type="color"
                          name="content_text_color"
                          value={form.content_text_color || "#333333"}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Layout 4 */}
                {selectedLayout === "layout4" && (
                  <div className="max-h-[75vh] overflow-y-auto p-5">
                    {/* ROW 1 → MAIN HEADING */}
                    <div className="mb-4">
                      <textarea
                        name="heading"
                        placeholder="Main Heading"
                        onChange={handleChange}
                        value={form.heading || ""}
                        className="border p-2 w-full rounded"
                      />
                    </div>

                    {/* ROW 2 → 4 CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="border border-gray-300 rounded-lg p-3"
                        >
                          <p className="text-xs font-semibold text-indigo-800 mb-2">
                            {item}
                          </p>

                          <input
                            name={`card${item}_title`}
                            placeholder="Title"
                            onChange={handleChange}
                            value={form[`card${item}_title`] || ""}
                            className="border p-2 w-full rounded mb-2"
                          />

                          <textarea
                            name={`card${item}_desc`}
                            placeholder="Description"
                            onChange={handleChange}
                            value={form[`card${item}_desc`] || ""}
                            className="border p-2 w-full rounded"
                          />
                        </div>
                      ))}
                    </div>

                    {/* BACKGROUND IMAGE */}
                    <div className="mt-5 border-2 border-dashed border-indigo-300 rounded-lg p-3">
                      <p className="text-xs font-semibold text-indigo-800 mb-2">
                        Background Image (optional)
                      </p>

                      <input
                        type="file"
                        accept="image/webp"
                        onChange={(e) => {
                          handleBgImageChange(e);
                          e.target.value = "";
                        }}
                        className="mb-2"
                      />

                      {(form.bg_img_preview || form.bg_img) && (
                        <div className="relative">
                          <img
                            src={form.bg_img_preview || form.bg_img}
                            alt="bg preview"
                            className="w-full h-[35vh] object-contain p-2 mb-3"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              // memory cleanup
                              if (form.bg_img_preview) {
                                URL.revokeObjectURL(form.bg_img_preview);
                              }

                              // removing from form
                              setForm((prev) => ({
                                ...prev,
                                bg_img_preview: null,
                              }));

                              // removing from banners preview
                              setBanners((prev) => {
                                const updated = [...prev];

                                if (updated[activeIndex]) {
                                  updated[activeIndex] = {
                                    ...updated[activeIndex],
                                    data: {
                                      ...updated[activeIndex].data,
                                      bg_img: null,
                                    },
                                  };
                                }

                                return updated;
                              });
                            }}
                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-1 text-xs rounded"
                          >
                            Remove Image
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      {/* BACKGROUND COLOR */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Choose Background Color
                        </p>

                        <input
                          type="color"
                          name="bg_color"
                          value={form.bg_color || ""}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>

                      {/* TEXT COLOR */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Text Color (Heading)
                        </p>
                        <input
                          type="color"
                          name="main_text_color"
                          value={form.main_text_color || "#000000"}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>

                      <div className="mt-3">
                        <p className="text-xs font-semibold text-indigo-800 mb-1">
                          Text Color (Content)
                        </p>
                        <input
                          type="color"
                          name="content_text_color"
                          value={form.content_text_color || "#333333"}
                          onChange={handleChange}
                          className="w-20 h-10 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between gap-5 items-center pt-2 px-5">
                  {activeIndex !== null && (
                    <button
                      onClick={handleResetLayout}
                      className="text-sm sm:text-base text-orange-400 border border-orange-400 px-4 py-2 rounded-lg hover:scale-95 transition-all duration-200 ease-linear"
                    >
                      Change Layout
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="text-sm sm:text-base bg-indigo-900 hover:scale-95 text-white px-5 py-2 rounded-lg transition-all duration-200 ease-linear"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowFormPopup(false)}
                      className="text-sm sm:text-base border hover:bg-gray-100 hover:scale-95 px-4 py-2 rounded-lg transition-all duration-200 ease-linear"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BannerElementor;

// import React, { useEffect, useState } from "react";
// import Carousel from "react-multi-carousel";
// import "react-multi-carousel/lib/styles.css";
// import { RiGalleryFill } from "react-icons/ri";
// import { IoIosArrowForward } from "react-icons/io";
// import { IoIosArrowBack } from "react-icons/io";
// import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";

// const BannerElementor = () => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 1024;
//       setIsMobile(mobile);

//       if (mobile) {
//         setIsSidebarOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const [banners, setBanners] = useState([]);
//   const [selectedLayout, setSelectedLayout] = useState(null);
//   const [showFormPopup, setShowFormPopup] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(null);

//   const [form, setForm] = useState({});

//   // Handle input
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   //   const handleImage = (e) => {
//   //     const file = e.target.files[0];
//   //     if (file) {
//   //       setForm({ ...form, image: URL.createObjectURL(file) });
//   //     }
//   //   };

//   //  image validation function
//   const handleImageChange = (e, key, requiredWidth, requiredHeight) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.type !== "image/webp") {
//       alert("Only WEBP images are allowed");
//       e.target.value = "";
//       return;
//     }

//     const img = new Image();
//     const objectUrl = URL.createObjectURL(file);

//     img.onload = () => {
//       const { width, height } = img;

//       if (width !== requiredWidth || height !== requiredHeight) {
//         alert(
//           `Invalid size for ${key}. Required: ${requiredHeight}h × ${requiredWidth}w`,
//         );
//         URL.revokeObjectURL(objectUrl);
//         e.target.value = "";
//         return;
//       }

//       setForm((prev) => ({
//         ...prev,
//         [key]: objectUrl,
//       }));
//     };

//     img.src = objectUrl;
//   };

//   const handleImageRatioChange = (e, key, requiredRatio) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (file.type !== "image/webp") {
//       alert("Only WEBP images are allowed");
//       e.target.value = "";
//       return;
//     }

//     const img = new Image();
//     const objectUrl = URL.createObjectURL(file);

//     img.onload = () => {
//       const { width, height } = img;
//       const ratio = width / height;

//       const expected = requiredRatio[0] / requiredRatio[1];

//       // allow small tolerance
//       if (Math.abs(ratio - expected) > 0.05) {
//         alert(
//           `Image ratio invalid! Requires ${requiredRatio[0]}:${requiredRatio[1]} ratio image.`,
//         );
//         URL.revokeObjectURL(objectUrl);
//         e.target.value = "";
//         return;
//       }

//       setForm((prev) => ({
//         ...prev,
//         [key]: objectUrl,
//       }));
//     };

//     img.src = objectUrl;
//   };

//   const handleBgImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Only WEBP check (same as your main function)
//     if (file.type !== "image/webp") {
//       alert("Only WEBP images are allowed");
//       e.target.value = "";
//       return;
//     }

//     const objectUrl = URL.createObjectURL(file);

//     setForm((prev) => ({
//       ...prev,
//       bg_img: objectUrl,
//     }));
//   };

//   //  validation before saving
//   const handleSave = () => {
//     // Layout 1
//     if (selectedLayout === "layout1") {
//       if (!form.img1 || !form.img2 || !form.img3) {
//         alert("All 3 images are required");
//         return;
//       }
//     }

//     // Layout 2
//     if (selectedLayout === "layout2") {
//       if (!form.image || !form.heading || !form.subheading) {
//         alert("Image and all fields are required");
//         return;
//       }
//       if (!form.bg_color) {
//         alert("Background color is required");
//         return;
//       }
//     }

//     // Layout 3
//     if (selectedLayout === "layout3") {
//       if (!form.image || !form.heading || !form.subheading) {
//         alert("Image, heading and subheading are required");
//         return;
//       }
//       if (!form.bg_color) {
//         alert("Background color is required");
//         return;
//       }
//     }

//     // Layout 4
//     if (selectedLayout === "layout4") {
//       if (!form.heading) {
//         alert("Main heading is required");
//         return;
//       }

//       for (let i = 1; i <= 4; i++) {
//         if (!form[`card${i}_title`] || !form[`card${i}_desc`]) {
//           alert(`Card ${i}: title and description are required`);
//           return;
//         }
//       }

//       if (!form.bg_img && !form.bg_color) {
//         alert("Either background image or background color is required");
//         return;
//       }
//     }

//     const updated = [...banners];

//     updated[activeIndex] = {
//       id: Date.now(),
//       layout: selectedLayout,
//       data: form,
//     };

//     setBanners(updated);

//     setForm({});
//     setSelectedLayout(null);
//     setActiveIndex(null);
//     setShowFormPopup(false);
//   };

//   const handleResetLayout = () => {
//     const confirmReset = window.confirm(
//       "Are you sure you want to change layout? Changes in this slide will be lost.",
//     );

//     if (!confirmReset) return;

//     const updated = [...banners];
//     updated[activeIndex] = null; // remove current banner

//     setBanners(updated);

//     // Reset everything
//     setForm({});
//     setSelectedLayout(null);
//     setActiveIndex(null);
//     setShowFormPopup(false);
//   };

//   const responsive = {
//     all: {
//       breakpoint: { max: 4000, min: 0 },
//       items: 1,
//     },
//   };

//   // Layout Renderer
//   const renderLayout = (banner) => {
//     if (!banner) return null;

//     const { layout, data } = banner;

//     if (layout === "layout1") {
//       return (
//         <div
//           className="p-2"
//           style={{ backgroundColor: data.bg_color || "transparent" }}
//         >
//           {/* Mobile (default) */}
//           <img
//             src={data.img1}
//             alt="img1"
//             className="w-full h-[80vh] max-h-[1000px] object-contain rounded-lg block sm:hidden"
//           />

//           {/* Small screens (sm → lg) */}
//           <img
//             src={data.img2}
//             alt="img2"
//             className="w-full h-[80vh] max-h-[1000px] object-contain rounded-lg hidden sm:block lg:hidden"
//           />

//           {/* Large screens (lg and above) */}
//           <img
//             src={data.img3}
//             alt="img3"
//             className="w-full h-[80vh] max-h-[1000px] object-contain rounded-lg hidden lg:block"
//           />
//         </div>
//       );
//     }

//     if (layout === "layout2") {
//       return (
//         <div
//           className="flex flex-col justify-center items-center h-[80vh] max-h-[1000px] p-8"
//           style={{ backgroundColor: data.bg_color || "transparent" }}
//         >
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
//             <div className="">
//               <h1
//                 className="font-bold text-3xl md:text-4xl 2xl:text-6xl"
//                 style={{ color: data.main_text_color || "#000" }}
//               >
//                 {data.heading}
//               </h1>
//               <p
//                 className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl mt-3"
//                 style={{ color: data.content_text_color || "#333" }}
//               >
//                 {data.subheading}
//               </p>
//             </div>

//             <img
//               src={data.image}
//               alt="Img"
//               className="w-full h-full object-contain"
//             />
//           </div>

//           <p
//             className="mt-5 text-center"
//             style={{ color: data.content_text_color || "#333" }}
//           >
//             {data.description}
//           </p>
//         </div>
//       );
//     }

//     if (layout === "layout3") {
//       return (
//         <div
//           className="flex flex-col justify-center items-center h-[80vh] max-h-[1000px] p-8"
//           style={{ backgroundColor: data.bg_color || "transparent" }}
//         >
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//             <img
//               src={data.image}
//               alt="Img"
//               className="w-full h-full object-contain"
//             />

//             <div className="text-center">
//               <h1
//                 className="font-bold text-3xl md:text-4xl 2xl:text-6xl"
//                 style={{ color: data.main_text_color || "#000" }}
//               >
//                 {data.heading}
//               </h1>
//               <p
//                 className="text-lg md:text-xl xl:text-2xl 2xl:text-3xl mt-3"
//                 style={{ color: data.content_text_color || "#333" }}
//               >
//                 {data.subheading}
//               </p>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     if (layout === "layout4") {
//       const isImage = !!data.bg_img;

//       const mainColor = data.main_text_color || (isImage ? "#fff" : "#000");

//       const contentColor =
//         data.content_text_color || (isImage ? "#e5e5e5" : "#333");

//       return (
//         <div
//           className="relative flex flex-col justify-center items-center h-[80vh] max-h-[1000px] overflow-hidden"
//           style={{ backgroundColor: data.bg_color || "transparent" }}
//         >
//           {/* Background Image */}
//           {data.bg_img && (
//             <img
//               src={data.bg_img}
//               alt="bg"
//               className="absolute inset-0 w-full h-full object-cover"
//             />
//           )}

//           {/* Overlay */}
//           <div
//             className={`absolute inset-0 p-8 flex flex-col justify-center ${
//               data.bg_img ? "bg-black/60" : ""
//             }`}
//           >
//             {/* Heading */}
//             <h1
//               className="font-bold text-3xl md:text-4xl 2xl:text-6xl text-center mb-8 rounded-xl backdrop-blur-sm p-3"
//               style={{ color: mainColor }}
//             >
//               {data.heading}
//             </h1>

//             {/* Cards */}
//             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//               {[1, 2, 3, 4].map((item) => (
//                 <div
//                   key={item}
//                   className="backdrop-blur-sm rounded-xl p-3 text-center"
//                   style={{ color: contentColor }}
//                 >
//                   <h2 className="font-semibold text-lg md:text-xl xl:text-2xl 2xl:text-3xl mb-1">
//                     {data[`card${item}_title`] || "Title"}
//                   </h2>
//                   <p
//                     className="md:text-lg xl:text-xl 2xl:text-2xl"
//                     style={{ color: contentColor }}
//                   >
//                     {data[`card${item}_desc`] || "Description"}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       );
//     }
//   };

//   // Always 5 slots
//   const slots = [...banners];
//   while (slots.length < 15) slots.push(null);

//   const renderLayoutPreview = (layout) => {
//     // small skeleton blocks
//     const box = "bg-gray-300 rounded";
//     const line = "h-2 bg-gray-300 rounded";

//     // ===================== LAYOUT 1  =====================
//     if (layout === "layout1") {
//       return (
//         <div
//           className={`flex justify-center items-center w-full min-h-20 h-full ${box}`}
//         >
//           <RiGalleryFill size={18} className="text-gray-500" />
//         </div>
//       );
//     }

//     // ===================== LAYOUT 2  =====================
//     if (layout === "layout2") {
//       return (
//         <div className="w-full h-full p-2 flex flex-col gap-2">
//           <div className="grid grid-cols-2 gap-2 h-full items-center">
//             <div className="flex flex-col gap-1">
//               <div className={`${line} w-3/4`} />
//               <div className={`${line} w-2/4`} />
//               <div className={`${line} w-4/5`} />
//               <div className={`${line} w-2/4`} />
//             </div>
//             <div
//               className={`flex justify-center items-center min-h-16 h-full ${box}`}
//             >
//               <RiGalleryFill size={16} className="text-gray-500" />
//             </div>
//           </div>
//           <div className="flex flex-col gap-2 justify-center items-center">
//             <div className={`${line} w-4/5`} />
//             <div className={`${line} w-2/3`} />
//           </div>
//         </div>
//       );
//     }

//     // ===================== LAYOUT 3  =====================
//     if (layout === "layout3") {
//       return (
//         <div className="grid grid-cols-2 gap-2 p-2 h-full w-full">
//           {/* Image */}
//           <div
//             className={`${box} min-h-16  h-full flex justify-center items-center`}
//           >
//             <RiGalleryFill size={16} className="text-gray-500" />
//           </div>

//           {/* Content */}
//           <div className="flex flex-col justify-center gap-2 h-full">
//             <div className={`${line} h-2`} />
//             <div className={`${line} w-3/4 h-2`} />
//             <div className={`${line} w-1/2`} />
//           </div>
//         </div>
//       );
//     }
//     // ===================== LAYOUT 4  =====================
//     if (layout === "layout4") {
//       return (
//         <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
//           <div className={`${line} w-1/2`} />
//           <div className={`${line} w-2/3`} />
//           <div className={`${line} w-1/3`} />

//           <div className="grid grid-cols-2 lg:grid-cols-4 w-full gap-x-2 gap-y-3 mt-3 justify-center items-center">
//             <div className="flex flex-col justify-center items-center gap-2">
//               <div className={`${line} w-2/3`} />
//               <div className={`${line} w-1/3`} />
//             </div>

//             <div className="flex flex-col justify-center items-center gap-2">
//               <div className={`${line} w-2/3`} />
//               <div className={`${line} w-1/3`} />
//             </div>

//             <div className="flex flex-col justify-center items-center gap-2">
//               <div className={`${line} w-2/3`} />
//               <div className={`${line} w-1/3`} />
//             </div>

//             <div className="flex flex-col justify-center items-center gap-2">
//               <div className={`${line} w-2/3`} />
//               <div className={`${line} w-1/3`} />
//             </div>
//           </div>
//         </div>
//       );
//     }
//   };

//   const CustomLeftArrow = ({ onClick }) => {
//     return (
//       <button
//         onClick={onClick}
//         className="absolute left-2 top-1/2 -translate-y-1/2 z-0 bg-black/30 hover:bg-indigo-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
//       >
//         <IoIosArrowBack />
//       </button>
//     );
//   };

//   const CustomRightArrow = ({ onClick }) => {
//     return (
//       <button
//         onClick={onClick}
//         className="absolute right-2 top-1/2 -translate-y-1/2 z-0 bg-black/30 hover:bg-indigo-900 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md"
//       >
//         <IoIosArrowForward />
//       </button>
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

//         {/* Header */}
//         <div className="flex justify-between gap-5 items-start lg:items-center">
//           <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
//             <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
//               Banner Elementor
//             </p>
//           </div>

//           <div className="flex items-center gap-1"></div>
//         </div>

//         {/* Banner Content */}
//         <div
//           className={`mt-3 transition-all ease-linear duration-300 ${
//             isSidebarOpen ? "lg:max-w-[72vw]" : "lg:max-w-[90vw]"
//           }`}
//         >
//           {/* <div className="mt-5"> */}
//           <Carousel
//             responsive={responsive}
//             customLeftArrow={<CustomLeftArrow />}
//             customRightArrow={<CustomRightArrow />}
//             infinite={false}
//             showDots
//           >
//             {slots.map((banner, index) => (
//               <div key={index} className="p-2">
//                 {banner ? (
//                   <div
//                     onClick={() => {
//                       setActiveIndex(index);
//                       setSelectedLayout(banner.layout);
//                       setForm(banner.data);
//                       setShowFormPopup(true);
//                     }}
//                     className="cursor-pointer border rounded-2xl overflow-hidden"
//                   >
//                     {renderLayout(banner)}
//                   </div>
//                 ) : (
//                   // 🔥 EMPTY SLOT → SHOW 2x2 GRID
//                   <div className="h-[80vh] max-h-[1000px] border-2 border-dashed rounded-lg p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
//                     {["layout1", "layout2", "layout3", "layout4"].map(
//                       (layout) => (
//                         <div
//                           key={layout}
//                           onClick={() => {
//                             setActiveIndex(index);
//                             setSelectedLayout(layout);
//                             setForm({});
//                             setShowFormPopup(true);
//                           }}
//                           className="flex items-center justify-center border rounded cursor-pointer hover:bg-gray-100 text-xs text-center"
//                         >
//                           {renderLayoutPreview(layout)}
//                         </div>
//                       ),
//                     )}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </Carousel>

//           {/* SINGLE POPUP */}
//           {showFormPopup && (
//             <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//               <div className="relative bg-white py-3 rounded-xl w-auto max-w-[95%] md::max-w-[900px]">
//                 <h2 className="font-bold pl-5">Fill Banner Data</h2>
//                 <button
//                   onClick={() => setShowFormPopup(false)}
//                   className="absolute top-1.5 right-3 text-gray-400 hover:text-black text-lg font-bold"
//                 >
//                   ✕
//                 </button>

//                 {/* Layout1 images */}
//                 {selectedLayout === "layout1" && (
//                   <div className="max-h-[75vh] overflow-y-auto p-5">
//                     <div className="flex flex-col gap-3">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
//                         {/* Image 1 */}
//                         <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
//                           <p className="text-xs font-semibold text-indigo-800 mb-2">
//                             Image 1 (550 × 350)
//                           </p>

//                           <input
//                             type="file"
//                             accept="image/webp"
//                             onChange={(e) =>
//                               handleImageChange(e, "img1", 350, 550)
//                             }
//                             className="mb-2"
//                           />

//                           {form.img1 && (
//                             <img
//                               src={form.img1}
//                               className="w-full h-[38vh] object-contain p-2"
//                               alt="img1"
//                             />
//                           )}
//                         </div>

//                         {/* Image 2 */}
//                         <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
//                           <p className="text-xs font-semibold text-indigo-800 mb-2">
//                             Image 2 (550 × 550)
//                           </p>

//                           <input
//                             type="file"
//                             accept="image/webp"
//                             onChange={(e) =>
//                               handleImageChange(e, "img2", 550, 550)
//                             }
//                             className="mb-2"
//                           />

//                           {form.img2 && (
//                             <img
//                               src={form.img2}
//                               className="w-full h-[38vh] object-contain p-2"
//                               alt="img2"
//                             />
//                           )}
//                         </div>
//                       </div>

//                       {/* Image 3 */}
//                       <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-2">
//                           Image 3 (650 × 1850)
//                         </p>

//                         <input
//                           type="file"
//                           accept="image/webp"
//                           onChange={(e) =>
//                             handleImageChange(e, "img3", 1850, 650)
//                           }
//                           className="mb-2"
//                         />

//                         {form.img3 && (
//                           <img
//                             src={form.img3}
//                             className="w-full h-[37vh] object-contain p-2"
//                             alt="img3"
//                           />
//                         )}
//                       </div>
//                     </div>

//                     {/* BACKGROUND COLOR */}
//                     <div className="mt-3">
//                       <p className="text-xs font-semibold text-indigo-800 mb-1">
//                         Background Color (optional)
//                       </p>

//                       <input
//                         type="color"
//                         name="bg_color"
//                         value={form.bg_color || ""}
//                         onChange={handleChange}
//                         className="w-20 h-10 cursor-pointer"
//                       />
//                     </div>
//                   </div>
//                 )}

//                 {/* Layout 2 */}
//                 {selectedLayout === "layout2" && (
//                   <div className="max-h-[75vh] overflow-y-auto p-5">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="flex flex-col gap-3 justify-center w-full">
//                         <input
//                           name="heading"
//                           placeholder="Heading"
//                           onChange={handleChange}
//                           value={form.heading || ""}
//                           className="border p-2 rounded"
//                         />

//                         <input
//                           name="subheading"
//                           placeholder="Subheading"
//                           onChange={handleChange}
//                           value={form.subheading || ""}
//                           className="border p-2 rounded"
//                         />
//                       </div>

//                       <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
//                         <p className="text-xs font-semibold text-indigo-800 mb-2">
//                           Banner Image (4:3 Ratio)
//                         </p>

//                         <input
//                           type="file"
//                           accept="image/webp"
//                           onChange={(e) =>
//                             handleImageRatioChange(e, "image", [4, 3])
//                           }
//                           className="mb-2"
//                         />

//                         {form.image && (
//                           <img
//                             src={form.image}
//                             className="w-full h-[35vh] object-contain p-2"
//                             alt="layout2"
//                           />
//                         )}
//                       </div>
//                     </div>

//                     {/* BOTTOM TEXT */}
//                     <div className="mt-4">
//                       <textarea
//                         name="description"
//                         placeholder="Description (Bottom Text)"
//                         onChange={handleChange}
//                         value={form.description || ""}
//                         className="border p-2 w-full rounded"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
//                       {/* BACKGROUND COLOR */}
//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Choose Background Color
//                         </p>

//                         <input
//                           type="color"
//                           name="bg_color"
//                           value={form.bg_color || ""}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>

//                       {/* TEXT COLOR */}
//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Text Color (Heading & Subheading)
//                         </p>
//                         <input
//                           type="color"
//                           name="main_text_color"
//                           value={form.main_text_color || "#000000"}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>

//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Text Color (Content)
//                         </p>
//                         <input
//                           type="color"
//                           name="content_text_color"
//                           value={form.content_text_color || "#333333"}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Layout 3 */}
//                 {selectedLayout === "layout3" && (
//                   <div className="max-h-[75vh] overflow-y-auto p-5">
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       {/* IMAGE */}
//                       <div className="border-2 border-dashed border-indigo-300 rounded-lg p-3 h-full">
//                         <p className="text-xs font-semibold text-indigo-800 mb-2">
//                           Image (4:3 Ratio)
//                         </p>

//                         <input
//                           type="file"
//                           accept="image/webp"
//                           onChange={(e) =>
//                             handleImageRatioChange(e, "image", [4, 3])
//                           }
//                           className="mb-2"
//                         />

//                         {form.image && (
//                           <img
//                             src={form.image}
//                             className="w-full h-[35vh] object-contain p-2"
//                             alt="layout3"
//                           />
//                         )}
//                       </div>

//                       {/* TEXT */}
//                       <div className="flex flex-col gap-3 justify-center">
//                         <input
//                           name="heading"
//                           placeholder="Heading"
//                           onChange={handleChange}
//                           value={form.heading || ""}
//                           className="border p-2 rounded"
//                         />

//                         <input
//                           name="subheading"
//                           placeholder="Subheading"
//                           onChange={handleChange}
//                           value={form.subheading || ""}
//                           className="border p-2 rounded"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
//                       {/* BACKGROUND COLOR */}
//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Choose Background Color
//                         </p>

//                         <input
//                           type="color"
//                           name="bg_color"
//                           value={form.bg_color || ""}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>

//                       {/* TEXT COLOR */}
//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Text Color (Heading)
//                         </p>
//                         <input
//                           type="color"
//                           name="main_text_color"
//                           value={form.main_text_color || "#000000"}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>

//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Text Color (Content)
//                         </p>
//                         <input
//                           type="color"
//                           name="content_text_color"
//                           value={form.content_text_color || "#333333"}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Layout 4 */}
//                 {selectedLayout === "layout4" && (
//                   <div className="max-h-[75vh] overflow-y-auto p-5">
//                     {/* ROW 1 → MAIN HEADING */}
//                     <div className="mb-4">
//                       <textarea
//                         name="heading"
//                         placeholder="Main Heading"
//                         onChange={handleChange}
//                         value={form.heading || ""}
//                         className="border p-2 w-full rounded"
//                       />
//                     </div>

//                     {/* ROW 2 → 4 CARDS */}
//                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                       {[1, 2, 3, 4].map((item) => (
//                         <div
//                           key={item}
//                           className="border border-gray-300 rounded-lg p-3"
//                         >
//                           <p className="text-xs font-semibold text-indigo-800 mb-2">
//                             {item}
//                           </p>

//                           <input
//                             name={`card${item}_title`}
//                             placeholder="Title"
//                             onChange={handleChange}
//                             value={form[`card${item}_title`] || ""}
//                             className="border p-2 w-full rounded mb-2"
//                           />

//                           <textarea
//                             name={`card${item}_desc`}
//                             placeholder="Description"
//                             onChange={handleChange}
//                             value={form[`card${item}_desc`] || ""}
//                             className="border p-2 w-full rounded"
//                           />
//                         </div>
//                       ))}
//                     </div>

//                     {/* BACKGROUND IMAGE */}
//                     <div className="mt-5 border-2 border-dashed border-indigo-300 rounded-lg p-3">
//                       <p className="text-xs font-semibold text-indigo-800 mb-2">
//                         Background Image (optional)
//                       </p>

//                       <input
//                         type="file"
//                         accept="image/webp"
//                         onChange={(e) => {
//                           handleBgImageChange(e);
//                           e.target.value = "";
//                         }}
//                         className="mb-2"
//                       />

//                       {form.bg_img && (
//                         <div className="relative">
//                           <img
//                             src={form.bg_img}
//                             alt="bg preview"
//                             className="w-full h-[35vh] object-contain p-2 mb-3"
//                           />

//                           <button
//                             type="button"
//                             onClick={() => {
//                               // memory cleanup
//                               if (form.bg_img) {
//                                 URL.revokeObjectURL(form.bg_img);
//                               }

//                               // removing from form
//                               setForm((prev) => ({
//                                 ...prev,
//                                 bg_img: null,
//                               }));

//                               // removing from banners preview
//                               setBanners((prev) => {
//                                 const updated = [...prev];

//                                 if (updated[activeIndex]) {
//                                   updated[activeIndex] = {
//                                     ...updated[activeIndex],
//                                     data: {
//                                       ...updated[activeIndex].data,
//                                       bg_img: null,
//                                     },
//                                   };
//                                 }

//                                 return updated;
//                               });
//                             }}
//                             className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-red-500 text-white px-2 py-1 text-xs rounded"
//                           >
//                             Remove Image
//                           </button>
//                         </div>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
//                       {/* BACKGROUND COLOR */}
//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Choose Background Color
//                         </p>

//                         <input
//                           type="color"
//                           name="bg_color"
//                           value={form.bg_color || ""}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>

//                       {/* TEXT COLOR */}
//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Text Color (Heading)
//                         </p>
//                         <input
//                           type="color"
//                           name="main_text_color"
//                           value={form.main_text_color || "#000000"}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>

//                       <div className="mt-3">
//                         <p className="text-xs font-semibold text-indigo-800 mb-1">
//                           Text Color (Content)
//                         </p>
//                         <input
//                           type="color"
//                           name="content_text_color"
//                           value={form.content_text_color || "#333333"}
//                           onChange={handleChange}
//                           className="w-20 h-10 cursor-pointer"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 <div className="flex justify-between gap-5 items-center pt-2 px-5">
//                   {activeIndex !== null && (
//                     <button
//                       onClick={handleResetLayout}
//                       className="text-sm sm:text-base text-orange-400 border border-orange-400 px-4 py-2 rounded-lg hover:scale-95 transition-all duration-200 ease-linear"
//                     >
//                       Change Layout
//                     </button>
//                   )}

//                   <div className="flex gap-2">
//                     <button
//                       onClick={handleSave}
//                       className="text-sm sm:text-base bg-indigo-900 hover:scale-95 text-white px-5 py-2 rounded-lg transition-all duration-200 ease-linear"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={() => setShowFormPopup(false)}
//                       className="text-sm sm:text-base border hover:bg-gray-100 hover:scale-95 px-4 py-2 rounded-lg transition-all duration-200 ease-linear"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3 mt-8 justify-self-center">
//             <button className="w-36 px-6 z-30 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//               Cancel
//             </button>

//             <button className="w-36 px-6 z-30 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//               Save
//             </button>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default BannerElementor;
