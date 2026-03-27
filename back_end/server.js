// const express = require('express');
// const mysql = require('mysql2');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// // 1. แก้ปัญหาการเชื่อมต่อระหว่างหน้าจอ (CORS)
// app.use(cors()); 
// app.use(express.json()); // ให้เซิร์ฟเวอร์อ่านข้อมูล JSON ที่ส่งมาจากหน้าจองสนามได้

// // 2. ตั้งค่า Data Tier (การเชื่อมต่อ MySQL)
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',      // ใส่ username ของ MySQL คุณ
//   password: 'your_password', // ใส่ password ของ MySQL คุณ
//   database: 'sportgo_db'    // ชื่อฐานข้อมูลที่คุณตั้งไว้
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to MySQL:', err);
//     return;
//   }
//   console.log('Connected to MySQL Database!');
// });

// // 3. ตัวอย่าง API สำหรับชั้น Business Logic (เช่น ดึงรายการสนาม)
// app.get('/api/courts', (req, res) => {
//   const sql = "SELECT * FROM SportFields";
//   db.query(sql, (err, result) => {
//     if (err) {
//       // ถ้าเกิด Error 500 จะมาเช็คได้ที่นี่
//       return res.status(500).json({ error: err.message });
//     }
//     res.json(result);
//   });
// });

// const PORT = 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });






// เปลี่ยนจาก mysql เป็น pg
// const { Pool } = require('pg');

// // การเชื่อมต่อสำหรับ PostgreSQL Online (เช่น Supabase)
// const pool = new Pool({
//   connectionString: 'postgres://postgres:[รหัสผ่าน]@db.xxxx.supabase.co:5432/postgres',
//   ssl: {
//     rejectUnauthorized: false // จำเป็นสำหรับการเชื่อมต่อแบบ Online ที่มีความปลอดภัย
//   }
// });

// module.exports = pool;








// const express = require('express');
// const cors = require('cors');
// const pool = require('./db'); // ดึงการเชื่อมต่อจาก db.js ที่คุณเพิ่งทำ
// require('dotenv').config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // API สำหรับดึงข้อมูลสนามทั้งหมดจาก Supabase
// app.get('/api/courts', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM courts ORDER BY id ASC');
//     res.json(result.rows); // PostgreSQL คืนค่าข้อมูลใน rows
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Server Error: ไม่สามารถดึงข้อมูลสนามได้" });
//   }
// });

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


// app.use(cors({
//   origin: 'http://localhost:5173', // หรือ domain ของ React
//   credentials: true
// }));

// server.js

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { createClient } from '@supabase/supabase-js';

// dotenv.config();
// const app = express();

// // 1️⃣ ตั้งค่า CORS ให้ frontend ติดต่อได้
// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(express.json());

// // 2️⃣ สร้าง Supabase client ด้วย service_role key (เฉพาะ backend)
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // 3️⃣ Route สำหรับ register user
// app.post('/api/register', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // สร้าง user โดยไม่ส่ง email verification
//     const { data: user, error: authError } = await supabase.auth.admin.createUser({
//       email,
//       password,
//       email_confirm: true
//     });

//     if (authError) return res.status(400).json({ error: authError.message });

//     // บันทึกข้อมูลเพิ่มเติมใน table users
//     const { data, error: dbError } = await supabase
//       .from('users')
//       .insert([{ id: user.id, name, email }]);

//     if (dbError) return res.status(400).json({ error: dbError.message });

//     res.json({ message: 'User created successfully', user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { createClient } from '@supabase/supabase-js';
// import pool from './db.js'; // ถ้าคุณยังต้องใช้ pool.query

// dotenv.config();
// const app = express();

// // 1️⃣ ตั้งค่า CORS ให้ frontend ติดต่อได้
// // app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// app.use(cors({
//   origin: [
//     'http://localhost:5173',
//     'http://localhost:5175',
//   ],
//   credentials: true,
// }));
// app.use(express.json());

// // 2️⃣ สร้าง Supabase client ด้วย service_role key (เฉพาะ backend)
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_SERVICE_ROLE_KEY
// );

// // =======================
// // Route สำหรับดึงข้อมูลสนาม (PostgreSQL)
// app.get('/api/courts', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM courts ORDER BY id ASC');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Server Error: ไม่สามารถดึงข้อมูลสนามได้" });
//   }
// });

// // เพิ่ม Endpoint สำหรับเช็คเวลาที่ถูกจองแล้วตามวันที่ (server.js)
// app.get('/api/booked-slots', async (req, res) => {
//   const { court_id, date } = req.query; // รับค่า court_id และวันที่มาเช็ค
  
