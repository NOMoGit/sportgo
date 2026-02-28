
// import { useState, useEffect } from "react";
// import BookingCalendar from "../../components/BookingCalendar";

// export default function HomePage() {
//   const images = [
//     "https://i.pinimg.com/1200x/ac/ea/bd/aceabd555e4f6a1e4d2c6151383397f5.jpg",
//     "https://i.pinimg.com/1200x/cc/b4/ed/ccb4ed99cad4201e54e18085d132812b.jpg",
//     "https://i.pinimg.com/1200x/0f/ad/ee/0fadee641661bfb0a1e1bed51d2a5c94.jpg",
//     "https://i.pinimg.com/1200x/8d/74/09/8d7409f39ced59cbdf9c73b476f0ba5a.jpg"
//   ];

//   const [currentIndex, setCurrentIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentIndex((prev) => (prev + 1) % images.length);
//     }, 3000); // เปลี่ยนรูปทุก 3 วินาที

//     return () => clearInterval(interval);
//   }, []);

//   const handleSelectDate = (date) => {
//     console.log("เลือกวันที่:", date);
//   };

//   return (
//     <div className="p-8 flex justify-center">
//       <div className="w-full max-w-7xl bg-white rounded-2xl shadow border overflow-hidden">

//         {/* รูปสนาม (Slider) */}
//         <div className="h-125 relative">
//           <img
//             src={images[currentIndex]}
//             className="w-full h-full object-cover transition-opacity duration-800"
//           />
//         </div>

//         {/* ปฏิทิน */}
//         <div className="p-6">
//           <BookingCalendar onSelectDate={handleSelectDate} />
//         </div>

//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import BookingCalendar from "../../components/BookingCalendar";
import { Link, useNavigate, useLocation } from "react-router-dom";
export default function HomePage() {
  const images = [
    "https://i.pinimg.com/1200x/ac/ea/bd/aceabd555e4f6a1e4d2c6151383397f5.jpg",
    "https://i.pinimg.com/1200x/cc/b4/ed/ccb4ed99cad4201e54e18085d132812b.jpg",
    "https://i.pinimg.com/1200x/0f/ad/ee/0fadee641661bfb0a1e1bed51d2a5c94.jpg",
    "https://i.pinimg.com/1200x/8d/74/09/8d7409f39ced59cbdf9c73b476f0ba5a.jpg"
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectDate = (date) => {
    console.log("เลือกวันที่:", date);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* 🔹 HERO SECTION */}
      <div className="relative h-[500px] overflow-hidden">
        {/* <img
          src={images[currentIndex]}
          className="w-full h-full object-cover transition-opacity duration-1000"
        /> */}
        <img
          key={currentIndex}
          src={images[currentIndex]}
          className="w-full h-full object-cover transition-opacity duration-1000"
        />


        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Text Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
            Book Your Court Easily
          </h1>
          <p className="text-lg mb-6 max-w-2xl">
            Reserve your favorite sports court in just a few clicks. 
            Fast, simple and convenient.
          </p>
          {/* <button className="bg-[#2563EB] hover:bg-blue-700 transition px-8 py-3 rounded-xl font-semibold shadow-lg">
            <Link to="/booking" className="text-white">START RESERVATION</Link>
          </button> */}
          <Link to="/booking" 
          className="bg-[#2563EB] hover:bg-blue-700 transition px-8 py-3 rounded-xl font-semibold shadow-lg text-white inline-block" 
          > START RESERVATION </Link>
        </div>
      </div>

      {/* 🔹 CALENDAR SECTION */}
      <div className="w-full px-6 mt-10 h-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 w-full">
          
          {/* <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Select Booking Date
          </h2> */}

          <BookingCalendar onSelectDate={handleSelectDate} />

        </div>
      </div>
    </div>
  );
}