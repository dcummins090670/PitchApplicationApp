import React from "react";

function HomePage() {
  const driveTimes = [
    { day: "Friday", meeting: "Leopardstown", time: "9:30am" },
    { day: "Saturday", meeting: "Leopardstown", time: "9:15am" },
    { day: "Sunday", meeting: "Leopardstown", time: "10:00am" },
    { day: "Monday", meeting: "Leopardstown", time: "9:30am" },
    { day: "Tuesday", meeting: "No Racing", time: " " },
    { day: "Wednesday", meeting: "Punchestown", time: "10:00am" },
    { day: "Thursday", meeting: "Tramore", time: "10:00am" },
    
  ];

  const corporate = [
    { date: "26th Dec", meeting: "Leopardstown", amount: "2" },
    { date: "27th Dec", meeting: "Leopardstown", amount: "2" },
    { date: "28th Dec", meeting: "Leopardstown", amount: "3" },
    { date: "29th Dec", meeting: "Leopardstown", amount: "2" },
    { date: "1st Jan", meeting: "Fairyhouse", amount: "2 " },
   
  ];

  const premium = [
    { date: "22nd Jan", meeting: "Gowran Park", amount: "2" },
   
  ];

  return (
    <div className="container mx-auto p-6 sm:p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-4">
        Welcome to the Bookmaker App
      </h1>
      <h2 className="text-1xl font-bold text-gray-500 mb-4">
        Drive-in times for upcoming meetings are as follows:
      </h2>

      {/* Drive-In Table container for scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Day</th>
              <th className="py-3 px-4 text-left">Meeting</th>
              <th className="py-3 px-4 text-left">Drive-In Time</th>
            </tr>
          </thead>
          <tbody>
            {driveTimes.map((d, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {d.day}
                </td>
                <td className="py-3 px-4 text-gray-700">{d.meeting}</td>
                <td className="py-3 px-4 text-gray-700">{d.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

       <h2 className="text-1xl font-bold text-gray-500 mt-6 mb-4">
        Upcoming Premium Pitches Available:
      </h2>      

      {/* Premium Area Table container for scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-orange-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Meeting</th>
              <th className="py-3 px-4 text-left">Number Available</th>
            </tr>
          </thead>
          <tbody>
            {premium.map((p, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {p.date}
                </td>
                <td className="py-3 px-4 text-gray-700">{p.meeting}</td>
                <td className="py-3 px-4 text-gray-700">{p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>      

      <h2 className="text-1xl font-bold text-gray-500 mt-6 mb-4">
        Upcoming Corporate Pitches Available:
      </h2>

      {/* Corporate Area Table container for scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Meeting</th>
              <th className="py-3 px-4 text-left">Number Available</th>
            </tr>
          </thead>
          <tbody>
            {corporate.map((c, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-800">
                  {c.date}
                </td>
                <td className="py-3 px-4 text-gray-700">{c.meeting}</td>
                <td className="py-3 px-4 text-gray-700">{c.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default HomePage;
