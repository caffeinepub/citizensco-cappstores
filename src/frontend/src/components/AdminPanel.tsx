import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, BarChart3, DollarSign, Megaphone, TrendingUp, Eye, MousePointerClick, Wallet, Gift, Activity, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllAnalytics, useListProjectEntries } from '../hooks/useQueries';
import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import RevenueDashboard from './RevenueDashboard';
import RevenueShareConfigModal from './RevenueShareConfigModal';
import CreateRewardCampaignModal from './CreateRewardCampaignModal';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { data: analytics = [], isLoading: analyticsLoading } = useGetAllAnalytics();
  const { data: projectEntries = [] } = useListProjectEntries();
  const [revenueConfigModalOpen, setRevenueConfigModalOpen] = useState(false);
  const [rewardCampaignModalOpen, setRewardCampaignModalOpen] = useState(false);

  // Calculate aggregate statistics
  const stats = useMemo(() => {
    const totalClicks = analytics.reduce((sum, entry) => sum + Number(entry.clicks), 0);
    const totalViews = analytics.reduce((sum, entry) => sum + Number(entry.views), 0);
    const engagementRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

    return {
      totalDApps: projectEntries.length,
      totalClicks,
      totalViews,
      engagementRate,
    };
  }, [analytics, projectEntries]);

  // Merge analytics with project data for detailed view
  const detailedAnalytics = useMemo(() => {
    return analytics.map(analytic => {
      const project = projectEntries.find(p => p.id === analytic.projectId);
      return {
        ...analytic,
        projectName: project?.name || 'Unknown',
      };
    }).sort((a, b) => Number(b.clicks) - Number(a.clicks));
  }, [analytics, projectEntries]);

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Enhanced Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Comprehensive management with AI insights, campaign oversight, and revenue controls
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="wallets">Wallets</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="ads">Advertising</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total DApps</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDApps}</div>
                <p className="text-xs text-muted-foreground">Active marketplace listings</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-2xl font-bold animate-pulse">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">DApp impressions</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointerClick className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-2xl font-bold animate-pulse">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Launch button clicks</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="text-2xl font-bold animate-pulse">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats.engagementRate}%</div>
                    <p className="text-xs text-muted-foreground">Click-through rate</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing DApps</CardTitle>
              <CardDescription>DApps ranked by total clicks with AI insights</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
              ) : detailedAnalytics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No analytics data available yet. DApps will appear here once users start interacting with them.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>DApp Name</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detailedAnalytics.slice(0, 10).map((item, index) => {
                      const ctr = Number(item.views) > 0 
                        ? ((Number(item.clicks) / Number(item.views)) * 100).toFixed(1)
                        : '0.0';
                      return (
                        <TableRow key={item.projectId}>
                          <TableCell className="font-medium">#{index + 1}</TableCell>
                          <TableCell>{item.projectName}</TableCell>
                          <TableCell className="text-right">{Number(item.views).toLocaleString()}</TableCell>
                          <TableCell className="text-right">{Number(item.clicks).toLocaleString()}</TableCell>
                          <TableCell className="text-right">{ctr}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Analytics Dashboard</CardTitle>
              <CardDescription>Track user engagement, DApp performance, and AI-powered insights</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsLoading ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground animate-pulse" />
                  <p className="text-muted-foreground">Loading analytics data...</p>
                </div>
              ) : detailedAnalytics.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No analytics data available yet</p>
                  <p className="text-sm text-muted-foreground">
                    Analytics will appear here once users start viewing and clicking on DApps.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Views per DApp</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(stats.totalViews / stats.totalDApps).toFixed(1)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Average Clicks per DApp</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {(stats.totalClicks / stats.totalDApps).toFixed(1)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total DApps</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {stats.totalDApps}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Detailed Analytics</CardTitle>
                      <CardDescription>Complete breakdown of all DApp performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>DApp Name</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                            <TableHead className="text-right">Clicks</TableHead>
                            <TableHead className="text-right">CTR</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {detailedAnalytics.map((item) => {
                            const ctr = Number(item.views) > 0 
                              ? ((Number(item.clicks) / Number(item.views)) * 100).toFixed(1)
                              : '0.0';
                            return (
                              <TableRow key={item.projectId}>
                                <TableCell className="font-medium">{item.projectName}</TableCell>
                                <TableCell className="text-right">{Number(item.views).toLocaleString()}</TableCell>
                                <TableCell className="text-right">{Number(item.clicks).toLocaleString()}</TableCell>
                                <TableCell className="text-right">{ctr}%</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Management
              </CardTitle>
              <CardDescription>
                Configure revenue sharing and track earnings distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => setRevenueConfigModalOpen(true)}>
                  Create Revenue Share Configuration
                </Button>
              </div>
              <RevenueDashboard projectEntries={projectEntries} analytics={analytics} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Management
              </CardTitle>
              <CardDescription>Monitor platform wallet balances and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Wallet management features coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Rewards Engine
              </CardTitle>
              <CardDescription>Create and manage reward campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Button onClick={() => setRewardCampaignModalOpen(true)}>
                  Create Reward Campaign
                </Button>
              </div>
              <div className="text-center py-12 text-muted-foreground">
                View existing campaigns in the Rewards page
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Advertising Platform
              </CardTitle>
              <CardDescription>Manage advertising campaigns and placements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Advertising platform features coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Monitor platform performance and health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="default" className="bg-green-600">Operational</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">-</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RevenueShareConfigModal
        open={revenueConfigModalOpen}
        onClose={() => setRevenueConfigModalOpen(false)}
      />

      <CreateRewardCampaignModal
        open={rewardCampaignModalOpen}
        onClose={() => setRewardCampaignModalOpen(false)}
      />
    </div>
  );
}
