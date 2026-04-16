<div className="card">
   <div className="card-header">
      <div className="search-wrap">
         <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
               className="search-input"
               placeholder="Buscar por username, email, role_name, perímetro..."
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
                  <td className="p-3 font-mono text-sm">{c.email || "—"}</td>
                  <td className="p-3">{c.password || c.role_name || "—"}</td>
                  <td className="p-3 font-semibold text-negro">{c.username}</td>
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
                        {/* <button className="btn-sm btn-sm-ghost" onClick={() => toggleUsuario(c.id)}>
                                    {c.activa ? "Desactivar" : "Activar"}
                                 </button>
                                 <button className="btn-sm btn-sm-ghost" onClick={() => handleEdit(c)}>
                                    Editar
                                 </button>
                                 <button className="btn-sm btn-sm-danger" onClick={() => handleDelete(c.id, c.username)}>
                                    Eliminar
                                 </button> */}
                     </div>
                  </td>
               </tr>
            ))}
         </tbody>
      </table>
   </div>
   <CustomTable
      data={userContext.items}
      paginate={[-1, 5, 10, 20, 50, 100]}
      columns={[
         {
            headerName: "USUARIOS",
            field: "username",
            gr
         }
      ]}
      headerActions={() => <></>}
   />
</div>;
