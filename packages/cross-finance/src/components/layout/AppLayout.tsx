
import { Outlet } from "react-router-dom";
import Header from "./Header";

export function AppLayout() {
  return (
    // <SidebarProvider>
        <main className=" ">
          <header className="bg-[#141414]">
          <Header />
          </header>
          <Outlet />
        </main>
    // </SidebarProvider> 
  );
}
