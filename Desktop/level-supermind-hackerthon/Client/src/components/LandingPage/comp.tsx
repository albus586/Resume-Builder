import React from "react";
import ReactDOM from "react-dom/client";
import { Check } from "lucide-react";

const features = [
  {
    title: "Social Metrics Insights",
    description:
      "Track key social metrics to understand your audience's engagement and optimize your strategy.",
  },
  {
    title: "Real-Time Analytics",
    description:
      "Get real-time updates on post performance, helping you stay ahead of trends and adapt quickly.",
  },
  {
    title: "Content Strategy",
    description:
      "Build and implement a content strategy backed by data to improve your social media presence.",
  },
];

function Features() {
  return (
    <div className="space-y-6">
      {features.map((feature) => (
        <div key={feature.title} className="flex gap-4">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// function Testimonial() {
//   return (
//     <div className="border border-gray-800 rounded-lg p-6 space-y-4">
//       <p className="text-lg">
//         "This tool revolutionized the way I analyze my social media content! I
//         can now easily track metrics and adjust my strategy in real-time."
//       </p>
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden">
//           <img
//             src="/placeholder.svg"
//             alt="Alex Lee"
//             className="w-full h-full object-cover"
//           />
//         </div>
//         <div>
//           <p className="font-semibold">Alex Lee</p>
//           <p className="text-gray-400 text-sm">Social Media Manager</p>
//         </div>
//       </div>
//     </div>
//   );
// }

function FeatureDiagram() {
  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <img
        src="./image.png"
        alt="Feature diagram showing Social Metrics, Real-Time Analytics, Content Strategy"
        className="w-full h-auto"
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white">
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-indigo-400">Social Media Insights</p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Unlock the Full Potential of Your Social Media
              </h1>
              <p className="text-gray-400 text-lg">
                Analyze your social media performance with ease. Our platform
                provides the insights you need to grow your online presence.
              </p>
            </div>

            <Features />
            {/* <Testimonial /> */}
          </div>

          <FeatureDiagram />
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
