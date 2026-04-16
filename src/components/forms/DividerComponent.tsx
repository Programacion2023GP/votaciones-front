import React from "react";

interface DividerComponentProps {
   title: string;
   orientation?: "horizontal" | "vertical";
   className?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * DividerComponent - Componente de separador con texto usando DaisyUI.
 * @param title - Texto que aparece en el centro del separador (solo en horizontal).
 * @param orientation - "horizontal" (por defecto) o "vertical".
 * @param className - Clases CSS adicionales.
 */
const DividerComponent: React.FC<DividerComponentProps> = ({ title, orientation = "horizontal", className = "" }) => {
   if (orientation === "horizontal") {
      return <div className={`divider ${className}`}>{title}</div>;
   }

   // Para vertical, DaisyUI no soporta texto, así que mostramos solo la línea vertical
   return <div className={`divider-vertical ${className}`}></div>;
};

export default DividerComponent;
