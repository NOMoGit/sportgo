import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';


import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage()
});

dotenv.config();
const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5175',
    'https://sportgo.vercel.app'
  ],
  credentials: true,
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get('/api/courts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courts')
      .select('*');

    if (error) throw error;

    res.json(data); 
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// app.post('/api/create-booking', upload.single('slip_image'), async (req, res) => {
//   try {
//     const { user_id, court_id, total_price, bookingDate, booking_id } = req.body;

//     const bookingTimes = JSON.parse(req.body.bookingTimes || '[]');
//     const selectedEquipments = JSON.parse(req.body.selectedEquipments || '[]');

//     const slipFile = req.file;
//     if (!slipFile) {
//       return res.status(400).json({ success: false, message: "ไม่พบไฟล์สลิป" });
//     }

//     const fileName = `receipts/${Date.now()}-${slipFile.originalname}`;

//     const { error: uploadError } = await supabase.storage
//       .from('receipts')
//       .upload(fileName, slipFile.buffer, {
//         contentType: slipFile.mimetype
//       });

//     if (uploadError) throw uploadError;

//     // 2. เอา public URL
//     const { data: publicData } = supabase.storage
//       .from('receipts')
//       .getPublicUrl(fileName);

//     const { data: checkBooking } = await supabase
//       .from('bookings')
//       .select('status')
//       .eq('id', booking_id)
//       .single();

//     if (!checkBooking || checkBooking.status === 'cancelled') {
//       return res.status(400).json({ 
//         success: false, 
//         message: "คิวนี้หมดเวลาและถูกยกเลิกไปแล้ว หากโอนเงินมาแล้วกรุณาติดต่อแอดมิน" 
//       });
//     }
//     const { data: updatedBooking, error: updateError } = await supabase
//       .from('bookings')
//       .update({
//         user_id,
//         total_price,
//         receipt_url: publicData.publicUrl,
//         status: 'waiting'
//       })
//       .eq('id', booking_id)
//       .select()    
//       .single();   

//     if (updateError) throw updateError;

//     console.log("🔥 UPDATED BOOKING:", updatedBooking);

//     if (selectedEquipments && selectedEquipments.length > 0) {
//       const equipData = selectedEquipments.map(item => ({
//         booking_id: booking_id,
//         equipment_id: item.id,
//         quantity: item.qty 
//       }));
//       const { error: eError } = await supabase.from('booking_equipments').insert(equipData);
//       if (eError) throw eError;
//     }
    
//     res.status(200).json({ success: true, message: "บันทึกการจองเรียบร้อย", booking_id: booking_id });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

