import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

const ConsultationCharts = () => {
  const analytics = {
    consultationsByCity: [
      { city: "Mumbai", totalConsultations: 120 },
      { city: "Delhi", totalConsultations: 95 },
      { city: "Bangalore", totalConsultations: 80 },
      { city: "Pune", totalConsultations: 60 },
      { city: "Chennai", totalConsultations: 40 },
    ],
    monthlyConsultations: [
      { month: 1, totalConsultations: 30 },
      { month: 2, totalConsultations: 45 },
      { month: 3, totalConsultations: 60 },
      { month: 4, totalConsultations: 50 },
      { month: 5, totalConsultations: 70 },
      { month: 6, totalConsultations: 80 },
      { month: 7, totalConsultations: 95 },
      { month: 8, totalConsultations: 100 },
      { month: 9, totalConsultations: 85 },
      { month: 10, totalConsultations: 90 },
      { month: 11, totalConsultations: 60 },
      { month: 12, totalConsultations: 40 },
    ],
  };

  const colors = [
    "#3A3963",
    "#4A497A",
    "#5C5B92",
    "#6F6EAA",
    "#8A89C2",
    "#A6A5D9",
  ];

  const donutData = {
    labels: analytics.consultationsByCity.map((c) => c.city),
    datasets: [
      {
        data: analytics.consultationsByCity.map((c) => c.totalConsultations),
        backgroundColor: colors,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" },
      tooltip: {
        callbacks: {
          label: (item) => `${item.raw} consultations`,
        },
      },
    },
  };

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const barData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Month Wise Consultations",
        data: monthLabels.map((_, i) => {
          const data = analytics.monthlyConsultations.find(
            (m) => m.month === i + 1,
          );
          return data ? data.totalConsultations : 0;
        }),
        backgroundColor: colors,
        borderRadius: 5,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: "top" } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } },
    },
  };

  return (
    <div className="flex flex-col md:flex-row sm:flex-wrap justify-between mt-5 gap-5">
      {/* Donut Chart */}
      <div className="flex-1 p-1 h-70 rounded-lg bg-white hover:shadow-md flex justify-center items-center transition-all duration-300">
        <div className="w-72 h-72">
          <Doughnut data={donutData} options={donutOptions} />
        </div>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 p-1 min-h-64 rounded-lg bg-white hover:shadow-md flex justify-center items-center transition-all duration-300">
        <div className="w-full h-80">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default ConsultationCharts;

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { Bar, Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// );

// const MyCharts = () => {
//   const [selectedOption, setSelectedOption] = useState(
//     "Bookings by Property Type",
//   );
//   const [analytics, setAnalytics] = useState({
//     bookingsByDestination: [],
//     bookingsByPropertyType: [],
//     revenueByDestination: [],
//     monthlyBookingsTrend: [],
//     bookingStatusBreakdown: [],
//   });

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const res = await axios.get(
//           "https://dash.zorbastays.com/web-backend/getAnalytics",
//         );
//         setAnalytics(res.data);
//       } catch (err) {
//         console.error("Error fetching analytics:", err);
//       }
//     };

//     fetchAnalytics();
//   }, []);

//   // Prepare chart data dynamically
//   const greenShades = [
//     "#3A3963", // dark green
//     "#4A497A",
//     "#5C5B92",
//     "#6F6EAA",
//     "#8A89C2",
//     "#A6A5D9",
//   ];

//   const chartDatasets = {
//     "Bookings by Destination": {
//       labels: analytics.bookingsByDestination.map((b) => b.destination),
//       datasets: [
//         {
//           data: analytics.bookingsByDestination.map((b) => b.totalBookings),
//           backgroundColor: greenShades.slice(
//             0,
//             analytics.bookingsByDestination.length,
//           ),
//         },
//       ],
//     },
//     "Bookings by Property Type": {
//       labels: analytics.bookingsByPropertyType.map((b) => b.propertyType),
//       datasets: [
//         {
//           data: analytics.bookingsByPropertyType.map((b) => b.totalBookings),
//           backgroundColor: greenShades.slice(
//             0,
//             analytics.bookingsByPropertyType.length,
//           ),
//         },
//       ],
//     },
//     "Revenue by Destination": {
//       labels: analytics.revenueByDestination.map((r) => r.destination),
//       datasets: [
//         {
//           data: analytics.revenueByDestination.map((r) =>
//             Number(r.totalRevenue || 0),
//           ),
//           backgroundColor: greenShades.slice(
//             0,
//             analytics.revenueByDestination.length,
//           ),
//         },
//       ],
//     },
//   };

//   const donutOptions = {
//     responsive: true,
//     plugins: {
//       tooltip: {
//         callbacks: {
//           label: function (tooltipItem) {
//             return tooltipItem.raw + " units";
//           },
//         },
//       },
//       legend: { position: "right" },
//     },
//   };

//   // const barData = {
//   //   labels: [
//   //     "data-type 1",
//   //     "data-type 2",
//   //     "data-type 3",
//   //     "data-type 4",
//   //     "data-type 5",
//   //     "data-type 6",
//   //     "data-type 7",
//   //     "data-type 8",
//   //     "data-type 9",
//   //     "data-type 10",
//   //   ],
//   //   datasets: [
//   //     {
//   //       label: "Data in %",
//   //       data: [65, 59, 80, 71, 26, 25, 23, 19, 20, 90],
//   //       backgroundColor: [
//   //         "#14532D",
//   //         "#1C5E3A",
//   //         "#236C43",
//   //         "#2E7B4D",
//   //         "#3A8B58",
//   //         "#4A9C65",
//   //         "#5BAE73",
//   //         "#6EBC80",
//   //         "#7AAA78",
//   //         "#6F8F6C",
//   //       ],
//   //       // borderColor: "purple",
//   //       // borderWidth: 0,
//   //       borderRadius: 10,
//   //     },
//   //   ],
//   // };

//   // const barOptions = {
//   //   responsive: true,
//   //   plugins: {
//   //     title: {
//   //       display: true,
//   //       text: "Traffic Analysis",
//   //     },
//   //     legend: {
//   //       position: "top",
//   //     },
//   //   },
//   //   scales: {
//   //     x: {
//   //       grid: {
//   //         display: false,
//   //       },
//   //     },
//   //     y: {
//   //       grid: {
//   //         display: false,
//   //       },
//   //     },
//   //   },
//   // };
//   const [barOption, setBarOption] = useState("Monthly Bookings Trend");

//   const monthLabels = [
//     "Jan",
//     "Feb",
//     "Mar",
//     "Apr",
//     "May",
//     "Jun",
//     "Jul",
//     "Aug",
//     "Sep",
//     "Oct",
//     "Nov",
//     "Dec",
//   ];

//   const barDatasets = {
//     "Monthly Bookings Trend": {
//       labels: monthLabels,
//       datasets: [
//         {
//           label: "Bookings",
//           data: monthLabels.map((_, i) => {
//             const monthData = analytics.monthlyBookingsTrend.find(
//               (m) => m.month === i + 1, // backend returns month as number (1–12)
//             );
//             return monthData ? monthData.totalBookings : 0;
//           }),
//           backgroundColor: greenShades.slice(0, 12),
//           borderRadius: 10,
//         },
//       ],
//     },
//     "Booking Status Breakdown": {
//       labels: analytics.bookingStatusBreakdown.map(
//         (s) => s.bookingStatus || "Unknown", // handle null
//       ),
//       datasets: [
//         {
//           label: "Bookings",
//           data: analytics.bookingStatusBreakdown.map((s) => s.total),
//           backgroundColor: greenShades.slice(
//             0,
//             analytics.bookingStatusBreakdown.length,
//           ),
//           borderRadius: 10,
//         },
//       ],
//     },
//   };

//   const barOptions = {
//     responsive: true,
//     plugins: {
//       title: {
//         display: false,
//         text: barOption,
//       },
//       legend: { position: "top" },
//     },
//     scales: {
//       x: { grid: { display: false } },
//       y: { grid: { display: false } },
//     },
//   };

//   return (
//     <div className="flex flex-col md:flex-row sm:flex-wrap justify-between mt-5 gap-5">
//       {/* Donut Chart */}
//       <div className="relative flex-1 p-1 h-70 rounded-lg bg-white hover:shadow-md flex justify-center items-center transition-all ease-in-out duration-300">
//         <div className="absolute top-2 right-2">
//           <select
//             value={selectedOption}
//             onChange={(e) => setSelectedOption(e.target.value)}
//             className="border-gray-400 px-3 text-sm border border-gray-300/50 rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//           >
//             {/* <option>Bookings by Destination</option> */}
//             <option>Bookings by Property Type</option>
//             <option>Revenue by Destination</option>
//           </select>
//         </div>
//         <div className="w-72 h-72">
//           <Doughnut
//             data={chartDatasets[selectedOption]}
//             options={donutOptions}
//           />
//         </div>
//       </div>

//       {/* Bar Chart */}
//       {/* <div className="flex-1 p-1 min-h-64 rounded-lg bg-white hover:shadow-md flex justify-center items-center transition-all ease-in-out duration-300">
//         <Bar data={barData} options={barOptions} />
//       </div> */}
//       {/* Bar Chart */}
//       <div className="relative flex-1 p-1 min-h-64 rounded-lg bg-white hover:shadow-md flex flex-col justify-center items-center transition-all ease-in-out duration-300">
//         {/* Dropdown */}
//         <div className="absolute top-2 right-2">
//           <select
//             value={barOption}
//             onChange={(e) => setBarOption(e.target.value)}
//             className="border-gray-400 px-3 text-sm border border-gray-300/50 rounded-lg w-full focus:outline-none placeholder:text-black/25 focus:ring-0 focus:border-black focus:shadow-md"
//           >
//             <option>Monthly Bookings Trend</option>
//             <option>Booking Status Breakdown</option>
//           </select>
//         </div>

//         <div className="w-full h-80 mt-12">
//           <Bar data={barDatasets[barOption]} options={barOptions} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MyCharts;
