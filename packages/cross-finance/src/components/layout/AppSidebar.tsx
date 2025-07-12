
import { 
  BarChart3, 
  Banknote, 
  BadgePercent, 
  TrendingUp, 
  Wallet, 
  Settings, 
  CircleArrowRight,
  Receipt 
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarFooter
} from '@/components/ui/sidebar';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2">
          <CircleArrowRight className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Oneremit Hub</span>
        </div>
        <div className="px-3 pt-1">
          <p className="text-xs text-sidebar-foreground/70">Remittance Management Platform</p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path} 
                      className={({ isActive }) => 
                        cn("flex items-center gap-3", 
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground")}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-3">
          <p className="text-xs text-sidebar-foreground/70">Oneremit v1.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
