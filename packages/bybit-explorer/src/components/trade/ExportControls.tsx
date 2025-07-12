import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportControlsProps {
  isExporting: boolean;
  onExport: (days: number) => void;
  disabled?: boolean;
}

export const ExportControls = ({
  isExporting,
  onExport,
  disabled = false,
}: ExportControlsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          disabled={disabled || isExporting}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onExport(7)}
          className="cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Last 7 days
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onExport(30)}
          className="cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Last 30 days
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onExport(90)}
          className="cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Last 90 days
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onExport(365)}
          className="cursor-pointer"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Last 365 days
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
