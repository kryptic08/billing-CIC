"use client";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface TooltipPortalProps {
  isVisible: boolean;
  x: number;
  y: number;
  children: React.ReactNode;
}

export const TooltipPortal = ({
  isVisible,
  x,
  y,
  children,
}: TooltipPortalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || typeof window === "undefined") {
    return null;
  }

  // Ensure tooltip stays within viewport bounds
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const tooltipWidth = 200; // Estimated tooltip width
  const tooltipHeight = 80; // Estimated tooltip height

  let adjustedX = x;
  let adjustedY = y;

  // Prevent tooltip from going off the right edge
  if (x + tooltipWidth > viewportWidth) {
    adjustedX = viewportWidth - tooltipWidth - 10;
  }

  // Prevent tooltip from going off the left edge
  if (adjustedX < 10) {
    adjustedX = 10;
  }

  // Prevent tooltip from going off the bottom edge
  if (y + tooltipHeight > viewportHeight) {
    adjustedY = y - tooltipHeight - 10;
  }

  // Prevent tooltip from going off the top edge
  if (adjustedY < 10) {
    adjustedY = 10;
  }

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[9999] px-3 py-2 text-sm font-medium text-white bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl pointer-events-none border border-gray-600/50"
          style={{
            left: adjustedX,
            top: adjustedY,
            transform: "translateX(-50%)",
            maxWidth: "200px",
            wordWrap: "break-word",
          }}
        >
          {children}
          <div
            className="absolute border-4 border-transparent border-t-gray-900/95"
            style={{
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
