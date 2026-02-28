




// import React, { useState } from 'react';
// import { Link,useNavigate } from 'react-router-dom';
// import { supabase } from "../../supabaseClient";

// const RegisterPage = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const navigate = useNavigate();
//   const [successMsg, setSuccessMsg] = useState('');

//   // const handleRegister = async (e) => {
//   //   e.preventDefault();
//   //   setLoading(true);
//   //   setErrorMsg('');

//   //   // 1️⃣ ใช้ Supabase Auth สร้างผู้ใช้
//   //   const { user, session, error } = await supabase.auth.signUp({
//   //       email,
//   //       password,
//   //       options: {
//   //         emailRedirectTo: 'http://localhost:5173/login',
//   //         data: {
//   //           name: name
//   //         }
//   //       }
//   //   });

//   //   if (error) {
//   //     setErrorMsg(error.message);
//   //     setLoading(false);
//   //     return;
//   //   }

//   //   // 2️⃣ บันทึกข้อมูลเพิ่มเติม (เช่น name) ลง table users
//   //   const { data, error: dbError } = await supabase
//   //     .from('users')  // table ที่คุณสร้างใน Supabase
//   //     .insert([{ id: user.id, name, email }]);

//   //   if (dbError) {
//   //     setErrorMsg(dbError.message);
//   //   } else {
//   //     setSuccessMsg('Register successful! Please check your email to confirm.');
//   //     setTimeout(() => {
//   //       navigate('/login');
//   //     }, 1500);
//   //   }

//   //   setLoading(false);
//   // };
//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg('');
//     setSuccessMsg('');

//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         // emailRedirectTo: 'http://localhost:5173/login',
//         data: { username }
//       }
//     });

//     if (error) {
//       setErrorMsg(error.message);
//       setLoading(false);
//       return;
//     }

//     // สมัครสำเร็จ → รอ email confirm
//     setSuccessMsg('Register Success');
//     setLoading(false);
//     setTimeout(() => {
//         navigate('/');
//     }, 1500);
//   };




//   return (
//     <div className="flex items-center justify-center min-h-[90vh] bg-gray-50 p-4">
//       <div className="bg-white p-10 rounded-[40px] shadow-sm w-full max-w-md border border-gray-100">
//         <h2 className="text-3xl font-bold text-center mb-2">Sign up</h2>
//         <p className="text-center text-gray-400 text-sm mb-8">Create an account to start booking</p>
        
//         {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
//         {successMsg && (
//           <p className="text-green-500 text-sm mb-2 text-center">
//             {successMsg}
//           </p>
//         )}

//         <form className="space-y-4" onSubmit={handleRegister}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Name / Surname</label>
//             <input 
//               type="text" 
//               placeholder="Your Name"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-teal-500 transition-all" 
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Email address</label>
//             <input 
//               type="email" 
//               placeholder="example@gmail.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-teal-500 transition-all" 
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 ml-1 mb-1">Password</label>
//             <input 
//               type="password" 
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-teal-500 transition-all" 
//               required
//             />
//           </div>

//           <div className="flex items-center gap-2 px-1">
//             <input type="checkbox" id="terms" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" required/>
//             <label htmlFor="terms" className="text-xs text-gray-500">
//               I agree to the <span className="text-teal-600 underline cursor-pointer">Terms, Service and Privacy Policy</span>
//             </label>
//           </div>

//           <button type="submit" className="w-full bg-black text-white p-4 rounded-2xl font-bold mt-4 hover:opacity-90 transition-opacity">
//             {loading ? 'Registering...' : 'CREATE AN ACCOUNT'}
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-500 mt-4">
//           Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:underline">Login for free</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import logo from "../../assets/logologin.png";
import bg from "../../assets/login.png";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
      return;
    }

    setSuccessMsg("Register Success! Please check your email.");
    setLoading(false);

    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 "></div>

      <div className="relative z-10 w-full flex items-center justify-between px-20">
        
        {/* 🔹 Register Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-4xl font-bold text-center">Sign Up</h2>
          <p className="text-center text-gray-400 mb-6">
            Sign up to join us
          </p>

          {errorMsg && (
            <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-green-500 text-sm mb-3">{successMsg}</p>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <label className="">Name</label>
            <input
              type="text"
              placeholder="Name / Surname"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 shadow-sm border rounded-lg outline-none"
              required
            />
            <label className="">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 shadow-sm border rounded-lg outline-none"
              required
            />
            <label className="">Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 shadow-sm border rounded-lg outline-none"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              {loading ? "Registering..." : "CREATE AN ACCOUNT"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-medium">
              Login
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