import React from "react";
import Swal from "sweetalert2";
import useAuthData from "../../hooks/useAuthData";
import useProjectsData from "../../hooks/useProjectsData";
import { icons } from "../../constant";
import useCasillasData from "../../hooks/useCasillasData";
import type { Project } from "../../domains/models/project.model";

const CAT_COLORS = {
   "Espacio Publico": "#2d6a4f",
   Movilidad: "#1a6891",
   Salud: "#9b2242",
   Infraestructura: "#5a3825",
   Educacion: "#7b3f91",
   "Medio Ambiente": "#386641",
   Servicios: "#8b6914",
   Deporte: "#c94f0a",
   Economia: "#1f5c8a",
   Social: "#912248",
   Seguridad: "#363d45",
   Tecnologia: "#1a5276",
   Inclusion: "#7d5a1e",
   Cultura: "#6d2e8a"
};

/* PAGE: BOLETA DE VOTACION */
const Boleta = ({ user, votos, onAddVoto }) => {
   const userAuth = useAuthData().persist.auth;
   const casillaContext = useCasillasData();
   const projectContext = useProjectsData();

   const STEPS = ["Identificacion", "Seleccion", "Revision", "Confirmacion"];
   const [step, setStep] = React.useState(0);
   const [prevStep, setPrevStep] = React.useState(0);

   // Step 0 - Voter ID
   const [voterId, setVoterId] = React.useState("");
   const [voterCasilla, setVoterCasilla] = React.useState("01");
   const [voterNVotos, setVoterNVotos] = React.useState(3);
   const [voterIdErr, setVoterIdErr] = React.useState("");

   // Step 1 - Selection
   const [seleccion, setSeleccion] = React.useState<Project[]>([]);
   const [search, setSearch] = React.useState("");
   const [dropdownOpen, setDropdownOpen] = React.useState(false);
   const [districtFilter, setDistrictFilter] = React.useState<number | null>(null);
   const [shakeSlot, setShakeSlot] = React.useState<number | null>(null);
   const searchRef = React.useRef(null);
   const dropRef = React.useRef(null);

   // Step 3 - Success folio
   const [folio, setFolio] = React.useState("");
   const [submitted, setSubmitted] = React.useState(false);
   const [loading, setLoading] = React.useState(false);

   React.useEffect(() => {
      const handleClick = (e: { target: any }) => {
         if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
   }, []);

   const goStep = (next: React.SetStateAction<number>) => {
      setPrevStep(step);
      setStep(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
   };

   const slideClass = step >= prevStep ? "slide-in-right" : "slide-in-left";

   // Categories for filter
   // const districts = [null, ...Array.from(new Set(projectContext.items.map((p) => p.assigned_district))).sort()];
   const districts =
      userAuth?.role_id === 3 ? [userAuth.casilla_district] : [null, ...Array.from(new Set(projectContext.items.map((p) => p.assigned_district))).sort()];
   console.log("🚀 ~ Boleta ~ districts:", districts);

   // Filtered projects for dropdown
   const filteredProjs = projectContext.items.filter((p) => {
      const matchSearch = p.project_name.toLowerCase().includes(search.toLowerCase()) || p.assigned_district.toString().includes(search.toLowerCase());
      const matchCat = districtFilter === null || p.assigned_district === districtFilter;
      return matchSearch && matchCat;
   });

   const isSelected = (id: number) => seleccion.some((s) => s?.id === id);

   const addVote = (project: Project) => {
      if (isSelected(project.id)) return;
      if (seleccion.length >= voterNVotos) {
         // Shake last empty slot
         const nextEmpty = seleccion.length;
         setShakeSlot(nextEmpty);
         setTimeout(() => setShakeSlot(null), 500);
         Swal.fire({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2200,
            icon: "warning",
            title: `Ya seleccionaste ${voterNVotos} project${voterNVotos > 1 ? "s" : ""}`,
            timerProgressBar: true
         });
         return;
      }
      setSeleccion((prev) => [...prev, project]);
      setSearch("");
      setDropdownOpen(false);
   };

   const removeVote = (id: any) => setSeleccion((prev) => prev.filter((s) => s.id !== id));

   const pct = (seleccion.length / voterNVotos) * 100;

   // Step 0 validate
   const handleStep0 = () => {
      if (!voterId.trim() || voterId.trim().length < 5) {
         setVoterIdErr("Ingresa tu clave de elector o project_name completo.");
         return;
      }
      // Check if already voted
      const alreadyVoted = votos.find((v: { voterId: string }) => v.voterId.toUpperCase() === voterId.trim().toUpperCase());
      if (alreadyVoted) {
         Swal.fire({
            icon: "warning",
            title: "Boleta ya emitida",
            html: "<p style=\"font-family:'Nunito Sans',sans-serif;font-size:.95rem;color:#474C55\">Tu boleta <b>ya fue registrada</b> anteriormente.<br>Solo se permite una participacion por ciudadano.</p>",
            confirmButtonColor: "#9B2242",
            confirmButtonText: "Entendido"
         });
         return;
      }
      setVoterIdErr("");
      goStep(1);
   };

   // Step 1 validate
   const handleStep1 = () => {
      if (seleccion.length < voterNVotos) {
         Swal.fire({
            icon: "info",
            title: "Seleccion incompleta",
            html: `<p style="font-family:\'Nunito Sans\',sans-serif;font-size:.95rem;color:#474C55">Debes elegir <b>${voterNVotos} project${voterNVotos > 1 ? "s" : ""}</b>.<br>Llevas <b>${seleccion.length}</b> seleccionado${seleccion.length !== 1 ? "s" : ""}.</p>`,
            confirmButtonColor: "#9B2242",
            confirmButtonText: "Continuar seleccionando"
         }).then(() => {
            goStep(2);
         });
         // return;
      } else {
         goStep(2);
      }
   };

   // Step 2 submit
   const handleSubmit = () => {
      setLoading(true);
      setTimeout(() => {
         const newFolio = "BOL-" + Date.now().toString(36).toUpperCase();
         setFolio(newFolio);
         onAddVoto({
            voterId: voterId.trim().toUpperCase(),
            casilla: voterCasilla,
            projects: seleccion.map((s) => s.id),
            folio: newFolio
         });
         setLoading(false);
         setSubmitted(true);
         goStep(3);
      }, 1000);
   };

   const resetBoleta = () => {
      setStep(0);
      setPrevStep(0);
      setVoterId("");
      setVoterIdErr("");
      setSeleccion([]);
      setSearch("");
      setSubmitted(false);
      setFolio("");
      setVoterNVotos(3);
      setVoterCasilla("01");
   };

   // Progress
   const ProgressBar = () => (
      <div className="boleta-progress">
         {STEPS.map((label, i) => (
            <React.Fragment key={i}>
               <div className={`progress-step ${step === i ? "active" : step > i ? "done" : ""}`}>
                  <div className="progress-step-circle">{step > i ? <icons.Lu.LuCheck name="check" size={15} color="#fff" /> : i + 1}</div>
                  <div className="progress-step-label">{label}</div>
               </div>
               {i < STEPS.length - 1 && (
                  <div className="progress-line">
                     <div className="progress-line-fill" style={{ width: step > i ? "100%" : "0%" }} />
                  </div>
               )}
            </React.Fragment>
         ))}
      </div>
   );

   return (
      <div className="page-container">
         <div className="page-header">
            <h1>Boleta de Votacion</h1>
            <p>Selecciona los proyectos de tu preferencia de forma anonima y segura.</p>
            <div className="page-divider" />
         </div>

         <ProgressBar />

         {/* ── STEP 0: Identificacion ── */}
         {step === 0 && (
            <div className={`voter-id-card ${slideClass}`}>
               <div className="voter-badge">
                  <icons.Lu.LuIdCard name="id" size={14} /> Verificacion de Identidad
               </div>
               <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "var(--guinda-dark)", marginBottom: 4 }}>
                  Antes de votar, confirma tu identidad
               </div>
               <p style={{ fontSize: ".85rem", color: "var(--gris)", marginBottom: 22, lineHeight: 1.6 }}>
                  Tu participacion es anonima. El dato de identificacion solo se usa para validar que no votes dos veces.
               </p>

               <div className="boleta-config-grid" style={{ marginBottom: 20 }}>
                  <div className="config-field">
                     <label>Clave de Elector o Nombre</label>
                     <input
                        className={`config-input${voterIdErr ? " form-input error" : ""}`}
                        type="text"
                        placeholder="Ej: GNZLM8503124H6"
                        value={voterId}
                        onChange={(e) => {
                           setVoterId(e.target.value);
                           setVoterIdErr("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleStep0()}
                        style={{ textTransform: "uppercase" }}
                     />
                     {voterIdErr && <div className="form-error">&#9888; {voterIdErr}</div>}
                  </div>
                  <div className="config-field">
                     <label>Casilla de Votacion</label>
                     <select className="config-select" value={voterCasilla} onChange={(e) => setVoterCasilla(e.target.value)}>
                        {casillaContext.items.map((c) => (
                           <option key={c.id} value={c.place}>
                              Casilla {c.place} - {c.place.split(" ")[0]}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="config-field">
                     <label>Numero de Votos (N)</label>
                     <input
                        className="config-input"
                        type="number"
                        min={1}
                        max={10}
                        value={voterNVotos}
                        onChange={(e) => setVoterNVotos(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                     />
                  </div>
               </div>

               <div
                  style={{
                     background: "rgba(155,34,66,.04)",
                     border: "1px solid rgba(155,34,66,.12)",
                     borderRadius: 12,
                     padding: "14px 18px",
                     marginBottom: 22,
                     display: "flex",
                     gap: 12,
                     alignItems: "flex-start"
                  }}
               >
                  <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>&#128274;</span>
                  <div style={{ fontSize: ".8rem", color: "var(--gris-cool)", lineHeight: 1.5 }}>
                     <b style={{ color: "var(--guinda-dark)" }}>Tu voto es secreto.</b> Los proyectos que elijas no se asocian a tu project_name en los resultados
                     publicos. Solo se registra que participaste.
                  </div>
               </div>

               <button className="btn-primary" onClick={handleStep0}>
                  <icons.Lu.LuArrowBigRight name="arrow" size={17} color="#fff" /> Continuar a la Boleta
               </button>
            </div>
         )}

         {/* ── STEP 1: Seleccion de projects ── */}
         {step === 1 && (
            <div className={slideClass}>
               {/* Counter */}
               <div
                  style={{
                     background: "#fff",
                     borderRadius: 16,
                     padding: "18px 22px",
                     border: "1px solid rgba(0,0,0,.05)",
                     boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                     marginBottom: 20
                  }}
               >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                     <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", fontWeight: 700, color: "var(--guinda-dark)" }}>
                        Elige {voterNVotos} proyecto{voterNVotos > 1 ? "s" : ""} de tu preferencia
                     </div>
                     <div className="voter-badge" style={{ margin: 0 }}>
                        <icons.Lu.LuPin name="pin" size={12} /> {userAuth?.username} - {userAuth?.casilla_place}
                     </div>
                  </div>
                  <div className="ballot-counter">
                     <div className="counter-bar-wrap">
                        <div className="counter-bar-fill" style={{ width: pct + "%" }} />
                     </div>
                     <div className="counter-label">
                        {seleccion.length} <span>/ {voterNVotos}</span>
                     </div>
                  </div>
               </div>

               {/* Slots grid */}
               <div className="votes-grid" style={{ marginBottom: 18 }}>
                  {Array.from({ length: voterNVotos }).map((_, i) => {
                     const proj = seleccion[i];
                     const catColor = proj ? CAT_COLORS[proj.assigned_district] || "var(--guinda)" : null;
                     return (
                        <div key={i} className={`vote-slot ${proj ? "filled" : "empty"} ${shakeSlot === i ? "shake" : ""}`} style={{ animationDelay: i * 0.04 + "s" }}>
                           {proj ? (
                              <>
                                 <div className="vote-slot-num">
                                    <icons.Lu.LuCheck name="check" size={11} color="var(--guinda)" /> Voto {i + 1}
                                 </div>
                                 <div className="vote-slot-name">{proj.project_name}</div>
                                 <div className="vote-slot-cat" style={{ color: catColor }}>
                                    {proj.assigned_district}
                                 </div>
                                 <button className="vote-remove-btn" onClick={() => removeVote(proj.id)} title="Quitar">
                                    &#10005;
                                 </button>
                              </>
                           ) : (
                              <div className="vote-slot-empty-label">
                                 <span
                                    style={{
                                       width: 22,
                                       height: 22,
                                       borderRadius: "50%",
                                       border: "2px dashed var(--gris-claro)",
                                       display: "inline-flex",
                                       alignItems: "center",
                                       justifyContent: "center",
                                       fontSize: ".75rem",
                                       color: "var(--gris-claro)"
                                    }}
                                 >
                                    {i + 1}
                                 </span>
                                 Voto pendiente
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>

               {/* Search & add */}
               <div
                  style={{
                     background: "#fff",
                     borderRadius: 16,
                     padding: "20px 22px",
                     border: "1px solid rgba(0,0,0,.05)",
                     boxShadow: "0 2px 12px rgba(0,0,0,.04)",
                     marginBottom: 20
                  }}
                  ref={dropRef}
               >
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".95rem", fontWeight: 700, color: "var(--guinda-dark)", marginBottom: 12 }}>
                     Agregar proyecto
                  </div>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                     <select
                        className="filter-select"
                        style={{ flex: "0 0 auto", minWidth: 160 }}
                        value={districtFilter}
                        onChange={(e) => setDistrictFilter(e.target.value)}
                     >
                        {districts.map((c) => (
                           <option key={c}>{c}</option>
                        ))}
                     </select>
                     <div className="ballot-search-wrap" style={{ flex: 1, minWidth: 200, marginBottom: 0 }} ref={searchRef}>
                        <span className="ballot-search-icon">
                           <icons.Lu.LuSearch name="search" size={15} />
                        </span>
                        <input
                           className="ballot-search-input"
                           placeholder="Buscar proyecto por nombre o distrito..."
                           value={search}
                           onChange={(e) => {
                              setSearch(e.target.value);
                              setDropdownOpen(true);
                           }}
                           onFocus={() => setDropdownOpen(true)}
                        />
                     </div>
                  </div>

                  {dropdownOpen && (
                     <div className="projects-dropdown">
                        {filteredProjs.length === 0 ? (
                           <div style={{ padding: "16px", textAlign: "center", color: "var(--gris-claro)", fontSize: ".85rem" }}>Sin resultados</div>
                        ) : (
                           filteredProjs.map((p) => {
                              const selected = isSelected(p.id);
                              const full = seleccion.length >= voterNVotos && !selected;
                              const catColor = CAT_COLORS[p.assigned_district] || "#555";
                              return (
                                 <div key={p.id} className={`project-option ${selected || full ? "disabled" : ""}`} onClick={() => !selected && !full && addVote(p)}>
                                    <div className="project-option-num">{p.id}</div>
                                    <div style={{ flex: 1 }}>
                                       <div className="project-option-name" style={{ color: selected ? "var(--gris)" : "var(--negro)" }}>
                                          {p.project_name}{" "}
                                          {selected && <span style={{ fontSize: ".7rem", color: "var(--guinda)", fontWeight: 700 }}>&#10003; Elegido</span>}
                                       </div>
                                       <div style={{ fontSize: ".72rem", color: "var(--gris)", marginTop: 1 }}>{p.project_place.slice(0, 55)}...</div>
                                    </div>
                                    <span className="project-option-cat" style={{ background: catColor + "18", color: catColor }}>
                                       {p.assigned_district}
                                    </span>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  )}
               </div>

               <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn-secondary" onClick={() => goStep(0)}>
                     <icons.Lu.LuArrowBigLeft name="back" size={16} /> Atras
                  </button>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleStep1} disabled={seleccion.length === 0}>
                     <icons.Lu.LuArrowBigRight name="arrow" size={17} color="#fff" /> Revisar seleccion
                  </button>
               </div>
            </div>
         )}

         {/* ── STEP 2: Revision ── */}
         {step === 2 && (
            <div className={`review-card ${slideClass}`}>
               <div className="review-header">
                  <div className="review-icon">&#128196;</div>
                  <div>
                     <div className="review-title">Confirma tu boleta</div>
                     <div className="review-sub">Revisa cuidadosamente tus elecciones. Una vez enviada, no podra modificarse.</div>
                  </div>
               </div>

               <div className="review-info-row">
                  <div className="review-info-item">
                     <label>Identificador</label>
                     <div className="val" style={{ fontFamily: "monospace", letterSpacing: ".04em", fontSize: ".82rem" }}>
                        {voterId.toUpperCase()}
                     </div>
                  </div>
                  <div className="review-info-item">
                     <label>Casilla</label>
                     <div className="val">Casilla {voterCasilla}</div>
                  </div>
                  <div className="review-info-item">
                     <label>Votos emitidos</label>
                     <div className="val">
                        {seleccion.length} de {voterNVotos}
                     </div>
                  </div>
                  <div className="review-info-item">
                     <label>Fecha y hora</label>
                     <div className="val" style={{ fontSize: ".82rem" }}>
                        {new Date().toLocaleString("es-MX")}
                     </div>
                  </div>
               </div>

               <div style={{ fontFamily: "'Playfair Display',serif", fontSize: ".9rem", fontWeight: 700, color: "var(--guinda-dark)", marginBottom: 12 }}>
                  Proyectos seleccionados
               </div>
               <div className="review-votes-list">
                  {seleccion.map((p, i) => {
                     const catColor = CAT_COLORS[p.assigned_district] || "#555";
                     return (
                        <div className="review-vote-item" key={p.id} style={{ animationDelay: i * 0.06 + "s" }}>
                           <div className="review-vote-rank">{i + 1}</div>
                           <div style={{ flex: 1 }}>
                              <div className="review-vote-name">
                                 {p.folio} - {p.project_name}
                              </div>
                              <div style={{ fontSize: ".75rem", color: "var(--gris)", marginTop: 2 }}>{p.project_name}</div>
                           </div>
                           <span className="review-vote-cat" style={{ background: catColor + "18", color: catColor }}>
                              {p.assigned_district}
                           </span>
                        </div>
                     );
                  })}
               </div>

               <div
                  style={{
                     background: "rgba(155,34,66,.04)",
                     border: "1px solid rgba(155,34,66,.12)",
                     borderRadius: 12,
                     padding: "12px 16px",
                     marginBottom: 22,
                     fontSize: ".8rem",
                     color: "var(--gris-cool)",
                     lineHeight: 1.5
                  }}
               >
                  &#9432; Al confirmar, tu voto queda registrado de forma definitiva. Esta accion no puede deshacerse.
               </div>

               <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button className="btn-secondary" onClick={() => goStep(1)}>
                     <icons.Lu.LuArrowBigLeft name="back" size={16} /> Modificar
                  </button>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                     {loading ? (
                        <>
                           <span style={{ animation: "pulse 1s infinite" }}>&#9203;</span> Registrando boleta...
                        </>
                     ) : (
                        <>
                           <icons.Lu.LuSend name="send" size={16} color="#fff" /> Emitir mi voto
                        </>
                     )}
                  </button>
               </div>
            </div>
         )}

         {/* ── STEP 3: Exito ── */}
         {step === 3 && (
            <div className={slideClass} style={{ display: "flex", justifyContent: "center" }}>
               <div className="boleta-success">
                  <div
                     style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: "linear-gradient(90deg,var(--guinda),var(--guinda-dark))",
                        borderRadius: "24px 24px 0 0"
                     }}
                  />
                  <div className="success-emblem">&#127881;</div>
                  <div className="success-title">&#161;Voto registrado!</div>
                  <p className="success-sub">
                     Tu boleta fue emitida correctamente en la <b>Casilla {voterCasilla}</b>.<br />
                     Gracias por participar en el proceso de Tu Voz Transforma.
                  </p>
                  <div className="success-folio">{folio}</div>
                  <div style={{ fontSize: ".75rem", color: "var(--gris-claro)", marginBottom: 22 }}>Guarda este folio como comprobante de tu participacion</div>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                     <button className="btn-secondary" onClick={resetBoleta}>
                        <icons.Gi.GiPaperTray name="ballot" size={15} /> Nueva boleta
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
export default Boleta;
