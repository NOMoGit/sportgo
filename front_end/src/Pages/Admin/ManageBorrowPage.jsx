import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const ManageBorrowPage = () => {
  const [bookings, setBookings] = useState([]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("bookings")
      .select(`
        id,
        status,
        users(username),
        booking_date,
        booking_equipments(quantity, equipments(name))
      `)
      .eq("status", "paid")
      .is("court_id",null);

    setBookings(data || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReturn = async (bookingId) => {
    const confirm = window.confirm("ยืนยันว่าคืนอุปกรณ์แล้ว?");
    if (!confirm) return;

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
        style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr 1fr" }}
      >
        <div>Customer</div>
        <div>Borrowed Date</div>
        <div>Items</div>
        <div>Status</div>
        <div className="text-right">Action</div>
      </div>

      {/* Rows */}
      {bookings.map(b => {
        const borrowedDate = new Date(b.booking_date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = borrowedDate < today;
        const totalItems = b.booking_equipments.reduce(
          (sum, e) => sum + e.quantity,
          0
        );

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
            className="grid items-center px-6 py-4  text-sm rounded-lg shadow-sm "
            style={{ gridTemplateColumns: "2fr 2fr 1.5fr 1.5fr 1fr" }}
          >
            {/* Customer */}
            <div>{b.users?.username}</div>

            {/* Borrowed Date */}
            <div>{borrowedDate.toLocaleDateString("en-GB")}</div>

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
            <div className="text-right">
              <button
                onClick={() => handleReturn(b.id)}
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