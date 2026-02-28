
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { supabase } from "../../supabaseClient";

// export default function LoginPage({ setUser }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   //  const handleLogin = async () => {
//   //   setLoading(true);
//   //   setError("");

//   //   const { data, error } = await supabase.auth.signInWithPassword({
//   //     email,
//   //     password,
//   //   });

//   //   if (error) {
//   //     setError(error.message);
//   //   } else {
//   //     alert("Login successful!");
//   //     console.log("User:", data.user);
//   //   }

//   //   setLoading(false);
//   // };
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg("");

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setErrorMsg(error.message);
//       setLoading(false);
//       return;
//     }

//     // 🔹 ดึง role จาก table users
//     // const { data: profile, error: profileError } = await supabase
//     //   .from("users")
//     //   .select("role")
//     //   .eq("id", data.user.id)
//     //   .single();
//     const { data: profile, error: profileError } = await supabase
//       .from("users")
//       .select("role, username")
//       .eq("id", data.user.id)
//       .single();

//     if (profileError) {
//       setErrorMsg("Cannot fetch user role");
//       setLoading(false);
//       return;
//     }

//     // 🔹 รวม auth user + role
//     // const userWithRole = {
//     //   ...data.user,
//     //   role: profile.role,
//     // };
//     const userWithRole = {
//       id: data.user.id,
//       email: data.user.email,
//       username: profile.username,
//       role: profile.role,
//     };


//     setUser(userWithRole);
//     // navigate("/");
//     // 🔹 redirect ตาม role
//     if (profile.role === "admin") {
//       navigate("/admin");
//     } else {
//       navigate("/");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="flex items-center justify-center min-h-[80vh]">
//       <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md border border-gray-50">
//         <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

//         {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}

//         <form onSubmit={handleLogin} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full p-3 bg-gray-100 rounded-xl outline-none"
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full p-3 bg-gray-100 rounded-xl outline-none"
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-black text-white p-3 rounded-xl font-bold"
//           >
//             {loading ? "Signing in..." : "Sign in"}
//           </button>
//         </form>

//         <div className="text-center my-4 text-gray-400 text-sm">
//           Or Continue With
//         </div>
//         <div className="flex justify-center gap-4">
//           <button className="p-2 border rounded-full">G</button>
//           <button className="p-2 border rounded-full">A</button>
//           <button className="p-2 border rounded-full">f</button>
//         </div>

//         <p className="text-center mt-6 text-sm">
//           Don't have an account?{" "}
//           <Link to="/register" className="text-teal-500">
//             Register for free
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logo from "../../assets/logologin.png";
import bg from "../../assets/login.png";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("role, username")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setErrorMsg("Cannot fetch user role");
      setLoading(false);
      return;
    }

    setUser({
      id: data.user.id,
      email: data.user.email,
      username: profile.username,
      role: profile.role,
    });

    navigate(profile.role === "admin" ? "/admin" : "/");
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 "></div>

      <div className="relative z-10 w-full flex items-center justify-between px-20">
        
        {/* 🔹 Login Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-4xl font-bold text-center">Login</h2>
          <p className="text-center text-gray-400 mb-6">
            Sign in to continue
          </p>

          {errorMsg && (
            <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 shadow-sm shadow-md border rounded-lg outline-none"
              required
            />
            <label className="">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 shadow-sm shadow-md border rounded-lg outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don’t have any account yet?{" "}
            <Link to="/register" className="text-green-600 font-medium">
              Register for free
            </Link>
          </p>
        </div>

        {/* 🔹 Logo Section */}
        <div className="hidden lg:flex flex-1 justify-center">
          <img
            src={logo}
            alt="SportGo Logo"
            className="w-[350px] drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}