import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
// import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // registration fields
  // const [name, setName] = useState("");
  // const [username, setUsername] = useState("");
  // const [password, setPassword] = useState("");
  // const [email, setEmail] = useState("");
  // const [phone, setPhone] = useState("");
  // const [role, setRole] = useState("");

  // REGISTER
  // const handleRegister = async () => {
  //   const userData = { username, name, password, email, phone, role };

  //   try {
  //     const res = await fetch(
  //       "https://dash.zorbastays.com/web-backend/register",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(userData),
  //       },
  //     );

  //     const data = await res.json();
  //     if (res.ok) {
  //       alert("Registered successfully!");
  //       resetFields();
  //       setIsRegister(false);
  //     } else {
  //       alert(data.error || "Registration failed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // // LOGIN
  // const handleLogin = async () => {
  //   try {
  //     const res = await fetch("https://dash.zorbastays.com/web-backend/login", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       // ✅ Check approval
  //       if (data.user && data.user.isApproved === 1) {
  //         // ✅ Save session data
  //         localStorage.setItem(
  //           "user",
  //           JSON.stringify({
  //             username: data.user.username,
  //             name: data.user.name,
  //             role: data.user.role,
  //           }),
  //         );

  //         // alert("Login successful!");
  //         // window.location.href = "/Dashboard"; // redirect
  //         toast.success("Login successful!");

  //         // navigate after a short delay so the toast is visible
  //         setTimeout(() => {
  //           // preferred: use react-router navigation
  //           navigate("/Dashboard");

  //           // or, if you must use a hard reload:
  //           // window.location.href = "/Dashboard";
  //         }, 650);
  //       } else {
  //         toast.info("Sorry, you are not approved by the admin yet.");
  //       }
  //     } else {
  //       toast.error(data.message || "Login failed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  // const user = JSON.parse(localStorage.getItem("user"));
  // if (user) {
  //   console.log(user.username, user.name, user.role);
  // }

  // const resetFields = () => {
  //   setName("");
  //   setUsername("");
  //   setPassword("");
  //   setEmail("");
  //   setPhone("");
  //   setRole("");
  //   setShowPassword(false);
  // };

  // // generate username whenever name changes
  // const handleNameChange = (e) => {
  //   const value = e.target.value;
  //   setName(value);

  //   if (value.trim()) {
  //     const base = value.trim().toLowerCase().replace(/\s+/g, "");
  //     const randomNum = Math.floor(100 + Math.random() * 900);
  //     setUsername(`${base}${randomNum}`);
  //   } else {
  //     setUsername("");
  //   }
  // };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url('../assets/TG_admin_bg.jpg')`, // TG_admin_bg.jpg
      }}
    >
      <div
        className={`bg-white/20 backdrop-blur-sm hover:backdrop-blur-2xl px-8 mx-5 rounded-xl border border-gray-300 ${
          isRegister ? "w-[550px] py-5" : "w-[450px] py-10"
        } hover:scale-105 transition-all duration-300 ease-in-out overflow-y-auto max-h-[90vh]`}
      >
        <img
          src="../assets/TransGlobe_logoWhite.webp" // TransGlobe_logoWhite.webp
          // src="https://imagedelivery.net/JqAydcRLXyliJTMOjPllJQ/86cc50c6-2160-45c2-a8cb-a1f3514ef700/public" // TransGlobe_logo.webp
          alt="Logo"
          className={`flex mx-auto h-16 mb-8  ${isRegister ? "h-24" : "h-28"} `}
        />

        {/* ========= LOGIN FORM ========= */}
        {!isRegister && (
          <>
            {/* <div>
              <label className="block text-gray-200 text-sm mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter username"
                className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md 
                 focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
              />
            </div>

            <div className="relative mt-3">
              <label className="block text-gray-200 text-sm mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md 
                 focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[36px] cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div> */}
            <form
              onSubmit={(e) => {
                e.preventDefault(); // prevent page reload
                // handleLogin();
              }}
            >
              <div>
                <label className="block text-gray-200 text-sm mb-1">
                  Email
                </label>
                <input
                  type="email"
                  // value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
              </div>

              <div className="relative mt-3">
                <label className="block text-gray-200 text-sm mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  // value={password}
                  // onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md 
      focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[36px] cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <div className="flex justify-center mt-5">
                <button
                  // href="#"
                  // onClick={handleLogin}
                  onClick={() => {
                    navigate("/Dashboard");
                  }}
                  type="submit"
                  className="relative px-12 py-3 overflow-hidden group bg-gradient-to-r from-[#3b3965] to-[#2B2A4C] hover:from-[#2B2A4C] hover:to-[#3b3965] text-white transition-all ease-linear duration-300 rounded-md active:scale-95"
                >
                  <span className="absolute right-0 w-10 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-5 -skew-x-12 group-hover:-translate-x-36 ease" />
                  <span className="relative font-medium">Login</span>
                </button>
              </div>

              <p className="text-center text-gray-300 text-sm mt-4">
                Don’t have an account?{" "}
                <button
                  onClick={() => {
                    // resetFields();
                    setIsRegister(true);
                  }}
                  className="text-purple-200 hover:underline"
                >
                  Register
                </button>
              </p>
            </form>
          </>
        )}

        {isRegister && (
          <>
            {/* Name + Username */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-gray-200 text-sm mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  // value={name}
                  // onChange={handleNameChange}
                  placeholder="Enter full name"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-gray-200 text-sm mb-1">
                  Username
                </label>
                <input
                  type="text"
                  // value={username}
                  // readOnly
                  placeholder="Generated Username"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Email */}
              <div>
                <label className="block text-gray-200 text-sm mb-1">
                  Email
                </label>
                <input
                  type="email"
                  // value={email}
                  // onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-200 text-sm mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  // value={phone}
                  // onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
              </div>
            </div>

            {/* Role (full width) */}
            <div className="mt-4">
              <label className="block text-gray-200 text-sm mb-1">Role</label>
              <select
                // value={role}
                // onChange={(e) => setRole(e.target.value)}
                className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
              >
                <option value="">Select role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>

            {/* Password + Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Password */}
              <div className="relative">
                <label className="block text-gray-200 text-sm mb-1">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  // value={password}
                  // onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
                <div
                  // onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[36px] cursor-pointer text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-gray-200 text-sm mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="bg-white/60 focus:bg-white/80 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3b3965] focus:border-transparent"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col justify-between items-center gap-4 mt-7">
              <button
                // onClick={handleRegister}
                className="relative px-6 py-2.5 h-11 overflow-hidden group bg-gradient-to-r from-[#3b3965] to-[#2B2A4C] hover:from-[#2B2A4C] hover:to-[#3b3965] text-white transition-all ease-linear duration-300 rounded-md active:scale-95"
              >
                <span className="absolute right-0 w-10 h-full top-0 transition-all duration-1000 transform translate-x-12 bg-white opacity-5 -skew-x-12 group-hover:-translate-x-36 ease" />
                <span className="relative font-medium">Sign Up</span>
              </button>

              {/* <button className="flex items-center gap-2 bg-white/80 text-black px-6 py-2.5 h-11 rounded-md hover:bg-white transition">
                <FcGoogle size={20} />
                Sign Up with Google
              </button> */}
            </div>

            <p className="text-center text-gray-300 text-sm mt-4">
              Already have an account?{" "}
              <button
                onClick={() => {
                  // resetFields();
                  setIsRegister(false);
                }}
                className="text-purple-200 hover:underline"
              >
                Login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
