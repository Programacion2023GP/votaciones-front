import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

const Layout = () => {
   // const [sidebarOpen, setSidebarOpen] = useState(false);

   return (
      <>
         <div className="drawer lg:drawer-open">
            <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
            <div className="drawer-content">
               {/* Navbar */}
               <Topbar />

               {/* Page content here */}
               <main className={`w-full transition-all duration-300`}>
                  <div
                     className="w-full page  mx-auto"
                     // p-6 md:p-8 max-w-7xl mx-auto
                     // style={{ padding: "20px 16px", paddingTop: "80px" }}
                  >
                     <Outlet />
                  </div>
               </main>
            </div>

            {/* Sidebar content here */}
            <Sidebar /* open={sidebarOpen} onClose={() => setSidebarOpen(false)}  */ />
         </div>
      </>
   );
};

export default Layout;
