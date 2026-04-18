import React from "react";

interface ProjectVote {
   id: number;
   project_name: string;
   assigned_district: number;
   votos: number;
}

interface TopProjectsListProps {
   projects: ProjectVote[];
   title?: string;
}

const TopProjectsList: React.FC<TopProjectsListProps> = ({ projects, title = "Proyectos más votados" }) => {
   return (
      <div className="card">
         <div className="card-header">
            <span className="card-title-text">🏆 {title}</span>
         </div>
         <div className="card-body">
            <div className="overflow-x-auto">
               <table className="min-w-full">
                  <thead>
                     <tr>
                        <th>#</th>
                        <th>Proyecto</th>
                        <th>Distrito</th>
                        <th>Votos</th>
                     </tr>
                  </thead>
                  <tbody>
                     {projects.map((proj, idx) => (
                        <tr key={proj.id}>
                           <td className="font-bold text-guinda">{idx + 1}</td>
                           <td>{proj.project_name}</td>
                           <td>{proj.assigned_district}</td>
                           <td>{proj.votos}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default TopProjectsList;
