
import { useState } from "react";
import { supabase } from "../../supabaseClient";
import toast from "react-hot-toast";

export default function ProfilePage({ user, setUser }) {
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (newPassword) {
        if (!oldPassword) {
          toast.error("กรุณากรอกรหัสผ่านเดิมเพื่อยืนยัน");
          setLoading(false);
          return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });
        if (signInError) throw new Error("รหัสผ่านเดิมไม่ถูกต้อง");
        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
        if (authError) throw authError;
      }
      // Debug: เช็คว่า user.id มีค่าถูกต้องไหม
      console.log("📝 Updating username for user.id:", user.id, "→", newUsername);

      const { data: updatedData, error: dbError } = await supabase
        .from("users")
        .update({ username: newUsername })
        .eq("id", user.id)
        .select(); // ดึงผลลัพธ์กลับมาด้วยเพื่อ debug

      console.log("✅ Update result:", updatedData, "| Error:", dbError);

      if (dbError) throw dbError;

      // ถ้า updatedData เป็น [] แสดงว่า RLS บล็อคอยู่ หรือ id ไม่ตรง
      if (!updatedData || updatedData.length === 0) {
        throw new Error("ไม่พบข้อมูลผู้ใช้ในฐานข้อมูล หรือไม่มีสิทธิ์แก้ไข (RLS)");
      }
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

  const avatarLetter = (user?.username || user?.email || "U")[0].toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&family=Kanit:wght@400;600;700&display=swap');

        .profile-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f4f8;
          font-family: 'Sarabun', sans-serif;
          padding: 2rem 1rem;
        }

        .card {
          background: #ffffff;
          border-radius: 28px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 8px 40px rgba(0, 62, 119, 0.10), 0 2px 8px rgba(0,0,0,0.04);
          overflow: hidden;
          position: relative;
        }

        /* Header band */
        .card-header {
          background: linear-gradient(135deg, #003E77 0%, #0062bc 100%);
          padding: 2rem 2rem 3.5rem;
          position: relative;
          overflow: hidden;
        }
        .card-header::before {
          content: '';
          position: absolute;
          top: -40px; right: -40px;
          width: 180px; height: 180px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
        }
        .card-header::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -30px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
        }

        .header-label {
          font-family: 'Kanit', sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin-bottom: 0.25rem;
        }
        .header-title {
          font-family: 'Kanit', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        /* Avatar floats over the band break */
        .avatar-wrap {
          position: absolute;
          bottom: -36px;
          right: 2rem;
          z-index: 10;
        }
        // .avatar {
        //   width: 72px;
        //   height: 72px;
        //   border-radius: 50%;
        //   background: linear-gradient(135deg, #ffd95a, #ff8c42);
        //   border: 4px solid #fff;
        //   box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        //   display: flex;
        //   align-items: center;
        //   justify-content: center;
        //   font-family: 'Kanit', sans-serif;
        //   font-size: 1.8rem;
        //   font-weight: 700;
        //   color: #fff;
        // }

        /* Body */
        .card-body {
          padding: 3rem 2rem 2rem;
        }

        /* Section label */
        .section-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #003E77;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, #cfdff0, transparent);
        }

        /* Field group */
        .field {
          margin-bottom: 1.1rem;
        }
        .field label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #4a5568;
          margin-bottom: 0.4rem;
        }
        .field-inner {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 1rem;
          pointer-events: none;
          transition: color 0.2s;
        }
        .field-inner.focused .field-icon {
          color: #003E77;
        }
        .field input {
          width: 100%;
          padding: 0.75rem 0.9rem 0.75rem 2.5rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-family: 'Sarabun', sans-serif;
          font-size: 0.95rem;
          color: #1a202c;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .field input::placeholder {
          color: #cbd5e0;
        }
        .field input:focus {
          border-color: #003E77;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,62,119,0.09);
        }

        /* Divider */
        .divider {
          margin: 1.5rem 0;
        }

        /* Submit button */
        .btn-submit {
          width: 100%;
          padding: 0.9rem;
          background: linear-gradient(135deg, #003E77, #0062bc);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-family: 'Kanit', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(0,62,119,0.25);
          position: relative;
          overflow: hidden;
          margin-top: 0.5rem;
        }
        .btn-submit:hover:not(:disabled) {
          opacity: 0.93;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,62,119,0.32);
        }
        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-submit:disabled {
          background: #cbd5e0;
          box-shadow: none;
          cursor: not-allowed;
        }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 0.5rem;
          vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Helper text */
        .helper {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          padding-left: 0.2rem;
        }
      `}</style>

      <div className="profile-root">
        <div className="card">
          {/* Header */}
          <div className="card-header">
            <p className="header-label">การตั้งค่า</p>
            <h2 className="header-title">แก้ไขโปรไฟล์</h2>
            <div className="avatar-wrap">
              <div className="avatar">{avatarLetter}</div>
            </div>
          </div>

          {/* Body */}
          <div className="card-body">
            <form onSubmit={handleUpdateProfile}>
              {/* Username section */}
              <div className="section-label">ข้อมูลผู้ใช้</div>
              <div className="field">
                <label>ชื่อผู้ใช้ (Username)</label>
                <div className={`field-inner ${focusedField === 'username' ? 'focused' : ''}`}>
                  {/* <span className="field-icon">👤</span> */}
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="กรอกชื่อผู้ใช้ใหม่"
                    required
                  />
                </div>
              </div>

              <div className="divider" />

              {/* Password section */}
              <div className="section-label">เปลี่ยนรหัสผ่าน</div>
              <div className="field">
                <label>รหัสผ่านเดิม</label>
                <div className={`field-inner ${focusedField === 'oldpw' ? 'focused' : ''}`}>
                  {/* <span className="field-icon">🔒</span> */}
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    onFocus={() => setFocusedField('oldpw')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="รหัสผ่านปัจจุบัน"
                  />
                </div>
              </div>

              <div className="field">
                <label>รหัสผ่านใหม่</label>
                <div className={`field-inner ${focusedField === 'newpw' ? 'focused' : ''}`}>
                  {/* <span className="field-icon">✨</span> */}
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setFocusedField('newpw')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                  />
                </div>
                <p className="helper">ไม่ต้องกรอกหากไม่ต้องการเปลี่ยนรหัสผ่าน</p>
              </div>

              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? (
                  <><span className="spinner" />กำลังบันทึก...</>
                ) : (
                  "บันทึกการเปลี่ยนแปลง"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}