// import React, { useState } from "react";
// import Carousel from "react-multi-carousel";
// import "react-multi-carousel/lib/styles.css";

// const BannerElementor = () => {
//   const [banners, setBanners] = useState([]);
//   const [selectedLayout, setSelectedLayout] = useState(null);
//   const [showFormPopup, setShowFormPopup] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(null);

//   const [form, setForm] = useState({});

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });
//   };

//   const handleImage = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setForm({ ...form, image: URL.createObjectURL(file) });
//     }
//   };

//   const handleSave = () => {
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

//   const responsive = {
//     all: {
//       breakpoint: { max: 4000, min: 0 },
//       items: 1,
//     },
//   };

//   // 🔥 MAIN RENDERER (with skeletons)
//   const renderLayout = (layout, data) => {
//     const isEmpty = !data;

//     // =======================
//     // LAYOUT 1 (Full Image)
//     // =======================
//     if (layout === "layout1") {
//       return isEmpty ? (
//         <div className="h-[250px] bg-gray-200 animate-pulse rounded-lg" />
//       ) : (
//         <div className="relative h-[250px]">
//           <img
//             src={data.image}
//             alt=""
//             className="w-full h-full object-cover rounded-lg"
//           />
//         </div>
//       );
//     }

//     // =======================
//     // LAYOUT 2 (Text + Image + Bottom Text)
//     // =======================
//     if (layout === "layout2") {
//       return isEmpty ? (
//         <div className="p-4 space-y-3 animate-pulse">
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-2">
//               <div className="h-4 bg-gray-300 rounded" />
//               <div className="h-4 bg-gray-300 rounded w-3/4" />
//             </div>
//             <div className="h-16 bg-gray-300 rounded" />
//           </div>
//           <div className="h-4 bg-gray-300 rounded" />
//         </div>
//       ) : (
//         <div className="p-4">
//           <div className="grid md:grid-cols-2 gap-4 items-center">
//             <div>
//               <h1 className="text-xl font-bold">{data.heading}</h1>
//               <p>{data.subheading}</p>
//             </div>
//             <img src={data.image} alt="" className="rounded-lg" />
//           </div>
//           <div className="mt-3 text-center">
//             <p>{data.description}</p>
//           </div>
//         </div>
//       );
//     }

//     // =======================
//     // LAYOUT 3 (Image Left, Text Right CTA)
//     // =======================
//     if (layout === "layout3") {
//       return isEmpty ? (
//         <div className="grid grid-cols-2 gap-3 p-4 animate-pulse">
//           <div className="h-20 bg-gray-300 rounded" />
//           <div className="space-y-2">
//             <div className="h-4 bg-gray-300 rounded" />
//             <div className="h-4 bg-gray-300 rounded w-3/4" />
//             <div className="h-6 bg-gray-300 rounded w-1/2" />
//           </div>
//         </div>
//       ) : (
//         <div className="grid md:grid-cols-2 gap-4 p-4 items-center">
//           <img src={data.image} alt="" className="rounded-lg" />
//           <div>
//             <h1 className="text-xl font-bold">{data.heading}</h1>
//             <p className="mt-2">{data.description}</p>
//             <button className="mt-3 bg-black text-white px-3 py-1 rounded">
//               {data.buttonText}
//             </button>
//           </div>
//         </div>
//       );
//     }

//     // =======================
//     // LAYOUT 4 (Centered CTA)
//     // =======================
//     if (layout === "layout4") {
//       return isEmpty ? (
//         <div className="p-6 text-center space-y-3 animate-pulse">
//           <div className="h-5 bg-gray-300 rounded w-1/2 mx-auto" />
//           <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto" />
//           <div className="h-6 bg-gray-300 rounded w-1/3 mx-auto" />
//         </div>
//       ) : (
//         <div className="p-6 text-center bg-gray-100 rounded-lg">
//           <h1 className="text-xl font-bold">{data.heading}</h1>
//           <p className="mt-2">{data.description}</p>
//           <button className="mt-3 bg-black text-white px-3 py-1 rounded">
//             {data.buttonText}
//           </button>
//         </div>
//       );
//     }
//   };

//   const slots = [...banners];
//   while (slots.length < 5) slots.push(null);

//   return (
//     <div className="p-6">
//       <Carousel responsive={responsive} arrows>
//         {slots.map((banner, index) => (
//           <div key={index} className="p-2">
//             {banner ? (
//               <div
//                 onClick={() => {
//                   setActiveIndex(index);
//                   setSelectedLayout(banner.layout);
//                   setForm(banner.data);
//                   setShowFormPopup(true);
//                 }}
//                 className="cursor-pointer border rounded-lg overflow-hidden"
//               >
//                 {renderLayout(banner.layout, banner.data)}
//               </div>
//             ) : (
//               <div className="h-[250px] border-2 border-dashed rounded-lg p-2 grid grid-cols-2 gap-2">
//                 {["layout1", "layout2", "layout3", "layout4"].map((layout) => (
//                   <div
//                     key={layout}
//                     onClick={() => {
//                       setActiveIndex(index);
//                       setSelectedLayout(layout);
//                       setForm({});
//                       setShowFormPopup(true);
//                     }}
//                     className="border rounded cursor-pointer hover:bg-gray-100 flex items-center justify-center"
//                   >
//                     {renderLayout(layout, null)}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         ))}
//       </Carousel>

