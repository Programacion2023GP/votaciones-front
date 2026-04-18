import React from "react";
import { icons } from "../../constant";

interface StatCardProps {
   label: string;
   value: number | string;
   icon?: React.ReactNode;
   color?: string;
   accentColor?: string;
   subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color = "guinda", accentColor = "guinda", subtext }) => {
   return (
      <div className="stat-card">
         <div className={`stat-accent ${accentColor}`} />
         <div className="stat-icon">{icon || <icons.Lu.LuChartBar />}</div>
         <div className="stat-value">{value}</div>
         <div className="stat-label">{label}</div>
         {subtext && <div className="stat-change">{subtext}</div>}
      </div>
   );
};

export default StatCard;
