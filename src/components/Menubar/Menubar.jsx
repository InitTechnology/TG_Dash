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
import { Link, useLocation } from "react-router-dom";

const Menubar = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/SignIn";
  };

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
  const menuItems = [
    { icon: <FaHome />, text: "Dashboard", to: "/Dashboard" },
    {
      icon: <FaBook />,
      text: "Consultations",
      to: "/",
      // to: "/ConsultationBookings",
    },
    // { icon: <FaBuilding />, text: "Properties", to: "/Properties" },
    // { icon: <FaUsers />, text: "Guests\u00A0Records", to: "/GuestRecords" },
    // { icon: <FaCalendarAlt />, text: "Calendar", to: "/Calendar" },
    // {
    //   icon: <FaUserTie />,
    //   text: "Staff\u00A0Management",
    //   to: "/StaffManagement",
    // },
    // {
    //   icon: <FaMoneyCheckAlt />,
    //   text: "Payments\u00A0&\u00A0Invoicing",
    //   to: "/Payments",
    // },
    // {
    //   icon: <FaCommentDots />,
    //   text: "Reviews\u00A0&\u00A0Feedback",
    //   to: "/Reviews",
    // },
    // { icon: <FaTasks />, text: "Kanban\u00A0Board", to: "/KanbanBoard" },
    // { icon: <FaTags />, text: "Discounts", to: "/Discounts" },
    { icon: <RiLogoutCircleRLine />, text: "Logout", action: handleLogout },
  ];
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
      {user && (
        <div className="mb-6 text-left transition-all duration-500 ease-in-out">
          <p className="font-bold text-white"> Hello, {user.name}</p>
          <p className="text-xs text-gray-400">
            {user.role.charAt(0).toUpperCase() +
              user.role.slice(1).toLowerCase()}
          </p>
        </div>
      )}
      <ul className="left-1/2 space-y-4">
        {/* {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              onClick={handleItemClick}
              className={`flex items-center p-2 rounded-md hover:bg-white hover:text-black transition-colors ${
                location.pathname === item.to ? "bg-white text-black" : ""
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className={`ml-4 whitespace-nowrap overflow-hidden transition-all duration-500 ${
                  isOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                {item.text}
              </span>
            </Link>
          </li>
        ))} */}
        <ul className="left-1/2 space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.to ? (
                <Link
                  to={item.to}
                  onClick={handleItemClick}
                  className={`flex items-center p-2 rounded-md hover:bg-white hover:text-black transition-colors ${
                    location.pathname === item.to ? "bg-white text-black" : ""
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
                    className={`ml-4 ${
                      isOpen ? "opacity-100" : "opacity-0 w-0"
                    }`}
                  >
                    {item.text}
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </ul>
    </div>
  );
};

export default Menubar;
