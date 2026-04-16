import React, { useState, useMemo } from "react";
import useStore from "../../store/useStore";
import icons from "../../constant/icons";
import Swal from "sweetalert2";

const CasillasP: React.FC = () => {
   const { casillas, addCasilla, updateCasilla, deleteCasilla, toggleCasilla } = useStore();
   const [showForm, setShowForm] = useState(false);
   const [search, setSearch] = useState("");
   const [filter, setFilter] = useState<"todas" | "activas" | "inactivas">("todas");

   // Estado del formulario para nueva casilla o edición
   const [form, setForm] = useState({
      id: 0,
      tipo: "rural" as "rural" | "urbana" | "especial",
      distrito: "",
      perimetro: "",
      lugar: "",
      ubicacion: "",
      colonia: ""
   });
   const [editingId, setEditingId] = useState<number | null>(null);

   // Filtrar y buscar
   const filtered = useMemo(() => {
      let filteredList = casillas.filter((c) => {
         const s = search.toLowerCase();
         const match =
            c.lugar.toLowerCase().includes(s) ||
            (c.distrito && c.distrito.includes(s)) ||
            (c.colonia && c.colonia.toLowerCase().includes(s)) ||
            (c.perimetro && c.perimetro.toLowerCase().includes(s));
         if (!match) return false;
         if (filter === "activas") return c.activa;
         if (filter === "inactivas") return !c.activa;
         return true;
      });
      return filteredList;
   }, [casillas, search, filter]);

   // Resetea el formulario
   const resetForm = () => {
      setForm({
         id: 0,
         tipo: "rural",
         distrito: "",
         perimetro: "",
         lugar: "",
         ubicacion: "",
         colonia: ""
      });
      setEditingId(null);
      setShowForm(false);
   };

   // Manejar envío (agregar o editar)
   const handleSubmit = () => {
      if (!form.lugar.trim()) {
         Swal.fire("Error", 'El campo "Lugar" es obligatorio', "error");
         return;
      }
      if (form.tipo === "rural" && (!form.distrito || !form.perimetro)) {
         Swal.fire("Error", "Distrito y perímetro son obligatorios para tipo Rural", "error");
         return;
      }
      if (form.tipo === "urbana" && (!form.distrito || !form.colonia)) {
         Swal.fire("Error", "Distrito y colonia son obligatorios para tipo Urbana", "error");
         return;
      }
      if (form.tipo === "especial" && !form.colonia) {
         Swal.fire("Error", "Colonia es obligatoria para tipo Especial", "error");
         return;
      }

      const newCasilla: any = {
         id: editingId || Date.now(),
         tipo: form.tipo,
         lugar: form.lugar.trim(),
         activa: true
      };
      if (form.tipo === "rural") {
         newCasilla.distrito = form.distrito;
         newCasilla.perimetro = form.perimetro;
         newCasilla.ubicacion = form.ubicacion || "Plaza";
      } else if (form.tipo === "urbana") {
         newCasilla.distrito = form.distrito;
         newCasilla.colonia = form.colonia;
      } else {
         newCasilla.colonia = form.colonia;
      }

      if (editingId) {
         updateCasilla(editingId, newCasilla);
         Swal.fire("Actualizado", "Centro de votación actualizado", "success");
      } else {
         addCasilla(newCasilla);
         Swal.fire("Agregado", "Centro de votación agregado", "success");
      }
      resetForm();
   };

   const handleEdit = (casilla: any) => {
      setEditingId(casilla.id);
      setForm({
         id: casilla.id,
         tipo: casilla.tipo,
         distrito: casilla.distrito || "",
         perimetro: casilla.perimetro || "",
         lugar: casilla.lugar,
         ubicacion: casilla.ubicacion || "",
         colonia: casilla.colonia || ""
      });
      setShowForm(true);
   };

   const handleDelete = (id: number, nombre: string) => {
      Swal.fire({
         title: "¿Eliminar centro?",
         text: `¿Seguro que quieres eliminar "${nombre}"?`,
         icon: "warning",
         showCancelButton: true,
         confirmButtonColor: "#9B2242",
         confirmButtonText: "Sí, eliminar",
         cancelButtonText: "Cancelar"
      }).then((result) => {
         if (result.isConfirmed) {
            deleteCasilla(id);
            Swal.fire("Eliminado", "Centro de votación eliminado", "success");
         }
      });
   };

   return (
      <div className="page">
         <div className="page-header">
            <div>
               <div className="breadcrumb">
                  Catálogos <span>›</span> <span>Centros de Votación</span>
               </div>
               <h1 className="page-title">Centros de Votación</h1>
               <p className="page-subtitle">19 de abril - 8:00 a 16:00 h.</p>
            </div>
            <button className="btn-secondary" onClick={() => setShowForm(!showForm)}>
               {showForm ? "✕ Cancelar" : "+ Nuevo Centro"}
            </button>
         </div>

         {showForm && (
            <div className="card mb-6" style={{ animation: "slideIn 0.3s ease" }}>
               <div className="card-header">
                  <span className="header-title">{editingId ? "Editar Centro" : "Nuevo Centro de Votación"}</span>
               </div>
               <div className="card-body">
                  <div className="grid-3 mb-4">
                     <div className="form-group">
                        <label className="form-label">Tipo</label>
                        <select className="form-input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}>
                           <option value="rural">Rural</option>
                           <option value="urbana">Urbana</option>
                           <option value="especial">Especial</option>
                        </select>
                     </div>
                     {form.tipo !== "especial" && (
                        <div className="form-group">
                           <label className="form-label">Distrito</label>
                           <input
                              className="form-input"
                              placeholder="Ej: 10, 11, 12"
                              value={form.distrito}
                              onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                           />
                        </div>
                     )}
                     {form.tipo === "rural" && (
                        <div className="form-group">
                           <label className="form-label">Perímetro</label>
                           <input
                              className="form-input"
                              placeholder="Ej: Lavín, Sacramento, Centro"
                              value={form.perimetro}
                              onChange={(e) => setForm({ ...form, perimetro: e.target.value })}
                           />
                        </div>
                     )}
                     {(form.tipo === "urbana" || form.tipo === "especial") && (
                        <div className="form-group">
                           <label className="form-label">Colonia</label>
                           <input
                              className="form-input"
                              placeholder="Ej: Centro, Hamburgo, etc."
                              value={form.colonia}
                              onChange={(e) => setForm({ ...form, colonia: e.target.value })}
                           />
                        </div>
                     )}
                     <div className="form-group">
                        <label className="form-label">Lugar / Nombre</label>
                        <input
                           className="form-input"
                           placeholder="Ej: Plaza de Armas, Vergel, etc."
                           value={form.lugar}
                           onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                        />
                     </div>
                     {form.tipo === "rural" && (
                        <div className="form-group">
                           <label className="form-label">Ubicación (opcional)</label>
                           <input
                              className="form-input"
                              placeholder="Ej: Plaza, Calle, etc."
                              value={form.ubicacion}
                              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
                           />
                        </div>
                     )}
                  </div>
                  <button className="btn-primary" style={{ maxWidth: 200 }} onClick={handleSubmit}>
                     {editingId ? "✓ Actualizar" : "✓ Agregar Centro"}
                  </button>
               </div>
            </div>
         )}

         <div className="card">
            <div className="card-header">
               <div className="search-wrap">
                  <div className="search-input-wrap">
                     <span className="search-icon">🔍</span>
                     <input
                        className="search-input"
                        placeholder="Buscar por lugar, distrito, colonia, perímetro..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
                  <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
                     <option value="todas">Todas</option>
                     <option value="activas">Activas</option>
                     <option value="inactivas">Inactivas</option>
                  </select>
               </div>
               <span style={{ fontSize: 12, color: "var(--blanco)", fontWeight: 600 }}>{filtered.length} centros</span>
            </div>
            <div className="table-wrap">
               <table className="w-full">
                  <thead>
                     <tr className="bg-gray-50 text-left text-[0.7rem] uppercase tracking-wider text-gris">
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Distrito</th>
                        <th className="p-3">Perímetro / Colonia</th>
                        <th className="p-3">Lugar</th>
                        <th className="p-3">Ubicación</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Acciones</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filtered.length === 0 && (
                        <tr>
                           <td colSpan={7}>
                              <div className="empty-state">
                                 <div className="empty-icon">🏛️</div>
                                 <div className="empty-title">Sin resultados</div>
                                 <div className="empty-desc">No se encontraron centros con ese criterio</div>
                              </div>
                           </td>
                        </tr>
                     )}
                     {filtered.map((c) => (
                        <tr key={c.id} className="border-b border-gray-100 hover:bg-guinda/5">
                           <td className="p-3">
                              <span className={`badge ${c.tipo === "rural" ? "badge-rural" : c.tipo === "urbana" ? "badge-urbana" : "badge-especial"}`}>
                                 {c.tipo === "rural" ? "🌾 Rural" : c.tipo === "urbana" ? "🏙️ Urbana" : "✨ Especial"}
                              </span>
                           </td>
                           <td className="p-3 font-mono text-sm">{c.distrito || "—"}</td>
                           <td className="p-3">{c.perimetro || c.colonia || "—"}</td>
                           <td className="p-3 font-semibold text-negro">{c.lugar}</td>
                           <td className="p-3 text-gris">{c.ubicacion || (c.tipo === "urbana" ? "—" : "Plaza")}</td>
                           <td className="p-3">
                              <span
                                 className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.activa ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                              >
                                 {c.activa ? <icons.Lu.LuCheck size={12} /> : <icons.Lu.LuX size={12} />}
                                 {c.activa ? "Activo" : "Inactivo"}
                              </span>
                           </td>
                           <td className="p-3">
                              <div className="flex gap-2">
                                 <button className="btn-sm btn-sm-ghost" onClick={() => toggleCasilla(c.id)}>
                                    {c.activa ? "Desactivar" : "Activar"}
                                 </button>
                                 <button className="btn-sm btn-sm-ghost" onClick={() => handleEdit(c)}>
                                    Editar
                                 </button>
                                 <button className="btn-sm btn-sm-danger" onClick={() => handleDelete(c.id, c.lugar)}>
                                    Eliminar
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default Casillas;
