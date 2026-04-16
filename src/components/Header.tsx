// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import useStore from "../store/useStore";
// import Swal from "sweetalert2";
// import icons from "./../constant/icons";
// // import { useStore } from "zustand";

// export function Header() {
//    const [isMenuOpen, setIsMenuOpen] = useState(false);
//    const { user, logout } = useStore();

//    const handleLogout = () => {
//       Swal.fire({
//          title: "Cerrar sesion?",
//          text: "Se cerrara su sesion actual",
//          icon: "question",
//          showCancelButton: true,
//          confirmButtonColor: "#9B2242",
//          cancelButtonColor: "#727372",
//          confirmButtonText: "Si, cerrar sesion",
//          cancelButtonText: "Cancelar"
//       }).then((result) => {
//          if (result.isConfirmed) {
//             logout();
//             Swal.fire({
//                title: "Sesion cerrada",
//                text: "Ha cerrado sesion correctamente",
//                icon: "success",
//                confirmButtonColor: "#9B2242",
//                timer: 2000,
//                showConfirmButton: false
//             });
//          }
//       });
//       setIsMenuOpen(false);
//    };

//    const handleViewProfile = () => {
//       Swal.fire({
//          title: "Perfil de Usuario",
//          html: `
//         <div class="text-left space-y-3 py-4">
//           <div class="flex items-center gap-3">
//             <span class="text-gray-500 w-20">Nombre:</span>
//             <span class="font-medium">${user?.name}</span>
//           </div>
//           <div class="flex items-center gap-3">
//             <span class="text-gray-500 w-20">Correo:</span>
//             <span class="font-medium">${user?.email}</span>
//           </div>
//           <div class="flex items-center gap-3">
//             <span class="text-gray-500 w-20">ID:</span>
//             <span class="font-medium text-sm text-gray-400">${user?.id}</span>
//           </div>
//         </div>
//       `,
//          icon: "info",
//          confirmButtonColor: "#9B2242",
//          confirmButtonText: "Cerrar"
//       });
//       setIsMenuOpen(false);
//    };

//    return (
//       <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm border-b border-gris-claro/30">
//          <div className="px-4 lg:px-8">
//             <div className="flex items-center justify-between h-16 md:h-20">
//                {/* Title - visible on mobile */}
//                <div className="lg:hidden pl-12">
//                   <h1 className="text-lg font-bold text-negro" style={{ fontFamily: "Georgia, serif" }}>
//                      Gobierno de Mexico
//                   </h1>
//                </div>

//                {/* Spacer for desktop */}
//                <div className="hidden lg:block"></div>

//                {/* Right Section */}
//                <div className="flex items-center gap-4">
//                   {/* Notifications */}
//                   <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative p-2 rounded-xl hover:bg-gris-claro/20 transition-colors">
//                      <icons.Lu.LuBell size={22} className="text-gris" />
//                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-guinda-primary rounded-full border-2 border-white"></span>
//                   </motion.button>

//                   {/* User Section */}
//                   {user && (
//                      <div className="relative">
//                         <button
//                            onClick={() => setIsMenuOpen(!isMenuOpen)}
//                            className="flex items-center gap-2 md:gap-3 px-3 py-2 rounded-xl hover:bg-gris-claro/20 transition-all duration-300 group"
//                         >
//                            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-guinda-primary to-guinda-secondary rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-shadow">
//                               {user.name.charAt(0).toUpperCase()}
//                            </div>
//                            <div className="hidden md:block text-left">
//                               <p className="text-sm font-medium text-negro leading-tight">{user.name}</p>
//                               <p className="text-xs text-gris leading-tight">{user.email}</p>
//                            </div>
//                            <icons.Lu.LuChevronDown className={`w-4 h-4 text-gris transition-transform duration-300 ${isMenuOpen ? "rotate-180" : ""}`} />
//                         </button>

//                         {/* Dropdown Menu */}
//                         <AnimatePresence>
//                            {isMenuOpen && (
//                               <>
//                                  {/* Backdrop */}
//                                  <motion.div
//                                     initial={{ opacity: 0 }}
//                                     animate={{ opacity: 1 }}
//                                     exit={{ opacity: 0 }}
//                                     className="fixed inset-0 z-40"
//                                     onClick={() => setIsMenuOpen(false)}
//                                  />

//                                  {/* Menu */}
//                                  <motion.div
//                                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                                     transition={{ duration: 0.2 }}
//                                     className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gris-claro/30 overflow-hidden z-50"
//                                  >
//                                     <div className="p-3 bg-gradient-to-r from-guinda-primary/5 to-guinda-secondary/5 border-b border-gris-claro/30">
//                                        <p className="text-sm font-medium text-negro">{user.name}</p>
//                                        <p className="text-xs text-gris truncate">{user.email}</p>
//                                     </div>

//                                     <div className="p-2">
//                                        <button
//                                           onClick={handleViewProfile}
//                                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-negro hover:bg-gris-claro/20 transition-colors"
//                                        >
//                                           <icons.Lu.LuUser className="w-4 h-4 text-gris" />
//                                           Ver perfil
//                                        </button>

//                                        <button
//                                           onClick={handleLogout}
//                                           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
//                                        >
//                                           <icons.Lu.LuLogOut className="w-4 h-4" />
//                                           Cerrar sesion
//                                        </button>
//                                     </div>
//                                  </motion.div>
//                               </>
//                            )}
//                         </AnimatePresence>
//                      </div>
//                   )}
//                </div>
//             </div>
//          </div>
//       </header>
//    );
// }
