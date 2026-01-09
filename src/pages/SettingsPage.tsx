import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { User, Bell, Shield, Palette, Save } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()

  // Profile settings
  const [displayName, setDisplayName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [redemptionAlerts, setRedemptionAlerts] = useState(true)
  const [riskAlerts, setRiskAlerts] = useState(true)
  const [rebalanceAlerts, setRebalanceAlerts] = useState(false)

  // Display settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY')

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')

  const handleSaveProfile = () => {
    toast.success('Profile settings saved')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved')
  }

  const handleSaveDisplay = () => {
    toast.success('Display settings saved')
  }

  const handleSaveSecurity = () => {
    toast.success('Security settings saved')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage application settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Display</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input
                  id="wallet"
                  value={user?.wallet_address || user?.walletAddress || ''}
                  disabled
                  className="font-mono text-sm bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Your wallet address cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter display name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email for notifications"
                />
              </div>

              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {(user?.roles || [user?.role]).filter(Boolean).map((role) => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how you receive alerts and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Delivery Methods</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Alert Types</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Redemption Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      New redemption requests and status changes
                    </p>
                  </div>
                  <Switch
                    checked={redemptionAlerts}
                    onCheckedChange={setRedemptionAlerts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Risk Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Risk threshold breaches and warnings
                    </p>
                  </div>
                  <Switch
                    checked={riskAlerts}
                    onCheckedChange={setRiskAlerts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rebalance Alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Portfolio rebalancing notifications
                    </p>
                  </div>
                  <Switch
                    checked={rebalanceAlerts}
                    onCheckedChange={setRebalanceAlerts}
                  />
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Display Settings */}
        <TabsContent value="display">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>
                Customize the application appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveDisplay} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Display Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-xs text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>

              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Automatically log out after inactivity
                </p>
              </div>

              <div className="space-y-2">
                <Label>Active Sessions</Label>
                <div className="border rounded-md p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">
                        Browser - Last active now
                      </p>
                    </div>
                    <span className="text-xs text-green-600">Active</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSecurity} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
