
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [exchangeSettings, setExchangeSettings] = useState({
    baseCurrency: 'USDT',
    quoteCurrency: 'NGN',
    defaultBuyRate: '1280.50',
    defaultSellRate: '1310.75',
    defaultMargin: '2.5',
  });
  
  const [railSettings, setRailSettings] = useState({
    optimizeFor: 'margin',
    trackHistory: true,
  });
  
  const { toast } = useToast();
  
  const handleSaveExchange = () => {
    toast({
      title: "Settings Saved",
      description: "Exchange settings have been updated successfully.",
    });
  };
  
  const handleSaveRail = () => {
    toast({
      title: "Settings Saved",
      description: "Rail optimization settings have been updated successfully.",
    });
  };
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Configure system preferences and application settings.</p>
      </div>
      
      <Tabs defaultValue="exchange" className="space-y-6">
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="exchange">Exchange</TabsTrigger>
          <TabsTrigger value="rails">Rails</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="user">User Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="exchange">
          <Card>
            <CardHeader>
              <CardTitle>Currency Exchange Settings</CardTitle>
              <CardDescription>Configure default rates and currencies for exchange operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baseCurrency">Base Currency</Label>
                  <Select 
                    value={exchangeSettings.baseCurrency} 
                    onValueChange={(value) => setExchangeSettings({...exchangeSettings, baseCurrency: value})}
                  >
                    <SelectTrigger id="baseCurrency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDT">USDT</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quoteCurrency">Quote Currency</Label>
                  <Select 
                    value={exchangeSettings.quoteCurrency}
                    onValueChange={(value) => setExchangeSettings({...exchangeSettings, quoteCurrency: value})}
                  >
                    <SelectTrigger id="quoteCurrency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="GHS">GHS</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultBuyRate">Default Buy Rate</Label>
                  <Input 
                    id="defaultBuyRate" 
                    value={exchangeSettings.defaultBuyRate} 
                    onChange={(e) => setExchangeSettings({...exchangeSettings, defaultBuyRate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultSellRate">Default Sell Rate</Label>
                  <Input 
                    id="defaultSellRate" 
                    value={exchangeSettings.defaultSellRate} 
                    onChange={(e) => setExchangeSettings({...exchangeSettings, defaultSellRate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultMargin">Default Margin (%)</Label>
                  <Input 
                    id="defaultMargin" 
                    value={exchangeSettings.defaultMargin} 
                    onChange={(e) => setExchangeSettings({...exchangeSettings, defaultMargin: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveExchange}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="rails">
          <Card>
            <CardHeader>
              <CardTitle>SWIFT Rail Settings</CardTitle>
              <CardDescription>Configure rail optimization preferences and settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="optimizeFor">Optimize Rails For</Label>
                <Select 
                  value={railSettings.optimizeFor}
                  onValueChange={(value) => setRailSettings({...railSettings, optimizeFor: value})}
                >
                  <SelectTrigger id="optimizeFor">
                    <SelectValue placeholder="Select optimization goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="margin">Maximum Margin</SelectItem>
                    <SelectItem value="speed">Fastest Processing</SelectItem>
                    <SelectItem value="cost">Lowest Cost</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="trackHistory" 
                  checked={railSettings.trackHistory}
                  onCheckedChange={(checked) => setRailSettings({...railSettings, trackHistory: checked})}
                />
                <Label htmlFor="trackHistory">Track rail performance history</Label>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Available Rails</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center">
                      <span>Swift Rail A</span>
                      <Badge className="ml-2" variant="outline">Active</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center">
                      <span>Swift Rail B</span>
                      <Badge className="ml-2" variant="outline">Active</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-md">
                    <div className="flex items-center">
                      <span>Swift Rail C</span>
                      <Badge className="ml-2" variant="outline">Active</Badge>
                    </div>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveRail}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Configure bank account preferences and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">Account settings will be available in a future version.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>Configure your personal preferences and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">User preferences will be available in a future version.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
