// Comprehensive patch for modern color functions

if (typeof window !== "undefined") {
  console.log("Applying comprehensive CSS color function patch");

  // 1. Patch CSS.supports
  const originalSupports = window.CSS.supports || (() => {});
  window.CSS.supports = function(property, value) {
    // Block oklab and oklch support checks
    if (
      (typeof property === 'string' && property.includes('oklab')) ||
      (typeof property === 'string' && property.includes('oklch')) ||
      (typeof value === 'string' && value.includes('oklab')) ||
      (typeof value === 'string' && value.includes('oklch'))
    ) {
      return false;
    }
    
    // Handle the CSS.supports(condition) overload
    if (arguments.length === 1 && typeof property === 'string') {
      if (property.includes('oklab') || property.includes('oklch')) {
        return false;
      }
    }
    
    return originalSupports.apply(this, arguments);
  };

  // 2. Patch style.setProperty to replace modern color formats
  const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
  CSSStyleDeclaration.prototype.setProperty = function(prop, value, priority) {
    if (typeof value === 'string') {
      // Replace oklab and oklch with hex values
      if (value.includes('oklab')) {
        value = '#393e46';
      } else if (value.includes('oklch')) {
        value = '#00adb5';
      }
    }
    return originalSetProperty.call(this, prop, value, priority);
  };

  // 3. Patch style properties setter
  const originalStyleDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
  if (originalStyleDescriptor && originalStyleDescriptor.set) {
    const originalStyleSetter = originalStyleDescriptor.set;
    
    Object.defineProperty(HTMLElement.prototype, 'style', {
      ...originalStyleDescriptor,
      set: function(value) {
        if (typeof value === 'string' && (value.includes('oklab') || value.includes('oklch'))) {
          value = value.replace(/oklab\([^)]+\)/g, '#393e46')
                       .replace(/oklch\([^)]+\)/g, '#00adb5');
        }
        return originalStyleSetter.call(this, value);
      }
    });
  }

  // 4. Create a MutationObserver to catch dynamically added style attributes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const element = mutation.target;
        const style = element.getAttribute('style');
        
        if (style && (style.includes('oklab') || style.includes('oklch'))) {
          const newStyle = style
            .replace(/oklab\([^)]+\)/g, '#393e46')
            .replace(/oklch\([^)]+\)/g, '#00adb5');
          
          element.setAttribute('style', newStyle);
        }
      }
    });
  });

  // Start observing the document with the configured parameters
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['style'],
    subtree: true
  });
}
