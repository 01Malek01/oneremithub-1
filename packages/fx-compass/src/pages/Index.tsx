
import React from 'react';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
// import { UserMenu } from '@/components/auth/UserMenu';
import { applyConsoleFilters } from '@/utils/logUtils';
import { logger } from '@/utils/logUtils';

const Index = () => {
  // Set up console settings on initial render
  React.useEffect(() => {
    // Apply console filtering for a cleaner experience
    applyConsoleFilters();
    logger.info("Dashboard initialized");
  }, []);
  
  return (
    <div className="flex-1 overflow-auto py-4">
      <div className="container mx-auto px-4">
        {/* <div className="flex justify-end mb-4">
          <UserMenu />
        </div> */}
      </div>
      
      <DashboardContainer />
      
      <footer className="mt-8 pb-4 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Oneremit FX Terminal - Powered by <a href="#" className="text-primary hover:underline">Oneremit</a></p>
      </footer>
    </div>
  );
};

export default Index;
