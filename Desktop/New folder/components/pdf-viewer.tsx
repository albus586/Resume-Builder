"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import html2canvas from "html2canvas";
import { Copy, Check } from "lucide-react";

// Configure the PDF.js worker with the correct version (3.11.174)
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
}

interface PDFViewerProps {
  file: string;
  pageNumber: number;
  onLoadSuccess: (numPages: number) => void;
  onError: (error: Error) => void;
  defaultScale?: number; // Add new prop for default scale
}

interface SelectionCoords {
  x: number;
  y: number;
}

interface StoredSelection {
  imageData: string;
  timestamp: string;
  page: number;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  file,
  pageNumber,
  onLoadSuccess,
  onError,
  defaultScale = 1.2, // Default to 1.2 if not provided
}) => {
  const [scale, setScale] = useState(defaultScale);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<SelectionCoords | null>(
    null
  );
  const [selectionEnd, setSelectionEnd] = useState<SelectionCoords | null>(
    null
  );
  const [showSelectionMenu, setShowSelectionMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedImageData, setSelectedImageData] = useState<string | null>(
    null
  );
  const [isCopied, setIsCopied] = useState(false);

  // Keep these states but hide their UI
  // Use empty array destructuring to ignore the first element of useState
  const [, setStoredSelections] = useState<StoredSelection[]>([]);

  // Add these new state variables
  // Use empty array destructuring to ignore the first element of useState
  const [, setCurrentSelection] = useState<{
    rect: DOMRect | null;
    imageData: string | null;
  }>({ rect: null, imageData: null });
  const [menuVisible, setMenuVisible] = useState(false);

  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);
  // Add a ref for the Page component
  const pageRef = useRef<HTMLDivElement>(null);

  // Load stored selections on mount - keep this for data persistence
  useEffect(() => {
    try {
      const selections = JSON.parse(
        localStorage.getItem("pdf-selections") || "[]"
      );
      setStoredSelections(selections);
    } catch (error) {
      console.error("Error loading stored selections:", error);
    }
  }, []);

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    onLoadSuccess(numPages);
  };

  // Calculate optimal width based on container size
  const calculateOptimalWidth = () => {
    if (typeof window !== "undefined") {
      // Responsive width calculation based on viewport
      const viewportWidth = window.innerWidth;
      if (viewportWidth < 768) {
        return viewportWidth * 0.85; // For mobile devices
      } else if (viewportWidth < 1200) {
        return 550; // For medium screens
      } else {
        return 650; // For larger screens
      }
    }
    return 550; // Default fallback
  };

  // Zoom controls
  const zoomIn = () => setScale(scale + 0.1);
  const zoomOut = () => setScale(Math.max(0.5, scale - 0.1));
  const resetZoom = () => setScale(1.2);

  // Prevent text selection during box selection - Update this function
  useEffect(() => {
    if (!pdfContainerRef.current) return;

    // Copy ref to avoid React hooks warning
    const container = pdfContainerRef.current;

    // Safer way to handle styling
    const applyStyles = (element: HTMLElement, selecting: boolean) => {
      if (selecting) {
        element.style.setProperty("user-select", "none");
        element.style.setProperty("-webkit-user-select", "none");
        element.style.setProperty("-moz-user-select", "none");
        element.style.setProperty("-ms-user-select", "none");
      } else {
        element.style.removeProperty("user-select");
        element.style.removeProperty("-webkit-user-select");
        element.style.removeProperty("-moz-user-select");
        element.style.removeProperty("-ms-user-select");
      }
    };

    applyStyles(container, isSelecting);

    return () => {
      // Use saved container reference for cleanup
      if (container) {
        applyStyles(container, false);
      }
    };
  }, [isSelecting]);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!pdfContainerRef.current) return;

    // Prevent default text selection
    e.preventDefault();

    // Get position relative to the PDF container
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsSelecting(true);
    setSelectionStart({ x, y });
    setSelectionEnd({ x, y });
    setShowSelectionMenu(false);
  }, []);

  // Handle mouse move to update selection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isSelecting || !pdfContainerRef.current) return;

      const rect = pdfContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSelectionEnd({ x, y });
    },
    [isSelecting]
  );

  // Handle mouse up to end selection
  const handleMouseUp = useCallback(async () => {
    if (!isSelecting || !pdfContainerRef.current || !selectionStart) return;

    setIsSelecting(false);

    // Only show menu if we've actually made a selection (not just a click)
    if (
      selectionEnd &&
      Math.abs(selectionStart.x - selectionEnd.x) > 10 &&
      Math.abs(selectionStart.y - selectionEnd.y) > 10
    ) {
      // Calculate the top-center position of the selection box for menu placement
      const left =
        Math.min(selectionStart.x, selectionEnd.x) +
        Math.abs(selectionStart.x - selectionEnd.x) / 2;
      const top = Math.min(selectionStart.y, selectionEnd.y);

      // Position menu above the selection
      setMenuPosition({
        x: left,
        y: top,
      });

      // Capture screenshot of selected area
      if (selectionRef.current) {
        try {
          const selectionRect = selectionRef.current.getBoundingClientRect();
          const pdfRect = pdfContainerRef.current.getBoundingClientRect();

          const canvas = await html2canvas(pdfContainerRef.current, {
            x: selectionRect.left - pdfRect.left,
            y: selectionRect.top - pdfRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
            backgroundColor: null,
            scale: window.devicePixelRatio * 2, // Better quality
          });

          const imageData = canvas.toDataURL("image/png");
          setSelectedImageData(imageData);

          // Store current selection information
          setCurrentSelection({
            rect: selectionRect,
            imageData: imageData,
          });

          // Save to localStorage
          const newSelection = {
            imageData,
            timestamp: new Date().toISOString(),
            page: pageNumber,
          };

          const selections = JSON.parse(
            localStorage.getItem("pdf-selections") || "[]"
          );
          selections.push(newSelection);
          localStorage.setItem("pdf-selections", JSON.stringify(selections));

          // Store the most recent selection separately for easy access
          localStorage.setItem("recent-pdf-selection", imageData);

          // Dispatch a custom event to notify the chat component
          const event = new CustomEvent("pdf-selection-created", {
            detail: { imageData },
          });
          window.dispatchEvent(event);

          console.log("PDF selection created and stored");

          // Update local state
          setStoredSelections([...selections]);

          // Show the selection menu and keep selection visible
          setShowSelectionMenu(true);
          setMenuVisible(true);
        } catch (error) {
          console.error("Error capturing selection:", error);
        }
      }
    }
  }, [isSelecting, selectionStart, selectionEnd, pageNumber]);

  // Handle clicks outside the selection menu - modify to not immediately close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSelectionMenu) {
        // Check if click is inside the menu
        const menuElement = document.querySelector(".selection-menu");
        if (menuElement && !menuElement.contains(e.target as Node)) {
          // Only close if clicked outside the menu
          setShowSelectionMenu(false);
          setMenuVisible(false);
          setCurrentSelection({ rect: null, imageData: null });
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSelectionMenu]);

  // Handle option selection - modify to save the selection and close the menu
  const handleOptionClick = (action: string) => {
    // Preserve the selection data for the specific action
    const selectionData = {
      imageData: selectedImageData,
      action: action,
      timestamp: new Date().toISOString(),
      page: pageNumber,
    };

    switch (action) {
      case "explain":
      case "summarize":
      case "rewrite":
        console.log(`${action} selected text`, selectionData);
        break;
      case "copy":
        if (selectedImageData) {
          navigator.clipboard.writeText("Selected PDF content copied");
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        }
        break;
      default:
        if (action.startsWith("highlight-")) {
          const color = action.split("-")[1];
          console.log(`Highlight with color: ${color}`, selectionData);
        }
    }

    // Close the menu and reset selection state
    setShowSelectionMenu(false);
    setMenuVisible(false);
    setCurrentSelection({ rect: null, imageData: null });
  };

  const highlightColors = [
    { name: "yellow", color: "#FFEB3B" },
    { name: "green", color: "#4CAF50" },
    { name: "blue", color: "#2196F3" },
    { name: "pink", color: "#E91E63" },
    { name: "orange", color: "#FF9800" },
    { name: "purple", color: "#9C27B0" },
    { name: "red", color: "#F44336" },
  ];

  // Calculate selection box dimensions
  const getSelectionStyle = () => {
    if (!selectionStart || !selectionEnd) return {};

    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionStart.x - selectionEnd.x);
    const height = Math.abs(selectionStart.y - selectionEnd.y);

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="flex justify-end w-full mb-2">
        {/* Remove the selections button */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-md p-1">
          <button
            onClick={zoomOut}
            className="p-1 text-gray-600 hover:bg-gray-200 rounded-md text-sm"
            aria-label="Zoom out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <span className="text-xs font-medium">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1 text-gray-600 hover:bg-gray-200 rounded-md text-sm"
            aria-label="Zoom in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              <line x1="11" y1="8" x2="11" y2="14"></line>
              <line x1="8" y1="11" x2="14" y2="11"></line>
            </svg>
          </button>
          <button
            onClick={resetZoom}
            className="p-1 text-gray-600 hover:bg-gray-200 rounded-md text-sm"
            aria-label="Reset zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9z"></path>
              <path d="M9 12h6"></path>
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={pdfContainerRef}
        className={`pdf-container flex-grow overflow-auto w-full flex justify-center relative ${
          isSelecting ? "selecting-mode" : ""
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          cursor: isSelecting ? "crosshair" : "default",
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE */,
        }}
      >
        <Document
          file={file}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={onError}
          onSourceError={onError}
          loading={
            <div className="flex items-center justify-center h-full w-full">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-32 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-red-600 font-medium">Error loading PDF</p>
              <p className="text-gray-500 text-sm mt-2">
                Please try again or use a different file.
              </p>
            </div>
          }
        >
          <div ref={pageRef} className="relative">
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-lg"
              width={calculateOptimalWidth()}
              scale={scale}
              renderMode="canvas"
              canvasBackground="#fff"
              // Add event handlers to prevent default text selection
              onMouseDown={(e) => isSelecting && e.preventDefault()}
            />
          </div>
        </Document>

        {/* Selection box - Modify to show even after selection is complete if menu is visible */}
        {(isSelecting || menuVisible) && selectionStart && selectionEnd && (
          <div
            ref={selectionRef}
            className="absolute pointer-events-none"
            style={{
              border: "2px dashed #00ADB5",
              backgroundColor: "rgba(0, 173, 181, 0.1)",
              ...getSelectionStyle(),
            }}
          ></div>
        )}

        {/* Selection menu - Enhanced with position above the selection */}
        {showSelectionMenu && selectedImageData && (
          <div
            className="absolute z-50 bg-white shadow-lg rounded-md p-2 selection-menu"
            style={{
              left: `${menuPosition.x}px`,
              bottom: `calc(100% - ${menuPosition.y}px + 10px)`, // Position above selection
              transform: "translateX(-50%)", // Center horizontally
              marginBottom: "5px", // Small gap between menu and selection
              animation: "fadeIn 0.2s ease-in-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Add a small instruction text */}
            <div className="text-center mb-2">
              <span className="text-xs text-gray-500">Choose an action:</span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <button
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded font-medium"
                onClick={() => handleOptionClick("explain")}
              >
                Explain
              </button>
              <button
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded font-medium"
                onClick={() => handleOptionClick("summarize")}
              >
                Summarize
              </button>
              <button
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded font-medium"
                onClick={() => handleOptionClick("rewrite")}
              >
                Rewrite
              </button>
            </div>

            <div className="flex items-center gap-2 border-t pt-2">
              {highlightColors.map((hc) => (
                <button
                  key={hc.name}
                  className="w-5 h-5 rounded-full hover:ring-2 ring-offset-1 ring-gray-400"
                  style={{ backgroundColor: hc.color }}
                  onClick={() => handleOptionClick(`highlight-${hc.name}`)}
                  aria-label={`Highlight with ${hc.name}`}
                />
              ))}
              <button
                className="w-7 h-7 ml-2 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-full"
                onClick={() => handleOptionClick("copy")}
                aria-label="Copy selection"
              >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>

            {/* Change arrow to point down instead of up */}
            <div
              className="w-3 h-3 bg-white absolute"
              style={{
                bottom: "-6px", // Position at bottom of menu
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)", // Point down
                boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.05)",
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Add global styles for selection */}
      <style jsx global>{`
        .selecting-mode {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        /* Hide scrollbars but keep functionality */
        .pdf-container::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        /* Also hide Document component scrollbars */
        .react-pdf__Document {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE */
        }

        .react-pdf__Document::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .selection-menu {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
};
