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

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Booking History</h1>

      <table className="w-full text-xs bg-white border">
        <thead className="bg-gray-50 text-gray-400 font-bold">
          <tr>
            <th className="p-4">User</th>
            <th className="p-4">Court</th>
            <th className="p-4">Date</th>
            <th className="p-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map(b => (
            <tr key={b.id} className="border-t">
              <td className="p-4">{b.users?.username}</td>
              <td className="p-4">{b.courts?.name}</td>
              <td className="p-4">{new Date(b.booking_date).toLocaleString()}</td>
              <td className="p-4">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminBookingHistory;