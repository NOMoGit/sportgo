// import React, { useState, useEffect } from 'react';
// import { supabase } from "../../supabaseClient";

// const HistoryPage = () => {
//   const [activeTab, setActiveTab] = useState('all');
//   const [historyData, setHistoryData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     supabase.auth.getUser().then(({ data }) => setUser(data.user));
//   }, []);

//   useEffect(() => {
//     if (!user) return;
//     let subscription;

//     const fetchHistory = async () => {
//       try {
//         const { data, error } = await supabase
//           .from('bookings')
//           .select(`
//             id, total_price, status, booking_date,
//             courts ( name, category ),
//             booking_time_slots ( time_slot ),
//             booking_equipments ( quantity, equipments ( name ) )
//           `)
//           .eq('user_id', user.id)
//           .order('id', { ascending: false });

//         if (error) throw error;

//         const formattedData = data.map(item => {
//           const isBorrowOnly = !item.courts;
//           let uiStatus = 'pending';
//           let uiStatusText = 'รอตรวจสอบสลิป';

//           if (item.status === 'paid') {
//             uiStatus = isBorrowOnly ? 'borrowed' : 'booked';
//             uiStatusText = isBorrowOnly ? 'ยืมสำเร็จ' : 'จองสำเร็จ';
//           } else if (item.status === 'returned') {
//             uiStatus = 'returned';
//             uiStatusText = 'คืนอุปกรณ์แล้ว';
//           } else if (item.status === 'rejected' || item.status === 'cancelled') {
//             uiStatus = 'cancelled';
//             uiStatusText = 'ถูกปฏิเสธ';
//           }

//           return {
//             id: item.id,
//             title: item.courts?.name || 'ยืมอุปกรณ์',
//             type: item.courts?.category || 'อุปกรณ์กีฬา',
//             date: item.booking_date
//               ? new Date(item.booking_date).toLocaleDateString('th-TH')
//               : '-',
//             bookingTimes: item.booking_time_slots?.map(s => s.time_slot) || [],
//             items: item.booking_equipments
//               ?.map(eq => `${eq.equipments?.name} x${eq.quantity}`)
//               .join(', ') || '',
//             price: `฿${item.total_price?.toLocaleString() || 0}`,
//             status: uiStatus,
//             statusText: uiStatusText,
//           };
//         });

//         setHistoryData(formattedData);
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();

//     subscription = supabase
//       .channel(`user-bookings-${user.id}`)
//       .on('postgres_changes',
//         { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` },
//         (payload) => {
//           if (payload.new.status === 'paid') alert('🎉 ชำระเงินสำเร็จแล้ว');
//           if (payload.new.status === 'rejected') alert('❌ การจองถูกปฏิเสธ');
//           fetchHistory();
//         })
//       .subscribe();

//     return () => supabase.removeChannel(subscription);
//   }, [user]);

//   const formatTimeRange = (times) => {
//     if (!times || times.length === 0) return [];
//     const sorted = [...times].sort((a, b) => parseInt(a) - parseInt(b));
//     let ranges = [];
//     let current = null;
//     sorted.forEach((t) => {
//       const [start, end] = t.split(" - ");
//       if (!current) { current = { start, end }; }
//       else if (start === current.end) { current.end = end; }
//       else { ranges.push(`${current.start} - ${current.end}`); current = { start, end }; }
//     });
//     if (current) ranges.push(`${current.start} - ${current.end}`);
//     return ranges;
//   };

//   const TABS = [
//     { id: 'all',       label: 'ทั้งหมด' },
//     { id: 'booked',    label: 'จองสำเร็จ' },
//     { id: 'pending',   label: 'รอตรวจสอบ' },
//     { id: 'borrowed',  label: 'ยืมสำเร็จ' },
//     { id: 'returned',  label: 'คืนแล้ว' },
//     { id: 'cancelled', label: 'ยกเลิก' },
//   ];

//   const STATUS_STYLE = {
//     pending:   { bg: 'bg-yellow-50',  text: 'text-yellow-700' },
//     booked:    { bg: 'bg-green-50',   text: 'text-green-700'  },
//     cancelled: { bg: 'bg-red-50',     text: 'text-red-500'    },
//     borrowed:  { bg: 'bg-blue-50',    text: 'text-blue-700'   },
//     returned:  { bg: 'bg-purple-50',  text: 'text-purple-700' },
//   };

//   const filteredData = activeTab === 'all'
//     ? historyData
//     : historyData.filter(item => item.status === activeTab);

