import { useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

export default function ProfilePage({ user, setUser }) {
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState(""); 
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. ตรวจสอบถ้ามีการจะเปลี่ยนรหัสผ่าน
      if (newPassword) {
        if (!oldPassword) {
          toast.error("กรุณากรอกรหัสผ่านเดิมเพื่อยืนยัน");
          setLoading(false);
          return;
        }
        // เช็ครหัสผ่านเดิมโดยการลอง Login ซ้ำ
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });
        if (signInError) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");

        // อัปเดตรหัสใหม่
        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
        if (authError) throw authError;
      }

      // 2. อัปเดต Username ใน Database
      const { error: dbError } = await supabase
        .from("users")
        .update({ username: newUsername })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // 3. อัปเดต State ในแอป
      setUser({ ...user, username: newUsername });
      toast.success("อัปเดตข้อมูลสำเร็จ!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#003E77]">ตั้งค่าโปรไฟล์</h2>
      <form onSubmit={handleUpdateProfile} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">Username ใหม่</label>
          <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <hr />
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">รหัสผ่านเดิม (เพื่อยืนยัน)</label>
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="รหัสปัจจุบัน" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">รหัสผ่านใหม่</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="6 ตัวขึ้นไป" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#003E77] text-white py-3 rounded-xl font-bold hover:bg-[#002a50] disabled:bg-gray-400 transition-all">
          {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </button>
      </form>
    </div>
  );
}