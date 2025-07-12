
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { ProtectedRoute, AuthRoute } from "./components/auth/ProtectedRoute";
import { NotificationProvider } from "./contexts/NotificationContext";

const App = () => (
  // <TooltipProvider>
  //   <NotificationProvider>
  //     <div className="min-h-screen bg-background text-foreground flex flex-col">
  //       <Routes>
  //         <Route 
  //           path="/" 
  //           element={
  //             <ProtectedRoute>
  //               <Index />
  //             </ProtectedRoute>
  //           } 
  //         />
  //         <Route 
  //           path="/auth" 
  //           element={
  //             <AuthRoute>
  //               <Auth />
  //             </AuthRoute>
  //           } 
  //         />
  //         {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
  //         <Route path="*" element={<NotFound />} />
  //       </Routes>
  //     </div>
  //   </NotificationProvider>
  // </TooltipProvider>

  <Index />
);

export default App;