//       {/* FORM POPUP */}
//       {showFormPopup && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//           <div className="bg-white p-6 rounded-xl w-[400px]">
//             <h2 className="mb-4 font-bold">Fill Banner Data</h2>

//             <input
//               name="heading"
//               placeholder="Heading"
//               onChange={handleChange}
//               value={form.heading || ""}
//               className="border p-2 w-full mb-2"
//             />

//             <textarea
//               name="description"
//               placeholder="Description"
//               onChange={handleChange}
//               value={form.description || ""}
//               className="border p-2 w-full mb-2"
//             />

//             <input
//               name="buttonText"
//               placeholder="Button Text"
//               onChange={handleChange}
//               value={form.buttonText || ""}
//               className="border p-2 w-full mb-2"
//             />

//             <input type="file" onChange={handleImage} className="mb-3" />

//             {form.image && (
//               <img
//                 src={form.image}
//                 alt=""
//                 className="w-full h-32 object-cover mb-3 rounded"
//               />
//             )}

//             <div className="flex gap-2">
//               <button
//                 onClick={handleSave}
//                 className="bg-black text-white px-4 py-2 rounded"
//               >
//                 Save
//               </button>
//               <button
//                 onClick={() => setShowFormPopup(false)}
//                 className="border px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BannerElementor;

