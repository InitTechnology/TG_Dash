import React, { useState, useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { TbArrowBigRightLine } from "react-icons/tb";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import Menubar from "../Menubar/Menubar";
import IconSearch from "./IconSearch";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const normalizeOfficeSlug = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/g, "");

const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const renderHighlightedBannerTitle = (title, selectedCity) => {
  if (!title) return null;

  const normalizedCity = toTitleCase(selectedCity);

  if (!normalizedCity) {
    return title;
  }

  const highlightRegex = new RegExp(`(${escapeRegex(normalizedCity)})`, "gi");

  return title.split(highlightRegex).map((part, index) => {
    const isMatched = part.toLowerCase() === normalizedCity.toLowerCase();

    return isMatched ? (
      <span key={`${part}-${index}`} className="text-red-700 font-normal">
        {part}
      </span>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    );
  });
};

const OfficePageElementor = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("menubarOpen");

    if (savedState !== null) {
      return JSON.parse(savedState);
    }

    return window.innerWidth >= 1024;
  });
  const [, setSubmitting] = useState(false);
  const [isBannerTitleEditing, setIsBannerTitleEditing] = useState(false);
  const [countries, setCountries] = useState([]);
  useEffect(() => {
    fetch("/world.json")
      .then((res) => res.json())
      .then((data) => setCountries(data));
  }, []);

  const flagUrls = useMemo(
    () => ({
      Australia:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/aed4de7d-f3fb-49ae-b8d8-736fc3603a00/public",
      Canada:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/5a169ba3-e6f1-4abd-913e-e11988ac1c00/public",
      UK: "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/e02420f7-1796-40b9-7986-2bf1fa2dd900/public",
      USA: "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/827816a8-627b-4e11-bf1b-0f41b7a65c00/public",
      Germany:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/4d712be5-7a9c-4671-58b7-6285a0959800/public",
      Dubai:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/682681fd-5603-48bc-33a6-93b1fd4ca600/public",
      Europe:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/6edd7a43-d4ca-4343-7776-4daebad92600/public",
      Ireland:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/615ae0ee-8b23-4ca6-c6b3-9607c9572400/public",
      Singapore:
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/8d93c1e6-cd1b-43c4-7e98-227ab7912500/public",
      "New Zealand":
        "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/9d4f42e5-a783-4e07-2e7c-6edd225ef000/public",
    }),
    [],
  );

  // States
  const [bgColor, setBgColor] = useState("#FFF9C4");
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState([{ id: 1, text: "" }]);

  const [destinations, setDestinations] = useState({
    headerTitle: "",
    headerPara: [{ id: 1, text: "" }],
    cards: [{ id: 1, country: "", description: "", flag: "" }],
  });

  const [examsData, setExamsData] = useState({
    title: "",
    subtitle: [{ id: 1, text: "" }],
    image: null,
    exams: [{ id: 1, name: "" }],
  });

  const [servicesData, setServicesData] = useState({
    headerTitle: "",
    headerPara: [{ id: 1, text: "" }],
    cards: [{ id: 1, title: "", description: "", icon: "" }],
  });

  const [testimonialsData, setTestimonialsData] = useState({
    title: "",
    subHeading: "",
    reviews: [{ id: 1, text: "", name: "", uni: "", country: "" }],
  });
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const [servicesData2, setServicesData2] = useState({
    headerTitle: "",
    headerPara: [{ id: 1, text: "" }],
    cards: [{ id: 1, title: "", description: "", icon: "" }],
  });

  const [faqData, setFaqData] = useState({
    title: "",
    subtitle: "",
    faqs: [
      { id: 1, question: "", answer: "" },
      { id: 2, question: "", answer: "" },
      { id: 3, question: "", answer: "" },
    ],
  });

  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    keywords: "",
  });

  const [officeData, setOfficeData] = useState({
    officeName: "",
    citySlug: "",
    country: "",
    state: "",
    city: "",
    address: "",
    phone: "",
    email: "",
    longitude: "",
    latitude: "",
    mapLink: "",
    googleEmbed: "",
    pageUrl: "",
  });

  const [examData, setExamData] = useState({
    trainers: [
      {
        id: 1,
        img: "",
        file: null,
        name: "",
        qualification: "",
        experience: "",
        specialization: [""],
      },
    ],
    testimonials: [
      {
        id: 1,
        review: "",
        name: "",
        bandScore: "",
      },
    ],
  });
  const selectedCountry = countries.find((c) => c.name === officeData.country);
  const states = selectedCountry?.states || [];
  const selectedState = states.find((s) => s.name === officeData.state);
  const cities = selectedState?.cities || [];
  const createUniqueId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  const cloneValue = (value) => {
    if (Array.isArray(value)) {
      return value.map(cloneValue);
    }

    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [
          key,
          cloneValue(nestedValue),
        ]),
      );
    }

    return value;
  };

  const createTrainer = () => ({
    id: createUniqueId(),
    img: "",
    name: "",
    qualification: "",
    experience: "",
    specialization: [""],
  });

  const createExamTestimonial = () => ({
    id: createUniqueId(),
    review: "",
    name: "",
    bandScore: "",
  });

  const addTrainer = () => {
    setExamData((prev) => ({
      ...prev,
      trainers: [...prev.trainers, createTrainer()],
    }));
  };

  const removeTrainer = (trainerId) => {
    setExamData((prev) => {
      if (prev.trainers.length === 1) return prev;

      return {
        ...prev,
        trainers: prev.trainers.filter((trainer) => trainer.id !== trainerId),
      };
    });
  };

  const addExamTestimonial = () => {
    setExamData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, createExamTestimonial()],
    }));
  };

  const removeExamTestimonial = (testimonialId) => {
    setExamData((prev) => {
      if (prev.testimonials.length === 1) return prev;

      return {
        ...prev,
        testimonials: prev.testimonials.filter(
          (testimonial) => testimonial.id !== testimonialId,
        ),
      };
    });
  };

  const addSpecialization = (trainerId) => {
    setExamData((prev) => ({
      ...prev,
      trainers: prev.trainers.map((t) =>
        t.id === trainerId && t.specialization.length < 10
          ? { ...t, specialization: [...t.specialization, ""] }
          : t,
      ),
    }));
  };

  const removeSpecialization = (trainerId, index) => {
    setExamData((prev) => ({
      ...prev,
      trainers: prev.trainers.map((t) =>
        t.id === trainerId
          ? {
              ...t,
              specialization: t.specialization.filter((_, i) => i !== index),
            }
          : t,
      ),
    }));
  };

  const handleSpecializationChange = (trainerId, index, value) => {
    const words = value.trim().split(/\s+/);

    if (words.length <= 3) {
      setExamData((prev) => ({
        ...prev,
        trainers: prev.trainers.map((t) =>
          t.id === trainerId
            ? {
                ...t,
                specialization: t.specialization.map((s, i) =>
                  i === index ? value : s,
                ),
              }
            : t,
        ),
      }));
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- GENERIC HANDLERS---
  const addDynamicItem = (setter, field, defaultObj = { text: "" }) => {
    setter((prev) => {
      const newItem = { id: createUniqueId(), ...cloneValue(defaultObj) };

      if (Array.isArray(prev)) return [...prev, newItem];

      return { ...prev, [field]: [...prev[field], newItem] };
    });
  };

  const removeDynamicItem = (setter, field, id) => {
    setter((prev) => {
      const list = Array.isArray(prev) ? prev : prev[field];
      if (list.length === 1) return prev;
      const newList = list.filter((item) => item.id !== id);
      return Array.isArray(prev) ? newList : { ...prev, [field]: newList };
    });
  };

  const handleDynamicChange = (setter, field, id, newValue, key = "text") => {
    setter((prev) => {
      const update = (list) =>
        list.map((item) =>
          item.id === id ? { ...item, [key]: newValue } : item,
        );
      if (Array.isArray(prev)) return update(prev);
      return { ...prev, [field]: update(prev[field]) };
    });
  };

  const bannerTitleFieldClassName =
    "font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full bg-transparent outline-none duration-300 p-0";
  const commonPosition =
    "absolute left-5 right-5 top-5 md:left-12 md:right-12 md:top-12 lg:left-20 lg:right-20 lg:top-20";

  const handleSave = async () => {
    setSubmitting(true);

    try {
      const formData = new FormData();

      const payload = {
        officeName: officeData.officeName,
        citySlug: officeData.citySlug,
        country: officeData.country,
        state: officeData.state,
        city: officeData.city,
        address: officeData.address,
        phone: officeData.phone,
        email: officeData.email,
        latitude: officeData.latitude,
        longitude: officeData.longitude,
        mapLink: officeData.mapLink,
        googleEmbed: officeData.googleEmbed,
        pageUrl: officeData.pageUrl,
        timings: officeData.timings,

        // Banner data
        bgColor: bgColor,
        title: title,
        sections: sections.map((s) => ({ text: s.text })),
        destinations: {
          headerTitle: destinations.headerTitle,
          headerPara: destinations.headerPara.map((p) => ({ text: p.text })),
          cards: destinations.cards.map((card) => ({
            country: card.country,
            description: card.description,
            flag: card.flag || "",
          })),
        },

        // Exams section
        examsData: {
          title: examsData.title,
          subtitle: examsData.subtitle.map((s) => ({ text: s.text })),
          exams: examsData.exams.map((e) => ({ name: e.name })),
        },

        // Services section
        servicesData: {
          headerTitle: servicesData.headerTitle,
          headerPara: servicesData.headerPara.map((p) => ({ text: p.text })),
          cards: servicesData.cards.map((card) => ({
            title: card.title,
            description: card.description,
            icon: card.icon || "",
          })),
        },

        servicesData2: {
          headerTitle: servicesData2.headerTitle,
          headerPara: servicesData2.headerPara.map((p) => ({ text: p.text })),
          cards: servicesData2.cards.map((card) => ({
            title: card.title,
            description: card.description,
            icon: card.icon || "",
          })),
        },

        testimonialsData: {
          title: testimonialsData.title,
          subHeading: testimonialsData.subHeading,
          reviews: testimonialsData.reviews.map((review) => ({
            text: review.text,
            name: review.name,
            uni: review.uni,
            country: review.country,
          })),
        },

        // FAQ section
        faqData: {
          faqs: faqData.faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        },

        // SEO data
        seoData: {
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords,
        },

        // Exam related data (trainers and testimonials)
        examData: {
          trainers: examData.trainers.map((trainer) => ({
            name: trainer.name,
            qualification: trainer.qualification,
            experience: trainer.experience,
            specialization: trainer.specialization.filter(
              (s) => s.trim() !== "",
            ),
            img: trainer.img || "",
          })),
          testimonials: examData.testimonials.map((testimonial) => ({
            review: testimonial.review,
            name: testimonial.name,
            bandScore: testimonial.bandScore,
          })),
        },
      };

      formData.append("data", JSON.stringify(payload));

      // ✅ send files
      examData.trainers.forEach((trainer, index) => {
        if (trainer.file) {
          formData.append(`trainer_img_${index}`, trainer.file);
        }
      });

      const response = await fetch(
        "https://transglobeedu.com/web-backend/office-page",
        {
          method: "POST",
          body: formData, // ❗ no headers
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Office page saved successfully!");
        console.log("Office ID:", data.data.officeId);
        console.log("Office Link:", data.data.link);

        localStorage.setItem("currentOfficeId", data.data.officeId);
      } else {
        alert(data.message || "Failed to save office page");
        console.error("Server errors:", data.errors);
      }
    } catch (error) {
      console.error("Error saving office page:", error);
      alert("Error saving office page: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen">
      <Menubar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isMobile={isMobile}
      />
      <main
        className={`p-5 lg:p-6 transition-all duration-500 w-full ${isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"}`}
      >
        <Outlet />

        {/* Header */}
        <div className="flex justify-between gap-5 items-start lg:items-center mb-8">
          <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
            Office Page Elementor
          </p>
        </div>

        <div className="mx-auto">
          {/* Section 1  banner*/}
          <div
            className="relative min-h-[300px] md:min-h-[350px] lg:min-h-[400px] rounded-xl p-5 md:p-12 lg:p-20 flex flex-col justify-center transition-all duration-300 shadow-sm overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            {title && !isBannerTitleEditing && (
              <div
                className={`${bannerTitleFieldClassName} ${commonPosition} pointer-events-none select-none whitespace-pre-wrap break-words`}
                style={{ lineHeight: 1.3 }}
              >
                {renderHighlightedBannerTitle(title, officeData.city)}
              </div>
            )}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsBannerTitleEditing(true)}
              onBlur={() => setIsBannerTitleEditing(false)}
              rows={isMobile ? 4 : 3}
              className={`${bannerTitleFieldClassName} ${commonPosition} resize-none border border-transparent focus:border-black ${
                title && !isBannerTitleEditing
                  ? "text-transparent caret-transparent"
                  : "caret-[#2B2A4C]"
              }`}
              style={{ lineHeight: 1.3 }}
              placeholder="Banner Title"
            />
            <div className="absolute lg:bottom-6 bottom-4 lg:right-8 right-2 flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1.5">
                <div className="relative w-6 h-6 border border-black rounded-sm overflow-hidden">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>
                <span className="text-md font-medium text-[#6B7280] uppercase tracking-wide">
                  {bgColor}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2  para*/}
          <div className="mt-6 mb-10">
            {sections.map((section, index) => (
              <div key={section.id} className="relative group mb-10">
                <div className="w-full border border-gray-400 rounded bg-white px-4 py-2 hover:border-black">
                  <textarea
                    value={section.text}
                    onChange={(e) =>
                      handleDynamicChange(
                        setSections,
                        null,
                        section.id,
                        e.target.value,
                      )
                    }
                    rows={isMobile ? 12 : 4}
                    placeholder="Type something here..."
                    className="w-full bg-transparent outline-none text-sm text-gray-500"
                  />
                </div>
                <div className="absolute -right-1 -bottom-8 flex items-center gap-1">
                  <button
                    onClick={() => addDynamicItem(setSections)}
                    className="border border-indigo-900 rounded-full p-1 bg-indigo-900 text-white"
                  >
                    <FaPlus size={18} />
                  </button>
                  {index !== 0 && (
                    <button
                      onClick={() =>
                        removeDynamicItem(setSections, null, section.id)
                      }
                      className="border border-indigo-900 rounded-full p-1 bg-indigo-900 text-white"
                    >
                      <FaMinus size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Section 3  flag*/}
          <div className="mt-12 mb-20 p-10 border border-gray-400 rounded-sm bg-white relative">
            <div className="mb-10">
              <textarea
                rows={1}
                value={destinations.headerTitle}
                onChange={(e) =>
                  setDestinations({
                    ...destinations,
                    headerTitle: e.target.value,
                  })
                }
                className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full bg-transparent outline-none focus:border-b border-black mb-2"
                placeholder="Title"
              />
              {destinations.headerPara.map((para, index) => (
                <div key={para.id} className="relative group mb-8">
                  <div className="w-full border border-gray-300 rounded bg-white px-3 py-2 hover:border-black">
                    <textarea
                      value={para.text}
                      onChange={(e) =>
                        handleDynamicChange(
                          setDestinations,
                          "headerPara",
                          para.id,
                          e.target.value,
                        )
                      }
                      rows={isMobile ? 4 : 1}
                      placeholder="Description"
                      className="w-full bg-transparent outline-none text-sm text-gray-500 resize-none"
                    />
                  </div>
                  <div className="absolute -bottom-7 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        addDynamicItem(setDestinations, "headerPara")
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaPlus size={14} />
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() =>
                          removeDynamicItem(
                            setDestinations,
                            "headerPara",
                            para.id,
                          )
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {destinations.cards.map((card, index) => (
                <div key={card.id} className="relative group">
                  <div className="border border-gray-400 p-5 flex flex-col items-center bg-white aspect-square justify-center shadow-sm">
                    <div
                      className="w-20 h-12 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
                      // onClick={() => flagInputRef.current.click()}
                    >
                      <div>
                        {card.flag ? (
                          <img
                            src={card.flag}
                            alt="Flag"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-[8px] text-[#2B2A4C]/60">
                            Flag
                          </span>
                        )}
                      </div>
                      {/* <label
                        htmlFor={`flag-${card.id}`}
                        className="w-full h-full flex items-center justify-center cursor-pointer"
                      >
                        {card.flag ? (
                          <img
                            src={card.flag}
                            alt="flag"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            Upload Flag
                          </span>
                        )}
                      </label> */}
                    </div>
                    {/* <select
                      value={card.country}
                      onChange={(e) =>
                        handleDynamicChange(
                          setDestinations,
                          "cards",
                          card.id,
                          e.target.value,
                          "country",
                        )
                      }
                      className="w-full border border-gray-300 rounded p-1 mb-3 outline-none text-sm text-[#2b2a2c] font-semibold text-center"
                    >
                      <option value="">Select Country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select> */}

                    {/* Flag + Country */}
                    <div className="flex gap-2 items-center mt-2">
                      {/* Flag Upload */}

                      {/* <input
                type="file"
                ref={flagInputRef}
                accept="image/*"
                hidden
                onChange={(e) => {
                  const selected = e.target.value;
                  setCountry(selected);
                  setFlag(flagUrls[selected] || ""); // 👈 automatically set flag URL
                }}
              /> */}

                      <select
                        value={card.country} // onChange={(e) => setCountry(e.target.value)}
                        onChange={(e) => {
                          const selected = e.target.value;

                          setDestinations((prev) => ({
                            ...prev,
                            cards: prev.cards.map((item) =>
                              item.id === card.id
                                ? {
                                    ...item,
                                    country: selected,
                                    flag: flagUrls[selected] || "",
                                  }
                                : item,
                            ),
                          }));
                        }}
                        className="bg-transparent outline-none border-b border-[#2B2A4C] text-sm text-left w-24 text-[#2B2A4C]"
                      >
                        <option value="" disabled>
                          Country
                        </option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                        <option value="Australia">Australia</option>
                        <option value="Canada">Canada</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="Germany">Germany</option>
                        <option value="Dubai">Dubai</option>
                        <option value="Europe">Europe</option>
                        <option value="Singapore">Singapore</option>
                      </select>
                    </div>
                    <textarea
                      value={card.description}
                      onChange={(e) =>
                        handleDynamicChange(
                          setDestinations,
                          "cards",
                          card.id,
                          e.target.value,
                          "description",
                        )
                      }
                      className="w-full text-sm text-center text-gray-500 bg-transparent outline-none border border-transparent rounded hover:border-black"
                      rows={3}
                      placeholder="description..."
                    />
                  </div>
                  <div className="absolute -bottom-7 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        addDynamicItem(setDestinations, "cards", {
                          country: "",
                          description: "",
                          flag: "",
                        })
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaPlus size={14} />
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() =>
                          removeDynamicItem(setDestinations, "cards", card.id)
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4  exam*/}
          <div className="mt-12 mb-20 p-8 border border-gray-400 rounded-sm bg-[#E7E7F8] relative">
            <textarea
              value={examsData.title}
              onChange={(e) =>
                setExamsData({ ...examsData, title: e.target.value })
              }
              className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full bg-transparent outline-none mb-4 focus:border-b border-black"
              placeholder="Title..."
            />
            {examsData.subtitle.map((sub, index) => (
              <div
                key={sub.id}
                className="relative mb-8 w-full border border-gray-300 rounded bg-[#F0F2F9] px-3 py-2 hover:border-black"
              >
                <textarea
                  rows={1}
                  value={sub.text}
                  onChange={(e) =>
                    handleDynamicChange(
                      setExamsData,
                      "subtitle",
                      sub.id,
                      e.target.value,
                    )
                  }
                  className="w-full text-sm text-gray-500 bg-transparent outline-none"
                  placeholder="Description..."
                />
                <div className="absolute -right-2 -bottom-7 flex gap-1">
                  <button
                    onClick={() => addDynamicItem(setExamsData, "subtitle")}
                    className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                  >
                    <FaPlus size={14} />
                  </button>
                  {index !== 0 && (
                    <button
                      onClick={() =>
                        removeDynamicItem(setExamsData, "subtitle", sub.id)
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaMinus size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-col lg:flex-row gap-10 mt-14">
              <div className="w-full lg:w-1/2 rounded-2xl h-[300px] lg:h-[400px] overflow-hidden">
                <img
                  src="https://www.vancopayments.com/hubfs/Graduation%20-%20Cap%20throw.png"
                  alt="Prep"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-[90%] lg:w-[40%] flex flex-col gap-5">
                {examsData.exams.map((exam, index) => (
                  <div key={exam.id} className="relative group">
                    <div className=" flex items-center bg-[#1D2145] text-white rounded-lg px-4 py-2 border border-transparent hover:border-white/50 transition-all">
                      <input
                        type="text"
                        value={exam.name}
                        onChange={(e) =>
                          handleDynamicChange(
                            setExamsData,
                            "exams",
                            exam.id,
                            e.target.value,
                            "name",
                          )
                        }
                        placeholder="Exam Name"
                        className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 font-medium max-w-[85%]"
                      />
                      <TbArrowBigRightLine
                        size={20}
                        className="md:ml-12 ml-3 flex-shrink-0"
                      />
                    </div>
                    <div className="absolute md:-right-12 -right-12 top-3 md:top-3 flex gap-1 z-10">
                      <button
                        onClick={() =>
                          addDynamicItem(setExamsData, "exams", { name: "" })
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaPlus size={10} />
                      </button>
                      {index !== 0 && (
                        <button
                          onClick={() =>
                            removeDynamicItem(setExamsData, "exams", exam.id)
                          }
                          className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                        >
                          <FaMinus size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* section 5  card 1*/}
          <div className="mt-12 mb-20 p-10 border border-gray-400 rounded-sm bg-white relative">
            <div className="mb-10">
              <textarea
                rows={1}
                value={servicesData.headerTitle}
                onChange={(e) =>
                  setServicesData({
                    ...servicesData,
                    headerTitle: e.target.value,
                  })
                }
                className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full bg-transparent outline-none focus:border-b border-black mb-2"
                placeholder="Title..."
              />

              {servicesData.headerPara.map((para, index) => (
                <div key={para.id} className="relative group mb-8">
                  <div className="w-full border border-gray-300 rounded bg-white px-3 py-2 hover:border-black">
                    <textarea
                      value={para.text}
                      onChange={(e) =>
                        handleDynamicChange(
                          setServicesData,
                          "headerPara",
                          para.id,
                          e.target.value,
                        )
                      }
                      rows={isMobile ? 8 : 2}
                      placeholder="Description..."
                      className="w-full bg-transparent outline-none text-sm text-gray-500 resize-none"
                    />
                  </div>
                  <div className="absolute -bottom-7 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        addDynamicItem(setServicesData, "headerPara")
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaPlus size={14} />
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() =>
                          removeDynamicItem(
                            setServicesData,
                            "headerPara",
                            para.id,
                          )
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {servicesData.cards.map((card, index) => (
                <div key={card.id} className="relative group">
                  <div className="flex flex-col items-start bg-white p-2 min-h-[300px] border border-gray-300">
                    {/* Icon Upload Area */}
                    {/* <div className="w-10 h-10 bg-[#1D2145] rounded-lg flex items-center justify-center mb-4 overflow-hidden"></div> */}
                    <div>
                      <IconSearch
                        value={card.icon}
                        onChange={(v) =>
                          handleDynamicChange(
                            setServicesData,
                            "cards",
                            card.id,
                            v,
                            "icon",
                          )
                        }
                        isActive={true}
                        textColor="text-white"
                      />
                    </div>
                    <textarea
                      value={card.title}
                      onChange={(e) =>
                        handleDynamicChange(
                          setServicesData,
                          "cards",
                          card.id,
                          e.target.value,
                          "title",
                        )
                      }
                      className="w-full text-xl font-medium text-[#1B003C] my-5 bg-transparent outline-none border-b border-transparent hover:border-gray-300 mb-3 resize-none"
                      rows={2}
                      placeholder="Heading"
                    />

                    <textarea
                      value={card.description}
                      onChange={(e) =>
                        handleDynamicChange(
                          setServicesData,
                          "cards",
                          card.id,
                          e.target.value,
                          "description",
                        )
                      }
                      className="w-full text-sm text-gray-500 bg-transparent outline-none border border-transparent rounded hover:border-gray-200 p-1 resize-none leading-relaxed"
                      rows={8}
                      placeholder="Description..."
                    />
                  </div>

                  <div className="absolute -bottom-7 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        addDynamicItem(setServicesData, "cards", {
                          title: "",
                          description: "",
                          icon: null,
                        })
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaPlus size={14} />
                    </button>
                    {index !== 0 && (
                      <button
                        onClick={() =>
                          removeDynamicItem(setServicesData, "cards", card.id)
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* section 6  carousel*/}
          <div className="mt-12 mb-20 p-8 flex flex-col lg:flex-row items-center gap-10 bg-[#E7E7F8] relative">
            <div className="w-full lg:w-1/2">
              <textarea
                rows={isMobile ? 5 : 3}
                value={testimonialsData.title}
                onChange={(e) =>
                  setTestimonialsData({
                    ...testimonialsData,
                    title: e.target.value,
                  })
                }
                className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full focus:border-b border-black bg-transparent outline-none mb-4 leading-tight"
                placeholder="Add Title..."
              />
              <textarea
                rows={2}
                value={testimonialsData.subHeading}
                onChange={(e) =>
                  setTestimonialsData({
                    ...testimonialsData,
                    subHeading: e.target.value,
                  })
                }
                className="w-full text-sm md:text-base font-medium text-[#1B003C] bg-transparent outline-none focus:border-b border-black"
                placeholder="Description..."
              />
            </div>
            {/* Student Testimonials to show on first page */}
            <div className="w-full lg:w-1/2 flex flex-col items-end">
              <div className="w-full overflow-hidden rounded-r-xl shadow-2xl bg-[#2D2E49] min-h-[260px] lg:min-h-[280px] relative">
                <div
                  className={`flex ${
                    isTransitioning
                      ? "transition-transform duration-500 ease-in-out"
                      : "transition-none"
                  }`}
                  style={{
                    transform: `translateX(-${activeReviewIdx * 100}%)`,
                  }}
                  onTransitionEnd={() => {
                    if (activeReviewIdx === testimonialsData.reviews.length) {
                      setIsTransitioning(false);
                      setActiveReviewIdx(0);
                    }
                  }}
                >
                  {testimonialsData.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="min-w-full p-6 md:p-6 text-white flex flex-col justify-between min-h-[260px]"
                    >
                      <div>
                        <span className="text-4xl font-serif text-white block mb-2">
                          “
                        </span>

                        <textarea
                          value={review.text}
                          onChange={(e) =>
                            handleDynamicChange(
                              setTestimonialsData,
                              "reviews",
                              review.id,
                              e.target.value,
                              "text",
                            )
                          }
                          className="w-full bg-transparent border border-transparent rounded hover:border-gray-200 outline-none text-sm md:text-base leading-relaxed"
                          rows={3}
                          placeholder="Review..."
                        />
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <input
                          type="text"
                          value={review.name}
                          onChange={(e) =>
                            handleDynamicChange(
                              setTestimonialsData,
                              "reviews",
                              review.id,
                              e.target.value,
                              "name",
                            )
                          }
                          className="w-full bg-transparent border-none outline-none font-bold text-lg mb-1"
                          placeholder="Name"
                        />

                        <div className="flex gap-3 items-center">
                          <textarea
                            type="text"
                            rows={isMobile ? 3 : 1}
                            value={review.uni}
                            onChange={(e) =>
                              handleDynamicChange(
                                setTestimonialsData,
                                "reviews",
                                review.id,
                                e.target.value,
                                "uni",
                              )
                            }
                            className="bg-transparent focus:border-b border-white outline-none w-1/2 text-sm text-white"
                            placeholder="University"
                          />

                          <div className="w-[1px] bg-white/20 h-4"></div>

                          <input
                            type="text"
                            value={review.country}
                            onChange={(e) =>
                              handleDynamicChange(
                                setTestimonialsData,
                                "reviews",
                                review.id,
                                e.target.value,
                                "country",
                              )
                            }
                            className="bg-transparent focus:border-b border-white outline-none w-1/2 text-sm text-white"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {testimonialsData.reviews.length > 0 && (
                    <div className="min-w-full p-6 md:p-8 text-white flex flex-col justify-between min-h-[260px]">
                      <div>
                        <span className="text-4xl font-serif text-white/20 block mb-2">
                          “
                        </span>
                        <p className="text-base md:text-lg italic leading-relaxed">
                          {testimonialsData.reviews[0].text}
                        </p>
                      </div>

                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="font-bold text-lg mb-1">
                          {testimonialsData.reviews[0].name}
                        </p>

                        <div className="flex gap-3 items-center text-sm text-gray-400">
                          <span>{testimonialsData.reviews[0].uni}</span>
                          <div className="w-[1px] bg-white/20 h-4"></div>
                          <span>{testimonialsData.reviews[0].country}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-20 md:bottom-10 right-4 flex gap-1 z-20">
                  <button
                    onClick={() => {
                      setIsTransitioning(true);
                      setActiveReviewIdx((prev) =>
                        prev === 0
                          ? testimonialsData.reviews.length - 1
                          : prev - 1,
                      );
                    }}
                    className="md:w-7 w-6 md:h-7 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-md"
                  >
                    <FaArrowLeftLong />
                  </button>

                  <button
                    onClick={() => {
                      setIsTransitioning(true);
                      setActiveReviewIdx((prev) => prev + 1);
                    }}
                    className="md:w-7 w-6 md:h-7 h-6 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-md"
                  >
                    <FaArrowRightLong />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-4 pr-4">
                {testimonialsData.reviews.length < 10 && (
                  <button
                    onClick={() =>
                      addDynamicItem(setTestimonialsData, "reviews", {
                        text: "",
                        name: "",
                        uni: "",
                        country: "",
                      })
                    }
                    className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                  >
                    <FaPlus size={14} />
                  </button>
                )}

                {testimonialsData.reviews.length > 1 && (
                  <button
                    onClick={() => {
                      removeDynamicItem(
                        setTestimonialsData,
                        "reviews",
                        testimonialsData.reviews[
                          activeReviewIdx === testimonialsData.reviews.length
                            ? 0
                            : activeReviewIdx
                        ].id,
                      );
                      setActiveReviewIdx(0);
                    }}
                    className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                  >
                    <FaMinus size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* section 7  card 2*/}
          <div className="mt-12 mb-20 p-10 border border-gray-400 rounded-sm bg-white relative">
            <div className="mb-10">
              <textarea
                rows={1}
                value={servicesData2.headerTitle}
                onChange={(e) =>
                  setServicesData2({
                    ...servicesData2,
                    headerTitle: e.target.value,
                  })
                }
                className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full bg-transparent outline-none focus:border-b border-black mb-2"
                placeholder="Title..."
              />

              {servicesData2.headerPara.map((para, index) => (
                <div key={para.id} className="relative group mb-8">
                  <div className="w-full border border-gray-300 rounded bg-white px-3 py-2 hover:border-black">
                    <textarea
                      value={para.text}
                      onChange={(e) =>
                        handleDynamicChange(
                          setServicesData2,
                          "headerPara",
                          para.id,
                          e.target.value,
                        )
                      }
                      rows={isMobile ? 8 : 2}
                      placeholder="Description..."
                      className="w-full bg-transparent outline-none text-sm text-gray-500 resize-none"
                    />
                  </div>

                  <div className="absolute -bottom-7 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        addDynamicItem(setServicesData2, "headerPara")
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaPlus size={14} />
                    </button>

                    {index !== 0 && (
                      <button
                        onClick={() =>
                          removeDynamicItem(
                            setServicesData2,
                            "headerPara",
                            para.id,
                          )
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
              {servicesData2.cards.map((card, index) => (
                <div key={card.id} className="relative group">
                  <div className="flex flex-col items-start bg-white p-2 min-h-[300px] border border-gray-300">
                    {/* <div className="w-10 h-10 bg-[#1D2145] rounded-lg flex items-center justify-center mb-4"></div> */}
                    <div>
                      {" "}
                      <IconSearch
                        value={card.icon}
                        onChange={(v) =>
                          handleDynamicChange(
                            setServicesData2,
                            "cards",
                            card.id,
                            v,
                            "icon",
                          )
                        }
                        isActive={true}
                        textColor="text-white"
                      />
                    </div>
                    <textarea
                      value={card.title}
                      onChange={(e) =>
                        handleDynamicChange(
                          setServicesData2,
                          "cards",
                          card.id,
                          e.target.value,
                          "title",
                        )
                      }
                      className="w-full text-xl font-medium text-[#1B003C] my-5 bg-transparent outline-none border-b border-transparent hover:border-gray-300 mb-3 resize-none"
                      rows={2}
                      placeholder="Heading"
                    />

                    <textarea
                      value={card.description}
                      onChange={(e) =>
                        handleDynamicChange(
                          setServicesData2,
                          "cards",
                          card.id,
                          e.target.value,
                          "description",
                        )
                      }
                      className="w-full text-sm text-gray-500 bg-transparent outline-none border border-transparent rounded hover:border-gray-200 p-1 resize-none leading-relaxed"
                      rows={8}
                      placeholder="Description..."
                    />
                  </div>

                  <div className="absolute -bottom-7 right-0 flex items-center gap-1">
                    <button
                      onClick={() =>
                        addDynamicItem(setServicesData2, "cards", {
                          title: "",
                          description: "",
                          icon: null,
                        })
                      }
                      className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                    >
                      <FaPlus size={14} />
                    </button>

                    {index !== 0 && (
                      <button
                        onClick={() =>
                          removeDynamicItem(setServicesData2, "cards", card.id)
                        }
                        className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                      >
                        <FaMinus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* section 8  faq*/}
          <div className="mt-12 mb-20 p-8 border border-gray-300 rounded-xl bg-[#F8F9FA]">
            <p className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] w-full bg-transparent outline-none text-center mb-6">
              FAQs regarding Study Abroad Consultants
            </p>

            <p className="w-full font-medium text-black bg-transparent outline-none text-center mb-8">
              Answers to the most common queries from students planning to
              studying abroad.
            </p>

            <div className="flex flex-col gap-4">
              {faqData.faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl border border-gray-300 overflow-hidden"
                >
                  {/* Question */}
                  <div className="px-5 py-4">
                    <textarea
                      value={faq.question}
                      onChange={(e) =>
                        handleDynamicChange(
                          setFaqData,
                          "faqs",
                          faq.id,
                          e.target.value,
                          "question",
                        )
                      }
                      rows={1}
                      className="w-full bg-transparent outline-none text-[#2B2A4C] font-medium resize-none"
                      placeholder="Write your question..."
                    />
                  </div>

                  <div className="px-5 pb-4 border-t border-gray-200">
                    <textarea
                      value={faq.answer}
                      onChange={(e) =>
                        handleDynamicChange(
                          setFaqData,
                          "faqs",
                          faq.id,
                          e.target.value,
                          "answer",
                        )
                      }
                      rows={3}
                      className="w-full bg-transparent outline-none text-sm text-gray-500 resize-none mt-2"
                      placeholder="Write your answer..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-1 mt-6">
              <button
                onClick={() =>
                  addDynamicItem(setFaqData, "faqs", {
                    question: "",
                    answer: "",
                  })
                }
                className="border border-indigo-900 rounded-full p-1 text-indigo-900"
              >
                <FaPlus size={14} />
              </button>

              {faqData.faqs.length > 3 && (
                <button
                  onClick={() =>
                    setFaqData((prev) => ({
                      ...prev,
                      faqs: prev.faqs.slice(0, -1),
                    }))
                  }
                  className="border border-indigo-900 rounded-full p-1 text-indigo-900"
                >
                  <FaMinus size={14} />
                </button>
              )}
            </div>
          </div>

          {/* section 9  Additional Required Data*/}
          <div className="mt-12 mb-20">
            <div className="border-t-2 border-dashed border-indigo-200 mb-16 "></div>

            <p className="text-2xl font-bold text-[#2D3142] mb-6 text-center">
              Additional Required Data
            </p>

            {/* Seo */}
            <div className="mt-8 p-8 border border-gray-300 rounded-xl">
              <p className="text-lg font-semibold text-gray-700 mb-3">SEO</p>

              <div className="space-y-3">
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    SEO Title
                  </label>
                  <textarea
                    type="text"
                    value={seoData.title}
                    onChange={(e) =>
                      setSeoData({ ...seoData, title: e.target.value })
                    }
                    placeholder="Enter seo title"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Description
                  </label>
                  <textarea
                    type="text"
                    value={seoData.description}
                    onChange={(e) =>
                      setSeoData({ ...seoData, description: e.target.value })
                    }
                    placeholder="Enter description"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Keywords
                  </label>
                  <textarea
                    rows={3}
                    value={seoData.keywords}
                    onChange={(e) =>
                      setSeoData({ ...seoData, keywords: e.target.value })
                    }
                    placeholder="Enter keywords..."
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 p-8 border border-gray-300 rounded-xl">
              <p className="text-lg font-semibold text-gray-700 mb-6">
                Office Details
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Office Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={officeData.officeName}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        officeName: e.target.value,
                      })
                    }
                    placeholder="Enter office name"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    City Page URL
                  </label>
                  <input
                    type="text"
                    value={officeData.citySlug}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        citySlug: normalizeOfficeSlug(e.target.value),
                      })
                    }
                    placeholder="for e.g. rajkot-pushkardham"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
                {/* country */}
                <div className="flex flex-col w-full">
                  <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    Country <span className="text-red-500">*</span>
                  </label>

                  {/* <select
                    value={officeData.country}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        country: e.target.value,
                        state: "",
                        city: "",
                      })
                    }
                    className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  > */}

                  <select
                    value={officeData.country}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        country: e.target.value,
                        state: "",
                        city: "",
                      })
                    }
                    className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select Country</option>

                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* state */}
                <div className="flex flex-col w-full">
                  <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    State <span className="text-red-500">*</span>
                  </label>

                  {/* <select
                    value={officeData.state}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        state: e.target.value,
                        city: "",
                      })
                    }
                    className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select State</option>

                    {officeData.country === "India" && (
                      <>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Madhya-pradesh">Madhya Pradesh</option>
                        <option value="Kerala">Kerala</option>
                      </>
                    )}

                    {officeData.country === "Nepal" && (
                      <>
                        <option value="Kathmandu">Kathmandu</option>
                      </>
                    )}
                  </select> */}
                  <select
                    value={officeData.state}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        state: e.target.value,
                        city: "",
                      })
                    }
                    className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select State</option>

                    {states.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* city */}
                <div className="flex flex-col w-full">
                  <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    City <span className="text-red-500">*</span>
                  </label>

                  {/* <select
                    value={officeData.city}
                    onChange={(e) =>
                      setOfficeData({ ...officeData, city: e.target.value })
                    }
                    className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select City</option>

                    {officeData.state === "Gujarat" && (
                      <>
                        <option value="Ahmedabad">Ahmedabad</option>
                        <option value="Rajkot">Rajkot</option>
                        <option value="Surat">Surat</option>
                        <option value="Vadodara">Vadodara</option>
                        <option value="Anand">Anand</option>
                        <option value="Gandhinagar">Gandhinagar</option>
                        <option value="Morbi">Morbi</option>
                        <option value="Jamnagar">Jamnagar</option>
                      </>
                    )}
                    {officeData.state === "Chandigarh" && (
                      <>
                        <option value="Chandigarh">Chandigarh</option>
                      </>
                    )}
                    {officeData.state === "Delhi" && (
                      <>
                        <option value="Delhi">Delhi</option>
                      </>
                    )}
                    {officeData.state === "Rajasthan" && (
                      <>
                        <option value="Jaipur">Jaipur</option>
                      </>
                    )}
                    {officeData.state === "Madhya-pradesh" && (
                      <>
                        <option value="Indore">Indore</option>
                      </>
                    )}

                    {officeData.state === "Maharashtra" && (
                      <>
                        <option value="Pune">Pune</option>
                      </>
                    )}
                    {officeData.state === "Kerala" && (
                      <>
                        <option value="Kochi">Kochi</option>
                      </>
                    )}
                    {officeData.state === "Nepal" && (
                      <>
                        <option value="Kathmandu">Kathmandu</option>
                      </>
                    )}
                  </select> */}
                  <select
                    value={officeData.city}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        city: e.target.value,
                      })
                    }
                    className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full focus:outline-none focus:ring-0 focus:border-black focus:shadow-md"
                  >
                    <option value="">Select City</option>

                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col w-full mb-4">
                <label
                  for="input"
                  className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                >
                  Address
                </label>
                <textarea
                  rows={2}
                  value={officeData.address}
                  onChange={(e) =>
                    setOfficeData({ ...officeData, address: e.target.value })
                  }
                  placeholder="Enter address"
                  className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Phone
                  </label>
                  <input
                    type="text"
                    value={officeData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9, ]/g, "");
                      setOfficeData((prev) => ({
                        ...prev,
                        phone: value,
                      }));
                    }}
                    placeholder="Enter Phone No."
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={officeData.email}
                    onChange={(e) =>
                      setOfficeData({ ...officeData, email: e.target.value })
                    }
                    placeholder="Enter email"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={officeData.longitude}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        longitude: e.target.value,
                      })
                    }
                    placeholder="Enter longitude"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={officeData.latitude}
                    onChange={(e) =>
                      setOfficeData({ ...officeData, latitude: e.target.value })
                    }
                    placeholder="Enter latitude"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Map Link
                  </label>
                  <input
                    type="text"
                    value={officeData.mapLink}
                    onChange={(e) =>
                      setOfficeData({ ...officeData, mapLink: e.target.value })
                    }
                    placeholder="Enter map link"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>

                <div className="flex flex-col w-full">
                  <label
                    for="input"
                    className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                  >
                    Google Map Embed
                  </label>
                  <input
                    type="text"
                    value={officeData.googleEmbed}
                    onChange={(e) =>
                      setOfficeData({
                        ...officeData,
                        googleEmbed: e.target.value,
                      })
                    }
                    placeholder="Enter google map embed"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
              </div>

              <div className="flex flex-col w-full">
                <label
                  for="input"
                  className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                >
                  Office Page URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={officeData.pageUrl}
                  onChange={(e) =>
                    setOfficeData({
                      ...officeData,
                      pageUrl: normalizeOfficeSlug(e.target.value),
                    })
                  }
                  placeholder="for e.g. study-abroad-consultants-in-rajkot-pushkardham"
                  className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                />
              </div>
            </div>

            {/* exam page */}
            <p className="text-2xl font-bold text-[#2D3142] mb-6 mt-20 text-center">
              Additional Details For Related Exam Page
            </p>

            <div className="mt-8 p-8 border border-gray-300 rounded-xl">
              {/* Trainers */}
              <p className="font-medium text-gray-600 mb-4">Trainers</p>

              {examData.trainers.map((trainer) => (
                <div key={trainer.id} className="border p-4 rounded mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col w-full mb-0">
                        <label
                          for="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          placeholder="Enter name"
                          value={trainer.name}
                          onChange={(e) =>
                            handleDynamicChange(
                              setExamData,
                              "trainers",
                              trainer.id,
                              e.target.value,
                              "name",
                            )
                          }
                          className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>

                      <div className="flex flex-col w-full mb-0">
                        <label
                          for="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                        >
                          Qualification
                        </label>
                        <input
                          type="text"
                          placeholder="Enter qualification"
                          value={trainer.qualification}
                          onChange={(e) =>
                            handleDynamicChange(
                              setExamData,
                              "trainers",
                              trainer.id,
                              e.target.value,
                              "qualification",
                            )
                          }
                          className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>
                      <div className="flex flex-col w-full mb-4">
                        <label
                          for="input"
                          className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                        >
                          Experience
                        </label>
                        <input
                          type="text"
                          placeholder="Enter experience"
                          value={trainer.experience}
                          onChange={(e) =>
                            handleDynamicChange(
                              setExamData,
                              "trainers",
                              trainer.id,
                              e.target.value,
                              "experience",
                            )
                          }
                          className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center lg:items-end">
                      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center ml-10">
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden lg:mr-0 mr-10">
                          {trainer.img ? (
                            <img
                              src={trainer.img}
                              alt="trainer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-400 text-center">
                              Upload
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];

                              if (file) {
                                const preview = URL.createObjectURL(file);

                                // preview
                                handleDynamicChange(
                                  setExamData,
                                  "trainers",
                                  trainer.id,
                                  preview,
                                  "img",
                                );

                                // actual file (THIS is what backend needs)
                                handleDynamicChange(
                                  setExamData,
                                  "trainers",
                                  trainer.id,
                                  file,
                                  "file",
                                );
                              }
                            }}
                            className="text-xs text-gray-500 
                              file:mr-3 file:py-2 file:px-3 
                              file:rounded-md file:border-0 
                              file:text-xs file:font-semibold 
                              file:bg-blue-50 file:text-indigo-900 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                      {trainer.specialization.map((spec, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="flex flex-col w-full mb-4">
                            <label
                              for="input"
                              className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                            >
                              Specialization
                            </label>
                            <input
                              type="text"
                              placeholder="Max 3 words"
                              value={spec}
                              onChange={(e) =>
                                handleSpecializationChange(
                                  trainer.id,
                                  index,
                                  e.target.value,
                                )
                              }
                              className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                            />
                          </div>

                          {index === trainer.specialization.length - 1 && (
                            <div className="flex gap-1">
                              {trainer.specialization.length < 10 && (
                                <button
                                  onClick={() => addSpecialization(trainer.id)}
                                  className="border border-indigo-900 text-indigo-900 rounded-full p-1"
                                >
                                  <FaPlus size={12} />
                                </button>
                              )}

                              {trainer.specialization.length > 1 && (
                                <button
                                  onClick={() =>
                                    removeSpecialization(trainer.id, index)
                                  }
                                  className="border border-indigo-900 text-indigo-900 rounded-full p-1"
                                >
                                  <FaMinus size={12} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1 mt-2">
                    <button
                      type="button"
                      onClick={addTrainer}
                      className="border border-indigo-900 text-indigo-900 rounded-full p-1"
                    >
                      <FaPlus size={12} />
                    </button>

                    {examData.trainers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTrainer(trainer.id)}
                        className="border border-indigo-900 text-indigo-900 rounded-full p-1"
                      >
                        <FaMinus size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Student Testimonials to show on internal page/ exam */}
              <p className="font-medium text-gray-600 mt-6 mb-4">
                Student Testimonials
              </p>
              {examData.testimonials.map((item) => (
                <div key={item.id} className="border p-4 rounded mb-4">
                  <div className="flex flex-col w-full mb-4">
                    <label
                      for="input"
                      className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                    >
                      Review
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter review"
                      value={item.review}
                      onChange={(e) =>
                        handleDynamicChange(
                          setExamData,
                          "testimonials",
                          item.id,
                          e.target.value,
                          "review",
                        )
                      }
                      className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter name"
                        value={item.name}
                        onChange={(e) =>
                          handleDynamicChange(
                            setExamData,
                            "testimonials",
                            item.id,
                            e.target.value,
                            "name",
                          )
                        }
                        className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>

                    <div className="flex flex-col w-full">
                      <label
                        for="input"
                        className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit"
                      >
                        Band Score
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Band Score"
                        value={item.bandScore}
                        onChange={(e) =>
                          handleDynamicChange(
                            setExamData,
                            "testimonials",
                            item.id,
                            e.target.value,
                            "bandScore",
                          )
                        }
                        className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={addExamTestimonial}
                      className="border border-indigo-900 text-indigo-900 rounded-full p-1"
                    >
                      <FaPlus size={12} />
                    </button>

                    {examData.testimonials.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExamTestimonial(item.id)}
                        className="border border-indigo-900 text-indigo-900 rounded-full p-1"
                      >
                        <FaMinus size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* button */}
          <div className="grid grid-cols-2 max-w-[310px] gap-3 mt-5 w-80 justify-self-center">
            <button className="px-6 z-30 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
              Cancel
            </button>

            <button
              className="px-6 z-30 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OfficePageElementor;

// // Table Reference

// import React, { useState, useEffect } from "react";
// // import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";
// // import "../Dashboard/Dashboard.css";

// const OfficePageElementor = () => {
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

//   return (
//     <div className="flex bg-[#F8F9FA]">
//       {/* <Menubar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         isMobile={isMobile}
//       /> */}

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
//               Office Page Elementor
//             </p>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="mt-5">
//           <div></div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default OfficePageElementor;
