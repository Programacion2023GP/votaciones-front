import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
   children: React.ReactNode;
   title: string;
   position?: "top" | "bottom" | "left" | "right";
}

const Tooltip: React.FC<TooltipProps> = ({ children, title, position = "top" }) => {
   const [show, setShow] = useState(false);
   const [coords, setCoords] = useState({ top: 0, left: 0 });
   const triggerRef = useRef<HTMLDivElement>(null);
   const timeoutRef = useRef<NodeJS.Timeout>();

   const updatePosition = () => {
      if (triggerRef.current) {
         const rect = triggerRef.current.getBoundingClientRect();
         const scrollX = window.scrollX;
         const scrollY = window.scrollY;
         let top = rect.top + scrollY;
         let left = rect.left + scrollX;
         switch (position) {
            case "top":
               top = rect.top + scrollY - 8;
               left = rect.left + scrollX + rect.width / 2;
               break;
            case "bottom":
               top = rect.bottom + scrollY + 8;
               left = rect.left + scrollX + rect.width / 2;
               break;
            case "left":
               top = rect.top + scrollY + rect.height / 2;
               left = rect.left + scrollX - 8;
               break;
            case "right":
               top = rect.top + scrollY + rect.height / 2;
               left = rect.right + scrollX + 8;
               break;
         }
         setCoords({ top, left });
      }
   };

   useEffect(() => {
      if (show) {
         updatePosition();
         window.addEventListener("scroll", updatePosition);
         window.addEventListener("resize", updatePosition);
      }
      return () => {
         window.removeEventListener("scroll", updatePosition);
         window.removeEventListener("resize", updatePosition);
      };
   }, [show]);

   const handleMouseEnter = () => {
      timeoutRef.current = setTimeout(() => {
         updatePosition();
         setShow(true);
      }, 150);
   };

   const handleMouseLeave = () => {
      clearTimeout(timeoutRef.current);
      setShow(false);
   };

   return (
      <>
         <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ display: "inline-block" }}>
            {children}
         </div>
         {show &&
            createPortal(
               <div
                  className="tooltip"
                  data-tip="hello"
                  style={{
                     position: "absolute",
                     top: coords.top,
                     left: coords.left,
                     transform: `translate(${position === "top" || position === "bottom" ? "-50%" : "-50%"}, ${position === "top" || position === "bottom" ? "-100%" : "-50%"})`,
                     background: "#1f2937",
                     color: "white",
                     padding: "4px 8px",
                     borderRadius: "4px",
                     fontSize: "12px",
                     whiteSpace: "nowrap",
                     zIndex: 99999,
                     pointerEvents: "none"
                  }}
               >
                  {title}
               </div>,
               document.body
            )}
      </>
   );
};

export default Tooltip;
