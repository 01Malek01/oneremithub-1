
import React from 'react';
import { FastForward, Globe, Clock } from 'lucide-react';

export function RailsOverview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <FastForward className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">SWIFT Rails</h1>
          <p className="text-muted-foreground">Optimize your SWIFT rail selection and track performance metrics.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        <div className="flex items-center p-3 rounded-lg border bg-card shadow-sm">
          <Globe className="h-5 w-5 text-primary mr-3" />
          <div>
            <div className="text-sm font-medium">Global Coverage</div>
            <div className="text-xs text-muted-foreground">200+ countries supported</div>
          </div>
        </div>
        <div className="flex items-center p-3 rounded-lg border bg-card shadow-sm">
          <Clock className="h-5 w-5 text-primary mr-3" />
          <div>
            <div className="text-sm font-medium">Average Processing Time</div>
            <div className="text-xs text-muted-foreground">24-48 hours</div>
          </div>
        </div>
        <div className="flex items-center p-3 rounded-lg border bg-card shadow-sm">
          <div className="h-5 w-5 text-primary mr-3 flex items-center justify-center font-bold">$</div>
          <div>
            <div className="text-sm font-medium">Average Fee</div>
            <div className="text-xs text-muted-foreground">2.3% per transaction</div>
          </div>
        </div>
      </div>
    </div>
  );
}
