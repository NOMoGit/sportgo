// import React from 'react';

// export default function PayPage() {
//   return (
//     <div className="p-8 max-w-6xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Pay</h1>
//       <div className="flex flex-col md:flex-row gap-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
//         <div className="flex-1 bg-gray-100 rounded-2xl h-64 flex items-center justify-center text-gray-400">
//            [ รูปภาพสนาม ]
//         </div>
//         <div className="flex-1">
//           <h2 className="text-3xl font-bold mb-2">Title สนามฟุตบอล</h2>
//           <div className="text-2xl font-bold text-teal-600 mb-4">$50 <span className="text-sm text-gray-400">/ hr</span></div>
//           <ul className="text-gray-500 space-y-2 mb-8 text-sm">
//             <li>• รายละเอียดการจอง 1</li>
//             <li>• รายละเอียดการจอง 2</li>
//           </ul>
//           <button className="w-full bg-black text-white py-3 rounded-xl mb-3">Confirm Payment</button>
//           <button className="w-full bg-red-500 text-white py-3 rounded-xl">Back</button>
//         </div>
//       </div>
//     </div>
//   );
// }





// import React, { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// export default function PayPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const court = location.state?.courtData; // รับข้อมูลที่ส่งมาจาก BookingPage
//   const [file, setFile] = useState(null);

//   const handleConfirm = () => {
//     if (!file) return alert("กรุณาอัปโหลดสลิปเพื่อยืนยันการชำระเงิน");
//     alert("ส่งสลิปเรียบร้อย! กรุณารอแอดมินตรวจสอบสถานะในหน้าประวัติ");
//     navigate('/history');
//   };

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-6">ชำระเงิน</h1>
//       <div className="bg-white p-8 rounded-3xl shadow-sm border flex flex-col md:flex-row gap-8">
//         <div className="flex-1">
//           <img src={court?.image} className="rounded-2xl h-48 w-full object-cover mb-4" />
//           <h2 className="text-2xl font-bold">{court?.name || "ยังไม่ได้เลือกสนาม"}</h2>
//           <p className="text-teal-600 font-bold text-xl">ยอดที่ต้องชำระ: ฿{location.state?.totalAmount}</p>
//         </div>
//         <div className="flex-1 space-y-4">
//           <label className="block font-bold text-gray-700">อัปโหลดสลิปโอนเงิน (PromptPay)</label>
//           <input 
//             type="file" 
//             onChange={(e) => setFile(e.target.files[0])}
//             className="w-full p-3 border-2 border-dashed rounded-xl" 
//           />
//           <button onClick={handleConfirm} className="w-full bg-black text-white py-4 rounded-xl font-bold">ยืนยันการชำระเงิน</button>
//           <button onClick={() => navigate(-1)} className="w-full text-gray-500 font-bold">ย้อนกลับ</button>
//         </div>
//       </div>
//     </div>
//   );
// }







// PayPage.jsx (ฉบับสมบูรณ์)
// import React, { useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { QRCodeCanvas } from 'qrcode.react'; // ตัววาด QR
// import generatePayload from 'promptpay-qr'; // ตัวสร้างรหัสพร้อมเพย์
// import { supabase } from "../../supabaseClient";

// export default function PayPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [user, setUser] = useState(null);
//   // รับข้อมูลครบชุดจากหน้าก่อนหน้า
  

//   // const { courtData, bookingTimes, totalAmount, selectedEquipments, user_id } = location.state || {};
//   const { 
//     courtData = null, 
//     bookingTimes = [], 
//     totalAmount = 0, 
//     selectedEquipments = [], 
//     bookingDate = "" // เพิ่มการรับค่าวันที่มาด้วย
//   } = location.state || {};

//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const formatTimeRange = (times) => {
//     if (!times || times.length === 0) return "";

//     // 1. เรียงลำดับเวลาจากน้อยไปมาก
//     const sortedTimes = [...times].sort((a, b) => {
//       return parseInt(a.split(":")[0]) - parseInt(b.split(":")[0]);
//     });

//     let ranges = [];
//     let currentRange = null;

//     sortedTimes.forEach((timeStr) => {
//       const [start, end] = timeStr.split(" - ");
      
