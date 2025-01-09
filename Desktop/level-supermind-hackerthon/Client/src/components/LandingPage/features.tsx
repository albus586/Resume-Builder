import { useEffect, useRef } from "react";
import blurredShapeGray from "/images/blurred-shape-gray.svg";
import blurredShape from "/images/blurred-shape.svg";
import featuresImage from "/images/features.png";
import { features } from "./featuresData";

export default function Features() {
  const grayShapeRef = useRef<HTMLDivElement>(null);
  const colorShapeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grayShape = grayShapeRef.current;
    const colorShape = colorShapeRef.current;

    const handleScroll = () => {
      if (grayShape && colorShape) {
        const scrollY = window.scrollY;
        grayShape.style.transform = `translate(-50%, ${scrollY * 0.1}px)`;
        colorShape.style.transform = `translate(-120%, ${scrollY * -0.1}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative">
      <div
        ref={grayShapeRef}
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2 transition-transform duration-300 ease-out"
        aria-hidden="true"
      >
        <img
          src={blurredShapeGray}
          width={760}
          height={668}
          alt="Blurred shape"
          className="max-w-none"
        />
      </div>
      <div
        ref={colorShapeRef}
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-80 -translate-x-[120%] opacity-50 transition-transform duration-300 ease-out"
        aria-hidden="true"
      >
        <img
          src={blurredShape}
          width={760}
          height={668}
          alt="Blurred shape"
          className="max-w-none"
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t py-12 [border-image:linear-gradient(to_right,transparent,theme(colors.slate.400/.25),transparent)1] md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-4 text-center md:pb-12">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-indigo-200/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-indigo-200/50">
              <span className="inline-flex bg-gradient-to-r from-indigo-500 to-indigo-200 bg-clip-text text-transparent">
                Advanced Features
              </span>
            </div>
          </div>

          {/* Features grid */}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article key={index} className="group relative">
                <div className="absolute -right-4 -top-4 text-indigo-500 transition-all duration-300 ease-in-out group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="mb-1 font-nacelle text-[1rem] font-semibold text-gray-200">
                  {feature.title}
                </h3>
                <p className="text-indigo-200/65">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      {/* Features image */}
      <div className="mt-20 text-center">
        <img
          src={featuresImage}
          width={3000} // Increased width
          height={5000} // Increased height
          alt="Features overview"
          className="mx-auto rounded-lg shadow-2xl"
        />
      </div>
    </section>
  );
}
