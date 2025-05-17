// Simplified patch for modern color functions - avoids illegal invocations

if (typeof window !== "undefined") {
  console.log("Applying simplified color function patch");

  try {
    // Add a style element with color overrides
    const style = document.createElement("style");
    style.textContent = `
      :root {
        --oklab-override: #393e46;
        --oklch-override: #00adb5;
        
        /* Force color opacity values */
        --tw-text-opacity: 1 !important;
        --tw-bg-opacity: 1 !important;
        --tw-border-opacity: 1 !important;
        --tw-ring-opacity: 1 !important;
      }
      
      /* Target potential problematic elements */
      [style*="oklab"], [style*="oklch"] {
        color: #252525 !important;
        background-color: #ffffff !important;
        border-color: #ebebeb !important;
      }
    `;
    document.head.appendChild(style);

    // Safety check for CSS.supports without modifying prototype
    if (window.CSS && window.CSS.supports) {
      // Create a safe wrapper function that doesn't change the original
      const originalSupports = window.CSS.supports;
      window.CSS.supports = function () {
        try {
          // Block oklab/oklch checks
          const args = Array.from(arguments);
          const stringArgs = args.join(" ");
          if (stringArgs.includes("oklab") || stringArgs.includes("oklch")) {
            return false;
          }
          // Call the original with the correct context
          return originalSupports.apply(window.CSS, args);
        } catch (e) {
          // Fallback in case of error
          console.warn("Error in CSS.supports patch:", e);
          return false;
        }
      };
    }

    console.log("Safe CSS color function patch applied");
  } catch (error) {
    console.error("Error in safe patch:", error);
  }
}
