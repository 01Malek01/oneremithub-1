import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle
} from "lucide-react";
import { Order } from "@/lib/types/bybit-api-types";

interface DashboardStatsProps {
  trades: Order[];
}

export function DashboardStats({ trades }: DashboardStatsProps) {
  const totalTrades = trades.length;
  const completedTrades = trades.filter(trade => trade.filter === "50").length;
  const cancelledTrades = trades.filter(trade => trade.filter === "40" || trade.filter === "80").length;
  const inProgressTrades = trades.filter(trade => 
    ["5", "10", "20", "60", "90", "110"].includes(trade.filter)
  ).length;
  const disputedTrades = trades.filter(trade => 
    ["30", "70", "100"].includes(trade.filter)
  ).length;

  const stats = [
    {
      title: "Total Trades",
      value: totalTrades,
      description: "Total number of trades",
      icon: <FileSpreadsheet className="h-4 w-4" />,
    },
    {
      title: "Completed",
      value: completedTrades,
      description: "Successfully finished trades",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      title: "In Progress",
      value: inProgressTrades,
      description: "Trades waiting for action",
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: "Cancelled",
      value: cancelledTrades,
      description: "Cancelled or failed trades",
      icon: <XCircle className="h-4 w-4" />,
    },
    {
      title: "Disputed",
      value: disputedTrades,
      description: "Trades under appeal or objection",
      icon: <AlertTriangle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="flex flex-col justify-between p-6 bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-700/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:bg-gray-700/90"
          style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards` }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300 mb-1 tracking-wide">{stat.title}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-auto font-light tracking-tight leading-relaxed">
            {stat.description}
          </p>
        </div>
      ))}
    </div>
  ); 
}