//   try {
//     const { data, error } = await supabase
//       .from('booking_time_slots')
//       .select('time_slot')
//       .eq('court_id', court_id)
//       .eq('booking_date', date); // เช็คทั้งสนามและวันที่พร้อมกัน

//     if (error) throw error;
//     res.json(data.map(item => item.time_slot)); // ส่งกลับแค่ Array ของเวลาที่จองแล้ว
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ปรับปรุงการบันทึกข้อมูล (Route: /api/create-booking)
// // เพิ่มการบันทึก booking_date ลงในตาราง booking_time_slots ด้วย
// // =======================
// // Route register
// app.post('/api/register', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // สร้าง user (ไม่ต้องยืนยัน email เพราะใช้ service_role)
//     const { data: user, error: authError } = await supabase.auth.admin.createUser({
//       email,
//       password,
//       email_confirm: true
//     });

//     if (authError) return res.status(400).json({ error: authError.message });

//     // บันทึกข้อมูลเพิ่มเติมใน table users
//     const { data, error: dbError } = await supabase
//       .from('users') // table ของคุณ
//       .insert([{ id: user.id, username, email }]);

//     if (dbError) return res.status(400).json({ error: dbError.message });

//     res.json({ message: 'User created successfully', user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // =======================
// // Route login
// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });
//     if (error) return res.status(400).json({ error: error.message });

//     res.json({ message: 'Login successful', user: data.user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // server.js (Back-end)
// app.post('/api/create-booking', async (req, res) => {
//   const { user_id, court_id, bookingTimes, selectedEquipments, total_price } = req.body;

//   try {
//     // 1. บันทึกลงตาราง bookings
//     const { data: booking, error: bError } = await supabase
//       .from('bookings')
//       .insert([{ 
//         user_id, 
//         court_id, 
//         total_price, 
//         status: 'waiting_verify' // สถานะรอแอดมินตรวจสลิป
//       }])
//       .select()
//       .single();

//     if (bError) throw bError;

//     // 2. บันทึกช่วงเวลาลง booking_time_slots
//     if (bookingTimes && bookingTimes.length > 0) {
//       const timeData = bookingTimes.map(time => ({
//         booking_id: booking.id,
//         time_slot: time
//       }));
//       const { error: tError } = await supabase.from('booking_time_slots').insert(timeData);
//       if (tError) throw tError;
//     }

//     // 3. บันทึกรายการอุปกรณ์ลง booking_equipments
//     if (selectedEquipments && selectedEquipments.length > 0) {
//       const equipData = selectedEquipments.map(item => ({
//         booking_id: booking.id,
//         equipment_id: item.id,
//         quantity: item.quantity
//       }));
//       const { error: eError } = await supabase.from('booking_equipments').insert(equipData);
//       if (eError) throw eError;
//     }

//     res.status(200).json({ success: true, message: "บันทึกการจองเรียบร้อย", booking_id: booking.id });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// // =======================
// const PORT = process.env.PORT || 8000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));










import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
// import pool from './db.js';

import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage()
});

dotenv.config();
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// --- ดึงข้อมูลสนามทั้งหมด ---
// app.get('/api/courts', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM courts ORDER BY id ASC');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({ error: "Server Error: ไม่สามารถดึงข้อมูลสนามได้" });
//   }
// });
app.get('/api/courts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courts')
      .select('*');

    if (error) throw error;

    res.json(data); // ✅ array
  } catch (err) {
    console.error(err);
    res.status(500).json([]); // ✅ ยังเป็น array
  }
});

// --- ดึงข้อมูลสล็อตเวลาที่ "เต็มแล้ว" ตามวันที่และสนามที่เลือก ---
app.get('/api/booked-slots', async (req, res) => {
  const { court_id, date } = req.query; 
  
  try {
    const { data, error } = await supabase
      .from('booking_time_slots')
      .select('time_slot')
      .eq('court_id', court_id)
      .eq('booking_date', date); // ค้นหาเฉพาะวันที่กำหนด

    if (error) throw error;
    res.json(data.map(item => item.time_slot)); 
  } catch (err) {
    res.status(500).json({ error: err.message });
    return res.status(409).json({ message: "เวลานี้ถูกจองแล้ว" }); //เพิ่มใหม่
  }
});

