import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const ManageBorrowPage = () => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const fetchData = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        users(username),
        booking_date,
        court_id,
        booking_equipments(quantity, equipments(id,name))
      `)
      .eq("status", "paid")
      // .is("court_id",null);
        
    // setBookings(data || []);
    const filtered = (data || []).filter(b => b.booking_equipments.length > 0);
    setBookings(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (bookingId, bookingEquipments) => {
    const confirm = window.confirm("ยืนยันว่าคืนอุปกรณ์แล้ว?");
    if (!confirm) return;

    // ✅ คืน stock อุปกรณ์
    if (bookingEquipments && bookingEquipments.length > 0) {
      for (const item of bookingEquipments) {
        await supabase.rpc("increment_stock", {
          equip_id: item.equipments.id,
          amount: item.quantity
        });
      }
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        status: "returned",
        returned_at: new Date().toISOString()
      })
      .eq("id", bookingId);

    if (!error) {
      alert("คืนอุปกรณ์สำเร็จ");
      fetchData();
    }
  };
  
  return (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-6">รายการยืมอุปกรณ์</h1>
    <div className="mb-4">
      <input
        type="text"
        placeholder="ค้นหาชื่อผู้ใช้..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/3 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div className="overflow-hidden rounded-lg  bg-white shadow-md">
      {/* Header */}
      {/* <div className="grid grid-cols-5 bg-blue-500 text-white text-sm font-semibold px-6 py-3">
        <div>Customer</div>
        <div>Borrowed Date</div>
        <div>Items</div>
        <div>Status</div>
        <div className="text-right">Action</div>
      </div> */}
      <div
        className="grid bg-blue-500 text-white text-sm font-semibold px-6 py-3"
        style={{ gridTemplateColumns: "2fr 2fr 2fr 2fr 2fr 1fr" }}
      >
        <div>Customer</div>
        <div>Borrowed Date</div>
        <div>Equipment</div>
        <div>Items</div>
        <div>Status</div>
        <div className="text-center">Action</div>
      </div>

      {/* Rows */}
      {bookings
        .filter(b =>
          b.users?.username
            ?.toLowerCase()
            .includes(search.toLowerCase())
        ).map(b => {
        // const borrowedDate = new Date(b.booking_date + "T00:00:00");
        // const today = new Date();
        // today.setHours(0, 0, 0, 0);

        // const isOverdue = borrowedDate < today;
        const borrowedDate = new Date(b.booking_date);

        // 🔥 เช็คว่าเป็น "ยืมอุปกรณ์ล้วน"
        const isEquipmentOnly = !b.court_id;

        let isOverdue = false;

        // ✅ เฉพาะ "จองสนาม" เท่านั้นที่ต้องเช็ค overdue
        if (!isEquipmentOnly) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const compareDate = new Date(borrowedDate);
          compareDate.setHours(0, 0, 0, 0);

          isOverdue = compareDate < today;
        }
        const totalItems = b.booking_equipments.reduce(
          (sum, e) => sum + e.quantity,
          0
        );
        const equipmentNames = b.booking_equipments
          .map(e => e.equipments?.name)
          .join(", ");
        return (
          // <div
          //   key={b.id}
          //   className="grid grid-cols-5 items-center px-6 py-4 border-t text-sm"
          // >
          //   {/* Customer */}
          //   <div>{b.users?.username}</div>

          //   {/* Borrowed Date */}
          //   <div>
          //     {borrowedDate.toLocaleDateString("en-GB")}
          //   </div>

          //   {/* Items */}
          //   <div>{totalItems} items</div>

          //   {/* Status */}
          //   <div
          //     className={`font-semibold ${
          //       isOverdue ? "text-red-500" : "text-orange-400"
          //     }`}
          //   >
          //     {isOverdue ? "Overdue" : "In use"}
          //   </div>

          //   {/* Action */}
          //   <div className="text-right">
          //     <button
          //       onClick={() => handleReturn(b.id)}
          //       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-semibold"
          //     >
          //       Process Return
          //     </button>
          //   </div>
          // </div>
          <div
            key={b.id}
            className="grid items-center px-6 py-4 text-sm rounded-lg shadow-sm bg-white"
            style={{ gridTemplateColumns: "2fr 2fr 2fr 2fr 2fr 1fr" }}
          >
            {/* Customer */}
            <div>{b.users?.username}</div>

            {/* Borrowed Date */}
            <div>{borrowedDate.toLocaleDateString("en-GB")}</div>

            {/* Equipment */}
            {/* <div className="text-gray-600 text-xs">
              {equipmentNames || "-"}
            </div> */}
            <div className="text-gray-600 text-xs space-y-0.5">
              {b.booking_equipments.length > 0
                ? b.booking_equipments.map((e, i) => (
                    <div key={i}>
                      {e.equipments?.name}{" "}
                      <span className="font-bold text-gray-800">x{e.quantity}</span>
                    </div>
                  ))
                : <span className="text-gray-300">-</span>
              }
            </div>

            {/* Items */}
            <div>{totalItems} items</div>

            {/* Status */}
            <div
              className={`font-semibold ${
                isOverdue ? "text-red-500" : "text-orange-400"
              }`}
            >
              {isOverdue ? "Overdue" : "In use"}
            </div>

            {/* Action */}
            <div className="flex justify-center items-center">
              <button
                onClick={() => handleReturn(b.id, b.booking_equipments)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs font-semibold"
              >
                Process Return
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
};

export default ManageBorrowPage;