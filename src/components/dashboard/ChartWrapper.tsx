import React from "react";
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
   tooltipFormatter
}) => {
   const renderChart = () => {
      switch (type) {
         case "bar":
            return (
               <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 5 }} layout={layout}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={layout === "horizontal" ? nameKey : undefined} type={layout === "vertical" ? "number" : "category"} />
                  <YAxis dataKey={layout === "vertical" ? nameKey : undefined} type={layout === "vertical" ? "category" : "number"} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey={dataKey} fill={colors[0]} radius={[6, 6, 0, 0]} barSize={40} />
               </BarChart>
            );
         case "line":
            return (
               <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={nameKey} />
                  <YAxis />
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
         {title && (
            <div className="card-header">
               <span className="card-title-text">{title}</span>
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
