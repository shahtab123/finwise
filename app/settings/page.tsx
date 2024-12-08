'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  User,
  Shield,
  Save,
  Globe,
  Palette,
  Key,
  Mail,
  Building,
  Phone,
  AlertTriangle
} from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    language: 'en',
    currency: 'USD',
    openaiKey: '',
    userDetails: {
      name: 'demo',
      email: 'demo@example.com',
      company: 'Demo Corp',
      phone: '+1234567890'
    }
  });

  const handleSave = () => {
    localStorage.setItem('finwise_settings', JSON.stringify(settings));
  };

  return (
    <div className="p-8 space-y-8">
      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-500" />
        <p className="text-sm text-yellow-500">This settings page is not functional yet. It's for demonstration purposes only.</p>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.userDetails.name}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    userDetails: { ...prev.userDetails, name: e.target.value }
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={settings.userDetails.email}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    userDetails: { ...prev.userDetails, email: e.target.value }
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                value={settings.userDetails.company}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    userDetails: { ...prev.userDetails, company: e.target.value }
                  }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={settings.userDetails.phone}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    userDetails: { ...prev.userDetails, phone: e.target.value }
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>Configure your API settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="openai">OpenAI API Key</Label>
              <Input
                id="openai"
                type="password"
                placeholder="sk-..."
                value={settings.openaiKey}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, openaiKey: e.target.value }))
                }
              />
              <p className="text-sm text-muted-foreground">
                Required for AI-powered features like transaction categorization
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize your interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={settings.darkMode}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, darkMode: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>Set your regional preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                name="language"
                className="w-full p-2 rounded-md border"
                value={settings.language}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, language: e.target.value }))
                }
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                name="currency"
                className="w-full p-2 rounded-md border"
                value={settings.currency}
                onChange={(e) => 
                  setSettings(prev => ({ ...prev, currency: e.target.value }))
                }
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-32">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
} 