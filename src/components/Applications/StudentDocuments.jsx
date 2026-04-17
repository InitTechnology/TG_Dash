import React, { useEffect, useState } from "react";
import Menubar from "../Menubar/Menubar";
import { Outlet } from "react-router-dom";
import { BiSolidLock } from "react-icons/bi";
import { GiPassport } from "react-icons/gi";
import { MdEditDocument } from "react-icons/md";
import { PiUploadSimpleBold } from "react-icons/pi";
import { X } from "lucide-react";

const StudentDocuments = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem("menubarOpen");
    return savedState !== null
      ? JSON.parse(savedState)
      : window.innerWidth >= 1024;
  });

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    const validFiles = files.filter((file) => file.type === "image/webp");

    if (validFiles.length !== files.length) {
      alert("Only .webp images are allowed");
    }

    const totalFiles = [...uploadedFiles, ...validFiles].slice(0, 5);

    if (uploadedFiles.length + validFiles.length > 5) {
      alert("Maximum 5 files allowed");
    }

    setUploadedFiles(totalFiles);
  };

  const DocumentCard = ({ title, icon, required = true, children }) => (
    <div
      onClick={() => {
        setSelectedDoc(title);
        setUploadedFiles([]);
      }}
      className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32 cursor-pointer"
    >
      {required && (
        <div className="absolute right-3 top-3">
          <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
            Required
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 text-indigo-900 font-medium">
        <div>{icon}</div>
        <p className="text-black">{title}</p>
      </div>

      <div className="mb-5">{children}</div>

      <div className="absolute left-4 bottom-3">
        <p className="text-[10px] text-gray-400">• Click to select & upload</p>
      </div>
    </div>
  );

  const removeFile = (indexToRemove) => {
    setUploadedFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
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

        {/* HEADER */}

        <div className="flex flex-col justify-between items-end gap-5 -mt-1.5">
          <div className="lg:hidden">
            <div className="flex gap-2 items-center pl-10 lg:pl-0">
              <div>
                {/* <button className="w-28 px-3 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
                <span className="flex items-center justify-center gap-1">
                  Unlock <BiSolidLockOpen />
                </span>
              </button> */}

                <button className="w-28 px-3 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
                  <span className="flex items-center justify-center gap-1">
                    Lock <BiSolidLock />
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap w-full gap-5 items-center justify-between bg-indigo-50 border border-indigo-200 py-2 px-4 rounded-lg">
            <div>
              <p className="font-semibold text-lg sm:text-xl text-indigo-900">
                Ashish Verma's Documents
              </p>
              <p className="text-xs text-gray-500">Master</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col justify-center items-center text-center">
                <p className="font-semibold">9</p>
                <p className="text-[10px] text-gray-500">Uploaded</p>
              </div>

              <div className="flex flex-col justify-center items-center text-center">
                <p className="text-green-600 font-semibold">7</p>
                <p className="text-[10px] text-gray-500">Verified</p>
              </div>

              <div className="flex flex-col justify-center items-center text-center">
                <p className="text-orange-400 font-semibold">2</p>
                <p className="text-[10px] text-gray-500">Review</p>
              </div>

              <div className="hidden lg:block ml-2">
                {/* <button className="w-28 px-3 py-2 bg-gray-800 rounded-lg text-center text-sm text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700">
                  <span className="flex items-center justify-center gap-1">
                    Unlock <BiSolidLockOpen />
                  </span>
                </button> */}

                <button className="w-28 px-3 py-2 bg-indigo-900 rounded-lg text-center text-sm text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700">
                  <span className="flex items-center justify-center gap-1">
                    Lock <BiSolidLock />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DOCUMENT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mt-8">
          <DocumentCard title="Passport" icon={<GiPassport size={30} />} />

          <DocumentCard
            title="Academic Transcripts"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="Statement of Purpose"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="Letter of Recommendation"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="Evidence of Funds"
            icon={<MdEditDocument size={30} />}
          />

          <DocumentCard
            title="GMAT / GRE Scores"
            icon={<MdEditDocument size={30} />}
            required={false}
          >
            <div className="text-xs mt-3 space-y-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> GMAT
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> GRE
              </label>
            </div>
          </DocumentCard>

          <DocumentCard
            title="CV / RESUME / ESSAY"
            icon={<MdEditDocument size={30} />}
          >
            <div className="text-xs mt-3 space-y-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> CV
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> RESUME
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> ESSAY
              </label>
            </div>
          </DocumentCard>

          <DocumentCard
            title="English Proficiency"
            icon={<MdEditDocument size={30} />}
          >
            <div className="text-xs mt-3 space-y-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> TOEFL
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> IELTS
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> PTE
              </label>
            </div>
          </DocumentCard>

          <DocumentCard
            title="ACT / SAT / LSAT"
            icon={<MdEditDocument size={30} />}
          >
            <div className="text-xs mt-3 space-y-1">
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> ACT
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> SAT
              </label>
              <label className="flex items-center gap-1">
                <input type="checkbox" className="scale-90" /> LSAT
              </label>
            </div>
          </DocumentCard>
        </div>

        {/* UPLOAD SECTION */}
        {selectedDoc && (
          <div
            className={`fixed bottom-4 transition-all duration-500 ${
              isSidebarOpen
                ? "w-[89%] sm:w-[95%] lg:left-72 lg:w-[calc(100%-19.5rem)]"
                : "w-[89%] sm:w-[95%] lg:left-24 lg:w-[calc(100%-7.5rem)]"
            }`}
          >
            <div className="absolute -top-3 -right-3">
              <X
                size={25}
                onClick={() => {
                  setSelectedDoc(null);
                  setUploadedFiles([]);
                }}
                className="text-indigo-500 hover:text-black bg-white border hover:border-2 border-indigo-300 rounded-full p-1 hover:p-0.5 cursor-pointer"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3 justify-between items-start border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-3 rounded-lg">
              <div>
                <p className="font-medium">Upload: {selectedDoc}</p>

                {uploadedFiles.length > 0 ? (
                  <div className="text-sm text-gray-500 mt-1">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-1 rounded mt-1"
                      >
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gray-500 hover:text-red-600 text-xs font-semibold"
                        >
                          <X size={13} />
                        </button>

                        <p className="text-xs truncate max-w-[180px]">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    No file(s) selected
                  </p>
                )}
              </div>

              <label className="flex gap-1 items-center px-3 py-2 bg-indigo-800 rounded-lg text-white cursor-pointer hover:scale-95 transition-all text-sm">
                Upload File
                <PiUploadSimpleBold size={16} />
                <input
                  type="file"
                  accept="image/webp"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDocuments;

// import React, { useEffect, useState } from "react";
// import Menubar from "../Menubar/Menubar";
// import { Outlet } from "react-router-dom";
// // import { BiSolidLockOpen } from "react-icons/bi";
// import { BiSolidLock } from "react-icons/bi";
// import { GiPassport } from "react-icons/gi";
// import { MdEditDocument } from "react-icons/md";
// import { PiUploadSimpleBold } from "react-icons/pi";

// const StudentDocuments = () => {
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
//   // const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
//     const savedState = localStorage.getItem("menubarOpen");

//     if (savedState !== null) {
//       return JSON.parse(savedState);
//     }

//     return window.innerWidth >= 1024;
//   });

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
//         <div className="flex flex-col justify-between items-end gap-5 -mt-1.5">
//           <div className="lg:hidden">
//             <div className="flex gap-2 items-center pl-10 lg:pl-0">
//               <div>
//                 {/* <button className="w-28 px-3 py-2 bg-gray-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                 <span className="flex items-center justify-center gap-1">
//                   Unlock <BiSolidLockOpen />
//                 </span>
//               </button> */}

//                 <button className="w-28 px-3 py-2 bg-indigo-900 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                   <span className="flex items-center justify-center gap-1">
//                     Lock <BiSolidLock />
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="flex flex-wrap w-full gap-5 items-center justify-between bg-indigo-50 border border-indigo-200 py-2 px-4 rounded-lg">
//             <div>
//               <p className="font-semibold text-lg sm:text-xl text-indigo-900">
//                 Ashish Verma's Documents
//               </p>
//               <p className="text-xs text-gray-500">Master</p>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="flex flex-col justify-center items-center text-center">
//                 <p className="font-semibold">9</p>
//                 <p className="text-[10px] text-gray-500">Uploaded</p>
//               </div>

//               <div className="flex flex-col justify-center items-center text-center">
//                 <p className="text-green-600 font-semibold">7</p>
//                 <p className="text-[10px] text-gray-500">Verified</p>
//               </div>

//               <div className="flex flex-col justify-center items-center text-center">
//                 <p className="text-orange-400 font-semibold">2</p>
//                 <p className="text-[10px] text-gray-500">Review</p>
//               </div>

//               <div className="hidden lg:block ml-2">
//                 {/* <button className="w-28 px-3 py-2 bg-gray-800 rounded-lg text-center text-sm text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-gray-700 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700">
//                   <span className="flex items-center justify-center gap-1">
//                     Unlock <BiSolidLockOpen />
//                   </span>
//                 </button> */}

//                 <button className="w-28 px-3 py-2 bg-indigo-900 rounded-lg text-center text-sm text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700">
//                   <span className="flex items-center justify-center gap-1">
//                     Lock <BiSolidLock />
//                   </span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 mt-8">
//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <GiPassport size={30} />
//                 </div>
//                 <p className="text-black">PASSPORT</p>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">Academic Transcripts</p>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">Statement of Purpose</p>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">Letter of Recommendation</p>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">Evidence of Funds</p>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               {/* <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div> */}

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">GMAT / GRE Scores</p>
//               </div>

//               <div className="text-xs space-y-1 mt-3 mb-6">
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>GMAT</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>GRE</p>
//                 </div>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">CV / RESUME / ESSAY</p>
//               </div>

//               <div className="text-xs space-y-1 mt-3 mb-6">
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>CV</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>RESUME</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>ESSAY</p>
//                 </div>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">
//                   English Proficiency <br /> (TOEFL / IELTS / PTE)
//                 </p>
//               </div>

//               <div className="text-xs space-y-1 mt-3 mb-6">
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>TOEFL</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>IELTS</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>PTE</p>
//                 </div>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>

//             <div className="relative border border-gray-200 p-5 rounded-xl hover:border-indigo-300 min-h-32">
//               <div className="absolute right-3 top-3">
//                 <p className="bg-indigo-100 text-[10px] py-0.5 px-1 rounded text-indigo-900 font-medium">
//                   Required
//                 </p>
//               </div>

//               <div className="flex flex-col gap-2 text-indigo-900 font-medium">
//                 <div>
//                   <MdEditDocument size={30} />
//                 </div>
//                 <p className="text-black">ACT / SAT / LSAT Scores</p>
//               </div>

//               <div className="text-xs space-y-1 mt-3 mb-6">
//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>ACT</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>SAT</p>
//                 </div>

//                 <div className="flex items-center gap-1">
//                   <input type="checkbox" name="" id="" className="scale-90" />
//                   <p>LSAT</p>
//                 </div>
//               </div>

//               <div className="absolute left-4 bottom-3">
//                 <p className="text-[10px] text-gray-400 font-normal">
//                   • Click to select & upload
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="upload_design">
//             <div className="flex flex-col md:flex-row justify-between items-center border-2 border-dashed border-indigo-200 bg-indigo-50 px-4 py-2 rounded-lg">
//               <div>
//                 <p className="font-medium">Upload: Passport</p>
//                 <p className="text-sm text-gray-500 mt-1">example_file_name</p>
//               </div>

//               <button className="flex gap-1 items-center px-3 py-2 bg-indigo-800 rounded-lg text-center text-white relative hover:scale-95 after:-z-20 after:absolute after:h-1 after:w-1 after:bg-indigo-900 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 text-sm">
//                 <span className="font-medium">Upload File</span>
//                 <PiUploadSimpleBold size={16} />
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default StudentDocuments;