//       if (!currentRange) {
//         currentRange = { start, end };
//       } else {
//         // 2. เช็คว่าเวลาเริ่มต้นของอันนี้ ตรงกับเวลาสิ้นสุดของอันก่อนหน้าหรือไม่ (ต่อเนื่องกัน)
//         if (start === currentRange.end) {
//           currentRange.end = end; // ขยายช่วงเวลาออกไป
//         } else {
//           // 3. ถ้าไม่ต่อเนื่อง ให้เก็บช่วงเก่าแล้วเริ่มช่วงใหม่
//           ranges.push(`${currentRange.start} - ${currentRange.end}`);
//           currentRange = { start, end };
//         }
//       }
//     });
    
//     if (currentRange) {
//       ranges.push(`${currentRange.start} - ${currentRange.end}`);
//     }

//     return ranges.join(", "); // จะได้ผลลัพธ์เช่น "09:00 - 11:00, 14:00 - 15:00"
//   };
//   // const handleConfirm = async () => {
//   //   if (!file) return alert("กรุณาอัปโหลดสลิปก่อนครับ");
//   //   setLoading(true);

//   //   try {
//   //     // 1. บันทึกลงตาราง bookings
//   //     const { data: booking, error: bError } = await supabase
//   //       .from('bookings')
//   //       .insert([{ 
//   //           court_id: courtData.id, 
//   //           user_id: user_id, // อย่าลืมส่ง ID ผู้ใช้มาจากหน้า Login
//   //           total_price: totalAmount,
//   //           status: 'waiting_verify'
//   //       }])
//   //       .select()
//   //       .single();

//   //     if (bError) throw bError;

//   //     // 2. บันทึกเวลาลง booking_time_slots
//   //     const timeData = bookingTimes.map(time => ({
//   //       booking_id: booking.id,
//   //       time_slot: time
//   //     }));
//   //     await supabase.from('booking_time_slots').insert(timeData);

//   //     // 3. บันทึกอุปกรณ์ลง booking_equipments (ถ้ามี)
//   //     if (selectedEquipments && selectedEquipments.length > 0) {
//   //       const equipData = selectedEquipments.map(item => ({
//   //         booking_id: booking.id,
//   //         equipment_id: item.id,
//   //         quantity: item.quantity
//   //       }));
//   //       await supabase.from('booking_equipments').insert(equipData);
//   //     }

//   //     alert("จองสำเร็จ! รอแอดมินตรวจสอบสลิปนะครับ");
//   //     navigate('/history');
//   //   } catch (err) {
//   //     alert("เกิดข้อผิดพลาด: " + err.message);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// // PayPage.jsx (ฟังก์ชันเมื่อกดส่งสลิป)
//   useEffect(() => {
//     const getUser = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         setUser(user);
//       } else {
//         alert("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
//         navigate('/login');
//       }
//     };
//     getUser();
//   }, [navigate]);

//   const handleConfirmPayment = async () => {
//     if (!user) return alert("รอกำลังโหลดข้อมูลผู้ใช้...");
//     const payload = {
//       user_id: user.id, // ID จากระบบ Login
//       court_id: courtData?.id, 
//       bookingTimes: bookingTimes, // ["09:00 - 10:00", ...]
//       selectedEquipments: selectedEquipments, // [{id, quantity}, ...]
//       total_price: totalAmount,
//       bookingDate: bookingDate
//     };

//     try {
//       const response = await fetch('http://localhost:8000/api/create-booking', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload)
//       });

