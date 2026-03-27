
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../supabaseClient";

const getLocalDateString = (daysToAdd = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  // ชดเชยเวลา Timezone (ไทย +7) ก่อนแปลงเป็น String
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return localDate.toISOString().split('T')[0];
};

const BookingPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ทั้งหมด");
  const [selectedCourt, setSelectedCourt] = useState(null); 
  const [selectedTimes, setSelectedTimes] = useState([]); 
  const [courts, setCourts] = useState([]);
  
  // const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(0));
  const [bookedTimes, setBookedTimes] = useState([]);

  const [loading, setLoading] = useState(false);
  /* ===============================
     FETCH COURTS + REALTIME
  =============================== */

  useEffect(() => {
    const fetchCourts = async () => {
      const { data, error } = await supabase
        .from("courts")
        .select("*");

      if (!error && data) {
        const availableCourts = data
          .filter(item => item.is_available)
          .map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: parseFloat(item.price_per_hour),
            image: item.image_url
          }));

        setCourts(availableCourts);
      }
    };

    fetchCourts();

    const channel = supabase
      .channel("realtime-user-courts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courts",
        },
        (payload) => {
          setCourts(prev => {

            if (
              payload.eventType === "UPDATE" &&
              payload.new.is_available === false
            ) {
              if (selectedCourt?.id === payload.new.id) {
                setSelectedCourt(null);
                setSelectedTimes([]);
                alert("สนามนี้ถูกปิดปรับปรุง");
              }

              return prev.filter(c => c.id !== payload.new.id);
            }

            if (
              payload.eventType === "UPDATE" &&
              payload.new.is_available === true
            ) {
              const exists = prev.find(c => c.id === payload.new.id);

              const newCourt = {
                id: payload.new.id,
                name: payload.new.name,
                category: payload.new.category,
                price: parseFloat(payload.new.price_per_hour),
                image: payload.new.image_url
              };

              if (exists) {
                return prev.map(c =>
                  c.id === payload.new.id ? newCourt : c
                );
              } else {
                return [...prev, newCourt];
              }
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, []); // ✅ แก้ให้ subscribe ครั้งเดียว


  /* ===============================
     FETCH BOOKED SLOTS + REALTIME
  =============================== */

  useEffect(() => {
    if (!selectedCourt) return;

    const fetchBookedSlots = async () => {
      
      const res = await fetch(
        `http://localhost:8000/api/booked-slots?court_id=${selectedCourt.id}&date=${selectedDate}`
      );
      const data = await res.json();
      setBookedTimes(data);
      setSelectedTimes([]);
    };

    fetchBookedSlots();

    const channel = supabase
      .channel(`booking-slots-${selectedCourt.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_time_slots',
          filter: `court_id=eq.${selectedCourt.id}` // ✅ สำคัญมาก
        },
        () => {
          fetchBookedSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [selectedCourt, selectedDate]);


  /* ===============================
     DATA + LOGIC (เหมือนเดิม)
  =============================== */

  const timeSlots = [
    "09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", 
    "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", 
    "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"
  ];

  const categories = [
    { name: "ทั้งหมด", icon: "🏠" }, 
    { name: "ฟุตบอล", icon: "⚽" }, 
    { name: "แบดมินตัน", icon: "🏸" }, 
    { name: "บาสเกตบอล", icon: "🏀" }, 
    { name: "ปิงปอง", icon: "🏓" }, 
    { name: "วอลเลย์บอล", icon: "🏐" }
  ];

  const filteredCourts = 
    filter === "ทั้งหมด" 
      ? courts 
      : courts.filter(c => c.category === filter);

  const handleTimeSelect = (time) => {
    setSelectedTimes(prev => 
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const totalPrice = 
    selectedCourt 
      ? selectedTimes.length * selectedCourt.price 
      : 0;

  // const confirmBooking = () => {
  //   if (selectedTimes.length === 0) {
  //     alert("กรุณาเลือกเวลา");
  //     return;
  //   }

  //   if (bookedTimes.some(t => selectedTimes.includes(t))) {
  //     alert("มีบางช่วงเวลาถูกจองไปแล้ว");
  //     return;
  //   }

  //   navigate('/borrow', { 
  //     state: { 
  //       courtData: selectedCourt, 
  //       bookingTimes: selectedTimes, 
  //       bookingDate: selectedDate,
  //       courtAmount: totalPrice 
  //     } 
  //   });
  // };
  // const confirmBooking = async () => {
  //   if (selectedTimes.length === 0) {
  //     alert("กรุณาเลือกเวลา");
  //     return;
  //   }

  //   try {
  //     const res = await fetch("http://localhost:8000/api/hold-booking", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({
  //         court_id: selectedCourt.id,
  //         booking_date: selectedDate,
  //         booking_times: selectedTimes,
  //         total_price: totalPrice
  //       })
  //     });

  //     const result = await res.json();

  //     if (!result.success) {
  //       alert(result.message || "ช่วงเวลานี้ถูกจองแล้ว");
  //       return;
  //     }

  //     // ✅ ได้ booking_id กลับมา
  //     navigate('/borrow', {
  //       state: {
  //         bookingId: result.booking_id, // 🔥 สำคัญ
  //         courtData: selectedCourt,
  //         bookingTimes: selectedTimes,
  //         bookingDate: selectedDate,
  //         courtAmount: totalPrice
  //       }
  //     });

  //   } catch (err) {
  //     alert("เชื่อมต่อ server ไม่ได้");
  //   }
  // };
  const confirmBooking = async () => {
    if (selectedTimes.length === 0) {
      alert("กรุณาเลือกเวลา");
      return;
    }

    setLoading(true); // ✅
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("กรุณาเข้าสู่ระบบก่อนทำการจองสนามครับ");
      navigate('/login'); 
      setLoading(false); 
      return; // สั่ง return เพื่อหยุดการทำงาน ไม่ให้โค้ดวิ่งไปบรรทัดล่าง
    }
    try {
      const res = await fetch("http://localhost:8000/api/hold-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          court_id: selectedCourt.id,
          booking_date: selectedDate,
          booking_times: selectedTimes,
          total_price: totalPrice,
          user_id: session.user.id 
        })
      });

      const result = await res.json();

      // if (!result.success) {
      //   alert(result.message || "ช่วงเวลานี้ถูกจองแล้ว");
      //   setLoading(false); // ✅
      //   return;
      // }
      if (!result.success) {
        alert(`เกิดข้อผิดพลาด: ${result.message || result.error || "ระบบขัดข้อง"}`);
        setLoading(false); 
        return;
      }
      navigate('/borrow', {
        state: {
          bookingId: result.booking_id,
          holdUntil: result.hold_until,
          courtData: selectedCourt,
          bookingTimes: selectedTimes,
          bookingDate: selectedDate,
          courtAmount: totalPrice
        }
      });

    } catch (err) {
      alert("เชื่อมต่อ server ไม่ได้");
    } finally {
      setLoading(false); // ✅
    }
  };
  // สร้างฟังก์ชันหาเวลา Local (ไทย) ป้องกันปัญหา UTC Timezone


  const today = getLocalDateString(0); // วันนี้
  const maxDate = getLocalDateString(6); // จองล่วงหน้าได้ 6 วัน (รวมวันนี้เป็น 7)
  // const today = new Date().toISOString().split('T')[0];
  // const maxDate = new Date(
  //   Date.now() + 6 * 24 * 60 * 60 * 1000
  // ).toISOString().split('T')[0];


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">เลือกจองสนามกีฬายอดนิยม</h1>
            <p className="text-gray-600 mt-2 text-lg">จองล่วงหน้าได้สูงสุด 7 วัน</p>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
            {categories.map(cat => (
              <button key={cat.name} onClick={() => setFilter(cat.name)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${filter === cat.name ? "bg-[#003E77] text-white shadow-lg" : "bg-white text-gray-600 hover:bg-teal-50"}`}>
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredCourts.map(court => (
            <div key={court.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
              <div className="relative h-56 overflow-hidden">
                <img src={court.image} alt={court.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-4">{court.name}</h3>
                <div className="mt-auto flex justify-between items-center">
                  <div className="text-2xl font-black text-teal-600">฿{court.price}<span className="text-gray-400 text-xs ml-1">/ชม.</span></div>
                  <button onClick={() => setSelectedCourt(court)} className="bg-[#003E77] hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm transition-all">จองสนาม</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCourt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-black">{selectedCourt.name}</h2>
                  <p className="text-gray-500 text-sm italic">กรุณาเลือกวันที่และเวลาที่ต้องการ</p>
                </div>
                <button className="text-2xl text-gray-400 hover:text-gray-600" onClick={() => {setSelectedCourt(null); setSelectedTimes([]);}}>✕</button>
              </div>

              {/* ส่วนเลือกวันที่ (Date Selection) */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">เลือกวันที่เข้าใช้บริการ</label>
                <input 
                  type="date" 
                  value={selectedDate}
                  min={today}
                  max={maxDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-600 outline-none transition-all font-bold text-gray-700"
                />
              </div>

              {/* ส่วนเลือกเวลา (Time Slots) */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {timeSlots.map(time => {
                  const isBooked = bookedTimes.includes(time); // ตรวจสอบว่าเวลานี้เต็มหรือยัง
                  return (
                    <button 
                      key={time} 
                      disabled={isBooked}
                      onClick={() => handleTimeSelect(time)} 
                      // className={`py-3 rounded-xl border-2 font-bold transition-all  ${
                      //   isBooked 
                      //     ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed" 
                      //     : selectedTimes.includes(time) 
                      //       ? "bg-[#003E77] bg-blue-50 text-teal-600 shadow-sm" 
                      //       : "border-gray-100 text-gray-500 hover:border-teal-200"
                      // }`}
                      className={`py-3 rounded-xl border-2 font-bold transition-all ${
                        isBooked
                          ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                          : selectedTimes.includes(time)
                            ? "bg-[#003E77] text-white border-[#003E77] shadow-md"
                            : "border-gray-100 text-gray-500 hover:border-[#003E77] hover:text-[#003E77]"
                      }`}
                    >
                      {time} {isBooked && "(เต็ม)"}
                    </button>
                  );
                })}
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl mb-8 flex justify-between items-center">
                <span className="text-gray-500 font-bold">ยอดรวม ({selectedTimes.length} ชม.)</span>
                <span className="text-2xl font-black text-gray-900">฿{totalPrice.toLocaleString()}</span>
              </div>
              
              <button 
                disabled={selectedTimes.length === 0} 
                onClick={confirmBooking} 
                className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${selectedTimes.length > 0 ? "bg-[#003E77] hover:bg-blue-700 active:scale-95" : "bg-gray-300"}`}
              >
                {selectedTimes.length > 0 ? "ดำเนินการต่อ" : "กรุณาเลือกเวลา"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;