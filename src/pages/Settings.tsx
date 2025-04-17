
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UsersManagement } from "@/components/settings/users-management";
import { RolesPermissions } from "@/components/settings/roles-permissions";
import { UserGroups } from "@/components/settings/user-groups";
import { SystemSettings } from "@/components/settings/system-settings";
import { useUserStore } from "@/stores/user-store";
import { Navigate } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { setDebugMode, initDebugMode } from "@/utils/debug-util";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function Settings() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("users");
  const [debugEnabled, setDebugEnabled] = useState(false);
  
  useEffect(() => {
    // Initialize debug mode and get current state
    initDebugMode();
    try {
      const storedPref = localStorage.getItem('mrp_debug_mode');
      setDebugEnabled(storedPref === 'true');
    } catch (e) {
      // Ignore storage errors
    }
  }, []);
  
  // Only admins can access settings
  if (user?.role !== "Admin") {
    return <Navigate to="/unauthorized" replace />;
  }
  
  const handleDebugToggle = (checked: boolean) => {
    setDebugEnabled(checked);
    setDebugMode(checked);
    toast.success(`Debug mode ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleClearLogs = () => {
    try {
      localStorage.removeItem('mrp_document_access_logs');
      toast.success("Client logs cleared");
    } catch (e) {
      toast.error("Failed to clear logs");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your users, roles, permissions and system settings.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage your users, their roles and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Configure roles and their associated permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesPermissions />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Groups</CardTitle>
              <CardDescription>
                Manage user groups and their roles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserGroups />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure system-wide settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SystemSettings />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Debug Settings</CardTitle>
              <CardDescription>
                Configure debugging and logging options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed logging in the browser console
                  </p>
                </div>
                <Switch
                  id="debug-mode"
                  checked={debugEnabled}
                  onCheckedChange={handleDebugToggle}
                />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Log Management</h3>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    onClick={handleClearLogs}
                  >
                    Clear Client Logs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/settings/logs', '_blank')}
                  >
                    View Server Logs
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Clear logs for debugging purposes. Server logs require admin access.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                System version: 1.0.0 | Database: Supabase | Last update: {new Date().toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
