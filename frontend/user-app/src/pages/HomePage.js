import React from "react";

function HomePage() {
  const driveTimes = [
    { day: "Fri 26th Dec", meeting: "Leopardstown", time: "9:30am" },
    { day: "Sat 27th Dec", meeting: "Leopardstown", time: "9:15am" },
    { day: "Sun 28th Dec", meeting: "Leopardstown", time: "10:00am" },
    { day: "Mon 29th Dec", meeting: "Leopardstown", time: "9:30am" },
    { day: "Wed 30th Dec", meeting: "Punchestown", time: "10:00am" },
    
    
  ];

  const corporate = [
    { date: "Fri 26th Dec", meeting: "Leopardstown", amount: "2" },
    { date: "Sat 27th Dec", meeting: "Leopardstown", amount: "2" },
    { date: "Sun 28th Dec", meeting: "Leopardstown", amount: "3" },
    { date: "Mon 29th Dec", meeting: "Leopardstown", amount: "2" },
    { date: "Thur 1st Jan", meeting: "Fairyhouse", amount: "2 " },
   
  ];

  const premium = [
    { date: "Fri 26th Dec", meeting: "Limerick", amount: "2" },
    { date: "Sat 27th Dec", meeting: "Limerick", amount: "2" },
    { date: "Sun 28th Dec", meeting: "Limerick", amount: "3" },
    { date: "Mon 29th Dec", meeting: "Limerick", amount: "2" },
    { date: "Thur 22nd Jan", meeting: "Gowran Park", amount: "2" },
   
  ];

  return (
    <div className="container mx-auto p-6 sm:p-8">
      
      <h2 className="text-2xl font-bold text-gray-700 mt-2 mb-4">
        Upcoming Premium Pitch Fixtures:
      </h2>      

      {/* Premium Area Table container for scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-orange-800 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Meeting</th>
              <th className="py-3 px-4 text-left"># Pitches</th>
            </tr>
          </thead>
          <tbody>
            {premium.map((p, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-800">{p.date}</td>
                <td className="py-3 px-4 text-gray-700">{p.meeting}</td>
                <td className="py-3 px-4 text-gray-700">{p.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>      

      <h2 className="text-2xl font-bold text-gray-700 mt-6 mb-4">
        Upcoming Corporate Pitch Fixtures:
      </h2>

      {/* Corporate Area Table container for scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Meeting</th>
              <th className="py-3 px-4 text-left"># Pitches</th>
            </tr>
          </thead>
          <tbody>
            {corporate.map((c, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-blue-50 transition"
              >
                <td className="py-3 px-4 font-medium text-gray-800">{c.date}</td>
                <td className="py-3 px-4 text-gray-700">{c.meeting}</td>
                <td className="py-3 px-4 text-gray-700">{c.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold text-gray-700 mt-6 mb-4">
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
                <td className="py-3 px-4 font-medium text-gray-800">{d.day}</td>
                <td className="py-3 px-4 text-gray-700">{d.meeting}</td>
                <td className="py-3 px-4 text-gray-700">{d.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    </div>
  );
}

export default HomePage;

