import { Suspense, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, HashRouter } from "react-router-dom";
import Login from "./pages/Login";
// import Registro from "./pages/participationsPage/Registro";
import Participaciones from "./pages/Participaciones";
import Layout from "./components/Layout";
import { isMobile } from "react-device-detect";

import { SnackbarProvider } from "notistack";

// Configuración dayjs
import dayjs from "dayjs";
import "dayjs/locale/es";
import Perfil from "./pages/Perfil";
import useAuthData from "./hooks/useAuthData";
import Usuarios from "./pages/usersPage/index.users";
import Casillas from "./pages/casillasPage/index.casillas";
import Boleta from "./pages/boletasPage/index.boleta";
import Participations from "./pages/participationsPage/index.participations";

dayjs.locale("es");

const PrivateRoute = ({ children }) => {
   // const user = useStore((state) => state.user);
   const userAuth = useAuthData().persist.auth;
   return userAuth ? children : <Navigate to="/login" replace />;
};

function App() {
   return (
      <>
         <SnackbarProvider
            maxSnack={5}
            anchorOrigin={{ horizontal: isMobile ? "center" : "right", vertical: "bottom" }}
            preventDuplicate
            // iconVariant={{
            //    success: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <TaskAltRounded fontSize="large" sx={{ p: 1 }} />
            //       </Paper>
            //    ),
            //    error: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <Error fontSize="small" sx={{ mr: 1 }} />
            //       </Paper>
            //    ),
            //    warning: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <Warning fontSize="small" sx={{ mr: 1 }} />
            //       </Paper>
            //    ),
            //    info: (
            //       <Paper sx={{ borderRadius: 1000 }}>
            //          <Info fontSize="small" sx={{ mr: 1 }} />
            //       </Paper>
            //    ),
            // }}
            style={{
               // color: "white",
               borderRadius: 15,
               fontWeight: "bold",
               zIndex: 11000
            }}
         >
            <Suspense /* fallback={<GlobalLoading /> */>
               <HashRouter>
                  <Routes>
                     <Route path="/login" element={<Login />} />
                     <Route
                        path="/"
                        element={
                           <PrivateRoute>
                              <Layout />
                           </PrivateRoute>
                        }
                     >
                        <Route index element={<Navigate to="/registro" replace />} />
                        <Route path="registro" element={<Participations />} />
                        <Route path="boleta" element={<Boleta />} />
                        <Route path="usuarios" element={<Usuarios />} />
                        <Route path="casillas" element={<Casillas />} />
                        <Route path="estadisticas" element={<Participaciones />} />
                        <Route path="perfil" element={<Perfil />} />
                     </Route>
                  </Routes>
               </HashRouter>
            </Suspense>
         </SnackbarProvider>
      </>
   );
}

export default App;