import React, { useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

const BannerElementor = () => {
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

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: URL.createObjectURL(file) });
    }
  };

  const handleSave = () => {
    const updated = [...banners];

    updated[activeIndex] = {
      id: Date.now(),
      layout: selectedLayout,
      data: form,
    };

    setBanners(updated);

    setForm({});
    setSelectedLayout(null);
    setActiveIndex(null);
    setShowFormPopup(false);
  };

  const responsive = {
    all: {
      breakpoint: { max: 4000, min: 0 },
      items: 1,
    },
  };

  // 🔥 Layout Renderer
  const renderLayout = (banner) => {
    if (!banner) return null;

    const { layout, data } = banner;

    if (layout === "layout1") {
      return (
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div>
              <h1 className="text-2xl font-bold">{data.heading}</h1>
              <p>{data.subheading}</p>
            </div>
            <img src={data.image} alt="" className="w-full rounded-lg" />
          </div>
          <div className="mt-4 text-center">
            <p>{data.description}</p>
          </div>
        </div>
      );
    }

    if (layout === "layout2") {
      return (
        <div className="relative h-[300px]">
          <img src={data.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
            <h1 className="text-2xl font-bold">{data.heading}</h1>
            <p>{data.subheading}</p>
          </div>
        </div>
      );
    }

    if (layout === "layout3") {
      return (
        <div className="grid md:grid-cols-2 gap-6 p-6 items-center">
          {/* Image LEFT */}
          <img
            src={data.image}
            alt=""
            className="rounded-lg h-[200px] w-full object-cover"
          />

          {/* Text RIGHT */}
          <div>
            <h1 className="text-2xl font-bold">{data.heading}</h1>
            <p className="mt-2 text-gray-600">{data.description}</p>
            <button className="mt-4 bg-black text-white px-4 py-2 rounded">
              {data.buttonText}
            </button>
          </div>
        </div>
      );
    }

    if (layout === "layout4") {
      return (
        <div className="relative h-[250px] rounded-lg overflow-hidden">
          {/* Background Image */}
          <img src={data.image} alt="" className="w-full h-full object-cover" />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
            <h1 className="text-2xl font-bold">{data.heading}</h1>
            <p className="mt-2">{data.description}</p>
            <button className="mt-4 bg-white text-black px-4 py-2 rounded">
              {data.buttonText}
            </button>
          </div>
        </div>
      );
    }
  };

  // Always 5 slots
  const slots = [...banners];
  while (slots.length < 5) slots.push(null);

  const renderLayoutPreview = (layout) => {
    // small skeleton blocks
    const box = "bg-gray-300 rounded";
    const line = "h-2 bg-gray-300 rounded";

    // =====================
    // LAYOUT 1 (Full Image)
    // =====================
    if (layout === "layout1") {
      return <div className={`w-full h-full ${box}`} />;
    }

    // =====================
    // LAYOUT 2 (Text + Img + Bottom)
    // =====================
    if (layout === "layout2") {
      return (
        <div className="w-full h-full p-2 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <div className={line} />
              <div className={`${line} w-3/4`} />
            </div>
            <div className={`h-6 ${box}`} />
          </div>
          <div className={line} />
        </div>
      );
    }

    // =====================
    // LAYOUT 3 (Image Left, Text Right)
    // =====================
    if (layout === "layout3") {
      return (
        <div className="grid grid-cols-2 gap-2 p-2 h-full bg-red-700">
          {/* Left Image */}
          <div className={`${box} h-full`} />

          {/* Right Content */}
          <div className="flex flex-col justify-center gap-2 h-full bg-sky-500">
            <div className={`${line} h-2`} />
            <div className={`${line} w-3/4 h-2`} />
            <div className={`${box} h-4 w-1/2`} />
          </div>
        </div>
      );
    }
    // =====================
    // LAYOUT 4 (Centered CTA Overlay)
    // =====================
    if (layout === "layout4") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
          <div className={`${line} w-1/2`} />
          <div className={`${line} w-3/4`} />
          <div className={`h-3 ${box} w-1/3`} />
        </div>
      );
    }
  };

  return (
    <div className="p-6">
      <Carousel responsive={responsive} arrows infinite={false}>
        {slots.map((banner, index) => (
          <div key={index} className="p-2">
            {banner ? (
              <div
                onClick={() => {
                  setActiveIndex(index);
                  setSelectedLayout(banner.layout);
                  setForm(banner.data);
                  setShowFormPopup(true);
                }}
                className="cursor-pointer border rounded-lg overflow-hidden"
              >
                {renderLayout(banner)}
              </div>
            ) : (
              // 🔥 EMPTY SLOT → SHOW 2x2 GRID
              <div className="h-[250px] border-2 border-dashed rounded-lg p-3 grid grid-cols-2 gap-3">
                {["layout1", "layout2", "layout3", "layout4"].map((layout) => (
                  <div
                    key={layout}
                    onClick={() => {
                      setActiveIndex(index);
                      setSelectedLayout(layout);
                      setForm({});
                      setShowFormPopup(true);
                    }}
                    className="flex items-center justify-center border rounded cursor-pointer hover:bg-gray-100 text-xs text-center"
                  >
                    {renderLayoutPreview(layout)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </Carousel>

      {/* 🧾 SINGLE POPUP */}
      {showFormPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px]">
            <h2 className="mb-4 font-bold">Fill Banner Data</h2>

            {/* Layout 1 */}
            {selectedLayout === "layout1" && (
              <>
                <input
                  name="heading"
                  placeholder="Heading"
                  onChange={handleChange}
                  value={form.heading || ""}
                  className="border p-2 w-full mb-2"
                />
                <input
                  name="subheading"
                  placeholder="Subheading"
                  onChange={handleChange}
                  value={form.subheading || ""}
                  className="border p-2 w-full mb-2"
                />
                <textarea
                  name="description"
                  placeholder="Bottom Text"
                  onChange={handleChange}
                  value={form.description || ""}
                  className="border p-2 w-full mb-2"
                />
              </>
            )}

            {/* Layout 2 */}
            {selectedLayout === "layout2" && (
              <>
                <input
                  name="heading"
                  placeholder="Heading"
                  onChange={handleChange}
                  value={form.heading || ""}
                  className="border p-2 w-full mb-2"
                />
                <input
                  name="subheading"
                  placeholder="Subheading"
                  onChange={handleChange}
                  value={form.subheading || ""}
                  className="border p-2 w-full mb-2"
                />
              </>
            )}

            {/* Layout 3 */}
            {selectedLayout === "layout3" && (
              <>
                <input
                  name="heading"
                  placeholder="Heading"
                  onChange={handleChange}
                  value={form.heading || ""}
                  className="border p-2 w-full mb-2"
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  onChange={handleChange}
                  value={form.description || ""}
                  className="border p-2 w-full mb-2"
                />
                <input
                  name="buttonText"
                  placeholder="Button Text"
                  onChange={handleChange}
                  value={form.buttonText || ""}
                  className="border p-2 w-full mb-2"
                />
              </>
            )}

            {/* Layout 4 */}
            {selectedLayout === "layout4" && (
              <>
                <input
                  name="heading"
                  placeholder="Main Heading"
                  onChange={handleChange}
                  value={form.heading || ""}
                  className="border p-2 w-full mb-2"
                />
                <textarea
                  name="description"
                  placeholder="Short Tagline"
                  onChange={handleChange}
                  value={form.description || ""}
                  className="border p-2 w-full mb-2"
                />
                <input
                  name="buttonText"
                  placeholder="CTA Text (e.g. Shop Now)"
                  onChange={handleChange}
                  value={form.buttonText || ""}
                  className="border p-2 w-full mb-2"
                />
              </>
            )}

            <input type="file" onChange={handleImage} className="mb-3" />

            {form.image && (
              <img
                src={form.image}
                alt=""
                className="w-full h-32 object-cover mb-3 rounded"
              />
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowFormPopup(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerElementor;