//   if (loading) return (
//     <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
//       กำลังโหลดข้อมูล...
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-4xl mx-auto">

//         <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-6">
//           ประวัติการจอง
//         </h1>

//         <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-1">
//           {TABS.map(tab => (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
//                 activeTab === tab.id
//                   ? 'bg-[#003E77] text-white'
//                   : 'bg-white text-gray-500 border border-gray-100'
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           {filteredData.length > 0 ? filteredData.map((item) => {
//             const s = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
//             const timeRanges = formatTimeRange(item.bookingTimes);

//             return (
//               <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">

//                 <div className="flex justify-between items-start">
//                   <div className="flex-1 min-w-0 pr-3">
//                     <h3 className="font-semibold text-gray-800">{item.title}</h3>
//                     <p className="text-xs text-gray-400 mt-0.5">#{item.id} · {item.type}</p>
//                   </div>
//                   <span className={`inline-flex items-center text-sm font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${s.bg} ${s.text}`}>
//                     {item.statusText}
//                   </span>
//                 </div>

//                 <div className="border-t border-gray-50" />

//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm text-gray-400 w-10 shrink-0">วันที่</span>
//                     <span className="text-sm text-gray-700 font-medium">{item.date}</span>
//                   </div>

//                   {timeRanges.length > 0 && (
//                     <div className="flex items-start gap-2">
//                       <span className="text-sm text-gray-400 w-10 shrink-0 pt-0.5">เวลา</span>
//                       <div className="flex flex-wrap gap-1">
//                         {timeRanges.map((range, i) => (
//                           <span key={i} className="bg-[#003E77] text-white text-xs font-semibold px-2 py-0.5 rounded-md">
//                             {range}
//                           </span>
//                         ))}
//                         <span className="text-sm text-gray-400 self-center">
//                           {item.bookingTimes.length} ชม.
//                         </span>
//                       </div>
//                     </div>
//                   )}

//                   {item.items && (
//                     <div className="flex items-start gap-2">
//                       <span className="text-sm text-gray-400 w-10 shrink-0">อุปกรณ์</span>
//                       <span className="text-sm text-gray-700">{item.items}</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
//                   <span className="text-sm text-gray-400">ยอดชำระ</span>
//                   <span className="text-xl font-black text-teal-600">{item.price}</span>
//                 </div>

//               </div>
//             );
//           }) : (
//             <div className="col-span-full text-center py-20 text-gray-300 text-sm">
//               ไม่พบข้อมูลในหมวดนี้
//             </div>
//           )}
//         </div>

//       </div>
//     </div>
//   );
// };

// export default HistoryPage;














import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "../../supabaseClient";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    let subscription;

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            id, total_price, status, booking_date,
            courts ( name, category ),
            booking_time_slots ( time_slot ),
            booking_equipments ( quantity, equipments ( name ) )
          `)
          .eq('user_id', user.id)
          .order('id', { ascending: false });

        if (error) throw error;

        const formattedData = data.map(item => {
          const isBorrowOnly = !item.courts;
          let uiStatus = 'pending';
          let uiStatusText = 'รอตรวจสอบสลิป';

          if (item.status === 'paid') {
            uiStatus = isBorrowOnly ? 'borrowed' : 'booked';
            uiStatusText = isBorrowOnly ? 'ยืมสำเร็จ' : 'จองสำเร็จ';
          } else if (item.status === 'returned') {
            uiStatus = 'returned';
            uiStatusText = 'คืนอุปกรณ์แล้ว';
          } else if (item.status === 'rejected' || item.status === 'cancelled') {
            uiStatus = 'cancelled';
            uiStatusText = 'ถูกปฏิเสธ';
          }

          return {
            id: item.id,
            title: item.courts?.name || 'ยืมอุปกรณ์',
            type: item.courts?.category || 'อุปกรณ์กีฬา',
            rawDate: item.booking_date,
            date: item.booking_date
              ? new Date(item.booking_date).toLocaleDateString('th-TH')
              : '-',
            bookingTimes: item.booking_time_slots?.map(s => s.time_slot) || [],
            items: item.booking_equipments
              ?.map(eq => `${eq.equipments?.name} x${eq.quantity}`)
              .join(', ') || '',
            price: `฿${item.total_price?.toLocaleString() || 0}`,
            status: uiStatus,
            statusText: uiStatusText,
            courtCategory: item.courts?.category || null,
          };
        });

        setHistoryData(formattedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    subscription = supabase
      .channel(`user-bookings-${user.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'bookings', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.new.status === 'paid') alert('🎉 ชำระเงินสำเร็จแล้ว');
          if (payload.new.status === 'rejected') alert('❌ การจองถูกปฏิเสธ');
          fetchHistory();
        })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user]);

  const formatTimeRange = (times) => {
    if (!times || times.length === 0) return [];
    const sorted = [...times].sort((a, b) => parseInt(a) - parseInt(b));
    let ranges = [];
    let current = null;
    sorted.forEach((t) => {
      const [start, end] = t.split(" - ");
      if (!current) { current = { start, end }; }
      else if (start === current.end) { current.end = end; }
      else { ranges.push(`${current.start} - ${current.end}`); current = { start, end }; }
    });
    if (current) ranges.push(`${current.start} - ${current.end}`);
    return ranges;
  };

  const TABS = [
    { id: 'all',       label: 'ทั้งหมด' },
    { id: 'booked',    label: 'จองสำเร็จ' },
    { id: 'pending',   label: 'รอตรวจสอบ' },
    { id: 'borrowed',  label: 'ยืมสำเร็จ' },
    { id: 'returned',  label: 'คืนแล้ว' },
    { id: 'cancelled', label: 'ยกเลิก' },
  ];

  const STATUS_STYLE = {
    pending:   { bg: 'bg-yellow-50',  text: 'text-yellow-700' },
    booked:    { bg: 'bg-green-50',   text: 'text-green-700'  },
    cancelled: { bg: 'bg-red-50',     text: 'text-red-500'    },
    borrowed:  { bg: 'bg-blue-50',    text: 'text-blue-700'   },
    returned:  { bg: 'bg-purple-50',  text: 'text-purple-700' },
  };

  const filteredData = activeTab === 'all'
    ? historyData
    : historyData.filter(item => item.status === activeTab);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
      กำลังโหลดข้อมูล...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-6">
          ประวัติการจอง
        </h1>

        <div className="flex overflow-x-auto gap-2 mb-6 no-scrollbar pb-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-[#003E77] text-white'
                  : 'bg-white text-gray-500 border border-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredData.length > 0 ? filteredData.map((item) => {
            const s = STATUS_STYLE[item.status] || STATUS_STYLE.pending;
            const timeRanges = formatTimeRange(item.bookingTimes);

            return (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">

                {/* Top */}
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">#{item.id} · {item.type}</p>
                  </div>
                  <span className={`inline-flex items-center text-sm font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${s.bg} ${s.text}`}>
                    {item.statusText}
                  </span>
                </div>

                <div className="border-t border-gray-50" />

                {/* Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 w-10 shrink-0">วันที่</span>
                    <span className="text-sm text-gray-700 font-medium">{item.date}</span>
                  </div>

                  {timeRanges.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-gray-400 w-10 shrink-0 pt-0.5">เวลา</span>
                      <div className="flex flex-wrap gap-1">
                        {timeRanges.map((range, i) => (
                          <span key={i} className="bg-[#003E77] text-white text-xs font-semibold px-2 py-0.5 rounded-md">
                            {range}
                          </span>
                        ))}
                        <span className="text-sm text-gray-400 self-center">
                          {item.bookingTimes.length} ชม.
                        </span>
                      </div>
                    </div>
                  )}

                  {item.items && (
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-gray-400 w-10 shrink-0">อุปกรณ์</span>
                      <span className="text-sm text-gray-700">{item.items}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-100">
                  <span className="text-sm text-gray-400">ยอดชำระ</span>
                  <span className="text-xl font-black text-teal-600">{item.price}</span>
                </div>

                {/* ปุ่มยืมอุปกรณ์เพิ่ม — เฉพาะ booked */}
                {item.status === 'booked' && (
                  <button
                    onClick={() => navigate('/borrow', {
                      state: {
                        bookingId: null,
                        courtData: { name: item.title, category: item.courtCategory },
                        bookingTimes: item.bookingTimes,
                        bookingDate: item.rawDate,
                        courtAmount: 0,
                      }
                    })}
                    className="w-full py-2.5 rounded-xl bg-[#003E77] hover:bg-blue-800 active:scale-[0.98] text-white text-sm font-semibold transition-all"
                  >
                    ยืมอุปกรณ์เพิ่ม
                  </button>
                )}

              </div>
            );
          }) : (
            <div className="col-span-full text-center py-20 text-gray-300 text-sm">
              ไม่พบข้อมูลในหมวดนี้
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HistoryPage;