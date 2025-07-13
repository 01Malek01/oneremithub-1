
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', newUsers: 120, returningUsers: 280 },
  { name: 'Tue', newUsers: 150, returningUsers: 320 },
  { name: 'Wed', newUsers: 180, returningUsers: 350 },
  { name: 'Thu', newUsers: 200, returningUsers: 400 },
  { name: 'Fri', newUsers: 250, returningUsers: 450 },
  { name: 'Sat', newUsers: 300, returningUsers: 520 },
  { name: 'Sun', newUsers: 280, returningUsers: 480 },
];

const UserAnalytics = () => {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Area
            type="monotone"
            dataKey="returningUsers"
            stackId="1"
            stroke="#06b6d4"
            fill="url(#returningGradient)"
          />
          <Area
            type="monotone"
            dataKey="newUsers"
            stackId="1"
            stroke="#ec4899"
            fill="url(#newGradient)"
          />
          <defs>
            <linearGradient id="returningGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="newGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#ec4899" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserAnalytics;
