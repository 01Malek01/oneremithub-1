import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

type UserCredential = {
  name: string;
  apiKey: string;
  apiSecret: string;
};

interface UserSwitcherProps {
  users: UserCredential[];
  selectedUserIndex: number;
  onUserChange: (index: number) => void;
}

export const UserSwitcher = ({
  users,
  selectedUserIndex,
  onUserChange,
}: UserSwitcherProps) => {
  return (
    <Card className="p-4 border border-border/50  backdrop-blur-sm github-fade-in bg-slate-900/90">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-white">Active User</label>
            <p className="text-xs text-muted-foreground text-white">Select the account to analyze</p>
          </div>
        </div>
        <select
          value={selectedUserIndex}
          onChange={(e) => onUserChange(Number(e.target.value))}
          className="border border-border rounded-lg px-3 py-2 bg-background text-sm github-focus min-w-[200px]"
          aria-label="Select user account"
        >
          {users.map((user, idx) => (
            <option key={user.name} value={idx}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
};
