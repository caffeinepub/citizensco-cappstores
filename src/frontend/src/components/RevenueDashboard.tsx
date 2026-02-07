import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, Plus, CheckCircle2, Clock } from 'lucide-react';
import { ProjectEntry, AnalyticsEntry } from '../backend';
import { useGetRevenueShareConfig } from '../hooks/useQueries';

interface RevenueDashboardProps {
  projectEntries: ProjectEntry[];
  analytics: AnalyticsEntry[];
  onCreateConfig: () => void;
}

export default function RevenueDashboard({ projectEntries, analytics, onCreateConfig }: RevenueDashboardProps) {
  // Calculate revenue metrics (simulated based on clicks/views)
  const revenueMetrics = useMemo(() => {
    const totalClicks = analytics.reduce((sum, a) => sum + Number(a.clicks), 0);
    const totalViews = analytics.reduce((sum, a) => sum + Number(a.views), 0);
    
    // Simulated revenue: $0.01 per view, $0.10 per click
    const estimatedRevenue = (totalViews * 0.01) + (totalClicks * 0.10);
    
    const dappsWithRevenue = projectEntries.filter(p => p.revenueShareConfigId);
    
    return {
      totalRevenue: estimatedRevenue,
      dappsWithRevenue: dappsWithRevenue.length,
      totalDApps: projectEntries.length,
      pendingPayouts: Math.floor(estimatedRevenue * 0.3), // 30% pending
    };
  }, [projectEntries, analytics]);

  // Detailed revenue by DApp
  const dappRevenue = useMemo(() => {
    return projectEntries.map(project => {
      const analytic = analytics.find(a => a.projectId === project.id);
      const views = analytic ? Number(analytic.views) : 0;
      const clicks = analytic ? Number(analytic.clicks) : 0;
      const revenue = (views * 0.01) + (clicks * 0.10);
      
      return {
        project,
        views,
        clicks,
        revenue,
        hasRevenueConfig: !!project.revenueShareConfigId,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [projectEntries, analytics]);

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Estimated earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DApps with Revenue Share</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueMetrics.dappsWithRevenue} / {revenueMetrics.totalDApps}
            </div>
            <p className="text-xs text-muted-foreground">Configured for payouts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueMetrics.pendingPayouts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Awaiting distribution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Revenue per DApp</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenueMetrics.totalDApps > 0 
                ? (revenueMetrics.totalRevenue / revenueMetrics.totalDApps).toFixed(2)
                : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">Per listing</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sharing Illustration */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Revenue Sharing Configuration</CardTitle>
              <CardDescription>
                Set up automatic revenue distribution for DApps with multiple stakeholders
              </CardDescription>
            </div>
            <Button onClick={onCreateConfig} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Config
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              src="/assets/generated/revenue-sharing-illustration.dim_400x300.png"
              alt="Revenue Sharing"
              className="w-full md:w-1/3 rounded-lg"
            />
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">How Revenue Sharing Works:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Define multiple participants with ICP Principals or Stripe IDs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Set percentage splits for each stakeholder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Link configurations to specific DApp listings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Automatic distribution based on usage metrics (views & clicks)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by DApp Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by DApp</CardTitle>
          <CardDescription>
            Earnings breakdown and payout status for each listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dappRevenue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No DApps available yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>DApp Name</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead>Revenue Config</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dappRevenue.map(({ project, views, clicks, revenue, hasRevenueConfig }) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell className="text-right">{views.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">
                      ${revenue.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {hasRevenueConfig ? (
                        <RevenueConfigBadge configId={project.revenueShareConfigId!} />
                      ) : (
                        <Badge variant="outline">Not configured</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasRevenueConfig ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RevenueConfigBadge({ configId }: { configId: string }) {
  const { data: config, isLoading } = useGetRevenueShareConfig(configId);

  if (isLoading) {
    return <Badge variant="outline">Loading...</Badge>;
  }

  if (!config) {
    return <Badge variant="outline">Invalid config</Badge>;
  }

  return (
    <Badge variant="default" className="gap-1">
      <Users className="h-3 w-3" />
      {config.participants.length} participants
    </Badge>
  );
}