//       const result = await response.json();
//       if (result.success) {
//         alert("จองสำเร็จ!");
//         navigate('/history');
//       } else {
//         alert("เกิดข้อผิดพลาด: " + result.error);
//       }
//     } catch (error) {
//       console.error("Network Error:", error);
//     }
//   };
//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       {/* ส่วนแสดงสรุปราคาและ QR Code ที่เราคุยกันไว้ (แบบ Dynamic) */}
//       <h1 className="text-3xl font-black mb-6">สรุปรายการจอง</h1>
//       <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm grid md:grid-cols-2 gap-8">
//           <div>
//             <h2 className="text-xl font-bold mb-2">{courtData?.name}</h2>
//               <div className="text-xs text-teal-600 flex flex-wrap gap-1 items-center">
//               <span className="font-bold">เวลา:</span>
//                 {formatTimeRange(bookingTimes).split(', ').map((range, index) => (
//                   <span key={index} className="bg-teal-200/50 px-2 py-0.5 rounded-md">
//                     {range}
//                   </span>
//                 ))}
//               {/* <span className="ml-1 text-[10px] opacity-70">({bookingTimes.length} ชม.)</span> */}
//               <span className="ml-1 text-[10px] opacity-70">
//                 ({bookingTimes?.length || 0} ชม.) 
//               </span>
//             </div>
//             {/* <p className="text-gray-500 mb-4">เวลา: {bookingTimes?.join(', ')}</p> */}
//             <div className="border-t pt-4">
//                <p className="font-bold">รายการอุปกรณ์:</p>
//                {selectedEquipments?.map(e => <p key={e.id} className="text-sm">- {e.name} x{e.quantity}</p>)}
//             </div>
//             <p className="text-3xl font-black text-teal-600 mt-6">฿{totalAmount?.toLocaleString()}</p>
//           </div>
//           <div className="flex flex-col items-center border-l pl-8">
//              <p className="font-bold mb-4">สแกนเพื่อจ่ายเงิน</p>
//              {/* ใส่ QR Code ตรงนี้ */}
//              <div className="bg-gray-100 w-48 h-48 rounded-2xl flex items-center justify-center mb-4">QR CODE</div>
//              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-xs mb-4" />
//              <button onClick={handleConfirmPayment} disabled={loading} className="w-full bg-black text-white py-4 rounded-2xl font-bold">
//                {loading ? "กำลังบันทึก..." : "ยืนยันและส่งสลิป"}
//              </button>
//           </div>
//       </div>
//     </div>
//   );
// }










import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react'; // ตัววาด QR
import generatePayload from 'promptpay-qr'; // ตัวสร้างรหัสพร้อมเพย์
import { supabase } from "../../supabaseClient"; // ตรวจสอบ path ให้ถูกนะครับ