// --- บันทึกการจอง (Booking Transaction) ---
app.post('/api/create-booking', upload.single('slip_image'), async (req, res) => {
  try {
    const { user_id, court_id, total_price, bookingDate, booking_id } = req.body;

    const bookingTimes = JSON.parse(req.body.bookingTimes || '[]');
    const selectedEquipments = JSON.parse(req.body.selectedEquipments || '[]');

    const slipFile = req.file;
    if (!slipFile) {
      return res.status(400).json({ success: false, message: "ไม่พบไฟล์สลิป" });
    }

    const fileName = `receipts/${Date.now()}-${slipFile.originalname}`;

    // const { error: uploadError } = await supabase.storage
    //   .from('receipts')
    //   .upload(fileName, slipFile.buffer, {
    //     contentType: slipFile.mimetype
    //   });

    // if (uploadError) throw uploadError;
    // const { error: updateError } = await supabase
    //   .from('bookings')
    //   .update({
    //     user_id,
    //     total_price,
    //     receipt_url: data.publicUrl,
    //     status: 'paid'
    //   })
    //   .eq('id', booking_id);

    // if (updateError) throw updateError;

    // const { data } = supabase.storage
    //   .from('receipts')
    //   .getPublicUrl(fileName);
    // 1. upload รูปก่อน
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(fileName, slipFile.buffer, {
        contentType: slipFile.mimetype
      });

    if (uploadError) throw uploadError;

    // 2. เอา public URL
    const { data: publicData } = supabase.storage
      .from('receipts')
      .getPublicUrl(fileName);

    // 3. update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        user_id,
        total_price,
        receipt_url: publicData.publicUrl,
        status: 'paid'
      })
      .eq('id', booking_id);

    if (updateError) throw updateError;

    // บันทึก booking
    // const { data: booking, error: bError } = await supabase
    //   .from('bookings')
    //   .insert([{
    //     user_id,
    //     court_id,
    //     total_price,
    //     booking_date: bookingDate,
    //     receipt_url: data.publicUrl,
    //     status: 'pending',
        
        
    //   }])
    //   .select()
    //   .single();

    // if (bError) throw bError;

    // 2. บันทึกช่วงเวลาลง booking_time_slots พร้อมระบุวันที่และรหัสสนาม
    // if (bookingTimes && bookingTimes.length > 0) {
    //   const timeData = bookingTimes.map(time => ({
    //     booking_id: booking.id,
    //     court_id: court_id || null,       // ระบุสนามเพื่อให้เช็คง่ายขึ้น
    //     booking_date: bookingDate, // ระบุวันที่เพื่อให้เช็คง่ายขึ้น
    //     time_slot: time
    //   }));
    //   const { error: tError } = await supabase.from('booking_time_slots').insert(timeData);
    //   if (tError) throw tError;
    // }

    // 3. บันทึกรายการอุปกรณ์ลง booking_equipments
    if (selectedEquipments && selectedEquipments.length > 0) {
      const equipData = selectedEquipments.map(item => ({
        // booking_id: booking.id,
        booking_id: booking_id,
        equipment_id: item.id,
        quantity: item.qty // ปรับเป็น item.qty ตามที่คุณส่งมาจาก BorrowPage
      }));
      const { error: eError } = await supabase.from('booking_equipments').insert(equipData);
      if (eError) throw eError;
    }

    res.status(200).json({ success: true, message: "บันทึกการจองเรียบร้อย", booking_id: booking_id });
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
    // const { court_id, booking_date, booking_times } = req.body;
    const { court_id, booking_date, booking_times, total_price } = req.body;

    if (!court_id || !booking_date || !booking_times?.length) {
      return res.status(400).json({ success: false, message: "ข้อมูลไม่ครบ" });
    }

    // 🔒 1. เช็คว่ามีคนจอง slot นี้อยู่ไหม
    const { data: existing, error: checkError } = await supabase
      .from('booking_time_slots')
      // .select('time_slot')
      .select(`
        time_slot,
        bookings!inner(status, hold_until)
      `)
      .eq('court_id', court_id)
      .eq('booking_date', booking_date)
      .in('time_slot', booking_times)
      .in('bookings.status', ['pending', 'paid', 'borrowed']);

    if (checkError) throw checkError;

    if (existing.length > 0) {
      return res.json({
        success: false,
        message: "ช่วงเวลานี้ถูกจองแล้ว"
      });
    }

    // 🔒 2. สร้าง booking (pending)
    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .insert([{
        court_id,
        booking_date,
        total_price,
        status: 'pending',
        hold_until: new Date(Date.now() + 5 * 60 * 1000) // 5 นาที
      }])
      .select()
      .single();

    if (bError) throw bError;

    // 🔒 3. insert time slots
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

    return res.json({
      success: true,
      booking_id: booking.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));