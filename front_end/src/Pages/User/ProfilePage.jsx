// import { useState } from "react";
// import { supabase } from "../../supabaseClient";
// import toast from "react-hot-toast";

// export default function ProfilePage({ user, setUser }) {
//   const [newUsername, setNewUsername] = useState(user?.username || "");
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const validate = () => {
//     const username = newUsername.trim();
//     const oldPw = oldPassword.trim();
//     const password = newPassword.trim();
//     const confirm = confirmPassword.trim();

//     if (!username) {
//       toast.error("กรุณากรอก username");
//       return false;
//     }

//     const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
//     if (!usernameRegex.test(username)) {
//       toast.error("Username ใช้ได้เฉพาะ a-z, 0-9, _ และต้องมี 3-20 ตัวอักษร");
//       return false;
//     }

//     if (oldPw || password || confirm) {
//       if (!oldPw || !password || !confirm) {
//         toast.error("กรุณากรอกรหัสผ่านให้ครบทุกช่อง");
//         return false;
//       }

//       if (password.length < 6) {
//         toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
//         return false;
//       }

//       if (password !== confirm) {
//         toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
//         return false;
//       }

//       if (password === oldPw) {
//         toast.error("รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม");
//         return false;
//       }
//     }

//     return true;
//   };

//   const handleUpdateProfile = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     setLoading(true);

//     try {
//       const username = newUsername.trim();
//       const oldPw = oldPassword.trim();
//       const password = newPassword.trim();

//       if (password) {
//         const { error: signInError } = await supabase.auth.signInWithPassword({
//           email: user.email,
//           password: oldPw,
//         });

//         if (signInError) {
//           toast.error("รหัสผ่านเดิมไม่ถูกต้อง");
//           setOldPassword("");
//           return;
//         }

//         const { error: authError } = await supabase.auth.updateUser({
//           password,
//         });

//         if (authError) throw authError;
//       }

//       if (username !== user.username) {
//         const { data, error } = await supabase
//           .from("users")
//           .update({ username })
//           .eq("id", user.id)
//           .select();

//         if (error) throw error;

//         if (!data || data.length === 0) {
//           throw new Error("ไม่มีสิทธิ์แก้ไข (RLS blocked)");
//         }

//         setUser({ ...user, username });
//       }

//       toast.success("อัปเดตโปรไฟล์สำเร็จ!");

//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//     } catch (err) {
//       toast.error(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex justify-center items-center bg-gray-100">
//       <form
//         onSubmit={handleUpdateProfile}
//         className="bg-white p-6 rounded-xl shadow-lg w-[350px]"
//       >
//         <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

//         {/* Username */}
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Username
//         </label>
//         <input
//           type="text"
//           value={newUsername}
//           onChange={(e) => setNewUsername(e.target.value)}
//           placeholder="username (3-20 ตัว)"
//           className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
//         />

//         {/* Divider */}
//         <p className="text-sm text-gray-500 mb-3">
//           เปลี่ยนรหัสผ่าน (ถ้าไม่ต้องการเปลี่ยนให้เว้นว่าง)
//         </p>

//         {/* Old Password */}
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           รหัสผ่านเดิม
//         </label>
//         <input
//           type="password"
//           value={oldPassword}
//           onChange={(e) => setOldPassword(e.target.value)}
//           placeholder="Old Password"
//           className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
//         />

//         {/* New Password */}
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           รหัสผ่านใหม่
//         </label>
//         <input
//           type="password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           placeholder="New Password (อย่างน้อย 6 ตัว)"
//           className="w-full mb-3 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
//         />

//         {/* Confirm Password */}
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           ยืนยันรหัสผ่านใหม่
//         </label>
//         <input
//           type="password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           placeholder="Confirm New Password"
//           className="w-full mb-5 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-900"
//         />

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           {loading ? "กำลังบันทึก..." : "Save Changes"}
//         </button>
//       </form>
//     </div>
//   );
// }
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

export default function ProfilePage({ user, setUser }) {
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validate = () => {
    const username = newUsername.trim();
    const oldPw = oldPassword.trim();
    const password = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!username) { toast.error("กรุณากรอก username"); return false; }
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) { toast.error("Username ใช้ได้เฉพาะ a-z, 0-9, _ และต้องมี 3-20 ตัวอักษร"); return false; }
    if (oldPw || password || confirm) {
      if (!oldPw || !password || !confirm) { toast.error("กรุณากรอกรหัสผ่านให้ครบทุกช่อง"); return false; }
      if (password.length < 6) { toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร"); return false; }
      if (password !== confirm) { toast.error("รหัสผ่านใหม่ไม่ตรงกัน"); return false; }
      if (password === oldPw) { toast.error("รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม"); return false; }
    }
    return true;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const username = newUsername.trim();
      const oldPw = oldPassword.trim();
      const password = newPassword.trim();

      if (password) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: oldPw });
        if (signInError) { toast.error("รหัสผ่านเดิมไม่ถูกต้อง"); setOldPassword(""); return; }
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
      }

      if (username !== user.username) {
        const { data, error } = await supabase.from("users").update({ username }).eq("id", user.id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("ไม่มีสิทธิ์แก้ไข (RLS blocked)");
        setUser({ ...user, username });
      }

      toast.success("อัปเดตโปรไฟล์สำเร็จ!");
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      toast.error(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter = (user?.username || user?.email || "U")[0].toUpperCase();

  const EyeIcon = ({ open }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      ) : (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
      )}
    </svg>
  );

  return (
    <div className="min-h-screen flex justify-center items-start pt-12 pb-12 bg-gray-100 px-4">
      <div className="w-full max-w-md">

        {/* Avatar Header Card */}
       
        <div className="bg-[#003E77] rounded-2xl px-6 pt-8 pb-12 text-center mb-[-40px] shadow-lg">
          <div className="relative inline-block mb-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full
              bg-white text-[#003E77] text-3xl font-medium shadow-md">
              {avatarLetter}
            </div>
            {/* online dot */}
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full
              bg-green-400 border-2 border-[#003E77]" />
          </div>
          <p className="text-white font-medium text-base tracking-tight">
            {user?.username || "User"}
          </p>
          <p className="text-blue-200 text-xs mt-1">{user?.email}</p>
        </div>

        {/* Main Form Card */}
        <form
          onSubmit={handleUpdateProfile}
          className="bg-white rounded-2xl shadow-lg px-6 pt-14 pb-7"
        >
          {/* Section: ข้อมูลโปรไฟล์ */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#003E77]">
              ข้อมูลโปรไฟล์
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
              Username
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="username (3-20 ตัวอักษร)"
              className="w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#003E77] transition-colors"
            />
          </div>

          {/* Section: เปลี่ยนรหัสผ่าน */}
          <div className="flex items-center gap-2 mb-1 mt-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#003E77]">
              เปลี่ยนรหัสผ่าน
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <p className="text-xs text-gray-400 mb-4">เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน</p>

          {[
            {
              label: "รหัสผ่านเดิม",
              value: oldPassword,
              setter: setOldPassword,
              show: showOld,
              toggle: () => setShowOld((v) => !v),
              placeholder: "Current password",
            },
            {
              label: "รหัสผ่านใหม่",
              value: newPassword,
              setter: setNewPassword,
              show: showNew,
              toggle: () => setShowNew((v) => !v),
              placeholder: "New password (อย่างน้อย 6 ตัว)",
            },
            {
              label: "ยืนยันรหัสผ่านใหม่",
              value: confirmPassword,
              setter: setConfirmPassword,
              show: showConfirm,
              toggle: () => setShowConfirm((v) => !v),
              placeholder: "Confirm new password",
            },
          ].map(({ label, value, setter, show, toggle, placeholder }) => (
            <div className="mb-4" key={label}>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">
                {label}
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 pr-10 border-2 border-gray-100 rounded-xl text-sm font-medium text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#003E77] transition-colors"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <EyeIcon open={show} />
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-[#003E77] hover:bg-blue-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm tracking-wide"
          >
            {loading ? "กำลังบันทึก..." : "Save Changes"}
          </button>
        </form>

      </div>
    </div>
  );
}