export default function PayPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // รับข้อมูลจากหน้า BorrowPage
  const { 
    courtData = null, 
    bookingTimes = [], 
    courtAmount = 0, 
    selectedEquipments = [],
    bookingDate = null,
    totalAmount = 0 
  } = location.state || {};
  // const totalAmount = courtAmount;
  const [qrCode, setQrCode] = useState("sample");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const PROMPTPAY_ID = "0985055141"; 

  // ดึงข้อมูล User
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        alert("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
        navigate('/login');
      }
    };
    getUser();
  }, [navigate]);

  // สร้าง QR Code อัตโนมัติเมื่อยอดเงินเปลี่ยน
  useEffect(() => {
    if (totalAmount > 0) {
      const payload = generatePayload(PROMPTPAY_ID, { amount: totalAmount });
      setQrCode(payload);
    }
  }, [totalAmount]);

  const today = new Date().toISOString().slice(0, 10);

  const safeBookingDate =
    bookingDate && bookingDate !== ""
      ? bookingDate
      : today;
  const handleConfirmPayment = async () => {
    if (!user) return alert("รอกำลังโหลดข้อมูลผู้ใช้...");
    if (!file) return alert("กรุณาแนบสลิปโอนเงินก่อนครับ");

    // เตรียมข้อมูลแบบ FormData (สำหรับส่งไฟล์รูปภาพ)
    const formData = new FormData();
    formData.append('user_id', user.id);
    // formData.append('court_id', courtData?.id);
    if (courtData?.id) {
      formData.append('court_id', courtData.id);
    } 
    // else {
    //   alert("ไม่พบข้อมูลสนาม");
    //   return;
    // }
    
    if (!totalAmount || isNaN(totalAmount)) {
      alert("ยอดเงินไม่ถูกต้อง");
      return;
    }

    formData.append('total_price', Number(totalAmount));
    // formData.append('total_price', totalAmount);
    // formData.append('bookingDate', bookingDate);
    if (safeBookingDate) {
      formData.append('bookingDate', safeBookingDate);
    }
    formData.append('bookingTimes', JSON.stringify(bookingTimes));
    formData.append('selectedEquipments', JSON.stringify(selectedEquipments));
    formData.append('slip_image', file); // แนบไฟล์รูป

    setLoading(true);
    try {
      // ตรวจสอบ Port ให้ตรงกับ Backend (8000)
      const response = await fetch('http://localhost:8000/api/create-booking', {
        method: 'POST',
        body: formData // fetch จะจัดการ header ให้เอง
      });

      const result = await response.json();
      
      if (result.success) {
        alert("🎉 จองสำเร็จ! ขอบคุณที่ใช้บริการ");
        navigate('/history');
      } else {
        alert("เกิดข้อผิดพลาด: " + (result.message || result.error));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRange = (times) => {
    if (!times || times.length === 0) return "";
    const sortedTimes = [...times].sort((a, b) => parseInt(a) - parseInt(b));
    let ranges = [];
    let currentRange = null;

    sortedTimes.forEach((timeStr) => {
      const [start, end] = timeStr.split(" - ");
      if (!currentRange) {
        currentRange = { start, end };
      } else {
        if (start === currentRange.end) {
          currentRange.end = end;
        } else {
          ranges.push(`${currentRange.start} - ${currentRange.end}`);
          currentRange = { start, end };
        }
      }
    });
    if (currentRange) ranges.push(`${currentRange.start} - ${currentRange.end}`);
    return ranges.join(", ");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-3xl font-black mb-6 text-gray-900">ชำระเงิน</h1>
      
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 grid md:grid-cols-2 gap-8">
          
          {/* ฝั่งซ้าย: รายละเอียด */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{courtData?.name || "ไม่ระบุสนาม"}</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl">
                <p className="text-sm text-gray-500 font-bold mb-1">วันที่ใช้บริการ</p>
                <p className="text-lg font-bold text-gray-900">
                  {bookingDate ? new Date(bookingDate).toLocaleDateString('th-TH') : "-"}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl">
                 <p className="text-sm text-gray-500 font-bold mb-1">เวลาที่เลือก ({bookingTimes?.length || 0} ชม.)</p>
                 <div className="flex flex-wrap gap-2">
                    {formatTimeRange(bookingTimes).split(', ').map((range, i) => (
                      <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-sm font-bold text-teal-600 shadow-sm">
                        {range}
                      </span>
                    ))}
                 </div>
              </div>

              {selectedEquipments.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-2xl">
                   <p className="text-sm text-gray-500 font-bold mb-2">อุปกรณ์เสริม</p>
                   {selectedEquipments.map(e => (
                     <div key={e.id} className="flex justify-between text-sm mb-1">
                       <span>{e.name}</span>
                       <span className="font-bold">x{e.quantity}</span>
                     </div>
                   ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              <span className="text-gray-500 font-bold">ยอดชำระสุทธิ</span>
              <span className="text-4xl font-black text-teal-600">฿{totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          {/* ฝั่งขวา: QR Code & Upload */}
          <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-8 md:pl-8">
             <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-200 mb-6 relative group">
                <div className="absolute inset-0 bg-teal-600 rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <QRCodeCanvas 
                  value={qrCode} 
                  size={200} 
                  level="H"
                  includeMargin={true}
                />
                <div className="text-center mt-2">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" alt="PromptPay" className="h-6 mx-auto opacity-80" />
                </div>
             </div>
             
             <p className="text-gray-500 text-sm mb-6 text-center">
               สแกน QR Code เพื่อชำระเงิน<br/>ยอดเงินจะขึ้นโดยอัตโนมัติ
             </p>

             <div className="w-full">
               <label className="block w-full cursor-pointer group">
                 <div className="flex items-center justify-center w-full h-14 px-4 transition bg-white border-2 border-gray-200 border-dashed rounded-2xl appearance-none cursor-pointer hover:border-teal-500 focus:outline-none">
                    <span className="flex items-center space-x-2">
                      <svg className="w-6 h-6 text-gray-400 group-hover:text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                      <span className="font-medium text-gray-600 group-hover:text-teal-600">
                        {file ? file.name : "คลิกเพื่อแนบสลิปโอนเงิน"}
                      </span>
                    </span>
                    <input 
                      type="file" 
                      accept="image/*"
                      name="file_upload" 
                      className="hidden" 
                      onChange={(e) => setFile(e.target.files[0])}
                    />
                 </div>
               </label>
             </div>

             <button 
               onClick={handleConfirmPayment} 
               disabled={loading} 
               className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all ${
                 loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 hover:bg-black hover:scale-[1.02]"
               }`}
             >
               {loading ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
             </button>
          </div>
      </div>
    </div>
  );
}