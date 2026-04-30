import React, { useState, useEffect, useMemo } from "react";
import { Outlet, useParams } from "react-router-dom";
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

const renderHighlightedBannerTitle = (title, office) => {
  if (!title) return null;

  const area = office?.area?.trim();
  const city = office?.city?.trim();

  let textToHighlight = "";

  // Priority: full area first
  if (area && title.toLowerCase().includes(area.toLowerCase())) {
    textToHighlight = area;
  } else if (city && title.toLowerCase().includes(city.toLowerCase())) {
    textToHighlight = city;
  }

  if (!textToHighlight) return title;

  const regex = new RegExp(`(${escapeRegex(textToHighlight)})`, "gi");

  return title.split(regex).map((part, index) =>
    part.toLowerCase() === textToHighlight.toLowerCase() ? (
      <span key={index} className="text-red-500">
        {part}
      </span>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    ),
  );
};

const EditOfficePageElementor = () => {
  // Get officeId from URL params like /edit-office/:officeId
  // OR fallback to localStorage
  const { officeId: paramOfficeId } = useParams();
  const officeId = paramOfficeId || localStorage.getItem("currentOfficeId");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
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
        "https://cdn.britannica.com/78/6078-050-18D5DEFE/Flag-Australia.jpg",
      Canada:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Flag_of_Canada_%28Pantone%29.svg/1200px-Flag_of_Canada_%28Pantone%29.svg.png",
      UK: "https://cdn.britannica.com/25/4825-050-977D8C5E/Flag-United-Kingdom.jpg",
      USA: "https://upload.wikimedia.org/wikipedia/commons/9/96/Flag_of_the_United_States_%28DDD-F-416E_specifications%29.svg",
      Germany:
        "https://img.freepik.com/free-vector/illustration-german-flag_53876-27101.jpg?semt=ais_hybrid&w=740&q=80",
      Dubai:
        "https://upload.wikimedia.org/wikipedia/commons/c/cb/Flag_of_the_United_Arab_Emirates.svg",
      Europe:
        "https://img.freepik.com/free-vector/illustration-european-union-flag_53876-27018.jpg?semt=ais_hybrid&w=740&q=80",
      Ireland:
        "https://upload.wikimedia.org/wikipedia/commons/4/45/Flag_of_Ireland.svg",
      Singapore:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Singapore.svg/1200px-Flag_of_Singapore.svg.png",
      "New Zealand":
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Flag_of_New_Zealand.svg/1200px-Flag_of_New_Zealand.svg.png",
    }),
    [],
  );

  // ==================== ALL STATES (same as insert) ====================
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
        name: "",
        qualification: "",
        experience: "",
        specialization: [""],
      },
    ],
    testimonials: [{ id: 1, review: "", name: "", bandScore: "" }],
  });

  // ==================== FETCH EXISTING DATA ON MOUNT ====================
  useEffect(() => {
    if (!officeId) {
      alert("No office ID found. Please go back and select an office to edit.");
      setLoadingData(false);
      return;
    }
    fetchOfficeData();
  }, [officeId]);

  const fetchOfficeData = async () => {
    try {
      setLoadingData(true);
      const response = await fetch(
        `https://transglobeedu.com/web-backend/office-page/${officeId}`,
      );
      const data = await response.json();

      if (!data.success) {
        alert("Failed to load office data: " + data.message);
        return;
      }

      const d = data.data;

      // Populate all states with fetched data
      setBgColor(d.bgColor || "#FFF9C4");
      setTitle(d.title || "");

      // Sections - ensure each has an id
      const fetchedSections =
        Array.isArray(d.sections) && d.sections.length > 0
          ? d.sections.map((s, i) => ({ id: s.id || i + 1, text: s.text || s }))
          : [{ id: 1, text: "" }];
      setSections(fetchedSections);

      // Destinations
      if (d.destinations) {
        setDestinations({
          headerTitle: d.destinations.headerTitle || "",
          headerPara: (d.destinations.headerPara || [{ text: "" }]).map(
            (p, i) => ({
              id: p.id || i + 1,
              text: p.text || "",
            }),
          ),
          cards: (
            d.destinations.cards || [{ country: "", description: "", flag: "" }]
          ).map((c, i) => ({
            id: c.id || i + 1,
            country: c.country || "",
            description: c.description || "",
            flag: c.flag || "",
          })),
        });
      }

      // Exams
      if (d.examsData) {
        setExamsData({
          title: d.examsData.title || "",
          subtitle: (d.examsData.subtitle || [{ text: "" }]).map((s, i) => ({
            id: s.id || i + 1,
            text: s.text || "",
          })),
          image: null,
          exams: (d.examsData.exams || [{ name: "" }]).map((e, i) => ({
            id: e.id || i + 1,
            name: e.name || "",
          })),
        });
      }

      // Services
      if (d.servicesData) {
        setServicesData({
          headerTitle: d.servicesData.headerTitle || "",
          headerPara: (d.servicesData.headerPara || [{ text: "" }]).map(
            (p, i) => ({
              id: p.id || i + 1,
              text: p.text || "",
            }),
          ),
          cards: (d.servicesData.cards || [{ title: "", description: "" }]).map(
            (c, i) => ({
              id: c.id || i + 1,
              title: c.title || "",
              description: c.description || "",
              icon: c.icon || "",
            }),
          ),
        });
      }

      // Testimonials
      if (d.testimonialsData) {
        setTestimonialsData({
          title: d.testimonialsData.title || "",
          subHeading: d.testimonialsData.subHeading || "",
          reviews: (
            d.testimonialsData.reviews || [
              { text: "", name: "", uni: "", country: "" },
            ]
          ).map((r, i) => ({
            id: r.id || i + 1,
            text: r.text || "",
            name: r.name || "",
            uni: r.uni || "",
            country: r.country || "",
          })),
        });
      }

      // Services 2
      if (d.servicesData2) {
        setServicesData2({
          headerTitle: d.servicesData2.headerTitle || "",
          headerPara: (d.servicesData2.headerPara || [{ text: "" }]).map(
            (p, i) => ({
              id: p.id || i + 1,
              text: p.text || "",
            }),
          ),
          cards: (
            d.servicesData2.cards || [{ title: "", description: "" }]
          ).map((c, i) => ({
            id: c.id || i + 1,
            title: c.title || "",
            description: c.description || "",
            icon: c.icon || "",
          })),
        });
      }

      // FAQ
      if (d.faqData) {
        setFaqData({
          faqs: (d.faqData.faqs || []).map((f, i) => ({
            id: f.id || i + 1,
            question: f.question || "",
            answer: f.answer || "",
          })),
        });
      }

      // SEO
      if (d.seoData) {
        setSeoData({
          title: d.seoData.title || "",
          description: d.seoData.description || "",
          keywords: d.seoData.keywords || "",
        });
      }

      // Office basic info
      setOfficeData({
        officeName: d.officeName || "",
        citySlug: d.citySlug || "",
        country: d.country || "",
        state: d.state || "",
        city: d.city || "",
        address: d.address || "",
        phone: d.phone || "",
        email: d.email || "",
        longitude: d.longitude || "",
        latitude: d.latitude || "",
        mapLink: d.mapLink || "",
        googleEmbed: d.googleEmbed || "",
        pageUrl: d.pageUrl || "",
      });

      // Exam data (trainers + testimonials)
      if (d.examData) {
        setExamData({
          trainers:
            (d.examData.trainers || []).length > 0
              ? d.examData.trainers.map((t, i) => ({
                  id: t.id || i + 1,
                  img: t.img || "",
                  name: t.name || "",
                  qualification: t.qualification || "",
                  experience: t.experience || "",
                  specialization:
                    t.specialization?.length > 0 ? t.specialization : [""],
                }))
              : [
                  {
                    id: 1,
                    img: "",
                    name: "",
                    qualification: "",
                    experience: "",
                    specialization: [""],
                  },
                ],
          testimonials:
            (d.examData.testimonials || []).length > 0
              ? d.examData.testimonials.map((t, i) => ({
                  id: t.id || i + 1,
                  review: t.review || "",
                  name: t.name || "",
                  bandScore: t.bandScore || "",
                }))
              : [{ id: 1, review: "", name: "", bandScore: "" }],
        });
      }
    } catch (error) {
      console.error("Error fetching office data:", error);
      alert("Error loading office data: " + error.message);
    } finally {
      setLoadingData(false);
    }
  };
  const selectedCountry = countries.find((c) => c.name === officeData.country);

  const states = selectedCountry?.states || [];

  const selectedState = states.find((s) => s.name === officeData.state);

  const cities = selectedState?.cities || [];
  // ==================== HELPERS (same as insert) ====================
  const createUniqueId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID)
      return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  };

  const cloneValue = (value) => {
    if (Array.isArray(value)) return value.map(cloneValue);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, cloneValue(v)]),
      );
    return value;
  };

  const createTrainer = () => ({
    id: createUniqueId(),
    img: "",
    file: null,
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

  const addTrainer = () =>
    setExamData((prev) => ({
      ...prev,
      trainers: [...prev.trainers, createTrainer()],
    }));
  const removeTrainer = (trainerId) =>
    setExamData((prev) => {
      if (prev.trainers.length === 1) return prev;
      return {
        ...prev,
        trainers: prev.trainers.filter((t) => t.id !== trainerId),
      };
    });
  const addExamTestimonial = () =>
    setExamData((prev) => ({
      ...prev,
      testimonials: [...prev.testimonials, createExamTestimonial()],
    }));
  const removeExamTestimonial = (id) =>
    setExamData((prev) => {
      if (prev.testimonials.length === 1) return prev;
      return {
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      };
    });
  const addSpecialization = (trainerId) =>
    setExamData((prev) => ({
      ...prev,
      trainers: prev.trainers.map((t) =>
        t.id === trainerId && t.specialization.length < 10
          ? { ...t, specialization: [...t.specialization, ""] }
          : t,
      ),
    }));
  const removeSpecialization = (trainerId, index) =>
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

  // ==================== SAVE (PUT instead of POST) ====================
  const handleSave = async () => {
    if (!officeId) {
      alert("No office ID found.");
      return;
    }
    setSubmitting(true);
    try {
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
        bgColor,
        title,
        highlightText: officeData.area?.trim() || officeData.city?.trim(),
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
        examsData: {
          title: examsData.title,
          subtitle: examsData.subtitle.map((s) => ({ text: s.text })),
          exams: examsData.exams.map((e) => ({ name: e.name })),
        },
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
          reviews: testimonialsData.reviews.map((r) => ({
            text: r.text,
            name: r.name,
            uni: r.uni,
            country: r.country,
          })),
        },
        faqData: {
          faqs: faqData.faqs.map((faq) => ({
            question: faq.question,
            answer: faq.answer,
          })),
        },
        seoData: {
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords,
        },
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
          testimonials: examData.testimonials.map((t) => ({
            review: t.review,
            name: t.name,
            bandScore: t.bandScore,
          })),
        },
      };
      // ==================== FORM DATA ====================
      const formData = new FormData();

      // JSON payload
      formData.append("data", JSON.stringify(payload));

      // ==================== FILES ====================
      examData.trainers.forEach((trainer, i) => {
        if (trainer.file) {
          formData.append(`trainer_img_${i}`, trainer.file);
        }
      });

      // ==================== DEBUG ====================
      console.log("===== FORM DATA =====");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // ==================== API CALL ====================
      const response = await fetch(
        `https://transglobeedu.com/web-backend/office-page/${officeId}`,
        {
          method: "PUT",
          body: formData, // ❗ NO headers
        },
      );

      const data = await response.json();

      if (data.success) {
        alert("Office page updated successfully!");
      } else {
        alert(data.message || "Failed to update office page");
        console.error("Server errors:", data.errors);
      }
    } catch (error) {
      console.error("Error updating office page:", error);
      alert("Error updating office page: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== LOADING STATE ====================
  if (loadingData) {
    return (
      <div className="flex bg-[#F8F9FA] min-h-screen">
        <Menubar
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          isMobile={isMobile}
        />
        <main
          className={`p-5 lg:p-6 w-full flex items-center justify-center ${isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"}`}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading office data...</p>
          </div>
        </main>
      </div>
    );
  }

  // ==================== JSX (100% same as OfficePageElementor, only header text + button text changed) ====================
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

        <div className="flex justify-between gap-5 items-start lg:items-center mb-8">
          <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
            Edit Office Page{" "}
            {officeId && (
              <span className="text-indigo-600 text-base font-normal ml-2">
                (ID: {officeId})
              </span>
            )}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Section 1 - banner */}
          <div
            className="relative min-h-[300px] md:min-h-[350px] lg:min-h-[400px] rounded-xl p-5 md:p-12 lg:p-20 flex flex-col justify-center transition-all duration-300 shadow-sm overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            {title && !isBannerTitleEditing && (
              <div
                className={`${bannerTitleFieldClassName} ${commonPosition} pointer-events-none select-none whitespace-pre-wrap break-words`}
                style={{ lineHeight: 1.3 }}
              >
                {renderHighlightedBannerTitle(title, officeData)}
              </div>
            )}
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setIsBannerTitleEditing(true)}
              onBlur={() => setIsBannerTitleEditing(false)}
              rows={isMobile ? 4 : 3}
              className={`${bannerTitleFieldClassName} ${commonPosition} resize-none border border-transparent focus:border-black ${title && !isBannerTitleEditing ? "text-transparent caret-transparent" : "caret-[#2B2A4C]"}`}
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

          {/* Section 2 - para */}
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

          {/* Section 3 - flag */}
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
                    <div className="w-20 h-12 border-2 border-dashed border-gray-300 flex items-center justify-center mb-4 overflow-hidden cursor-pointer">
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
                    <div className="flex gap-2 items-center mt-2">
                      <select
                        value={card.country}
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

          {/* Section 4 - exam */}
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
                    <div className="flex items-center bg-[#1D2145] text-white rounded-lg px-4 py-2 border border-transparent hover:border-white/50 transition-all">
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

          {/* Section 5 - card 1 */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {servicesData.cards.map((card, index) => (
                <div key={card.id} className="relative group">
                  <div className="flex flex-col items-start bg-white p-2 min-h-[300px] border border-gray-300 ">
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

          {/* Section 6 - carousel */}
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
            <div className="w-full lg:w-1/2 flex flex-col items-end">
              <div className="w-full overflow-hidden rounded-r-xl shadow-2xl bg-[#2D2E49] min-h-[260px] lg:min-h-[280px] relative">
                <div
                  className={`flex ${isTransitioning ? "transition-transform duration-500 ease-in-out" : "transition-none"}`}
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
                          "
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
                          "
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

          {/* Section 7 - card 2 */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

          {/* Section 8 - FAQ */}
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

          {/* Section 9 - Additional Required Data */}
          <div className="mt-12 mb-20">
            <div className="border-t-2 border-dashed border-indigo-200 mb-16"></div>
            <p className="text-2xl font-bold text-[#2D3142] mb-6 text-center">
              Additional Required Data
            </p>

            {/* SEO */}
            <div className="mt-8 p-8 border border-gray-300 rounded-xl">
              <p className="text-lg font-semibold text-gray-700 mb-6">SEO</p>
              <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex flex-col w-full">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    SEO Title
                  </label>
                  <input
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
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    Description
                  </label>
                  <input
                    type="text"
                    value={seoData.description}
                    onChange={(e) =>
                      setSeoData({ ...seoData, description: e.target.value })
                    }
                    placeholder="Enter description"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
              </div>
              <div className="flex flex-col w-full">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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

            {/* Office Details */}
            <div className="mt-8 p-8 border border-gray-300 rounded-xl">
              <p className="text-lg font-semibold text-gray-700 mb-6">
                Office Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex flex-col w-full">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    Office Name
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
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                    placeholder="e.g. surat-katargam"
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>

                {/* country */}
                <div className="flex flex-col w-full">
                  <label className="text-gray-400 text-xs font-semibold relative z-10 top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    Country
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
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="Nepal">Nepal</option>
                  </select> */}
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
                    State
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
                      <option value="Kathmandu">Kathmandu</option>
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
                    City
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
                      <option value="Chandigarh">Chandigarh</option>
                    )}
                    {officeData.state === "Delhi" && (
                      <option value="Delhi">Delhi</option>
                    )}
                    {officeData.state === "Rajasthan" && (
                      <option value="Jaipur">Jaipur</option>
                    )}
                    {officeData.state === "Madhya-pradesh" && (
                      <option value="Indore">Indore</option>
                    )}
                    {officeData.state === "Maharashtra" && (
                      <option value="Pune">Pune</option>
                    )}
                    {officeData.state === "Kerala" && (
                      <option value="Kochi">Kochi</option>
                    )}
                    {officeData.state === "Nepal" && (
                      <option value="Kathmandu">Kathmandu</option>
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
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                <div className="flex flex-col w-full mb-4">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={officeData.phone}
                    maxLength={10}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setOfficeData({ ...officeData, phone: value });
                    }}
                    placeholder="Enter Phone No."
                    className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                  />
                </div>
                <div className="flex flex-col w-full mb-4">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                <div className="flex flex-col w-full mb-4">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                <div className="flex flex-col w-full mb-4">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                <div className="flex flex-col w-full mb-4">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                <div className="flex flex-col w-full mb-4">
                  <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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

              <div className="flex flex-col w-full mb-4">
                <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
                  Office Page URL
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
                  placeholder="e.g. study-abroad-consultants-in-surat-katargam"
                  className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
                />
              </div>
            </div>

            {/* Exam Page Data */}
            <p className="text-2xl font-bold text-[#2D3142] mb-6 mt-20 text-center">
              Additional Details For Related Exam Page
            </p>
            <div className="mt-8 p-8 border border-gray-300 rounded-xl">
              <p className="font-medium text-gray-600 mb-4">Trainers</p>
              {examData.trainers.map((trainer) => (
                <div key={trainer.id} className="border p-4 rounded mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col w-full mb-0">
                        <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                        <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                        <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                              if (!file) return;

                              const imageUrl = URL.createObjectURL(file);

                              setExamData((prev) => ({
                                ...prev,
                                trainers: prev.trainers.map((t) =>
                                  t.id === trainer.id
                                    ? {
                                        ...t,
                                        img: imageUrl, // preview
                                        file: file, // ✅ actual file (THIS WAS MISSING)
                                      }
                                    : t,
                                ),
                              }));
                            }}
                            className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-indigo-900 cursor-pointer"
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
                            <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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

              <p className="font-medium text-gray-600 mt-6 mb-4">
                Student Testimonials
              </p>
              {examData.testimonials.map((item) => (
                <div key={item.id} className="border p-4 rounded mb-4">
                  <div className="flex flex-col w-full mb-4">
                    <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                    <div className="flex flex-col w-full mb-4">
                      <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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
                    <div className="flex flex-col w-full mb-4">
                      <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
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

          {/* Buttons */}
          <div className="grid grid-cols-2 max-w-[310px] gap-3 mt-5 w-80 justify-self-center">
            <button className="px-6 z-30 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 transition-all duration-700 text-sm">
              Cancel
            </button>
            <button
              className="px-6 z-30 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 transition-all duration-700 text-sm disabled:opacity-60"
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditOfficePageElementor;
