
import { 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data - would come from API in production
const data = [
  { date: "Apr 21", buyRate: 1260, sellRate: 1290 },
  { date: "Apr 22", buyRate: 1265, sellRate: 1295 },
  { date: "Apr 23", buyRate: 1270, sellRate: 1300 },
  { date: "Apr 24", buyRate: 1275, sellRate: 1305 },
  { date: "Apr 25", buyRate: 1278, sellRate: 1308 },
  { date: "Apr 26", buyRate: 1280.5, sellRate: 1310.75 },
  { date: "Apr 27", buyRate: 1282, sellRate: 1312 },
];

export function RateHistoryChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-normal">USDT/NGN Rate History</CardTitle>
        <Select defaultValue="7d">
          <SelectTrigger className="h-8 w-[120px]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last quarter</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="date" 
              tickLine={false} 
              axisLine={false}
              dy={10}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              domain={['dataMin - 10', 'dataMax + 10']}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`₦${value}`, ""]} 
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="buyRate"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
              name="Buy Rate"
            />
            <Line
              type="monotone"
              dataKey="sellRate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              name="Sell Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
