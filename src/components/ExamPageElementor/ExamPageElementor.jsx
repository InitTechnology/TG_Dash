import Menubar from "../Menubar/Menubar";
import React, { useState, useEffect, useRef } from "react";
// import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
// import "../Dashboard/Dashboard.css";
import { FaMinus, FaPlus } from "react-icons/fa6";
import IconSearch from "./IconSearch";
import { toast } from "react-toastify";
import { FaExclamationTriangle } from "react-icons/fa";

const EXAM_KEYS = ["ielts", "pte", "toefl", "gre", "gmat", "sat", "german"];
const uid = () => Math.random().toString(36).substr(2, 9);
const API_BASE = "https://transglobeedu.com/web-backend";

const createTextItem = (value = "") => ({ id: uid(), value });
const getTextValue = (item) =>
  typeof item === "string" ? item : item?.value || "";
const ensureTextItem = (item) =>
  typeof item === "string" ? createTextItem(item) : item;
const normalizeTextItems = (items = [""]) =>
  items.length > 0 ? items.map(ensureTextItem) : [createTextItem("")];
const stripTextItems = (items = []) => items.map(getTextValue);
const insertTextItemAfter = (items, index) => {
  const nextItems = [...items];
  nextItems.splice(index + 1, 0, createTextItem(""));
  return nextItems;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const DRAG_SCROLL_EDGE_OFFSET = 180;
const getOfficeItemsFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.offices)) return response.data.offices;
  if (Array.isArray(response?.offices)) return response.offices;
  return [];
};

const normalizeOffice = (office) => {
  if (typeof office === "string") {
    const trimmedOffice = office.trim();

    if (!trimmedOffice) {
      return null;
    }

    return {
      id: trimmedOffice,
      name: trimmedOffice,
      citySlug: trimmedOffice,
    };
  }

  const id =
    office?._id ||
    office?.id ||
    office?.officeId ||
    office?.value ||
    office?.slug ||
    office?.citSlug ||
    office?.officeName ||
    office?.office ||
    office?.name ||
    "";

  const officeName =
    office?.officeName ||
    office?.office ||
    office?.name ||
    office?.title ||
    office?.city ||
    office?.label ||
    office?.citSlug ||
    office?.slug ||
    "";

  const citySlug =
    office?.citySlug ||
    office?.citSlug ||
    office?.slug ||
    office?.link ||
    officeName ||
    "";

  if (!id || !officeName) {
    return null;
  }

  return {
    id: String(id),
    name: String(officeName),
    citySlug: String(citySlug),
  };
};

const getOfficeNameById = (officeId, offices = []) =>
  offices.find((office) => office.id === String(officeId))?.name || "";

const getOfficeIdByLegacyValue = (officeValue, offices = []) => {
  if (!officeValue) return "";

  const normalizedValue = String(officeValue);
  const directMatch = offices.find((office) => office.id === normalizedValue);

  if (directMatch) {
    return directMatch.id;
  }

  const nameMatch = offices.find(
    (office) => office.name.toLowerCase() === normalizedValue.toLowerCase(),
  );

  if (nameMatch) {
    return nameMatch.id;
  }

  const citySlugMatch = offices.find(
    (office) => office.citySlug.toLowerCase() === normalizedValue.toLowerCase(),
  );

  return citySlugMatch?.id || "";
};

const normalizeExamSlug = (value = "") =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/g, "");

// const DRAG_SCROLL_MAX_SPEED = 160;
const toTitleCase = (value = "") =>
  value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const renderHighlightedBannerTitle = (title, selectedExam, selectedOffice) => {
  if (!title) return null;

  const normalizedExam = selectedExam?.toUpperCase() || "";
  const normalizedOffice = toTitleCase(selectedOffice);
  const highlightTerms = [normalizedExam, normalizedOffice]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (highlightTerms.length === 0) {
    return title;
  }

  const highlightRegex = new RegExp(
    `(${highlightTerms.map(escapeRegex).join("|")})`,
    "gi",
  );

  return title.split(highlightRegex).map((part, index) => {
    const matchedTerm = highlightTerms.find(
      (term) => term.toLowerCase() === part.toLowerCase(),
    );

    return matchedTerm ? (
      <span key={`${part}-${index}`} className="font-normal text-red-700">
        {matchedTerm}
      </span>
    ) : (
      <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
    );
  });
};

const createSection = (type) => {
  const base = { id: uid(), type, isInitial: true };
  const card = () => ({
    id: uid(),
    icon: "",
    heading: "",
    descriptions: [createTextItem("")],
  });
  const point6 = () => ({
    id: uid(),
    point: "",
    descriptions: [createTextItem("")],
    link: "",
  });
  switch (type) {
    case "design1":
      return { ...base, title: "", paras: [createTextItem("")] };
    case "design2":
      return { ...base, title: "", points: [createTextItem("")] };
    case "design3":
      return {
        ...base,
        title: "",
        paras: [createTextItem("")],
        cards: [card()],
      };
    case "design4":
      return {
        ...base,
        title: "",
        paras: [createTextItem("")],
        cards: [card()],
      };
    case "design5":
      return {
        ...base,
        bgImage: "",
        title: "",
        paras: [createTextItem("")],
        cards: [card()],
      };
    case "design6":
      return {
        ...base,
        title: "",
        para: [createTextItem("")],
        points: [point6()],
      };
    case "design7":
      return {
        ...base,
        title: "Frequently Asked Questions",
        highlightText: "Jaipur",
        subtitle:
          "Answers to the most common queries from students planning to studying abroad.",
        faqs: [
          {
            id: uid(),
            question: "",
            answer: "",
          },
          {
            id: uid(),
            question: "",
            answer: "",
          },
          {
            id: uid(),
            question: "",
            answer: "",
          },
        ],
      };
    case "design8":
      return {
        ...base,
        seoTitle: "",
        description: "",
        examSlug: "",
        office: "",
        descriptions: [createTextItem("")],
        keywords: [createTextItem("")],
      };
    default:
      return base;
  }
};

const cleanSection = (
  { id: _id, isInitial: _isInitial, ...rest },
  sectionIndex,
) => {
  const s = { ...rest };
  if (typeof sectionIndex === "number") {
    s.position = sectionIndex;
  }
  if (s.paras) s.paras = stripTextItems(s.paras);
  if (s.para) s.para = stripTextItems(s.para);
  if (s.descriptions) s.descriptions = stripTextItems(s.descriptions);
  if (s.keywords) s.keywords = stripTextItems(s.keywords);
  if (s.cards) {
    s.cards = s.cards.map(
      ({ id: _c, description, descriptions, ...c }, cardIndex) => ({
        ...c,
        position: cardIndex,
        descriptions:
          descriptions && descriptions.length > 0
            ? stripTextItems(descriptions)
            : [description || ""],
      }),
    );
  }
  if (s.points && s.points.length > 0) {
    if (typeof s.points[0] === "object" && "point" in s.points[0]) {
      s.points = s.points.map(({ id: _p, descriptions, ...p }, pointIndex) => ({
        ...p,
        position: pointIndex,
        descriptions: stripTextItems(descriptions),
      }));
    } else {
      s.points = stripTextItems(s.points);
    }
  }
  if (s.faqs) {
    s.faqs = s.faqs.map(({ id: _f, ...f }, faqIndex) => ({
      ...f,
      position: faqIndex,
    }));
  }
  return s;
};

const cloneSectionWithIds = (section) => {
  const cleanedSection = cleanSection(section);
  const clonedSection = {
    ...cleanedSection,
    id: uid(),
    isInitial: false,
  };
  if (clonedSection.paras) {
    clonedSection.paras = normalizeTextItems(clonedSection.paras);
  }
  if (clonedSection.para) {
    clonedSection.para = normalizeTextItems(clonedSection.para);
  }
  if (clonedSection.descriptions) {
    clonedSection.descriptions = normalizeTextItems(clonedSection.descriptions);
  }
  if (clonedSection.keywords) {
    clonedSection.keywords = normalizeTextItems(clonedSection.keywords);
  }
  if (clonedSection.cards) {
    clonedSection.cards = clonedSection.cards.map((card) => ({
      ...card,
      id: uid(),
      descriptions: normalizeTextItems(card.descriptions),
    }));
  }
  if (clonedSection.points && clonedSection.points.length > 0) {
    if (
      typeof clonedSection.points[0] === "object" &&
      "point" in clonedSection.points[0]
    ) {
      clonedSection.points = clonedSection.points.map((point) => ({
        ...point,
        id: uid(),
        descriptions: normalizeTextItems(point.descriptions),
      }));
    } else {
      clonedSection.points = normalizeTextItems(clonedSection.points);
    }
  }
  if (clonedSection.faqs) {
    clonedSection.faqs = clonedSection.faqs.map((faq) => ({
      ...faq,
      id: uid(),
    }));
  }
  return clonedSection;
};

const Inp = ({
  value,
  onChange,
  placeholder,
  className = "",
  textColor = "text-black",
  isActive = true,
}) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`
      w-full 
      appearance-none
      rounded-none
      border-0 border-b
      shadow-none
      px-1 py-2 
      placeholder-gray-400 
      ${textColor}
      transition-colors duration-200
      focus:outline-none 
      focus:ring-0
      focus:shadow-none
      ${isActive ? "border-b-gray-300" : "border-b-transparent"}
      bg-transparent
      ${className}
      text-sm
    `}
  />
);

const TextArea = ({
  value,
  onChange,
  placeholder,
  className = "",
  textColor = "text-black",
  rows = 3,
  isActive = true,
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className={`
      w-full resize-none
      appearance-none
      rounded-none
      border-0 border-b
      shadow-none
      px-1 py-2 text-sm
      placeholder-gray-400
      ${textColor}
      transition-colors duration-200
      focus:outline-none
      focus:ring-0
      focus:shadow-none
      ${isActive ? "border-b-gray-300" : "border-b-transparent"}
      bg-transparent
      ${className}
    `}
  />
);

const PlusMinusRow = ({ onAdd, onRemove, canRemove, variant, variantSize }) => {
  const isSpecial = variant === "design4" || variant === "design5";
  // const size =
  //   variant === "design6" ||
  //   variant === "design5" ||
  //   variant === "design4" ||
  //   variant === "design3";
  const size10 = variantSize === "size10";
  return (
    <div className="flex gap-1 shrink-0">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className={`p-1 ${
          isSpecial
            ? "border border-white text-white"
            : "border border-indigo-900 text-indigo-900"
        } rounded-full hover:scale-95 transition-all duration-300`}
      >
        <FaPlus size={`${size10 ? 10 : 14}`} />
      </button>

      {canRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`p-1 ${
            isSpecial
              ? "border border-white text-white"
              : "border border-indigo-900 text-indigo-900"
          } rounded-full hover:scale-95 transition-all duration-300`}
        >
          <FaMinus size={`${size10 ? 10 : 14}`} />
        </button>
      )}
    </div>
  );
};

