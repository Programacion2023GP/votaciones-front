import React, { useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

type ChartType = "bar" | "line" | "pie" | "horizontalBar";

interface ChartWrapperProps {
   type: ChartType;
   data: any[];
   dataKey?: string;
   nameKey?: string;
   colors?: string[];
   title?: string;
   layout?: "horizontal" | "vertical";
   height?: number;
   tooltipFormatter?: (value: any, name: any, props: any) => any;
   /** Etiqueta para el eje X (solo para gráficos de barras y líneas) */
   xLabel?: string;
   /** Etiqueta para el eje Y (solo para gráficos de barras y líneas) */
   yLabel?: string;
   /** Muestra el total de los valores en dataKey */
   showTotal?: boolean;
   /** Texto que acompaña al total (ej. "Total de votos") */
   totalLabel?: string;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({
   type,
   data,
   dataKey = "value",
   nameKey = "name",
   colors = ["#9B2242", "#474C55", "#B8B6AF"],
   title,
   layout = "horizontal",
   height = 250,
   tooltipFormatter,
   xLabel,
   yLabel,
   showTotal = false,
   totalLabel = "Total"
}) => {
   // Calcular total si se solicita
   const total = useMemo(() => {
      if (!showTotal) return null;
      return data.reduce((acc, item) => acc + (Number(item[dataKey]) || 0), 0);
   }, [data, dataKey, showTotal]);

   const renderChart = () => {
      switch (type) {
         case "bar":
         case "horizontalBar":
            const isHorizontal = type === "horizontalBar" || layout === "vertical";
            return (
               <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} layout={isHorizontal ? "vertical" : "horizontal"}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                     dataKey={isHorizontal ? undefined : nameKey}
                     type={isHorizontal ? "number" : "category"}
                     label={xLabel && !isHorizontal ? { value: xLabel, position: "insideBottom", offset: -5 } : undefined}
                  />
                  <YAxis
                     dataKey={isHorizontal ? nameKey : undefined}
                     type={isHorizontal ? "category" : "number"}
                     label={yLabel && !isHorizontal ? { value: yLabel, angle: -90, position: "insideLeft" } : undefined}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey={dataKey} fill={colors[0]} radius={[6, 6, 0, 0]} barSize={40} />
               </BarChart>
            );
         case "line":
            return (
               <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={nameKey} label={xLabel ? { value: xLabel, position: "insideBottom", offset: -5 } : undefined} />
                  <YAxis label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft" } : undefined} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Line type="monotone" dataKey={dataKey} stroke={colors[0]} strokeWidth={2} />
               </LineChart>
            );
         case "pie":
            return (
               <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey={dataKey} nameKey={nameKey} label>
                     {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                     ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
               </PieChart>
            );
         default:
            return null;
      }
   };

   return (
      <div className="card">
         {(title || (showTotal && total !== null)) && (
            <div className="card-header">
               {title && <span className="card-title-text">{title}</span>}
               {showTotal && total !== null && (
                  <span className="badge badge-primary ml-2" style={{ marginLeft: 2 }}>
                     {totalLabel}: {total.toLocaleString()}
                  </span>
               )}
            </div>
         )}
         <div className="card-body">
            <div className="chart-wrap" style={{ height }}>
               <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
               </ResponsiveContainer>
            </div>
         </div>
      </div>
   );
};

export default ChartWrapper;
