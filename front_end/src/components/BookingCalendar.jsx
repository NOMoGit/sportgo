import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

export default function BookingCalendar({ onSelectDate }) {
  return (
    // <FullCalendar
    //   plugins={[dayGridPlugin, interactionPlugin]}
    //   initialView="dayGridMonth"
    //   height="auto"
    //   selectable={true}
    //   dateClick={(info) => {
    //     onSelectDate(info.dateStr); // ส่งวันที่กลับ
    //   }}
    // />
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      height="80vh"
      selectable={true}
      dateClick={(info) => {
        onSelectDate(info.dateStr);
      }}
    />
  );
}