import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import axios from "axios";

import multer from 'multer';
async function verifySlip(buffer, mimetype) {
  try {
    const response = await axios.post(
      "https://api.slipok.com/api/line/apikey/63606",
      buffer,
      {
        headers: {
          "Content-Type": mimetype || "image/jpeg"  // 👈 ใช้ mimetype จริง
        }
      }
    );
    return response.data;
  } catch (err) {
    console.error("❌ SlipOK error status:", err.response?.status);
    console.error("❌ SlipOK error body:", JSON.stringify(err.response?.data, null, 2));
    return null;
  }
}
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
app.post('/api/create-booking', upload.single('slip_image'), async (req, res) => {
  try {
    const { user_id, court_id, total_price, bookingDate, booking_id } = req.body;

    const bookingTimes = JSON.parse(req.body.bookingTimes || '[]');
    const selectedEquipments = JSON.parse(req.body.selectedEquipments || '[]');

    // ✅ DEBUG
    console.log("🔥 bookingTimes:", bookingTimes);
    console.log("🔥 selectedEquipments:", selectedEquipments);
    console.log("🔥 booking_id:", booking_id);
    console.log("🔥 file:", req.file);

    // ✅ GUARD กัน crash
    if (!Array.isArray(bookingTimes) || bookingTimes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "bookingTimes ไม่ถูกต้อง"
      });
    }
    const slipFile = req.file;
    if (!slipFile) {
      return res.status(400).json({ success: false, message: "ไม่พบไฟล์สลิป" });
    }
    let slipData = null;
    let autoApproved = false;

    // try {
    //   const result = await verifySlip(slipFile.buffer, slipFile.mimetype);

    //   if (result && result.success) {
    //     slipData = result.data;

    //     if (Number(slipData.amount) === Number(total_price)) {
    //       autoApproved = true;
    //     }
    //   }
    // } catch (err) {
    //   console.log("⚠️ Slip API ล่ม ใช้ manual");
    // }
    // 🧪 MOCK MODE
    try {
      console.log("📤 Sending to SlipOK:", { mimetype: slipFile.mimetype, bufferSize: slipFile.buffer.length });
      
      const result = await verifySlip(slipFile.buffer, slipFile.mimetype);

      console.log("✅ SlipOK response:", JSON.stringify(result, null, 2));
      console.log("💰 amount from slip:", result?.data?.amount);
      console.log("💰 total_price expected:", total_price);
      console.log("✅ match?", Number(result?.data?.amount) === Number(total_price));

      if (result && result.success) {
        slipData = result.data;
        if (Number(slipData.amount) === Number(total_price)) {
          autoApproved = true;
          console.log("🎉 Auto approved!");
        } else {
          console.log("⚠️ Amount mismatch → manual review");
        }
      }
    } catch (err) {
      console.log("⚠️ Slip API ล่ม ใช้ manual");
    }
    slipData = {
      transRef: "MOCK_" + Date.now()
    };

    autoApproved = true;

    let transactionId = slipData?.transRef || null;

    if (transactionId) {
      const { data: existing } = await supabase
        .from("bookings")
        .select("id")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "สลิปนี้ถูกใช้ไปแล้ว"
        });
      }
    }
    const expandTimeSlots = (times) => {
      let result = [];

      times.forEach(range => {
        const [start, end] = range.split(" - ");
        let current = parseInt(start);
        const endHour = parseInt(end);

        while (current < endHour) {
          const next = current + 1;
          result.push(
            `${String(current).padStart(2, '0')}:00 - ${String(next).padStart(2, '0')}:00`
          );
          current = next;
        }
      });

      return result;
    };

    const expandedTimes = bookingTimes;

    if (selectedEquipments.length > 0) {

      const { data: slots } = await supabase
        .from('booking_time_slots')
        .select('booking_id')
        .in('time_slot', expandedTimes)
        .eq('booking_date', bookingDate);

      const overlappingIds = [...new Set((slots || []).map(s => s.booking_id))]
        .filter(id => String(id) !== String(booking_id));

      let usedStockMap = {};

      if (overlappingIds.length > 0) {

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

          usedEquips?.forEach(e => {
            usedStockMap[e.equipment_id] =
              (usedStockMap[e.equipment_id] || 0) + e.quantity;
          });
        }
      }

      const equipmentIds = selectedEquipments.map(e => e.id);
      const { data: equipmentData } = await supabase
        .from('equipments')
        .select('id, stock, name')
        .in('id', equipmentIds);

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
            message: `${equip.name} ไม่พอ (เหลือ ${realStock})`
          });
        }
      }
    }
    console.log("🔥 BEFORE UPLOAD");
    const fileName = `receipts/${Date.now()}-${slipFile.originalname}`;
    const status = autoApproved ? "paid" : "waiting";
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, slipFile.buffer, {
        contentType: slipFile.mimetype
      });

    if (uploadError) {
      console.log("❌ UPLOAD ERROR:", uploadError);
      throw uploadError;
    }

    console.log("🔥 UPLOAD SUCCESS");

    const { data: publicData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    console.log("🔥 PUBLIC URL:", publicData);
    
    const { error: rpcError } = await supabase.rpc('safe_create_booking', {
      p_booking_id: booking_id,
      p_user_id: user_id,
      p_total_price: total_price,
      p_receipt_url: publicData.publicUrl,
      p_equipments: selectedEquipments,
      p_status: status,
      p_transaction_id: transactionId,
      p_verified: autoApproved,
      p_is_additional: selectedEquipments.length > 0 && !court_id 
    });

    if (rpcError) {
      return res.status(400).json({
        success: false,
        message: rpcError.message
      });
    }
    if (selectedEquipments.length > 0) {
      const equipData = selectedEquipments.map(item => ({
        booking_id: booking_id,
        equipment_id: item.id,
        quantity: item.qty
      }));

      console.log("🔥 EQUIP INSERT SUCCESS");
    }

    res.json({
      success: true,
      message: "จองสำเร็จ",
      booking_id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.post('/api/add-equipment', async (req, res) => {
  try {
    const { booking_id, equipment_id, qty, price } = req.body;

    // 🔥 1. insert อุปกรณ์
    const { error: insertError } = await supabase
      .from('booking_equipments')
      .insert({
        booking_id,
        equipment_id,
        quantity: qty
      });

    if (insertError) {
      return res.status(400).json({ success: false, message: insertError.message });
    }

    // 🔥 2. ดึงราคาเดิม
    const { data: booking } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('id', booking_id)
      .single();

    const newTotal = Number(booking.total_price) + (price * qty);

    // 🔥 3. update ราคา + reset สถานะ
    await supabase
      .from('bookings')
      .update({
        total_price: newTotal,
        status: "waiting"
      })
      .eq('id', booking_id);

    res.json({ success: true, new_total: newTotal });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
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

// app.post('/api/hold-booking', async (req, res) => {
//   try {
//     const { user_id, court_id, booking_date, booking_times, total_price } = req.body;

//     if (!user_id || !court_id || !booking_date || !booking_times?.length) {
//       return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
//     }

//     const now = new Date().toISOString();

//     const { data: timeSlots, error: timeError } = await supabase
//       .from('booking_time_slots')
//       .select('booking_id, time_slot')
//       .eq('court_id', court_id)
//       .eq('booking_date', booking_date)
//       .in('time_slot', booking_times);

//     if (timeError) throw timeError;

//     if (timeSlots && timeSlots.length > 0) {
//       const bookingIds = [...new Set(timeSlots.map(t => t.booking_id))];

//       const { data: activeBookings, error: bookingError } = await supabase
//         .from('bookings')
//         .select('id, status, hold_until')
//         .in('id', bookingIds);

//       if (bookingError) throw bookingError;

//       const isBlocked = activeBookings.some(booking => {
//         if (['paid', 'borrowed', 'waiting'].includes(booking.status)) return true;
//         if (booking.status === 'pending' && booking.hold_until > now) return true;
//         return false;
//       });

//       if (isBlocked) {
//         return res.json({ success: false, message: "ช่วงเวลานี้เพิ่งถูกจองไปเมื่อสักครู่ครับ" });
//       }
//     }

//     const { error: clearError } = await supabase
//       .from('booking_time_slots')
//       .delete()
//       .eq('court_id', court_id)
//       .eq('booking_date', booking_date)
//       .in('time_slot', booking_times);

//     if (clearError) throw clearError;

//     const { data: booking, error: bError } = await supabase
//       .from('bookings')
//       .insert([{
//         user_id,
//         court_id,
//         booking_date,
//         total_price,
//         status: 'pending',
//         hold_until: new Date(Date.now() + 5 * 60 * 1000).toISOString()
//       }])
//       .select()
//       .single();

//     if (bError) throw bError;

//     const timeData = booking_times.map(time => ({
//       booking_id: booking.id,
//       court_id,
//       booking_date,
//       time_slot: time
//     }));

//     const { error: tError } = await supabase
//       .from('booking_time_slots')
//       .insert(timeData);

//     if (tError) throw tError;

//     res.json({ success: true, booking_id: booking.id,hold_until: booking.hold_until });

//   } catch (err) {
//     console.error("🔥 DATABASE ERROR:", err.message);
    
//     if (err.message.includes("unique_booking") || err.message.includes("duplicate key")) {
//        return res.status(409).json({ 
//          success: false, 
//          message: "มีผู้ใช้งานท่านอื่นกำลังทำรายการในเวลานี้พอดีครับ กรุณาลองใหม่" 
//        });
//     }

//     res.status(500).json({ success: false, message: `ระบบขัดข้อง: ${err.message}` });
//   }
// });
app.post('/api/hold-booking', async (req, res) => {
  try {
    const { user_id, court_id, booking_date, booking_times, total_price } = req.body;

    // 🔹 เช็คข้อมูลครบ
    if (!user_id || !court_id || !booking_date || !booking_times?.length) {
      return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
    }

    // 🔥 กันจองเวลาที่ผ่านมาแล้ว
    const now = new Date();

    for (const time of booking_times) {
      const [start] = time.split(" - ");
      const slotTime = new Date(`${booking_date}T${start}:00`);

      if (slotTime <= now) {
        return res.status(400).json({
          success: false,
          message: "ไม่สามารถจองเวลาที่ผ่านมาแล้วได้"
        });
      }
    }

    // 🔹 ใช้ ISO สำหรับเทียบ hold_until
    const nowISO = new Date().toISOString();

    // 🔹 เช็คว่ามีคนจอง slot นี้แล้วหรือยัง
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
        if (booking.status === 'pending' && booking.hold_until > nowISO) return true;
        return false;
      });

      if (isBlocked) {
        return res.json({ 
          success: false, 
          message: "ช่วงเวลานี้เพิ่งถูกจองไปเมื่อสักครู่ครับ" 
        });
      }
    }

    // 🔹 ลบ slot เก่าที่อาจค้าง
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
        hold_until: new Date(Date.now() + 10 * 60 * 1000).toISOString()
      }])
      .select()
      .single();

    if (bError) throw bError;

    // 🔹 insert time slots
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

    // ✅ success
    res.json({ 
      success: true, 
      booking_id: booking.id,
      hold_until: booking.hold_until 
    });

  } catch (err) {
    console.error("🔥 DATABASE ERROR:", err.message);
    
    if (err.message.includes("unique_booking") || err.message.includes("duplicate key")) {
      return res.status(409).json({ 
        success: false, 
        message: "มีผู้ใช้งานท่านอื่นกำลังทำรายการในเวลานี้พอดีครับ กรุณาลองใหม่" 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: `ระบบขัดข้อง: ${err.message}` 
    });
  }
});
app.post('/api/cancel-booking', async (req, res) => {
  const { booking_id } = req.body;

  await supabase
    .from('booking_time_slots')
    .delete()
    .eq('booking_id', booking_id);

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', booking_id);

  res.json({ success: true });
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