
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Exchange from "./pages/Exchange";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import Rails from "./pages/Rails";
import Loans from "./pages/Loans";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BybitExplorer from "./pages/BybitExplorer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fx-market" element={<Exchange />} />
            <Route path="/bybit-explorer" element={<BybitExplorer />} />

            <Route path="/transactions" element={<Transactions />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/rails" element={<Rails />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
