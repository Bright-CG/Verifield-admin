import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShieldCheck, Activity, TrendingUp } from "lucide-react"

const stats = [
  { title: "Total Tenants", value: "—", icon: Users, note: "Active companies & parties" },
  { title: "Verifications Today", value: "—", icon: ShieldCheck, note: "Anchored to immutable log" },
  { title: "API Uptime", value: "99.9%", icon: Activity, note: "All systems operational" },
  { title: "Active Agents", value: "—", icon: TrendingUp, note: "Field agents online" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Overview</h2>
        <p className="text-muted-foreground mt-1">
          Real-time status across all tenants and agents.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Laravel API", status: "Operational", ok: true },
              { label: "MySQL Database", status: "Operational", ok: true },
              { label: "Laravel Reverb (WebSocket)", status: "Not Started", ok: false },
              { label: "Spatial Queries (ST_Distance)", status: "Configured", ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className={`font-medium ${item.ok ? "text-emerald-500" : "text-amber-500"}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Security Posture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Sanctum Auth", status: "Active" },
              { label: "Immutable Triggers", status: "Active" },
              { label: "20m Proximity Lock", status: "Active" },
              { label: "Multi-Tenant Isolation", status: "Active" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-emerald-500">{item.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
