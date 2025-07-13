import { Outlet } from 'react-router-dom';
import Header from './Header';

export const AppLayout = () => {
  return (
    <div className="min-h-screen bg-[#141414]">
      <Header />
      <Outlet />
    </div>
  );
};