app.post('/api/create-booking', upload.single('slip_image'), async (req, res) => {
  try {
    const { user_id, court_id, total_price, bookingDate, booking_id } = req.body;
    const bookingTimes = JSON.parse(req.body.bookingTimes || '[]');
    const selectedEquipments = JSON.parse(req.body.selectedEquipments || '[]');

    const slipFile = req.file;
    if (!slipFile) {
      return res.status(400).json({ success: false, message: "ไม่พบไฟล์สลิป" });
    }

    // 1. เช็ค booking ยังไม่ถูก cancel
    const { data: checkBooking } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', booking_id)
      .single();

    if (!checkBooking || checkBooking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: "คิวนี้หมดเวลาและถูกยกเลิกไปแล้ว หากโอนเงินมาแล้วกรุณาติดต่อแอดมิน"
      });
    }

    // 2. เช็ค stock อุปกรณ์ตาม time slot ก่อน insert
    if (selectedEquipments && selectedEquipments.length > 0) {

      // หา booking_ids ที่ใช้ time_slot เดียวกัน วันเดียวกัน
      const { data: slots } = await supabase
        .from('booking_time_slots')
        .select('booking_id')
        .in('time_slot', bookingTimes)
        .eq('booking_date', bookingDate);

      const overlappingIds = [...new Set((slots || []).map(s => s.booking_id))]
        .filter(id => String(id) !== String(booking_id)); // ไม่นับตัวเอง

      let usedStockMap = {};

      if (overlappingIds.length > 0) {
        // กรองเฉพาะ active bookings
        const { data: activeBookings } = await supabase
          .from('bookings')
          .select('id')
          .in('id', overlappingIds)
          .in('status', ['paid', 'waiting', 'pending']);

        const activeIds = (activeBookings || []).map(b => b.id);

        if (activeIds.length > 0) {
          const { data: usedEquips } = await supabase
            .from('booking_equipments')
            .select('equipment_id, quantity')
            .in('booking_id', activeIds);

          (usedEquips || []).forEach(e => {
            usedStockMap[e.equipment_id] = (usedStockMap[e.equipment_id] || 0) + e.quantity;
          });
        }
      }

      // ดึง stock จริงของแต่ละอุปกรณ์
      const equipmentIds = selectedEquipments.map(e => e.id);
      const { data: equipmentData } = await supabase
        .from('equipments')
        .select('id, stock, name')
        .in('id', equipmentIds);

      // เช็คว่าพอมั้ย
      for (const item of selectedEquipments) {
        const equip = equipmentData?.find(e => e.id === item.id);
        if (!equip) {
          return res.status(400).json({
            success: false,
            message: `ไม่พบอุปกรณ์ ${item.name}`
          });
        }
        const usedQty = usedStockMap[item.id] || 0;
        const realStock = equip.stock - usedQty;
        if (item.qty > realStock) {
          return res.status(400).json({
            success: false,
            message: `${equip.name} ไม่เพียงพอในช่วงเวลานี้ (เหลือ ${realStock} ชิ้น)`
          });
        }
      }
    }

    // 3. Upload slip
    const fileName = `receipts/${Date.now()}-${slipFile.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, slipFile.buffer, { contentType: slipFile.mimetype });
    if (uploadError) throw uploadError;

    const { data: publicData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    // 4. Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        user_id,
        total_price,
        receipt_url: publicData.publicUrl,
        status: 'waiting'
      })
      .eq('id', booking_id)
      .select()
      .single();

    if (updateError) throw updateError;

    // 5. Insert booking_equipments
    if (selectedEquipments && selectedEquipments.length > 0) {
      const equipData = selectedEquipments.map(item => ({
        booking_id: booking_id,
        equipment_id: item.id,
        quantity: item.qty
      }));
      const { error: eError } = await supabase
        .from('booking_equipments')
        .insert(equipData);
      if (eError) throw eError;
    }

    res.status(200).json({ success: true, message: "บันทึกการจองเรียบร้อย", booking_id });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Auth Routes ---
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const { data: user, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    if (authError) return res.status(400).json({ error: authError.message });

    const { error: dbError } = await supabase
      .from('users')
      .insert([{ id: user.id, username, email, role: 'user' }]);

    if (dbError) return res.status(400).json({ error: dbError.message });
    res.json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: 'Login successful', user: data.user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/hold-booking', async (req, res) => {
  try {
    const { user_id, court_id, booking_date, booking_times, total_price } = req.body;

    if (!user_id || !court_id || !booking_date || !booking_times?.length) {
      return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
    }

    const now = new Date().toISOString();

    const { data: timeSlots, error: timeError } = await supabase
      .from('booking_time_slots')
      .select('booking_id, time_slot')
      .eq('court_id', court_id)
      .eq('booking_date', booking_date)
      .in('time_slot', booking_times);

    if (timeError) throw timeError;

    if (timeSlots && timeSlots.length > 0) {
      const bookingIds = [...new Set(timeSlots.map(t => t.booking_id))];

      const { data: activeBookings, error: bookingError } = await supabase
        .from('bookings')
        .select('id, status, hold_until')
        .in('id', bookingIds);

      if (bookingError) throw bookingError;

      const isBlocked = activeBookings.some(booking => {
        if (['paid', 'borrowed', 'waiting'].includes(booking.status)) return true;
        if (booking.status === 'pending' && booking.hold_until > now) return true;
        return false;
      });

      if (isBlocked) {
        return res.json({ success: false, message: "ช่วงเวลานี้เพิ่งถูกจองไปเมื่อสักครู่ครับ" });
      }
    }

    const { error: clearError } = await supabase
      .from('booking_time_slots')
      .delete()
      .eq('court_id', court_id)
      .eq('booking_date', booking_date)
      .in('time_slot', booking_times);

    if (clearError) throw clearError;

    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .insert([{
        user_id,
        court_id,
        booking_date,
        total_price,
        status: 'pending',
        hold_until: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      }])
      .select()
      .single();

    if (bError) throw bError;

    const timeData = booking_times.map(time => ({
      booking_id: booking.id,
      court_id,
      booking_date,
      time_slot: time
    }));

    const { error: tError } = await supabase
      .from('booking_time_slots')
      .insert(timeData);

    if (tError) throw tError;

    res.json({ success: true, booking_id: booking.id,hold_until: booking.hold_until });

  } catch (err) {
    console.error("🔥 DATABASE ERROR:", err.message);
    
    if (err.message.includes("unique_booking") || err.message.includes("duplicate key")) {
       return res.status(409).json({ 
         success: false, 
         message: "มีผู้ใช้งานท่านอื่นกำลังทำรายการในเวลานี้พอดีครับ กรุณาลองใหม่" 
       });
    }

    res.status(500).json({ success: false, message: `ระบบขัดข้อง: ${err.message}` });
  }
});

app.get('/api/booked-slots', async (req, res) => {
  const { court_id, date } = req.query;

  try {
    const now = new Date().toISOString();

    const { data: timeSlots, error: timeError } = await supabase
      .from('booking_time_slots')
      .select('booking_id, time_slot')
      .eq('court_id', court_id)
      .eq('booking_date', date);

    if (timeError) throw timeError;

    if (!timeSlots || timeSlots.length === 0) {
      return res.json([]);
    }

    const bookingIds = [...new Set(timeSlots.map(t => t.booking_id))];

    const { data: activeBookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, hold_until')
      .in('id', bookingIds);

    if (bookingError) throw bookingError;

    const bookingStatusMap = {};
    activeBookings.forEach(b => {
      bookingStatusMap[b.id] = b;
    });

    const blockedTimes = timeSlots.filter(slot => {
      const booking = bookingStatusMap[slot.booking_id];
      if (!booking) return false;

      if (['paid', 'borrowed', 'waiting'].includes(booking.status)) return true;

      if (booking.status === 'pending' && booking.hold_until > now) return true;

      return false;
      
    }).map(slot => slot.time_slot);

    res.json(blockedTimes);

  } catch (err) {
    console.error("Error fetching booked slots:", err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

setInterval(async () => {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .in('status', ['pending'])
      .lt('hold_until', now)
      .not('hold_until', 'is', null);
      
    if (error) throw error;
    if (!data || data.length === 0) return;

    const ids = data.map(b => b.id);

    console.log("🧹 Cleaning expired bookings:", ids);

    const { error: deleteError } = await supabase
      .from('booking_time_slots')
      .delete()
      .in('booking_id', ids);

    if (deleteError) throw deleteError;

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      
      .in('id', ids);

    if (updateError) throw updateError;

  } catch (err) {
    console.error("Cleanup error:", err.message);
  }
}, 60000); 