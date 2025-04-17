
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export function SystemSettings() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    documentRetentionDays: "365",
    enableEmailNotifications: true,
    defaultWorkOrderPriority: "Normal",
    enablePartHistory: true,
    enableMachineIntegration: false
  });
  
  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Simulated API call - in a real application, this would save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("System settings saved successfully");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Settings</CardTitle>
          <CardDescription>
            Configure settings for document handling and storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="retention">Document Retention Period (Days)</Label>
              <Input
                id="retention"
                type="number"
                value={settings.documentRetentionDays}
                onChange={(e) => setSettings({ ...settings, documentRetentionDays: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Documents older than this will be marked for review or archiving
              </p>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="part-history">Part History Tracking</Label>
                <p className="text-xs text-muted-foreground">
                  Track changes to parts and revision history
                </p>
              </div>
              <Switch 
                id="part-history"
                checked={settings.enablePartHistory}
                onCheckedChange={(checked) => setSettings({ ...settings, enablePartHistory: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure how and when notifications are sent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Send email notifications for work order updates and assignments
              </p>
            </div>
            <Switch 
              id="email-notifications"
              checked={settings.enableEmailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, enableEmailNotifications: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default-priority">Default Work Order Priority</Label>
            <Select
              value={settings.defaultWorkOrderPriority}
              onValueChange={(value) => setSettings({ ...settings, defaultWorkOrderPriority: value })}
            >
              <SelectTrigger id="default-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Settings</CardTitle>
          <CardDescription>
            Configure external system integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="machine-integration">Machine Integration</Label>
              <p className="text-xs text-muted-foreground">
                Enable direct integration with CNC machines and tracking systems
              </p>
            </div>
            <Switch 
              id="machine-integration"
              checked={settings.enableMachineIntegration}
              onCheckedChange={(checked) => setSettings({ ...settings, enableMachineIntegration: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
