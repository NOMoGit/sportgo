import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "../supabaseClient";
import logo from "../assets/logologin.png";
export default function Navbar({ user, setUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // const isLoggedIn = !!user;
  const isLoggedIn = !!user && !!user.email;
  const isAdminPath = location.pathname.startsWith("/admin");

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // const handleLogout = async () => {
  //   setUser(null);
  //   setIsMenuOpen(false);
  //   navigate("/login");
  // };
  const handleLogout = async () => {
    // setUser({
    //   loggedIn: false,
    //   role: null,
    //   email: null,
    //   username: null,
    // });
    // setIsMenuOpen(false);
    // navigate("/login");
    await supabase.auth.signOut();   // ⭐ สำคัญมาก
  setUser(null);                   // เคลียร์ state
  setIsMenuOpen(false);
  navigate("/login");
  };


  return (
    <nav className="bg-[#003E77] shadow-sm sticky top-0 z-50 ">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 justify-between">
        <div className="flex justify-between h-16 items-center ">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
          > 
          <img
            src={logo}
            alt="SPORTGO Logo"
            className="h-10 w-auto"
          />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
            {user?.role === "admin" && isAdminPath ? (
              <>
                <Link to="/admin" className="text-white">
                  DASHBOARD
                </Link>
                <Link to="/admin/courts" className="text-white">MANAGE COURTS</Link>
                <Link to="/admin/borrow" className="text-white">MANAGE BORROW</Link>
                <Link to="/admin/equipments" className="text-white">MANAGE EQUIPMENTS</Link>
                <Link
                  to="/admin/history" className="text-white"
                >
                BOOKING HISTORY
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-white">HOME</Link>
                <Link to="/booking" className="text-white">RESERVATION</Link>
                <Link to="/history" className="text-white">MY HISTORY</Link>
                <Link to="/borrow" className="text-white">BORROW</Link>
              </>
            )}
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 border-l pl-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase">{user.role}</p>
                  <p className="text-xs font-bold text-white">
                    {user.username || user.email}
                  </p>
                </div>
                
                {/* แยกปุ่มตั้งค่าออกมาต่างหาก */}
                <Link 
                  to="/profile" 
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                  title="Settings"
                >
                  <UserIcon size={18} />
                </Link>

                <button
                  onClick={handleLogout}
                  className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold"
              >
                SIGN IN
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md"
          >
            {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {/* {isMenuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-3">
          <Link to="/" onClick={toggleMenu}>HOME</Link>
          <Link to="/booking" onClick={toggleMenu}>RESERVATION</Link>
          <Link to="/history" onClick={toggleMenu}>MY HISTORY</Link>
          <Link to="/borrow" onClick={toggleMenu}>BORROW</Link>

          {isLoggedIn && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <UserIcon size={18} />
                <span>{user.username || user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 text-red-500 font-bold"
              >
                LOGOUT
              </button>
            </div>
          )}
        </div>
      )} */}
      {isMenuOpen && (
  <div className="md:hidden bg-[#003E77] text-white border-t border-white/20 px-6 py-6 space-y-4 animate-fadeIn">

    {user?.role === "admin" ? (
      <>
        <Link
          to="/admin"
          onClick={toggleMenu}
          className={`block font-semibold ${
            location.pathname === "/admin" ? "text-yellow-300" : "hover:text-teal-300"
          }`}
        >
          DASHBOARD
        </Link>

        <Link
          to="/admin/courts"
          onClick={toggleMenu}
          className={`block font-semibold ${
            location.pathname === "/admin/courts"
              ? "text-yellow-300"
              : "hover:text-teal-300"
          }`}
        >
          MANAGE COURTS
        </Link>

        <Link
          to="/admin/borrow"
          onClick={toggleMenu}
          className="block font-semibold hover:text-teal-300"
        >
          MANAGE BORROW
        </Link>

        <Link
          to="/admin/equipments"
          onClick={toggleMenu}
          className="block font-semibold hover:text-teal-300"
        >
          MANAGE EQUIPMENTS
        </Link>

        <Link
          to="/admin/history"
          onClick={toggleMenu}
          className="block font-semibold hover:text-teal-300"
        >
          BOOKING HISTORY
        </Link>
      </>
    ) : (
      <>
        <Link
          to="/"
          onClick={toggleMenu}
          className={`block font-semibold ${
            location.pathname === "/" ? "text-yellow-300" : "hover:text-teal-300"
          }`}
        >
          HOME
        </Link>

        <Link
          to="/booking"
          onClick={toggleMenu}
          className="block font-semibold hover:text-teal-300"
        >
          RESERVATION
        </Link>

        <Link
          to="/history"
          onClick={toggleMenu}
          className="block font-semibold hover:text-teal-300"
        >
          MY HISTORY
        </Link>

        <Link
          to="/borrow"
          onClick={toggleMenu}
          className="block font-semibold hover:text-teal-300"
        >
          BORROW
        </Link>
      </>
    )}

    {/* {isLoggedIn && (
      <div className="pt-6 border-t border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon size={18} />
          <div>
            <p className="text-xs opacity-70 uppercase">{user.role}</p>
            <p className="font-semibold">
              {user.username || user.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 transition rounded-xl py-2 font-bold"
        >
          LOGOUT
        </button>
      </div>
    )} */}
    {isLoggedIn && (
      <div className="pt-6 border-t border-white/20 space-y-2">
        {/* แสดงชื่อเฉยๆ (กดไม่ได้) */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-xs font-bold uppercase">{user.role[0]}</span>
          </div>
          <div>
            <p className="text-[10px] opacity-70 uppercase leading-none">{user.role}</p>
            <p className="font-semibold">{user.username || user.email}</p>
          </div>
        </div>

        {/* เมนูตั้งค่าแยกออกมา */}
        <Link 
          to="/profile" 
          onClick={toggleMenu}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 transition text-yellow-300 font-medium"
        >
          <UserIcon size={18} />
          <span>EDIT PROFILE / SETTINGS</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 transition rounded-xl py-2 mt-4 font-bold"
        >
          LOGOUT
        </button>
      </div>
    )}
  </div>
)}
    </nav>
  );
}