const CardsEditor = ({
  cards,
  onChange,
  ring,
  bg,
  variant,
  isActive = true,
}) => {
  const isDesign5 = variant === "design5";
  const isDesign4 = variant === "design4";

  const getDescriptions = (card) => {
    if (Array.isArray(card.descriptions) && card.descriptions.length > 0) {
      return card.descriptions;
    }
    return [createTextItem(card.description || "")];
  };

  const upd = (i, key, v) => {
    const c = [...cards];
    c[i] = { ...c[i], [key]: v };
    onChange(c);
  };

  const add = (index) => {
    const newCards = [...cards];
    newCards.splice(index + 1, 0, {
      id: uid(),
      icon: "",
      heading: "",
      descriptions: [createTextItem("")],
    });
    onChange(newCards);
  };

  const remove = (i) => onChange(cards.filter((_, idx) => idx !== i));

  const updateDescription = (cardIndex, descriptionIndex, value) => {
    const updatedCards = [...cards];
    const descriptions = [...getDescriptions(updatedCards[cardIndex])];
    descriptions[descriptionIndex] = {
      ...descriptions[descriptionIndex],
      value,
    };
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      descriptions,
    };
    delete updatedCards[cardIndex].description;
    onChange(updatedCards);
  };

  const addDescription = (cardIndex, descriptionIndex) => {
    const updatedCards = [...cards];
    const descriptions = [...getDescriptions(updatedCards[cardIndex])];
    descriptions.splice(descriptionIndex + 1, 0, createTextItem(""));
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      descriptions,
    };
    delete updatedCards[cardIndex].description;
    onChange(updatedCards);
  };

  const removeDescription = (cardIndex, descriptionIndex) => {
    const updatedCards = [...cards];
    const descriptions = getDescriptions(updatedCards[cardIndex]).filter(
      (_, index) => index !== descriptionIndex,
    );
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      descriptions:
        descriptions.length > 0 ? descriptions : [createTextItem("")],
    };
    delete updatedCards[cardIndex].description;
    onChange(updatedCards);
  };

  return (
    <div className="mt-3 w-full space-y-3">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, i) => (
          <div key={card.id} className="relative mb-10">
            <div
              className={`w-full min-w-0 overflow-hidden rounded-xl border border-white/10 text-white shadow-lg ${
                isDesign5
                  ? "bg-white/10 backdrop-blur-md border-white/20"
                  : "bg-[#3a3960]"
              }`}
              style={{
                backgroundColor: isDesign5 ? undefined : bg || "#fff",
              }}
            >
              <div className="space-y-3 p-4 text-center items-center flex flex-col">
                {" "}
                <div className="flex justify-center items-center">
                  <IconSearch
                    value={card.icon}
                    onChange={(v) => upd(i, "icon", v)}
                    isActive={isActive}
                    textColor={
                      isDesign5 || isDesign4 ? "text-white" : "text-black"
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Inp
                    value={card.heading}
                    onChange={(v) => upd(i, "heading", v)}
                    placeholder="Enter Heading"
                    ring={ring}
                    className="px-3.5 py-2.5 font-semibold mt-2 text-gray-500 text-sm leading-relaxed text-center"
                    textColor={
                      isDesign5 || isDesign4 ? "text-white" : "text-black"
                    }
                    isActive={isActive}
                  />
                </div>
                <div className="space-y-1">
                  {getDescriptions(card).map(
                    (description, descriptionIndex) => (
                      <div
                        key={description.id}
                        className="flex items-center justify-center gap-2 w-full"
                      >
                        <Inp
                          value={getTextValue(description)}
                          onChange={(v) =>
                            updateDescription(i, descriptionIndex, v)
                          }
                          placeholder={`Description ${descriptionIndex + 1}`}
                          ring={ring}
                          className="px-3.5 py-2.5 mt-2 text-gray-500 text-sm leading-relaxed text-center"
                          textColor={
                            isDesign5 || isDesign4 ? "text-white" : "text-black"
                          }
                          isActive={isActive}
                        />
                        <PlusMinusRow
                          onAdd={() => addDescription(i, descriptionIndex)}
                          onRemove={() =>
                            removeDescription(i, descriptionIndex)
                          }
                          canRemove={getDescriptions(card).length > 1}
                          variant={variant}
                          variantSize="size10"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 right-2 flex gap-2  p-1 rounded-full">
              <PlusMinusRow
                onAdd={() => add(i)}
                onRemove={() => remove(i)}
                canRemove={cards.length > 1}
                variant={variant}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ParasEditor = ({
  paras,
  onChange,
  className,
  variant,
  textColor,
  isActive,
}) => {
  const upd = (i, v) => {
    const p = [...paras];
    p[i] = { ...p[i], value: v };
    onChange(p);
  };

  const add = (index) => onChange(insertTextItemAfter(paras, index));

  const remove = (i) => onChange(paras.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {paras.map((p, i) => (
        <div key={p.id} className="flex items-center gap-2">
          <Inp
            value={getTextValue(p)}
            onChange={(v) => upd(i, v)}
            placeholder={`Paragraph ${i + 1}`}
            textColor={textColor}
            className={className}
            isActive={isActive}
          />
          <PlusMinusRow
            onAdd={() => add(i)}
            onRemove={() => remove(i)}
            canRemove={paras.length > 1}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
};

const D1 = ({ s, onChange, isActive }) => {
  const u = (k, v) => onChange({ ...s, [k]: v });
  return (
    <div className="space-y-3 ">
      <Inp
        value={s.title}
        onChange={(v) => u("title", v)}
        placeholder="Enter Title"
        isActive={isActive}
        className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl"
        textColor="text-[#2B2A4C]"
      />
      <ParasEditor
        paras={s.paras}
        onChange={(v) => u("paras", v)}
        isActive={isActive}
        className="font-medium"
      />
    </div>
  );
};
const D2 = ({ s, onChange, isActive }) => {
  const u = (k, v) => onChange({ ...s, [k]: v });
  const upd = (i, v) => {
    const p = [...s.points];
    p[i] = { ...p[i], value: v };
    u("points", p);
  };
  const add = (index) => u("points", insertTextItemAfter(s.points, index));
  const rem = (i) =>
    u(
      "points",
      s.points.filter((_, idx) => idx !== i),
    );
  return (
    <div className="space-y-3">
      <Inp
        value={s.title}
        onChange={(v) => u("title", v)}
        placeholder="Enter Title"
        isActive={isActive}
        className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl"
        textColor="text-[#2B2A4C]"
      />
      <div className="space-y-2">
        {s.points.map((pt, i) => (
          <div key={pt.id} className="flex items-center gap-2">
            <div
              className="flex items-center justify-center 
                  w-5 h-5 text-[11px] 
                  text-white bg-red-800 
                  rounded-full 
                  font-medium select-none"
            >
              {i + 1}
            </div>
            <Inp
              value={getTextValue(pt)}
              onChange={(v) => upd(i, v)}
              placeholder={`Point ${i + 1}`}
              isActive={isActive}
              className="font-medium"
            />
            <PlusMinusRow
              onAdd={() => add(i)}
              onRemove={() => rem(i)}
              canRemove={s.points.length > 1}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const D3 = ({ s, onChange, isActive }) => {
  const u = (k, v) => onChange({ ...s, [k]: v });
  return (
    <div className="space-y-3">
      <Inp
        value={s.title}
        onChange={(v) => u("title", v)}
        placeholder="Enter Title"
        isActive={isActive}
        className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl"
        textColor="text-[#2B2A4C]"
      />
      <ParasEditor
        paras={s.paras}
        onChange={(v) => u("paras", v)}
        isActive={isActive}
        className="font-medium"
      />
      <CardsEditor
        cards={s.cards}
        onChange={(v) => u("cards", v)}
        isActive={isActive}
        className="bg-[#2B2A4C] text-white p-1.5 rounded-lg"
      />
    </div>
  );
};

const D4 = ({ s, onChange, isActive }) => {
  const u = (k, v) => onChange({ ...s, [k]: v });

  return (
    <div className="space-y-6 p-6 bg-[#2b2a4c] text-white border border-white">
      <Inp
        value={s.title}
        onChange={(v) => u("title", v)}
        placeholder="Enter Title"
        ring="focus:ring-indigo-400"
        bg="#3a3960"
        textColor="text-white"
        className="py-3 border-white/10 font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl"
        isActive={isActive}
      />

      <div className="">
        <p className="text-xs uppercase tracking-widest text-gray-400"></p>
        <ParasEditor
          paras={s.paras}
          onChange={(v) => u("paras", v)}
          ring="focus:ring-indigo-400"
          bg="#3a3960"
          variant="design4"
          isActive={isActive}
          textColor="text-white"
          className="font-medium"
        />
      </div>
      <div>
        <CardsEditor
          cards={s.cards}
          onChange={(v) => u("cards", v)}
          ring="focus:ring-indigo-400"
          bg="#2b2a4c"
          variant="design4"
          isActive={isActive}
        />
      </div>

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <button className="bg-white text-[#2b2a4c] px-6 py-2 rounded-md font-medium hover:opacity-90 transition">
          Book Your Free Demo Class Today
        </button>
      </div>
    </div>
  );
};

const D5 = ({ s, onChange, bgImage, isActive }) => {
  const u = (k, v) => onChange({ ...s, [k]: v });

  // const isParaLimit = s.paras.length >= 3;
  // const isCardLimit = s.cards.length >= 4;

  return (
    <div className="relative w-full min-h-[400px] overflow-hidden border border-white">
      <img
        src={bgImage}
        alt="bg"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-[#2B2A4C]/80"></div>

      <div className="relative z-10 p-8 text-white space-y-6 text-center">
        <Inp
          value={s.title}
          onChange={(v) => u("title", v)}
          placeholder="Enter Title"
          ring="focus:ring-indigo-400"
          bg="#3a3960"
          textColor="text-white"
          className="mt-10 text-center font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-white max-w-[900px]"
          isActive={isActive}
        />

        <div className="max-w-3xl mx-auto space-y-2">
          <ParasEditor
            paras={s.paras}
            onChange={(v) => u("paras", v.slice(0, 3))}
            ring="focus:ring-indigo-400"
            bg="#3a3960"
            variant="design5"
            textColor="text-white"
            className="text-center text-lg max-w-2xl mx-auto font-medium"
            isActive={isActive}
          />
        </div>

        <div className="max-w-5xl mx-auto">
          <CardsEditor
            cards={s.cards}
            onChange={(v) => u("cards", v.slice(0, 4))}
            ring="focus:ring-indigo-400"
            variant="design5"
            isActive={isActive}
          />
        </div>
      </div>
    </div>
  );
};

const D6 = ({ s, onChange, isActive }) => {
  const u = (k, v) => onChange({ ...s, [k]: v });
  const upd = (i, k, v) => {
    const pts = [...s.points];
    pts[i] = { ...pts[i], [k]: v };
    u("points", pts);
  };
  const add = () =>
    u("points", [
      ...s.points,
      { id: uid(), point: "", descriptions: [createTextItem("")], link: "" },
    ]);
  const updDesc = (i, di, v) => {
    const pts = [...s.points];
    pts[i].descriptions[di] = {
      ...pts[i].descriptions[di],
      value: v,
    };
    u("points", pts);
  };

  const addDesc = (i, di) => {
    const pts = [...s.points];
    pts[i].descriptions.splice(di + 1, 0, createTextItem(""));
    u("points", pts);
  };

  const remDesc = (i, di) => {
    const pts = [...s.points];
    pts[i].descriptions = pts[i].descriptions.filter((_, idx) => idx !== di);
    u("points", pts);
  };
  const rem = (i) =>
    u(
      "points",
      s.points.filter((_, idx) => idx !== i),
    );

  const updPara = (i, v) => {
    const newParas = [...s.para];
    newParas[i] = { ...newParas[i], value: v };
    u("para", newParas);
  };

  const addPara = (index) => {
    u("para", insertTextItemAfter(s.para, index));
  };

  const remPara = (i) => {
    u(
      "para",
      s.para.filter((_, idx) => idx !== i),
    );
  };
  return (
    <div className="space-y-3">
      <Inp
        value={s.title}
        onChange={(v) => u("title", v)}
        placeholder="Enter Title"
        isActive={isActive}
        className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C]"
      />
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400"></p>

        {s.para.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2">
            <span className="text-gray-300 text-sm select-none"></span>

            <Inp
              value={getTextValue(p)}
              onChange={(v) => updPara(i, v)}
              placeholder="Enter Paragraph"
              isActive={isActive}
              className="mt-4 text-gray-600"
            />

            <PlusMinusRow
              onAdd={() => addPara(i)}
              onRemove={() => remPara(i)}
              canRemove={s.para.length > 1}
            />
          </div>
        ))}
      </div>
      <div>
        <div className="space-y-6 mt-6">
          {s.points.map((pt, i) => (
            <div key={pt.id}>
              {/* 🔹 DASHED BOX */}
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3">
                {/* POINT + LINK */}
                <div className="flex gap-2">
                  <Inp
                    value={pt.point}
                    onChange={(v) => upd(i, "point", v)}
                    placeholder={`Point ${i + 1}`}
                    isActive={isActive}
                    className="text-base md:text-lg font-semibold text-[#2B2A4C]"
                  />

                  <input
                    type="text"
                    value={pt.link}
                    onChange={(e) => upd(i, "link", e.target.value)}
                    placeholder="Link URL"
                    className={`w-40 shrink-0 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none ${
                      isActive ? "focus:border-gray-300" : ""
                    }`}
                  />
                </div>

                {/* DESCRIPTIONS */}
                <div className="space-y-2">
                  {pt.descriptions.map((desc, di) => (
                    <div key={desc.id} className="flex items-center gap-2">
                      <Inp
                        value={getTextValue(desc)}
                        onChange={(v) => updDesc(i, di, v)}
                        placeholder="Enter Description"
                        isActive={isActive}
                        className="mt-1 text-gray-600 text-sm"
                      />

                      <PlusMinusRow
                        onAdd={() => addDesc(i, di)}
                        onRemove={() => remDesc(i, di)}
                        canRemove={pt.descriptions.length > 1}
                        variant="design6"
                        variantSize="size10"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <PlusMinusRow
                  onAdd={add}
                  onRemove={() => rem(i)}
                  canRemove={s.points.length > 1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const D7 = ({ s, onChange, isActive }) => {
  const u = (key, value) => onChange({ ...s, [key]: value });

  const updateFaq = (index, key, value) => {
    const faqs = [...s.faqs];
    faqs[index] = { ...faqs[index], [key]: value };
    u("faqs", faqs);
  };

  const addFaq = (index) => {
    const faqs = [...s.faqs];
    faqs.splice(index + 1, 0, { id: uid(), question: "", answer: "" });
    u("faqs", faqs);
  };

  const removeFaq = (index) => {
    u(
      "faqs",
      s.faqs.filter((_, faqIndex) => faqIndex !== index),
    );
  };

  return (
    <div
      className="rounded-[15px] bg-[#f7f4fb] px-6 py-10 sm:px-8 lg:px-10"
      data-section-type="design7"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] text-center">
            Frequently Asked Questions{" "}
          </h2>
          <p className="font-medium text-center mt-3">
            Answers to the most common queries from students planning to
            studying abroad.
          </p>
        </div>

        <div className="mt-12">
          <div className="space-y-6">
            {s.faqs.map((faq, index) => (
              <div key={faq.id} className="relative">
                {/* FAQ CARD */}
                <div className="rounded-xl border border-[#d6d9e4] bg-white mt-6 py-2 px-2 shadow-[0_0_0_1px_rgba(214,217,228,0.15)]">
                  <div className="flex items-center gap-2">
                    <Inp
                      value={faq.question}
                      onChange={(value) => updateFaq(index, "question", value)}
                      placeholder={`FAQ Question ${index + 1}`}
                      className="text-[13px] sm:text-[14px] font-semibold text-black"
                      isActive={isActive}
                    />
                  </div>

                  <TextArea
                    value={faq.answer}
                    onChange={(value) => updateFaq(index, "answer", value)}
                    placeholder="FAQ Answer"
                    rows={1}
                    className="text-[10px] sm:text-[14px] leading-2 text-[#556072]"
                    isActive={isActive}
                  />
                </div>
                <div className="flex justify-end mt-2 pr-2">
                  <PlusMinusRow
                    onAdd={() => addFaq(index)}
                    onRemove={() => removeFaq(index)}
                    canRemove={s.faqs.length > 3 && index >= 3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const D8 = ({ s, onChange, selectedExam, setSelectedExam, offices = [] }) => {
  const [isKeywordFocused, setIsKeywordFocused] = useState(false);
  const u = (key, value) => onChange({ ...s, [key]: value });
  const selectedOfficeId = getOfficeIdByLegacyValue(s.office, offices);

  const keywordsValue =
    typeof s.keywords === "string"
      ? s.keywords
      : Array.isArray(s.keywords)
        ? s.keywords.map(getTextValue).join(", ")
        : "";

  return (
    <div className="bg-[#F8F9FA] px-6 py-10 rounded-xl">
      <h2 className="text-center text-lg font-semibold text-gray-700 mb-10">
        Additional Required Data{" "}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-1.5 items-center rounded-lg pt-1 p-4">
        <div className="flex flex-col w-full">
          <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
            SEO Title
          </label>
          <input
            value={s.seoTitle || ""}
            onChange={(e) => u("seoTitle", e.target.value)}
            placeholder="Enter title"
            className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
            SEO Description
          </label>
          <input
            value={s.description || ""}
            onChange={(e) => u("description", e.target.value)}
            placeholder="Enter description"
            className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
            SEO Keywords
          </label>

          <input
            value={keywordsValue}
            onChange={(e) => u("keywords", e.target.value)}
            placeholder="Enter keywords"
            onFocus={() => setIsKeywordFocused(true)}
            onBlur={() => setIsKeywordFocused(false)}
            className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
          />
          {isKeywordFocused && (
            <p className="text-xs text-gray-500 mt-1 ml-1">
              Enter keywords separated by commas (,)
            </p>
          )}
        </div>
        <div>
          <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
            Exam Slug
          </label>
          <input
            value={s.examSlug || ""}
            onChange={(e) => u("examSlug", normalizeExamSlug(e.target.value))}
            placeholder="ielts-coaching"
            className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
          />
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
            Select Office
          </label>
          <select
            value={selectedOfficeId}
            onChange={(e) => u("office", e.target.value)}
            className="border-gray-400 bg-[#F8F9FA] text-black p-3 text-sm border rounded-lg w-full"
          >
            <option value="">Select office</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-gray-400 text-xs font-semibold relative top-2 ml-2 px-1 bg-[#F8F9FA] w-fit">
            Select Exam
          </label>
          <select
            value={selectedExam || ""}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="border-gray-400 bg-[#F8F9FA] p-3 text-sm border rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
          >
            <option value="">Select exam</option>
            {EXAM_KEYS.map((k) => (
              <option key={k} value={k}>
                {k.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const EDITORS = {
  design1: D1,
  design4: D4,
  design3: D3,
  design5: D5,
  design2: D2,
  design6: D6,
  design7: D7,
  design8: D8,
};
const DESIGN_TYPES = Object.keys(EDITORS);
const keepDesign8Last = (items) => {
  const design8Sections = items.filter((section) => section.type === "design8");
  const otherSections = items.filter((section) => section.type !== "design8");

  return [...otherSections, ...design8Sections];
};

const isLockedSection = (section) =>
  section.type === "design7" ||
  section.type === "design8" ||
  (section.type === "design1" && section.isInitial) ||
  (section.type === "design3" && section.isInitial);
const isDroppableSection = (section) =>
  section.type !== "design7" && section.type !== "design8";
const getDropBlockedStartIndex = (items) =>
  items.findIndex(
    (section) => section.type === "design7" || section.type === "design8",
  );

const getDesign45OrderIssue = (items) => {
  const design4Index = items.findIndex((section) => section.type === "design4");
  const design5Index = items.findIndex((section) => section.type === "design5");

  if (design4Index === -1 || design5Index === -1) {
    return null;
  }

  const startIndex = Math.min(design4Index, design5Index) + 1;
  const endIndex = Math.max(design4Index, design5Index);
  const middleSections = items.slice(startIndex, endIndex);

  if (middleSections.length === 0) {
    return toast.warn("Dark sections cannot be stacked consecutively.", {
      icon: <FaExclamationTriangle color="#FFA500" />,
      style: {
        color: "#FFA500",
        border: "1px solid #FFA500",
      },
      progressStyle: {
        background: "#FFA500",
      },
    });
  }

  const hasInvalidMiddleSection = middleSections.some(
    (section) => section.type === "design7" || section.type === "design8",
  );

  if (hasInvalidMiddleSection) {
    return "Design 7 and Design 8 cannot stay between Design 4 and Design 5.";
  }

  return null;
};

const validateSectionOrder = (items) => {
  const orderedItems = keepDesign8Last(items);

  if (orderedItems[orderedItems.length - 1]?.type !== "design8") {
    return {
      isValid: false,
      message: "Design 8 must stay as the last section.",
      items: items,
    };
  }

  const design45Issue = getDesign45OrderIssue(orderedItems);

  if (design45Issue) {
    return {
      isValid: false,
      message: design45Issue,
      items,
    };
  }

  return {
    isValid: true,
    message: "",
    items: orderedItems,
  };
};

const SectionCard = ({
  s,
  sectionRef,
  onDuplicate,
  onRemove,
  onUpdate,
  selectedExam,
  setSelectedExam,
  offices,
  isActive,
  isDraggingActive,
  isDragging,
  isDropTarget,
  canDrop,
  isDropBlocked,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) => {
  const Editor = EDITORS[s.type];

  const isDuplicateDisabled =
    s.type === "design4" ||
    s.type === "design5" ||
    s.type === "design7" ||
    s.type === "design8";

  const isDraggable = !isLockedSection(s);

  const isStrictBlocked = s.type === "design7" || s.type === "design8";
  const isDesign7 = s.type === "design7";

  const shouldShowBlockedCursor =
    isDraggingActive && (isDropBlocked || isStrictBlocked);

  return (
    <>
      <div
        ref={sectionRef}
        draggable={isDraggable}
        onDragStart={isDraggable ? onDragStart : undefined}
        onDragOver={(e) => {
          if (isDesign7) {
            e.preventDefault(); // keeps drop event alive in the browser
            e.stopPropagation(); // prevents parent container from interfering
            // ❌ removed: dropEffect = "none" — this was silently killing the drop event
            return;
          }
          if (!canDrop || isStrictBlocked) {
            e.preventDefault();
            return;
          }
          onDragOver && onDragOver(e);
        }}
        onDrop={(e) => {
          if (isDesign7) {
            e.preventDefault();
            e.stopPropagation();
            toast.warn("You cannot drop on this section", {
              icon: <FaExclamationTriangle color="#FFA500" />,
              style: {
                color: "#FFA500",
                border: "1px solid #FFA500",
              },
              progressStyle: {
                background: "#FFA500",
              },
            });
            onDragEnd && onDragEnd();
            return;
          }
          if (canDrop && !isStrictBlocked) {
            onDrop && onDrop(e);
          } else {
            e.preventDefault();
          }
        }}
        onDragEnd={isDraggable ? onDragEnd : undefined}
        className={`rounded-md mb-4 mt-10 overflow-hidden transition-all duration-200 
        ${
          s.type === "design4" ||
          s.type === "design5" ||
          s.type === "design7" ||
          s.type === "design8"
            ? "p-0"
            : "p-4"
        }
        ${
          isActive
            ? s.type === "design8"
              ? "border border-transparent"
              : "border border-gray-400"
            : "border border-transparent"
        }
        ${
          shouldShowBlockedCursor || (isDraggingActive && isDesign7)
            ? "cursor-not-allowed"
            : isDraggable
              ? "cursor-move"
              : ""
        }
        ${isDragging ? "opacity-50" : ""}
        ${isDropTarget && canDrop && !isDesign7 ? "ring-2 ring-indigo-400 ring-offset-2" : ""}
        `}
      >
        <div className="p-0">
          <Editor
            s={s}
            onChange={onUpdate}
            isActive={isActive}
            selectedExam={selectedExam}
            setSelectedExam={setSelectedExam}
            offices={offices}
            bgImage={
              s.type === "design5"
                ? "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/5a41f99c-58b2-4772-65d1-9bb84487ab00/public"
                : null
            }
          />
        </div>
      </div>

      {!isDuplicateDisabled && (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-2 bg-indigo-900 rounded-full text-white hover:scale-95 transition-all duration-300"
          >
            <FaPlus size={18} />
          </button>

          {!s.isInitial && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 bg-indigo-900 rounded-full text-white hover:scale-95 transition-all duration-300"
            >
              <FaMinus size={18} />
            </button>
          )}
        </div>
      )}
    </>
  );
};

const ExamPageElementor = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("menubarOpen");

    if (savedState !== null) {
      return JSON.parse(savedState);
    }

    return window.innerWidth >= 1024;
  });
  const [selectedExam, setSelectedExam] = useState(EXAM_KEYS[0]);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerBgColor, setBannerBgColor] = useState("");
  const [sections, setSections] = useState(() =>
    DESIGN_TYPES.map((type) => createSection(type)),
  );
  const [, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [tableInclude, setTableInclude] = useState(true);
  const [offices, setOffices] = useState([]);
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  const [dropTargetSectionId, setDropTargetSectionId] = useState(null);
  const [isBannerTitleEditing, setIsBannerTitleEditing] = useState(false);
  const isDraggingActive = Boolean(draggedSectionId);
  const dragPointerYRef = useRef(null);
  const dragScrollFrameRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const dragScrollLastTimeRef = useRef(null);
  const sectionRefs = useRef({});
  const setDragCursor = (cursor) => {
    document.body.style.cursor = cursor;
  };
  const showToast = (type, msg) => {
    setToast({ type, msg });
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => setToast(null), 4000);
  };
  const getDropBlockedBoundaryY = () => {
    const blockedStartIndex = getDropBlockedStartIndex(sections);

    if (blockedStartIndex === -1) {
      return Infinity;
    }

    const blockedSection = sections[blockedStartIndex];
    const blockedElement = sectionRefs.current[blockedSection?.id];

    if (!blockedElement) {
      return Infinity;
    }

    return blockedElement.getBoundingClientRect().top;
  };
  useEffect(() => {
    setSections((prev) => {
      const existingTypes = new Set(prev.map((section) => section.type));
      const missingSections = DESIGN_TYPES.filter(
        (type) => !existingTypes.has(type),
      ).map((type) => createSection(type));

      return missingSections.length > 0
        ? keepDesign8Last([...prev, ...missingSections])
        : keepDesign8Last(prev);
    });
  }, []);

  useEffect(() => {
    const onResize = () => {
      const m = window.innerWidth < 1024;
      setIsMobile(m);
      if (m) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await fetch(`${API_BASE}/branchoffices`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.message || "Failed to fetch offices");
        }

        const normalizedOffices = getOfficeItemsFromResponse(data)
          .map(normalizeOffice)
          .filter(Boolean);

        setOffices(normalizedOffices);
      } catch (error) {
        console.error("Error fetching offices:", error);
        showToast("error", `Unable to load offices: ${error.message}`);
      }
    };

    fetchOffices();
  }, []);

  useEffect(() => {
    if (offices.length === 0) return;

    setSections((prev) =>
      prev.map((section) => {
        if (section.type !== "design8" || !section.office) {
          return section;
        }

        const normalizedOfficeId = getOfficeIdByLegacyValue(
          section.office,
          offices,
        );

        if (!normalizedOfficeId || normalizedOfficeId === section.office) {
          return section;
        }

        return {
          ...section,
          office: normalizedOfficeId,
        };
      }),
    );
  }, [offices]);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!draggedSectionId) {
      dragPointerYRef.current = null;
      dragScrollLastTimeRef.current = null;
      setDragCursor("");

      if (dragScrollFrameRef.current) {
        cancelAnimationFrame(dragScrollFrameRef.current);
        dragScrollFrameRef.current = null;
      }
      return;
    }

    const handleDragOver = (event) => {
      event.preventDefault();
      dragPointerYRef.current = event.clientY;
    };

    const clearDragPointer = () => {
      dragPointerYRef.current = null;
      dragScrollLastTimeRef.current = null;
      setDragCursor("");
    };

    const autoScrollWhileDragging = (timestamp) => {
      const pointerY = dragPointerYRef.current;

      const lastTime = dragScrollLastTimeRef.current ?? timestamp;
      const delta = Math.min(timestamp - lastTime, 20);
      dragScrollLastTimeRef.current = timestamp;

      if (typeof pointerY === "number") {
        const viewportHeight = window.innerHeight;
        const blockedBoundaryY = getDropBlockedBoundaryY();

        let scrollDelta = 0;

        // 🔼 Scroll UP
        if (pointerY < DRAG_SCROLL_EDGE_OFFSET) {
          const intensity =
            (DRAG_SCROLL_EDGE_OFFSET - pointerY) / DRAG_SCROLL_EDGE_OFFSET;

          const speed = 300 + Math.pow(intensity, 2) * 1500;

          scrollDelta = -(speed * delta) / 1000;
        }

        // 🔽 Scroll DOWN
        else if (viewportHeight - pointerY < DRAG_SCROLL_EDGE_OFFSET) {
          if (pointerY >= blockedBoundaryY) {
            setDragCursor("not-allowed");
            dragScrollFrameRef.current = requestAnimationFrame(
              autoScrollWhileDragging,
            );
            return;
          }

          const intensity =
            (DRAG_SCROLL_EDGE_OFFSET - (viewportHeight - pointerY)) /
            DRAG_SCROLL_EDGE_OFFSET;

          const speed = 300 + Math.pow(intensity, 2) * 1500;

          scrollDelta = (speed * delta) / 1000;
        }

        if (scrollDelta !== 0) {
          window.scrollBy({
            top: scrollDelta,
            behavior: "auto",
          });
        }
      }

      dragScrollFrameRef.current = requestAnimationFrame(
        autoScrollWhileDragging,
      );
    };

    document.addEventListener("dragover", handleDragOver, { passive: false });
    document.addEventListener("drop", clearDragPointer);
    document.addEventListener("dragend", clearDragPointer);

    dragScrollFrameRef.current = requestAnimationFrame(autoScrollWhileDragging);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("drop", clearDragPointer);
      document.removeEventListener("dragend", clearDragPointer);

      if (dragScrollFrameRef.current) {
        cancelAnimationFrame(dragScrollFrameRef.current);
        dragScrollFrameRef.current = null;
      }

      dragScrollLastTimeRef.current = null;
      setDragCursor("");
    };
    // eslint-disable-next-line
  }, [draggedSectionId]);

  const commitSections = (nextSections) => {
    const validation = validateSectionOrder(nextSections);

    if (!validation.isValid) {
      showToast("error", validation.message);
      return false;
    }

    setSections(validation.items);
    return true;
  };

  const duplicateSection = (id) => {
    const index = sections.findIndex((section) => section.id === id);

    if (index === -1) return;

    if (
      sections[index].type === "design4" ||
      sections[index].type === "design5" ||
      sections[index].type === "design7" ||
      sections[index].type === "design8"
    ) {
      return;
    }

    const duplicatedSection = cloneSectionWithIds(sections[index]);
    const next = [...sections];
    next.splice(index + 1, 0, duplicatedSection);
    commitSections(next);
  };

  const removeSection = (id) => {
    const targetSection = sections.find((section) => section.id === id);

    if (!targetSection || isLockedSection(targetSection)) {
      return;
    }

    const next = sections.filter((section) => section.id !== id);
    commitSections(next);
  };

  const updateSection = (id, updated) =>
    setSections((p) => p.map((s) => (s.id === id ? updated : s)));
  const reorderSections = (draggedId, targetId) => {
    if (!draggedId || !targetId || draggedId === targetId) return;

    const draggedSection = sections.find((section) => section.id === draggedId);
    const targetSection = sections.find((section) => section.id === targetId);

    if (!draggedSection || !targetSection) {
      return;
    }

    if (isLockedSection(draggedSection) || !isDroppableSection(targetSection)) {
      return;
    }

    const movableSections = sections.filter(
      (section) => section.type !== "design8",
    );
    const design8Sections = sections.filter(
      (section) => section.type === "design8",
    );
    const fromIndex = movableSections.findIndex(
      (section) => section.id === draggedId,
    );
    const toIndex = movableSections.findIndex(
      (section) => section.id === targetId,
    );

    if (fromIndex === -1 || toIndex === -1) {
      return;
    }

    const nextMovableSections = [...movableSections];
    const [movingSection] = nextMovableSections.splice(fromIndex, 1);
    nextMovableSections.splice(toIndex, 0, movingSection);

    const nextSections = [...nextMovableSections, ...design8Sections];
    commitSections(nextSections);
  };
  const resetDragState = () => {
    setDraggedSectionId(null);
    setDropTargetSectionId(null);
    setDragCursor("");
  };

  const buildPayload = () => ({
    examKey: selectedExam,
    bannerTitle,
    bannerBgColor: bannerBgColor || "#d8efff",
    tableInclude,
    sections: sections.map((section, sectionIndex) =>
      cleanSection(section, sectionIndex),
    ),
  });
  const selectedOfficeId = getOfficeIdByLegacyValue(
    sections.find((section) => section.type === "design8")?.office || "",
    offices,
  );
  const selectedOffice = getOfficeNameById(selectedOfficeId, offices);
  const lastDesign6Index = sections
    .map((section, index) => (section.type === "design5" ? index : -1))
    .filter((index) => index !== -1)
    .pop();
  const bannerTitleFieldClassName =
    "block w-full bg-transparent p-0 font-semibold text-xl leading-[1.3] text-[#2B2A4C] md:text-2xl lg:text-3xl 2xl:text-4xl";
  const livePayload = buildPayload();

  const handleSubmit = async () => {
    setSubmitting(true);
    setToast(null);

    try {
      const payload = buildPayload();

      // Get the selected office from design8 section
      const design8Section = sections.find(
        (section) => section.type === "design8",
      );
      const selectedOfficeId = getOfficeIdByLegacyValue(
        design8Section?.office || "",
        offices,
      );

      // Get SEO data from design8 section
      const seoData = {
        title: design8Section?.seoTitle || "",
        description: design8Section?.description || "",
        keywords: design8Section?.keywords || "",
      };

      // Get FAQs from design7 section
      const design7Section = sections.find(
        (section) => section.type === "design7",
      );
      const faqs = design7Section?.faqs || [];

      // Get testimonials from design6 section or other sections
      let testimonials = [];
      const design6Section = sections.find(
        (section) => section.type === "design6",
      );
      if (design6Section?.points) {
        testimonials = design6Section.points.map((point) => ({
          text: point.descriptions?.[0]?.value || "",
          name: point.point || "",
          detail: "",
        }));
      }

      const requestBody = {
        ...payload,
        office: selectedOfficeId,
        officeId: selectedOfficeId,
        slug: normalizeExamSlug(design8Section?.examSlug || payload.examKey),
        seo: seoData,
        faqs: faqs,
        examReviews: {
          studentTestimonials: testimonials,
        },
      };

      console.log("Sending payload:", JSON.stringify(requestBody, null, 2));

      const res = await fetch(`${API_BASE}/exam-page/${requestBody.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok) {
        alert("INSERTED SUCCESSFULLY IN DATABASE...");
      } else {
        throw new Error(data.message || `HTTP ${res.status}`);
      }

      showToast("success", "✅ Exam page saved successfully!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("error", `❌ Error: ${err.message}`);
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
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <p className="font-bold text-xl text-gray-700 ml-10 lg:ml-0">
            Exam Page Elementor
          </p>
        </div>
        {toast?.msg && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium
    ${
      toast?.type === "success"
        ? "bg-green-100 text-green-800 border border-green-200"
        : "bg-red-100 text-red-800 border border-red-200"
    }`}
          >
            {toast.msg}
          </div>
        )}
        {/* <div
          className="min-h-[360px] rounded-[14px]  sm:px-10 lg:px-16 lg:py-20"
          style={{ backgroundColor: bannerBgColor || "#d8efff" }}
        > */}
        <div
          className="relative min-h-[300px] md:min-h-[350px] lg:min-h-[400px] rounded-xl p-5 md:p-12 lg:p-20 flex flex-col justify-center transition-all duration-300 shadow-sm overflow-hidden"
          style={{ backgroundColor: bannerBgColor || "#d8efff" }}
        >
          <div className="mx-auto flex max-w-7xl flex-col items-start w-full">
            <div className="relative w-full pb-20">
              {bannerTitle && !isBannerTitleEditing ? (
                <div
                  aria-hidden="true"
                  className={`${bannerTitleFieldClassName} pointer-events-none absolute inset-0 select-none whitespace-pre-wrap break-words`}
                >
                  {renderHighlightedBannerTitle(
                    bannerTitle,
                    selectedExam,
                    selectedOffice,
                  )}
                </div>
              ) : null}

              <textarea
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                onFocus={() => setIsBannerTitleEditing(true)}
                onBlur={() => setIsBannerTitleEditing(false)}
                onClick={() => setIsBannerTitleEditing(true)}
                rows={isMobile ? 4 : 3}
                placeholder="Banner Title"
                className={`${bannerTitleFieldClassName} relative z-10 resize-none border border-transparent outline-none transition duration-300 placeholder-gray-500/40 focus:border-black ${
                  bannerTitle && !isBannerTitleEditing
                    ? "text-transparent caret-transparent"
                    : "caret-[#2B2A4C] placeholder:text-[#2B2A4C]/40"
                }`}
                style={{ lineHeight: 1.3 }}
              />
            </div>

            <div className="absolute lg:bottom-6 bottom-4 lg:right-8 right-4 flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 backdrop-blur-sm rounded-lg">
                <div className="relative w-6 h-6 border border-black rounded-sm overflow-hidden">
                  <input
                    type="color"
                    value={bannerBgColor || "#ffffff"}
                    onChange={(e) => setBannerBgColor(e.target.value)}
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none p-0 bg-transparent"
                  />
                </div>

                <span className="text-sm font-medium text-[#6B7280] uppercase tracking-wide">
                  {bannerBgColor}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          onDragOver={(e) => {
            if (!draggedSectionId) return;
            let targetElement = e.target;
            while (
              targetElement &&
              !targetElement.getAttribute?.("data-section-type")
            ) {
              targetElement = targetElement.parentElement;
            }

            if (
              targetElement &&
              targetElement.getAttribute("data-section-type") === "design7"
            ) {
              e.preventDefault();
              setDragCursor("not-allowed");
              setDropTargetSectionId(null);
              return;
            }

            const blockedBoundaryY = getDropBlockedBoundaryY();
            if (e.clientY >= blockedBoundaryY) {
              e.dataTransfer.dropEffect = "none";
              setDragCursor("not-allowed");
              setDropTargetSectionId(null);
              e.preventDefault();
              return;
            }
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDragCursor("grabbing");
            dragPointerYRef.current = e.clientY;
          }}
          onDrop={(e) => {
            e.preventDefault();

            // Check if dropping on Design7
            let targetElement = e.target;
            while (
              targetElement &&
              !targetElement.getAttribute?.("data-section-type")
            ) {
              targetElement = targetElement.parentElement;
            }

            if (
              targetElement &&
              targetElement.getAttribute("data-section-type") === "design7"
            ) {
              toast.warn("You cannot drop on this section", {
                icon: <FaExclamationTriangle color="#FFA500" />,
                style: {
                  color: "#FFA500",
                  border: "1px solid #FFA500",
                },
                progressStyle: {
                  background: "#FFA500",
                },
              });
              resetDragState();
              return;
            }

            resetDragState();
          }}
        >
          {sections.map((s, index) => {
            const dropBlockedStartIndex = getDropBlockedStartIndex(sections);
            const isDropBlocked =
              dropBlockedStartIndex !== -1 && index >= dropBlockedStartIndex;
            const canDropOnSection = isDroppableSection(s) && !isDropBlocked;

            return (
              <React.Fragment key={s.id}>
                {s.type === "design8" && (
                  <div className="mx-1 mt-12 border-t border-gray-300 section-card" />
                )}
                <SectionCard
                  s={s}
                  sectionRef={(node) => {
                    if (node) {
                      sectionRefs.current[s.id] = node;
                    } else {
                      delete sectionRefs.current[s.id];
                    }
                  }}
                  onDuplicate={() => duplicateSection(s.id)}
                  onRemove={() => removeSection(s.id)}
                  onUpdate={(updated) => updateSection(s.id, updated)}
                  selectedExam={selectedExam}
                  setSelectedExam={setSelectedExam}
                  offices={offices}
                  isActive={true}
                  isDraggingActive={isDraggingActive}
                  isDragging={draggedSectionId === s.id}
                  isDropTarget={dropTargetSectionId === s.id}
                  canDrop={canDropOnSection}
                  isDropBlocked={Boolean(draggedSectionId) && isDropBlocked}
                  onDragStart={(e) => {
                    setDraggedSectionId(s.id);
                    setDropTargetSectionId(s.id);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", s.id);
                    setDragCursor("grabbing");
                  }}
                  onDragOver={(e) => {
                    const blockedBoundaryY = getDropBlockedBoundaryY();
                    if (e.clientY >= blockedBoundaryY) {
                      e.dataTransfer.dropEffect = "none";
                      setDragCursor("not-allowed");
                      setDropTargetSectionId(null);
                      return;
                    }
                    if (!canDropOnSection) {
                      e.dataTransfer.dropEffect = "none";
                      setDragCursor("not-allowed");
                      setDropTargetSectionId(null);
                      return;
                    }
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragCursor("grabbing");
                    if (draggedSectionId && draggedSectionId !== s.id) {
                      setDropTargetSectionId(s.id);
                    }
                  }}
                  onDrop={(e) => {
                    if (!canDropOnSection) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const draggedId =
                      e.dataTransfer.getData("text/plain") || draggedSectionId;
                    reorderSections(draggedId, s.id);
                    resetDragState();
                  }}
                  onDragEnd={resetDragState}
                />
                {index === lastDesign6Index && (
                  <div className="mt-5 flex justify-start">
                    <label className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg font-medium text-gray-700 shadow-sm">
                      <input
                        type="checkbox"
                        checked={tableInclude}
                        onChange={(e) => setTableInclude(e.target.checked)}
                        className="h-5 w-5 accent-indigo-900"
                      />
                      <span>Include Table</span>
                    </label>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex justify-center gap-4 mt-10">
          <button className="w-40 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
            Cancel
          </button>

          <button
            className="w-40 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </main>
    </div>
  );
};

export default ExamPageElementor;

// ================old code===========
//#2b2a4c
// import React, { useState, useEffect } from "react";
// import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";
// import "../Dashboard/Dashboard.css";

// const EXAM_KEYS = ["ielts", "pte", "toefl", "gre", "gmat", "sat", "german"];
// const ExamPageElementor = () => {
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
//               Exam Page Elementor
//             </p>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="mt-5">
//           <div className="bg-red">
//               <div>
//                 <input type="text" />
//               </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default ExamPageElementor;

// import React, { useState, useEffect, useRef } from "react";
// import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";
// import "../Dashboard/Dashboard.css";
// import { FaMinus, FaPlus } from "react-icons/fa6";
// import IconSearch from "./IconSearch";

// const EXAM_KEYS = ["ielts", "pte", "toefl", "gre", "gmat", "sat", "german"];
// // const CITY_KEYWORDS = [
// //   "Rajkot",
// //   "New Delhi",
// //   "Delhi",
// //   "Mumbai",
// //   "Bangalore",
// //   "Bengaluru",
// //   "Chennai",
// //   "Hyderabad",
// //   "Pune",
// //   "Kolkata",
// //   "Ahmedabad",
// //   "Jaipur",
// //   "Chandigarh",
// //   "Noida",
// //   "Gurgaon",
// //   "Gurugram",
// //   "Lucknow",
// //   "Indore",
// //   "Bhopal",
// //   "Patna",
// //   "Surat",
// //   "Kanpur",
// //   "Nagpur",
// //   "Coimbatore",
// //   "Kochi",
// //   "Kota",
// //   "Vadodara",
// //   "Visakhapatnam",
// //   "Mysore",
// //   "Mohali",
// // ];

// // const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// // const normalizeMatch = (value) => value.trim().toLowerCase();
// // const HIGHLIGHT_TERMS = [...EXAM_KEYS, ...CITY_KEYWORDS].sort(
// //   (a, b) => b.length - a.length,
// // );
// // const HIGHLIGHT_TERM_SET = new Set(HIGHLIGHT_TERMS.map(normalizeMatch));
// // const HIGHLIGHT_REGEX = new RegExp(
// //   `\\b(${HIGHLIGHT_TERMS.map(escapeRegex).join("|")})\\b`,
// //   "gi",
// // );

// // const renderHighlightedBannerTitle = (title) => {
// //   if (!title) return null;

// //   return title.split(HIGHLIGHT_REGEX).map((part, index) => {
// //     const isHighlighted = HIGHLIGHT_TERM_SET.has(normalizeMatch(part));

// //     if (isHighlighted) {
// //       return (
// //         <span key={`${part}-${index}`} className="text-red-500">
// //           {part}
// //         </span>
// //       );
// //     }

// //     return <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>;
// //   });
// // };

// const uid = () => Math.random().toString(36).substr(2, 9);

// const createTextItem = (value = "") => ({ id: uid(), value });
// const getTextValue = (item) =>
//   typeof item === "string" ? item : item?.value || "";
// const ensureTextItem = (item) =>
//   typeof item === "string" ? createTextItem(item) : item;
// const normalizeTextItems = (items = [""]) =>
//   items.length > 0 ? items.map(ensureTextItem) : [createTextItem("")];
// const stripTextItems = (items = []) => items.map(getTextValue);
// const insertTextItemAfter = (items, index) => {
//   const nextItems = [...items];
//   nextItems.splice(index + 1, 0, createTextItem(""));
//   return nextItems;
// };

// const createSection = (type) => {
//   const base = { id: uid(), type, isInitial: true };
//   const card = () => ({
//     id: uid(),
//     icon: "",
//     heading: "",
//     descriptions: [createTextItem("")],
//   });
//   const point6 = () => ({
//     id: uid(),
//     point: "",
//     descriptions: [createTextItem("")],
//     link: "",
//   });
//   switch (type) {
//     case "design1":
//       return { ...base, title: "", paras: [createTextItem("")] };
//     case "design2":
//       return { ...base, title: "", points: [createTextItem("")] };
//     case "design3":
//       return {
//         ...base,
//         title: "",
//         paras: [createTextItem("")],
//         cards: [card()],
//       };
//     case "design4":
//       return {
//         ...base,
//         title: "",
//         paras: [createTextItem("")],
//         cards: [card()],
//       };
//     case "design5":
//       return {
//         ...base,
//         bgImage: "",
//         title: "",
//         paras: [createTextItem("")],
//         cards: [card()],
//       };
//     case "design6":
//       return {
//         ...base,
//         title: "",
//         para: [createTextItem("")],
//         points: [point6()],
//       };
//     case "design7":
//       return {
//         ...base,
//         title: "Frequently Asked Questions About IELTS Coaching in",
//         highlightText: "Jaipur",
//         subtitle:
//           "Answers to the most common queries from students planning to studying abroad.",
//         faqs: [
//           {
//             id: uid(),
//             question: "",
//             answer: "",
//           },
//           {
//             id: uid(),
//             question: "",
//             answer: "",
//           },
//           {
//             id: uid(),
//             question: "",
//             answer: "",
//           },
//         ],
//       };
//     case "design8":
//       return {
//         ...base,
//         seoTitle: "",
//         descriptions: [createTextItem("")],
//         keywords: [createTextItem("")],
//       };
//     default:
//       return base;
//   }
// };

// const cleanSection = ({ id: _id, isInitial: _isInitial, ...rest }) => {
//   const s = { ...rest };
//   if (s.paras) s.paras = stripTextItems(s.paras);
//   if (s.para) s.para = stripTextItems(s.para);
//   if (s.descriptions) s.descriptions = stripTextItems(s.descriptions);
//   if (s.keywords) s.keywords = stripTextItems(s.keywords);
//   if (s.cards) {
//     s.cards = s.cards.map(({ id: _c, description, descriptions, ...c }) => ({
//       ...c,
//       descriptions:
//         descriptions && descriptions.length > 0
//           ? stripTextItems(descriptions)
//           : [description || ""],
//     }));
//   }
//   if (s.points && s.points.length > 0) {
//     if (typeof s.points[0] === "object" && "point" in s.points[0]) {
//       s.points = s.points.map(({ id: _p, descriptions, ...p }) => ({
//         ...p,
//         descriptions: stripTextItems(descriptions),
//       }));
//     } else {
//       s.points = stripTextItems(s.points);
//     }
//   }
//   if (s.faqs) s.faqs = s.faqs.map(({ id: _f, ...f }) => f);
//   return s;
// };

// const cloneSectionWithIds = (section) => {
//   const cleanedSection = cleanSection(section);
//   const clonedSection = {
//     ...cleanedSection,
//     id: uid(),
//     isInitial: false,
//   };
//   if (clonedSection.paras) {
//     clonedSection.paras = normalizeTextItems(clonedSection.paras);
//   }
//   if (clonedSection.para) {
//     clonedSection.para = normalizeTextItems(clonedSection.para);
//   }
//   if (clonedSection.descriptions) {
//     clonedSection.descriptions = normalizeTextItems(clonedSection.descriptions);
//   }
//   if (clonedSection.keywords) {
//     clonedSection.keywords = normalizeTextItems(clonedSection.keywords);
//   }
//   if (clonedSection.cards) {
//     clonedSection.cards = clonedSection.cards.map((card) => ({
//       ...card,
//       id: uid(),
//       descriptions: normalizeTextItems(card.descriptions),
//     }));
//   }
//   if (clonedSection.points && clonedSection.points.length > 0) {
//     if (
//       typeof clonedSection.points[0] === "object" &&
//       "point" in clonedSection.points[0]
//     ) {
//       clonedSection.points = clonedSection.points.map((point) => ({
//         ...point,
//         id: uid(),
//         descriptions: normalizeTextItems(point.descriptions),
//       }));
//     } else {
//       clonedSection.points = normalizeTextItems(clonedSection.points);
//     }
//   }
//   if (clonedSection.faqs) {
//     clonedSection.faqs = clonedSection.faqs.map((faq) => ({
//       ...faq,
//       id: uid(),
//     }));
//   }
//   return clonedSection;
// };

// const Inp = ({
//   value,
//   onChange,
//   placeholder,
//   className = "",
//   textColor = "text-black",
//   isActive = false,
// }) => (
//   <input
//     type="text"
//     value={value}
//     onChange={(e) => onChange(e.target.value)}
//     placeholder={placeholder}
//     className={`
//       w-full
//       appearance-none
//       rounded-none
//       border-0 border-b
//       shadow-none
//       px-1 py-2
//       placeholder-gray-400
//       ${textColor}
//       transition-colors duration-200
//       focus:outline-none
//       focus:ring-0
//       focus:shadow-none
//       ${isActive ? "border-b-gray-300" : "border-b-transparent"}
//       bg-transparent
//       ${className}
//       text-sm
//     `}
//   />
// );

// const TextArea = ({
//   value,
//   onChange,
//   placeholder,
//   className = "",
//   textColor = "text-black",
//   rows = 3,
//   isActive = false,
// }) => (
//   <textarea
//     value={value}
//     onChange={(e) => onChange(e.target.value)}
//     placeholder={placeholder}
//     rows={rows}
//     className={`
//       w-full resize-none
//       appearance-none
//       rounded-none
//       border-0 border-b
//       shadow-none
//       px-1 py-2 text-sm
//       placeholder-gray-400
//       ${textColor}
//       transition-colors duration-200
//       focus:outline-none
//       focus:ring-0
//       focus:shadow-none
//       ${isActive ? "border-b-gray-300" : "border-b-transparent"}
//       bg-transparent
//       ${className}
//     `}
//   />
// );

// const PlusMinusRow = ({ onAdd, onRemove, canRemove, variant }) => {
//   const isSpecial = variant === "design4" || variant === "design5";
//   const size =
//     variant === "design6" ||
//     variant === "design5" ||
//     variant === "design4" ||
//     variant === "design3";

//   return (
//     <div className="flex gap-1 shrink-0">
//       <button
//         onClick={(e) => {
//           e.stopPropagation();
//           onAdd();
//         }}
//         className={`p-1 ${
//           isSpecial
//             ? "border border-white text-white"
//             : "border border-indigo-900 text-indigo-900"
//         } rounded-full hover:scale-95 transition-all duration-300`}
//       >
//         <FaPlus size={`${size ? 10 : 14}`} />
//       </button>

//       {canRemove && (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onRemove();
//           }}
//           className={`p-1 ${
//             isSpecial
//               ? "border border-white text-white"
//               : "border border-indigo-900 text-indigo-900"
//           } rounded-full hover:scale-95 transition-all duration-300`}
//         >
//           <FaMinus size={`${size ? 10 : 14}`} />
//         </button>
//       )}
//     </div>
//   );
// };

// const CardsEditor = ({
//   cards,
//   onChange,
//   ring,
//   bg,
//   variant,
//   isActive = false,
// }) => {
//   const isDesign5 = variant === "design5";

//   const getDescriptions = (card) => {
//     if (Array.isArray(card.descriptions) && card.descriptions.length > 0) {
//       return card.descriptions;
//     }
//     return [createTextItem(card.description || "")];
//   };

//   const upd = (i, key, v) => {
//     const c = [...cards];
//     c[i] = { ...c[i], [key]: v };
//     onChange(c);
//   };

//   const add = (index) => {
//     const newCards = [...cards];
//     newCards.splice(index + 1, 0, {
//       id: uid(),
//       icon: "",
//       heading: "",
//       descriptions: [createTextItem("")],
//     });
//     onChange(newCards);
//   };

//   const remove = (i) => onChange(cards.filter((_, idx) => idx !== i));

//   const updateDescription = (cardIndex, descriptionIndex, value) => {
//     const updatedCards = [...cards];
//     const descriptions = [...getDescriptions(updatedCards[cardIndex])];
//     descriptions[descriptionIndex] = {
//       ...descriptions[descriptionIndex],
//       value,
//     };
//     updatedCards[cardIndex] = {
//       ...updatedCards[cardIndex],
//       descriptions,
//     };
//     delete updatedCards[cardIndex].description;
//     onChange(updatedCards);
//   };

//   const addDescription = (cardIndex, descriptionIndex) => {
//     const updatedCards = [...cards];
//     const descriptions = [...getDescriptions(updatedCards[cardIndex])];
//     descriptions.splice(descriptionIndex + 1, 0, createTextItem(""));
//     updatedCards[cardIndex] = {
//       ...updatedCards[cardIndex],
//       descriptions,
//     };
//     delete updatedCards[cardIndex].description;
//     onChange(updatedCards);
//   };

//   const removeDescription = (cardIndex, descriptionIndex) => {
//     const updatedCards = [...cards];
//     const descriptions = getDescriptions(updatedCards[cardIndex]).filter(
//       (_, index) => index !== descriptionIndex,
//     );
//     updatedCards[cardIndex] = {
//       ...updatedCards[cardIndex],
//       descriptions:
//         descriptions.length > 0 ? descriptions : [createTextItem("")],
//     };
//     delete updatedCards[cardIndex].description;
//     onChange(updatedCards);
//   };

//   return (
//     <div className="mt-3 w-full space-y-3">
//       <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
//         {cards.map((card, i) => (
//           <div key={card.id} className="relative mb-10">
//             <div
//               className={`w-full min-w-0 overflow-hidden rounded-xl border border-white/10 text-white shadow-lg ${
//                 isDesign5 ? "bg-transparent" : "bg-[#3a3960]"
//               }`}
//               style={{
//                 backgroundColor: isDesign5 ? "transparent" : bg || "#fff",
//               }}
//             >
//               <div className="space-y-3 p-4 text-center items-center flex flex-col">
//                 {" "}
//                 <div className="flex justify-center items-center">
//                   {" "}
//                   <IconSearch
//                     value={card.icon}
//                     onChange={(v) => upd(i, "icon", v)}
//                     placeholder="Icon"
//                     isActive={isActive}
//                     textColor={isDesign5 ? "text-white" : "text-black"}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Inp
//                     value={card.heading}
//                     onChange={(v) => upd(i, "heading", v)}
//                     placeholder="Heading"
//                     ring={ring}
//                     className="px-3.5 py-2.5 font-semibold mt-5 text-center"
//                     textColor={isDesign5 ? "text-white" : "text-black"}
//                     isActive={isActive}
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   {getDescriptions(card).map(
//                     (description, descriptionIndex) => (
//                       <div
//                         key={description.id}
//                         className="flex items-center justify-center gap-2 w-full"
//                       >
//                         <Inp
//                           value={getTextValue(description)}
//                           onChange={(v) =>
//                             updateDescription(i, descriptionIndex, v)
//                           }
//                           placeholder={`Description ${descriptionIndex + 1}`}
//                           ring={ring}
//                           className="px-3.5 py-2.5 mt-2 text-sm text-center text-gray-600"
//                           textColor={isDesign5 ? "text-white" : "text-black"}
//                           isActive={isActive}
//                         />
//                         <PlusMinusRow
//                           onAdd={() => addDescription(i, descriptionIndex)}
//                           onRemove={() =>
//                             removeDescription(i, descriptionIndex)
//                           }
//                           canRemove={getDescriptions(card).length > 1}
//                           variant={variant}
//                         />
//                       </div>
//                     ),
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="absolute -bottom-10 right-2 flex gap-2  p-1 rounded-full">
//               <PlusMinusRow
//                 onAdd={() => add(i)}
//                 onRemove={() => remove(i)}
//                 canRemove={cards.length > 1}
//                 variant={variant}
//               />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const ParasEditor = ({
//   paras,
//   onChange,
//   className,
//   variant,
//   textColor,
//   isActive,
// }) => {
//   const upd = (i, v) => {
//     const p = [...paras];
//     p[i] = { ...p[i], value: v };
//     onChange(p);
//   };

//   const add = (index) => onChange(insertTextItemAfter(paras, index));

//   const remove = (i) => onChange(paras.filter((_, idx) => idx !== i));

//   return (
//     <div className="space-y-2">
//       {paras.map((p, i) => (
//         <div key={p.id} className="flex items-center gap-2">
//           <Inp
//             value={getTextValue(p)}
//             onChange={(v) => upd(i, v)}
//             placeholder={`Paragraph ${i + 1}`}
//             textColor={textColor}
//             className={className}
//             isActive={isActive}
//           />
//           <PlusMinusRow
//             onAdd={() => add(i)}
//             onRemove={() => remove(i)}
//             canRemove={paras.length > 1}
//             variant={variant}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// const D1 = ({ s, onChange, isActive }) => {
//   const u = (k, v) => onChange({ ...s, [k]: v });
//   return (
//     <div className="space-y-3">
//       <Inp
//         value={s.title}
//         onChange={(v) => u("title", v)}
//         placeholder="Title"
//         isActive={isActive}
//         className="font-semibold text-xl"
//         textColor="text-[#2B2A4C]"
//       />
//       <ParasEditor
//         paras={s.paras}
//         onChange={(v) => u("paras", v)}
//         isActive={isActive}
//         className="font-medium"
//       />
//     </div>
//   );
// };
// const D2 = ({ s, onChange, isActive }) => {
//   const u = (k, v) => onChange({ ...s, [k]: v });
//   const upd = (i, v) => {
//     const p = [...s.points];
//     p[i] = { ...p[i], value: v };
//     u("points", p);
//   };
//   const add = (index) => u("points", insertTextItemAfter(s.points, index));
//   const rem = (i) =>
//     u(
//       "points",
//       s.points.filter((_, idx) => idx !== i),
//     );
//   return (
//     <div className="space-y-3">
//       <Inp
//         value={s.title}
//         onChange={(v) => u("title", v)}
//         placeholder="Title"
//         isActive={isActive}
//         className="font-semibold text-xl"
//         textColor="text-[#2B2A4C]"
//       />
//       <div className="space-y-2">
//         {s.points.map((pt, i) => (
//           <div key={pt.id} className="flex items-center gap-2">
//             <div
//               className="flex items-center justify-center
//                   w-5 h-5 text-[11px]
//                   text-white bg-red-800
//                   rounded-full
//                   font-medium select-none"
//             >
//               {i + 1}
//             </div>
//             <Inp
//               value={getTextValue(pt)}
//               onChange={(v) => upd(i, v)}
//               placeholder={`Point ${i + 1}`}
//               isActive={isActive}
//               className="font-medium"
//             />
//             <PlusMinusRow
//               onAdd={() => add(i)}
//               onRemove={() => rem(i)}
//               canRemove={s.points.length > 1}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const D3 = ({ s, onChange, isActive }) => {
//   const u = (k, v) => onChange({ ...s, [k]: v });
//   return (
//     <div className="space-y-3">
//       <Inp
//         value={s.title}
//         onChange={(v) => u("title", v)}
//         placeholder="Title"
//         isActive={isActive}
//         className="font-semibold text-xl"
//         textColor="text-[#2B2A4C]"
//       />
//       <ParasEditor
//         paras={s.paras}
//         onChange={(v) => u("paras", v)}
//         isActive={isActive}
//         className="font-medium"
//       />
//       <CardsEditor
//         cards={s.cards}
//         onChange={(v) => u("cards", v)}
//         isActive={isActive}
//         className="bg-[#2B2A4C] text-white p-1.5 rounded-lg"
//       />
//     </div>
//   );
// };

// const D4 = ({ s, onChange, isActive }) => {
//   const u = (k, v) => onChange({ ...s, [k]: v });

//   return (
//     <div className="space-y-6 p-6 bg-[#2b2a4c] text-white border border-white">
//       <Inp
//         value={s.title}
//         onChange={(v) => u("title", v)}
//         placeholder="Section Title"
//         ring="focus:ring-indigo-400"
//         bg="#3a3960"
//         textColor="text-white"
//         className="py-3 border-white/10 font-semibold text-xl"
//         isActive={isActive}
//       />

//       <div className="">
//         <p className="text-xs uppercase tracking-widest text-gray-400"></p>
//         <ParasEditor
//           paras={s.paras}
//           onChange={(v) => u("paras", v)}
//           ring="focus:ring-indigo-400"
//           bg="#3a3960"
//           variant="design4"
//           isActive={isActive}
//           className="font-medium"
//         />
//       </div>
//       <div>
//         <CardsEditor
//           cards={s.cards}
//           onChange={(v) => u("cards", v)}
//           ring="focus:ring-indigo-400"
//           bg="#2b2a4c"
//           variant="design4"
//           isActive={isActive}
//         />
//       </div>

//       {/* CTA */}
//       <div className="flex justify-center pt-4">
//         <button className="bg-white text-[#2b2a4c] px-6 py-2 rounded-md font-medium hover:opacity-90 transition">
//           Book Your Free Demo Class Today
//         </button>
//       </div>
//     </div>
//   );
// };

// const D5 = ({ s, onChange, bgImage, isActive }) => {
//   const u = (k, v) => onChange({ ...s, [k]: v });

//   // const isParaLimit = s.paras.length >= 3;
//   // const isCardLimit = s.cards.length >= 4;

//   return (
//     <div className="relative w-full min-h-[400px] overflow-hidden border border-white">
//       <img
//         src={bgImage}
//         alt="bg"
//         className="absolute inset-0 w-full h-full object-cover"
//       />

//       <div className="absolute inset-0 bg-[#2B2A4C]/80"></div>

//       <div className="relative z-10 p-8 text-white space-y-6 text-center">
//         <Inp
//           value={s.title}
//           onChange={(v) => u("title", v)}
//           placeholder="Title"
//           ring="focus:ring-indigo-400"
//           bg="#3a3960"
//           textColor="text-white"
//           className="mt-10 text-center font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-white max-w-[900px]"
//           isActive={isActive}
//         />

//         <div className="max-w-3xl mx-auto space-y-2">
//           <ParasEditor
//             paras={s.paras}
//             onChange={(v) => u("paras", v.slice(0, 3))}
//             ring="focus:ring-indigo-400"
//             bg="#3a3960"
//             variant="design5"
//             textColor="text-white"
//             className="text-center text-lg max-w-2xl mx-auto font-medium"
//             isActive={isActive}
//           />
//         </div>

//         <div className="max-w-5xl mx-auto">
//           <CardsEditor
//             cards={s.cards}
//             onChange={(v) => u("cards", v.slice(0, 4))}
//             ring="focus:ring-indigo-400"
//             variant="design5"
//             isActive={isActive}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const D6 = ({ s, onChange, isActive }) => {
//   const u = (k, v) => onChange({ ...s, [k]: v });
//   const upd = (i, k, v) => {
//     const pts = [...s.points];
//     pts[i] = { ...pts[i], [k]: v };
//     u("points", pts);
//   };
//   const add = () =>
//     u("points", [
//       ...s.points,
//       { id: uid(), point: "", descriptions: [createTextItem("")], link: "" },
//     ]);
//   const updDesc = (i, di, v) => {
//     const pts = [...s.points];
//     pts[i].descriptions[di] = {
//       ...pts[i].descriptions[di],
//       value: v,
//     };
//     u("points", pts);
//   };

//   const addDesc = (i, di) => {
//     const pts = [...s.points];
//     pts[i].descriptions.splice(di + 1, 0, createTextItem(""));
//     u("points", pts);
//   };

//   const remDesc = (i, di) => {
//     const pts = [...s.points];
//     pts[i].descriptions = pts[i].descriptions.filter((_, idx) => idx !== di);
//     u("points", pts);
//   };
//   const rem = (i) =>
//     u(
//       "points",
//       s.points.filter((_, idx) => idx !== i),
//     );

//   const updPara = (i, v) => {
//     const newParas = [...s.para];
//     newParas[i] = { ...newParas[i], value: v };
//     u("para", newParas);
//   };

//   const addPara = (index) => {
//     u("para", insertTextItemAfter(s.para, index));
//   };

//   const remPara = (i) => {
//     u(
//       "para",
//       s.para.filter((_, idx) => idx !== i),
//     );
//   };
//   return (
//     <div className="space-y-3">
//       <Inp
//         value={s.title}
//         onChange={(v) => u("title", v)}
//         placeholder="Title"
//         isActive={isActive}
//         className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C]"
//       />
//       <div className="space-y-2">
//         <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400"></p>

//         {s.para.map((p, i) => (
//           <div key={p.id} className="flex items-center gap-2">
//             <span className="text-gray-300 text-sm select-none"></span>

//             <Inp
//               value={getTextValue(p)}
//               onChange={(v) => updPara(i, v)}
//               placeholder="Paragraph"
//               isActive={isActive}
//               className="mt-4 text-gray-600"
//             />

//             <PlusMinusRow
//               onAdd={() => addPara(i)}
//               onRemove={() => remPara(i)}
//               canRemove={s.para.length > 1}
//             />
//           </div>
//         ))}
//       </div>
//       <div>
//         <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2"></p>
//         <div className="space-y-2">
//           {s.points.map((pt, i) => (
//             <div
//               key={pt.id}
//               className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 space-y-2"
//             >
//               <div className="flex justify-between items-center">
//                 <span className="text-[11px] font-medium text-gray-400"></span>
//                 <PlusMinusRow
//                   onAdd={add}
//                   onRemove={() => rem(i)}
//                   canRemove={s.points.length > 1}
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Inp
//                   value={pt.point}
//                   onChange={(v) => upd(i, "point", v)}
//                   placeholder={`point ${i + 1}`}
//                   isActive={isActive}
//                   className="text-base md:text-lg font-semibold text-[#2B2A4C] group-hover:text-[#B31312] transition-colors"
//                 />
//                 <input
//                   type="text"
//                   value={pt.link}
//                   onChange={(e) => upd(i, "link", e.target.value)}
//                   placeholder="Link URL"
//                   className={`w-40 shrink-0 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 ${
//                     isActive
//                       ? "focus:border-b-gray-300"
//                       : "focus:border-b-transparent"
//                   }`}
//                 />
//               </div>
//               <div className="space-y-2">
//                 {pt.descriptions.map((desc, di) => (
//                   <div key={desc.id} className="flex items-center gap-2">
//                     <span className="text-gray-300 text-sm select-none"></span>
//                     <Inp
//                       value={getTextValue(desc)}
//                       onChange={(v) => updDesc(i, di, v)}
//                       placeholder="Description…"
//                       isActive={isActive}
//                       className="mt-1 text-gray-600 text-sm leading-relaxed"
//                     />

//                     <PlusMinusRow
//                       onAdd={() => addDesc(i, di)}
//                       onRemove={() => remDesc(i, di)}
//                       canRemove={pt.descriptions.length > 1}
//                       variant="design6"
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// const D7 = ({ s, onChange, isActive }) => {
//   const u = (key, value) => onChange({ ...s, [key]: value });

//   const updateFaq = (index, key, value) => {
//     const faqs = [...s.faqs];
//     faqs[index] = { ...faqs[index], [key]: value };
//     u("faqs", faqs);
//   };

//   const addFaq = (index) => {
//     const faqs = [...s.faqs];
//     faqs.splice(index + 1, 0, { id: uid(), question: "", answer: "" });
//     u("faqs", faqs);
//   };

//   const removeFaq = (index) => {
//     u(
//       "faqs",
//       s.faqs.filter((_, faqIndex) => faqIndex !== index),
//     );
//   };

//   return (
//     <div className="rounded-[15px] bg-[#f7f4fb] px-6 py-10 sm:px-8 lg:px-10">
//       <div className="mx-auto max-w-6xl">
//         {/* Heading */}
//         <div className="mx-auto max-w-4xl text-center">
//           <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl 2xl:text-4xl text-[#2B2A4C] text-center">
//             Frequently Asked Questions About IELTS Coaching in{" "}
//           </h2>
//           <p className="font-medium text-center mt-3">
//             Answers to the most common queries from students planning to
//             studying abroad.
//           </p>
//         </div>

//         {/* FAQ Full Width */}
//         <div className="mt-12">
//           <div className="space-y-6">
//             {s.faqs.map((faq, index) => (
//               <div key={faq.id}>
//                 <div className="relative rounded-xl border border-[#d6d9e4] bg-white mt-6 py-2 px-2 shadow-[0_0_0_1px_rgba(214,217,228,0.15)]">
//                   <div className="absolute top-2 right-2 flex gap-2">
//                     <PlusMinusRow
//                       onAdd={() => addFaq(index)}
//                       onRemove={() => removeFaq(index)}
//                       canRemove={s.faqs.length > 3 && index >= 3}
//                     />
//                   </div>
//                   <div className="flex items-center gap-2 pr-20">
//                     <Inp
//                       value={faq.question}
//                       onChange={(value) => updateFaq(index, "question", value)}
//                       placeholder={`FAQ Question ${index + 1}`}
//                       className="text-[13px] sm:text-[14px] font-bold text-black"
//                       isActive={isActive}
//                     />
//                   </div>
//                   <TextArea
//                     value={faq.answer}
//                     onChange={(value) => updateFaq(index, "answer", value)}
//                     placeholder="FAQ Answer"
//                     rows={1}
//                     className="text-[10px] sm:text-[14px] leading-2 text-[#556072]"
//                     isActive={isActive}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const D8 = ({ s, onChange, isActive }) => {
//   const u = (key, value) => onChange({ ...s, [key]: value });

//   return (
//     <div className="border border-[#d9ddea] bg-white px-6 py-8 shadow-sm sm:px-8">
//       <h2 className="text-center text-lg font-semibold text-[#2B2A4C] mb-6">
//         Additional Required Data (not to be displayed on the website)
//       </h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
//         <div>
//           <Inp
//             value={s.seoTitle}
//             onChange={(value) => u("seoTitle", value)}
//             placeholder="Enter Title"
//             isActive={isActive}
//           />
//         </div>
//         <div>
//           <Inp
//             value={s.description}
//             onChange={(value) => u("description", value)}
//             placeholder="Enter Description"
//             isActive={isActive}
//           />
//         </div>
//         <div>
//           <Inp
//             value={s.keywords}
//             onChange={(value) => u("keywords", value)}
//             placeholder="Enter Keywords"
//             isActive={isActive}
//           />
//         </div>
//         <div>
//           <Inp
//             value={s.examSlug}
//             onChange={(value) => u("examSlug", value)}
//             placeholder="Enter Exam Slug"
//             isActive={isActive}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// const EDITORS = {
//   design1: D1,
//   design4: D4,
//   design3: D3,
//   design5: D5,
//   design2: D2,
//   design6: D6,
//   design7: D7,
//   design8: D8,
// };
// const DESIGN_TYPES = Object.keys(EDITORS);

// const SectionCard = ({
//   s,
//   onDuplicate,
//   onRemove,
//   onUpdate,
//   isActive,
//   onClick,
// }) => {
//   const Editor = EDITORS[s.type];
//   const isDuplicateDisabled =
//     s.type === "design4" ||
//     s.type === "design5" ||
//     s.type === "design7" ||
//     s.type === "design8";

//   return (
//     <>
//       <div
//         onClick={onClick}
//         className={`rounded-md mb-4 mt-10 overflow-hidden transition-all duration-200
//   ${s.type === "design4" || s.type === "design5" || s.type === "design7" || s.type === "design8" ? "p-0" : "p-4"}
//   ${isActive ? "border border-gray-400" : "border border-transparent"}`}
//       >
//         <div className="p-0">
//           <Editor
//             s={s}
//             onChange={onUpdate}
//             isActive={isActive} // ✅ ADD THIS
//             bgImage={
//               s.type === "design5"
//                 ? "https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/5a41f99c-58b2-4772-65d1-9bb84487ab00/public"
//                 : null
//             }
//           />
//         </div>
//       </div>

//       {!isDuplicateDisabled && (
//         <div className="flex items-center gap-2 justify-end">
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               onDuplicate();
//             }}
//             className="p-2 bg-indigo-900 rounded-full text-white hover:scale-95 transition-all duration-300"
//           >
//             <FaPlus size={18} />
//           </button>
//           {!s.isInitial && (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onRemove();
//               }}
//               className="p-2 bg-indigo-900 rounded-full text-white hover:scale-95 transition-all duration-300"
//             >
//               <FaMinus size={18} />
//             </button>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// const ExamPageElementor = () => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
//   const [selectedExam, setSelectedExam] = useState(EXAM_KEYS[0]);
//   const [bannerTitle, setBannerTitle] = useState("");
//   const [bannerBgColor, setBannerBgColor] = useState("");
//   const [sections, setSections] = useState(() =>
//     DESIGN_TYPES.map((type) => createSection(type)),
//   );
//   const [submitting, setSubmitting] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [activeSection, setActiveSection] = useState(null);
//   const [tableInclude, setTableInclude] = useState(true);

//   useEffect(() => {
//     setSections((prev) => {
//       const existingTypes = new Set(prev.map((section) => section.type));
//       const missingSections = DESIGN_TYPES.filter(
//         (type) => !existingTypes.has(type),
//       ).map((type) => createSection(type));

//       return missingSections.length > 0 ? [...prev, ...missingSections] : prev;
//     });
//   }, []);

//   useEffect(() => {
//     const onResize = () => {
//       const m = window.innerWidth < 1024;
//       setIsMobile(m);
//       if (m) setIsSidebarOpen(false);
//     };
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const containerRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (containerRef.current && !containerRef.current.contains(e.target)) {
//         setActiveSection(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);
//   const duplicateSection = (id) =>
//     setSections((prev) => {
//       const index = prev.findIndex((section) => section.id === id);
//       if (index === -1) return prev;
//       if (
//         prev[index].type === "design4" ||
//         prev[index].type === "design5" ||
//         prev[index].type === "design7" ||
//         prev[index].type === "design8"
//       ) {
//         return prev;
//       }
//       const duplicatedSection = cloneSectionWithIds(prev[index]);
//       const next = [...prev];
//       next.splice(index + 1, 0, duplicatedSection);
//       return next;
//     });
//   const removeSection = (id) =>
//     setSections((prev) => prev.filter((section) => section.id !== id));
//   const updateSection = (id, updated) =>
//     setSections((p) => p.map((s) => (s.id === id ? updated : s)));

//   const buildPayload = () => ({
//     examKey: selectedExam,
//     bannerTitle,
//     bannerBgColor,
//     tableInclude,
//     sections: sections.map(cleanSection),
//   });
//   const lastDesign6Index = sections
//     .map((section, index) => (section.type === "design5" ? index : -1))
//     .filter((index) => index !== -1)
//     .pop();
//   // const livePayload = buildPayload();

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     setToast(null);
//     try {
//       const payload = buildPayload();
//       const res = await fetch(`/api/exam-page/${selectedExam}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       setToast({ type: "success", msg: "✅ Page saved successfully!" });
//     } catch (err) {
//       setToast({ type: "error", msg: `❌ Error: ${err.message}` });
//     } finally {
//       setSubmitting(false);
//       setTimeout(() => setToast(null), 4000);
//     }
//   };

//   return (
//     <div className="flex bg-[#F8F9FA] min-h-screen">
//       <Menubar
//         isOpen={isSidebarOpen}
//         setIsOpen={setIsSidebarOpen}
//         isMobile={isMobile}
//       />

//       <main
//         className={`p-5 lg:p-6 transition-all duration-500 w-full ${isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"}`}
//       >
//         <Outlet />
//         <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
//           <p className="font-bold text-xl text-gray-700 ml-10 lg:ml-0">
//             Exam Page Elementor
//           </p>
//           <div className="flex items-center gap-3">
//             {/* Exam selector */}
//             <select
//               value={selectedExam}
//               onChange={(e) => setSelectedExam(e.target.value)}
//               className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-medium"
//             >
//               {EXAM_KEYS.map((k) => (
//                 <option key={k} value={k}>
//                   {k.toUpperCase()}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={handleSubmit}
//               disabled={submitting}
//               className={`px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all shadow-sm
//                 ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
//             >
//               {submitting ? "Saving…" : "Save & Submit"}
//             </button>
//           </div>
//         </div>
//         {toast?.msg && (
//           <div
//             className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium
//     ${
//       toast?.type === "success"
//         ? "bg-green-100 text-green-800 border border-green-200"
//         : "bg-red-100 text-red-800 border border-red-200"
//     }`}
//           >
//             {toast.msg}
//           </div>
//         )}
//         <div
//           className="mx-5 min-h-[360px] rounded-[28px] px-6 py-14 sm:px-10 lg:px-16 lg:py-20"
//           style={{ backgroundColor: bannerBgColor || "#d8efff" }}
//         >
//           <div className="mx-auto flex max-w-6xl flex-col items-start">
//             <input
//               type="text"
//               value={bannerTitle}
//               onChange={(e) => setBannerTitle(e.target.value)}
//               placeholder="Enter Banner title"
//               className="w-full bg-transparent text-[34px] font-extrabold leading-tight tracking-tight text-[#2B2A4C] placeholder:text-[#2B2A4C]/50 focus:outline-none sm:text-[46px] lg:text-[64px]"
//             />
//             <div className="flex items-center gap-2 max-w-md">
//               <input
//                 type="color"
//                 value={bannerBgColor || "#ffffff"}
//                 onChange={(e) => setBannerBgColor(e.target.value)}
//                 className="w-12 h-12 p-1 rounded-md border border-gray-200 cursor-pointer"
//               />

//               <input
//                 type="text"
//                 value={bannerBgColor}
//                 onChange={(e) => setBannerBgColor(e.target.value)}
//                 placeholder="Enter color #fffff"
//                 className="flex-1 rounded-lg bg-transparent px-4 py-3 text-sm font-semibold text-[#2B2A4C] focus:outline-none focus:ring focus:ring-gray-300"
//               />
//             </div>
//           </div>
//         </div>
//         <div ref={containerRef}>
//           {sections.map((s, index) => (
//             <React.Fragment key={s.id}>
//               {s.type === "design8" && (
//                 <div className="mx-1 mt-12 border-t border-gray-300" />
//               )}
//               <SectionCard
//                 s={s}
//                 onDuplicate={() => duplicateSection(s.id)}
//                 onRemove={() => removeSection(s.id)}
//                 onUpdate={(updated) => updateSection(s.id, updated)}
//                 isActive={activeSection === s.id}
//                 onClick={() => setActiveSection(s.id)}
//               />
//               {index === lastDesign6Index && (
//                 <div className="mt-5 flex justify-end">
//                   <label className="inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-lg font-medium text-gray-700 shadow-sm">
//                     <input
//                       type="checkbox"
//                       checked={tableInclude}
//                       onChange={(e) => setTableInclude(e.target.checked)}
//                       className="h-5 w-5 accent-indigo-900"
//                     />
//                     <span>Include Table</span>
//                   </label>
//                 </div>
//               )}
//             </React.Fragment>
//           ))}
//         </div>

//         {/* <div className="mx-5 mt-8 mb-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
//           <div className="mb-3">
//             <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
//               Live Payload
//             </p>
//             <p className="mt-1 text-sm text-gray-500">
//               This updates automatically from the current banner and all designs.
//             </p>
//           </div>
//           <pre className="max-h-[500px] overflow-auto rounded-xl bg-gray-900 p-4 text-xs leading-6 text-green-200">
//             {JSON.stringify(livePayload, null, 2)}
//           </pre>
//         </div> */}
//       </main>
//     </div>
//   );
// };

// export default ExamPageElementor;

// // import React, { useState, useEffect } from "react";
// // import Menubar from "../Menubar/Menubar";
// // import { Outlet } from "react-router-dom";
// // import "../Dashboard/Dashboard.css";

// // const ExamPageElementor = () => {
// //   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

// //   useEffect(() => {
// //     const handleResize = () => {
// //       const mobile = window.innerWidth < 1024;
// //       setIsMobile(mobile);

// //       if (mobile) {
// //         setIsSidebarOpen(false);
// //       }
// //     };

// //     window.addEventListener("resize", handleResize);
// //     return () => window.removeEventListener("resize", handleResize);
// //   }, []);

// //   return (
// //     <div className="flex bg-[#F8F9FA]">
// //       <Menubar
// //         isOpen={isSidebarOpen}
// //         setIsOpen={setIsSidebarOpen}
// //         isMobile={isMobile}
// //       />

// //       <main
// //         className={`p-5 lg:p-6 transition-all duration-500 w-full ${
// //           isMobile ? "ml-0" : isSidebarOpen ? "ml-64" : "ml-16"
// //         }`}
// //       >
// //         <Outlet />

// //         {/* Header */}
// //         <div className="flex justify-between gap-5 items-start lg:items-center">
// //           <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">
// //             <p className="font-semibold text-xl text-gray-700 ml-10 lg:ml-0">
// //               Exam Page Elementor
// //             </p>
// //           </div>
// //         </div>

// //         {/* Content */}
// //         <div className="mt-5">
// //           <div></div>
// //         </div>
// //       </main>
// //     </div>
// //   );
// // };

// // export default ExamPageElementor;
