import {
  FaHome,
  FaBook,
  // FaBuilding,
  // FaUsers,
  // FaCalendarAlt,
  // FaUserTie,
  // FaMoneyCheckAlt,
  // FaCommentDots,
  // FaTags,
  FaBars,
  // FaTasks,
} from "react-icons/fa";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { HiMiniBuildingLibrary } from "react-icons/hi2";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaUserTie } from "react-icons/fa";
import { BsCalendar2EventFill } from "react-icons/bs";
import { CgTemplate } from "react-icons/cg";
import { useEffect } from "react";
// import { HiDocumentCheck } from "react-icons/hi2";

const Menubar = ({ isOpen, setIsOpen, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    localStorage.setItem("menubarOpen", JSON.stringify(isOpen));
  }, [isOpen]);

  // const menuItems = [
  //   { icon: <FaHome />, text: "Dashboard", to: "/Dashboard" },
  //   { icon: <FaBook />, text: "Bookings", to: "/Bookings" },
  //   { icon: <FaBuilding />, text: "Properties", to: "/Properties" },
  //   { icon: <FaUsers />, text: "Guests Records", to: "/GuestRecords" },
  //   { icon: <FaCalendarAlt />, text: "Calendar", to: "/Calendar" },
  //   { icon: <FaUserTie />, text: "Staff Management", to: "/StaffManagement" },
  //   {
  //     icon: <FaMoneyCheckAlt />,
  //     text: "Payments & Invoicing",
  //     to: "/Payments",
  //   },
  //   { icon: <FaCommentDots />, text: "Reviews & Feedback", to: "/Reviews" },
  //   { icon: <FaTasks />, text: "Kanban Board", to: "/KanbanBoard" },
  //   { icon: <FaTags />, text: "Discounts", to: "/Discounts" },
  //   { icon: <RiLogoutCircleRLine />, text: "Logout", action: handleLogout },
  // ];
  const allMenuItems = [
    { icon: <FaHome />, text: "Dashboard", to: "/Dashboard" },
    {
      icon: <FaBook />,
      text: "Consultations",
      to: "/StudentConsultations",
    },
    {
      icon: <BsCalendar2EventFill />,
      text: "Events",
      to: "/Events",
    },
    {
      icon: <HiMiniBuildingLibrary />,
      text: "Universities",
      to: "/Universities",
    },
    // {
    //   icon: <HiDocumentCheck />,
    //   text: "Document\u00A0Evaluator",
    //   to: "/StudentDocument",
    // },
    {
      icon: <FaUserTie />,
      text: "User\u00A0Management",
      to: "/UserManagement",
    },
    {
      icon: <CgTemplate />,
      text: "Banner\u00A0Elementor",
      to: "/BannerElementor",
    },
    { icon: <RiLogoutCircleRLine />, text: "Logout", action: handleLogout },
  ];
  // Filter menu items based on user role
  const getFilteredMenuItems = () => {
    if (!user) return allMenuItems;

    const userRole = user.role;

    // For Content Manager, only show Events and BannerElementor + Logout
    if (userRole === "Content Manager") {
      return allMenuItems.filter(
        (item) =>
          item.text === "Events" ||
          item.text === "Banner\u00A0Elementor" ||
          item.text === "Logout",
      );
    }

    // For other roles, show all menu items
    return allMenuItems;
  };

  const menuItems = getFilteredMenuItems();

  const handleItemClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`h-screen bg-[#2B2A4C] text-white p-4 transition-all duration-500 fixed top-0 left-0 z-50
        ${isOpen ? (isMobile ? "w-64" : "md:w-64") : "w-[68px]"}
        ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}
      `}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`text-white bg-[#2B2A4C] p-2 mb-8 rounded
                      ${
                        isMobile
                          ? isOpen
                            ? "ml-0" // Mobile open
                            : "ml-16" // Mobile closed
                          : "ml-0" // Desktop
                      } transition-all duration-300
                  `}
      >
        <FaBars size={20} />
      </button>
      {/*   {user && (
        <div className="mb-6 text-left transition-all duration-500 ease-in-out">
          <p className="font-medium text-sm text-white"> Hello, {user.name}</p>
          <p className="text-xs text-gray-400 mt-1">
            {user.role.charAt(0).toUpperCase() +
              user.role.slice(1).toLowerCase()}
          </p>
        </div>
      )}*/}
      {user && (
        <div className="mb-6 text-left transition-all duration-500 ease-in-out">
          {/* <p className="font-medium text-sm text-white">
            Hello, {user.name ?? "User"}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            {user?.role
              ? user.role.charAt(0).toUpperCase() +
                user.role.slice(1).toLowerCase()
              : ""}
          </p> */}

          {/* <div className="font-medium text-sm text-white">
            {!isMobile && !isOpen ? (
              <div className="w-8 h-8 mx-auto flex items-center justify-center rounded-full border border-white text-white mb-2">
                {(user.name ?? "User").charAt(0).toUpperCase()}
              </div>
            ) : (
              <p className="transition-all ease-in-out duration-500">
                Hello,&nbsp;{user.name ?? "User"}
              </p>
            )}
          </div> */}
        </div>
      )}

      <ul className="left-1/2 space-y-3">
        {menuItems.map((item, index) => (
          <li key={index}>
            {item.to ? (
              <Link
                to={item.to}
                onClick={handleItemClick}
                className={`flex items-center p-2 rounded-md hover:bg-white hover:text-black transition-colors ${
                  location.pathname === item.to ||
                  (item.to === "/Universities" &&
                    (location.pathname.startsWith("/EditUniversityElementor") ||
                      location.pathname === "/AddUniversityElementor"))
                    ? "bg-white text-black"
                    : ""
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span
                  className={`ml-4 font-medium ${
                    isOpen ? "opacity-100" : "opacity-0 w-0"
                  }`}
                >
                  {item.text}
                </span>
              </Link>
            ) : (
              <button
                onClick={item.action}
                className="flex items-center p-2 rounded-md hover:bg-white hover:text-black transition-colors w-full text-left"
              >
                <span className="text-xl">{item.icon}</span>
                <span
                  className={`ml-4 ${isOpen ? "opacity-100" : "opacity-0 w-0"}`}
                >
                  {item.text}
                </span>
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Menubar;
