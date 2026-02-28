

import React, { useState, useEffect } from 'react';
import { supabase } from "../../supabaseClient";

const HistoryPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  useEffect(() => {
  if (!user) return; // ⛔ รอจนกว่าจะมี user

  let subscription;

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          total_price,
          status,
          booking_date,
          courts ( name, category ),
          booking_time_slots ( time_slot ),
          booking_equipments ( quantity, equipments ( name ) )
        `)
        .eq('user_id', user.id)
        .order('id', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(item => {
        let uiStatus = 'pending';
        let uiStatusText = 'รอตรวจสอบสลิป';

        const isBorrowOnly = !item.courts;

        if (item.status === 'paid') {
          uiStatus = isBorrowOnly ? 'borrowed' : 'booked';
          uiStatusText = isBorrowOnly ? 'ยืมสำเร็จ' : 'จองสำเร็จ';
        } else if (item.status === 'returned') {
          uiStatus = 'returned';
          uiStatusText = 'คืนอุปกรณ์แล้ว';
        } else if (item.status === 'rejected') {
          uiStatus = 'cancelled';
          uiStatusText = 'ถูกปฏิเสธ';
        }

        return {
          id: item.id,
          title: item.courts?.name || 'ยืมอุปกรณ์',
          type: item.courts?.category || 'อุปกรณ์กีฬา',
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
        };
      });

      setHistoryData(formattedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // โหลดครั้งแรก
  fetchHistory();

  // realtime
  subscription = supabase
    .channel(`user-bookings-${user.id}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log('Realtime:', payload);

        if (payload.new.status === 'paid') {
          alert('🎉 ชำระเงินสำเร็จแล้ว');
        }

        if (payload.new.status === 'rejected') {
          alert('❌ การจองถูกปฏิเสธ');
        }

        fetchHistory();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}, [user]);

  const formatTimeDisplay = (times) => {
    if (!times || times.length === 0) return "ไม่ได้ระบุเวลา";
    if (times.length === 1) return times[0];
    const sorted = [...times].sort((a, b) => parseInt(a) - parseInt(b));
    const start = sorted[0].split(" - ")[0];
    const end = sorted[sorted.length - 1].split(" - ")[1];
    return `${start} - ${end} (${times.length} ชม.)`;
  };

  const filteredData = activeTab === 'all' 
    ? historyData 
    : historyData.filter(item => item.status === activeTab);

  if (loading) return <div className="p-10 text-center">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 mb-8">ประวัติการจอง</h1>
      <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200 pb-4">
        {[
          { id: 'all', label: 'ทั้งหมด', color: 'bg-gray-800' },
          { id: 'booked', label: 'จองสำเร็จ', color: 'bg-green-600' },
          { id: 'cancelled', label: 'ยกเลิกแล้ว', color: 'bg-red-500' },
          { id: 'pending', label: 'รอชำระเงิน', color: 'bg-yellow-500' },
          { id: 'borrowed', label: 'ยืมสำเร็จ', color: 'bg-blue-600' },
          { id: 'returned', label: 'คืนแล้ว', color: 'bg-blue-600' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all text-sm ${
              activeTab === tab.id 
              ? `${tab.color} text-white shadow-lg` 
              : 'text-gray-500 bg-white hover:bg-gray-100 border border-gray-100'
            }`}
          >
            {tab.label} ({tab.id === 'all' ? historyData.length : historyData.filter(i => i.status === tab.id).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredData.length > 0 ? filteredData.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h3>
                <p className="text-blue-600 font-bold text-sm uppercase tracking-wider">{item.type}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                item.status === 'booked'
                  ? 'bg-green-50 text-green-600'
                  : item.status === 'borrowed'
                  ? 'bg-blue-50 text-blue-600'
                  : item.status === 'returned'
                  ? 'bg-blue-50 text-blue-600'
                  : item.status === 'cancelled'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-yellow-50 text-yellow-600'
              }`}>
                {item.statusText}
              </span>
            </div>
            <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl mb-6">
              <div className="flex items-center gap-3">
                <span className="text-lg">📅</span> 
                <span className="font-bold">{item.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">⏰</span> 
                <span className="font-black text-gray-900">{formatTimeDisplay(item.bookingTimes)}</span>
              </div>
              {item.items && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">👕</span> 
                  <span>{item.items}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-end border-t border-gray-50 pt-4">
              <div className="text-left">
                <p className="text-xs text-gray-400 font-bold uppercase">ยอดชำระสุทธิ</p>
                <p className="text-2xl font-black text-teal-600">{item.price}</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-gray-100 text-gray-400 px-5 py-2.5 rounded-xl text-xs font-black cursor-not-allowed">
                  {item.statusText}
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
             <p className="text-4xl mb-4">📭</p>
             <p className="text-gray-400 font-bold">ไม่พบประวัติการจองในหมวดนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HistoryPage;