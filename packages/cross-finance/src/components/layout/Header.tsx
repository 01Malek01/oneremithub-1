import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BarChart3, Banknote, BadgePercent, TrendingUp, Wallet, Receipt, Settings } from 'lucide-react';

const menuItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: BarChart3,
  },
  {
    title: "Fx Market",
    path: "/fx-market",
    icon: BadgePercent,
  },
  {
    title: "Transactions",
    path: "/transactions",
    icon: Receipt,
  },
  {
    title: "Bank Accounts",
    path: "/accounts",
    icon: Wallet,
  },
  {
    title: "Rails",
    path: "/rails",
    icon: TrendingUp,
  },
  {
    title: "Loans & Credit",
    path: "/loans",
    icon: Banknote,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function Header() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#303030] px-10 py-3">
      <div className="flex items-center gap-4 text-white">
        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">Oneremit Hub</h2>
      </div>
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-6">
          {menuItems.map((item) => (
            <NavLink 
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                cn(
                  "flex items-center gap-2 text-sm font-medium leading-normal transition-colors hover:text-white/80",
                  isActive ? "text-white" : "text-white/60"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  )
}
