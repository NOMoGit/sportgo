import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const AdminBookingHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const today = new Date().toISOString().slice(0, 10);

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          receipt_url,
          status,
          users ( username, email ),
          courts ( name, category )
        `)
        .lt("booking_date", `${today}T00:00:00`) // ✅ อดีต
        .order("booking_date", { ascending: false });

      if (!error && data) {
        setHistory(data);
      }
    };

    fetchHistory();
  }, []);

  // return (
  //   <div className="p-10">
  //     <h1 className="text-2xl font-bold mb-6">Booking History</h1>

  //     <table className="w-full text-xs bg-white border">
  //       <thead className="bg-gray-50 text-gray-400 font-bold">
  //         <tr>
  //           <th className="p-4">User</th>
  //           <th className="p-4">Court</th>
  //           <th className="p-4">Date</th>
  //           <th className="p-4">Status</th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {history.map(b => (
  //           <tr key={b.id} className="border-t">
  //             <td className="p-4">{b.users?.username}</td>
  //             <td className="p-4">{b.courts?.name}</td>
  //             <td className="p-4">{new Date(b.booking_date).toLocaleString()}</td>
  //             <td className="p-4">{b.status}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // );
  return (
  <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
    <h1 className="text-3xl font-black text-gray-900 mb-8">
      ประวัติการจอง (Admin)
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {history.length > 0 ? history.map(b => {
        const dateText = b.booking_date
          ? new Date(b.booking_date + "T00:00:00").toLocaleDateString("en-GB")
          : "-";

        return (
          <div
            key={b.id}
            className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {b.courts?.name || "ไม่ระบุสนาม"}
                </h3>
                <p className="text-teal-600 font-bold text-sm uppercase">
                  {b.courts?.category || "-"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  ผู้จอง: {b.users?.username} ({b.users?.email})
                </p>
              </div>

              {/* Status badge */}
              <span
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                  b.status === "paid"
                    ? "bg-green-50 text-green-600"
                    : b.status === "returned"
                    ? "bg-blue-50 text-blue-600"
                    : b.status === "rejected"
                    ? "bg-red-50 text-red-500"
                    : "bg-yellow-50 text-yellow-600"
                }`}
              >
                {b.status}
              </span>
            </div>

            {/* Detail */}
            <div className="space-y-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-2xl mb-6">
              <div className="flex items-center gap-3">
                <span className="text-lg">📅</span>
                <span className="font-bold">{dateText}</span>
              </div>

              {b.receipt_url && (
                <div className="flex items-center gap-3">
                  <span className="text-lg">🧾</span>
                  <button
                    onClick={() => window.open(b.receipt_url, "_blank")}
                    className="text-teal-600 font-bold hover:underline"
                  >
                    view
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-50 pt-4 text-right">
              <span className="text-xs text-gray-400 font-bold">
                Booking ID #{b.id}
              </span>
            </div>
          </div>
        );
      }) : (
        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <p className="text-4xl mb-4">📭</p>
          <p className="text-gray-400 font-bold">
            ไม่พบประวัติการจอง
          </p>
        </div>
      )}
    </div>
  </div>
);
};

export default AdminBookingHistory;