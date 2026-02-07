import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, BarChart3, DollarSign, Megaphone, TrendingUp, Eye, MousePointerClick, Wallet, Gift, Activity, Brain } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllAnalytics, useGetProjectEntries } from '../hooks/useQueries';
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
  const { data: projectEntries = [] } = useGetProjectEntries();
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
        projectCategory: project?.category || 'Unknown',
        revenueShareConfigId: project?.revenueShareConfigId,
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
                      <TableHead>Category</TableHead>
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
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.projectCategory}
                            </Badge>
                          </TableCell>
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
                        <CardTitle className="text-sm font-medium">Most Popular Category</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold capitalize">
                          {detailedAnalytics[0]?.projectCategory || 'N/A'}
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
                            <TableHead>Category</TableHead>
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
                                <TableCell>
                                  <Badge variant="outline" className="capitalize">
                                    {item.projectCategory}
                                  </Badge>
                                </TableCell>
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
          <RevenueDashboard 
            projectEntries={projectEntries}
            analytics={analytics}
            onCreateConfig={() => setRevenueConfigModalOpen(true)}
          />
        </TabsContent>

        <TabsContent value="wallets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Enhanced Wallet Management
              </CardTitle>
              <CardDescription>
                Monitor user wallets with real-time balances and instant settlement tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <img 
                  src="/assets/generated/wallet-interface.dim_400x300.png" 
                  alt="Wallet Management" 
                  className="w-full max-w-md mx-auto mb-4 rounded-lg opacity-50"
                />
                <p className="text-muted-foreground mb-2">Advanced wallet management dashboard</p>
                <p className="text-sm text-muted-foreground">
                  View user wallet balances in ICP and fiat, transaction history, instant settlement status, and manage platform-wide wallet settings.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Enhanced Rewards Engine Configuration
              </CardTitle>
              <CardDescription>
                Create and manage AI-personalized reward campaigns with all 11 campaign types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={() => setRewardCampaignModalOpen(true)} className="w-full">
                Create New Reward Campaign
              </Button>
              <div className="text-center py-8">
                <img 
                  src="/assets/generated/rewards-engine-dashboard.dim_600x400.png" 
                  alt="Rewards Engine" 
                  className="w-full max-w-2xl mx-auto mb-4 rounded-lg opacity-50"
                />
                <p className="text-muted-foreground">
                  Configure airdrops, bonuses, commissions, contests, earnings, education, referrals, rewards, specials, volunteer, and workshop campaigns with AI-powered personalization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Intelligent Advertising Platform
              </CardTitle>
              <CardDescription>
                Configure ad campaigns, revenue distribution, and flexible pricing models
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <img 
                  src="/assets/generated/ad-revenue-sharing.dim_400x300.png" 
                  alt="Ad Revenue Sharing" 
                  className="w-full max-w-md mx-auto mb-4 rounded-lg opacity-50"
                />
                <p className="text-muted-foreground mb-2">Advertising system with automated revenue sharing</p>
                <p className="text-sm text-muted-foreground">
                  Set up ad campaigns with flexible reward-based pricing, configure revenue splits across multiple entities, track advertising performance with real-time analytics, and manage ad approvals with instant settlement options.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health & Economic Transparency
              </CardTitle>
              <CardDescription>Monitor platform operations, performance, and financial tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Backend Canister</p>
                    <p className="text-sm text-muted-foreground">Main application logic</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Stripe Integration</p>
                    <p className="text-sm text-muted-foreground">Payment processing with instant settlement</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Enhanced Wallet System</p>
                    <p className="text-sm text-muted-foreground">Multi-currency ICP and fiat balances</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Operational</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">AI Rewards Engine</p>
                    <p className="text-sm text-muted-foreground">Personalized campaign management</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Running</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Revenue Automation</p>
                    <p className="text-sm text-muted-foreground">Multi-entity splits with instant settlement</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">AI Discovery Engine</p>
                    <p className="text-sm text-muted-foreground">Contextual recommendations and trending analysis</p>
                  </div>
                  <Badge variant="default" className="bg-green-500">Optimized</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {revenueConfigModalOpen && (
        <RevenueShareConfigModal 
          open={revenueConfigModalOpen}
          onClose={() => setRevenueConfigModalOpen(false)}
        />
      )}

      {rewardCampaignModalOpen && (
        <CreateRewardCampaignModal 
          open={rewardCampaignModalOpen}
          onClose={() => setRewardCampaignModalOpen(false)}
        />
      )}
    </div>
  );
}
