import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllAnalytics, useGetProjectEntries, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, Coins, Activity, Target, Brain, Megaphone, Wallet } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

export default function GlobalDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: analytics = [], isLoading: analyticsLoading } = useGetAllAnalytics();
  const { data: projectEntries = [] } = useGetProjectEntries();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  // Calculate comprehensive global metrics
  const metrics = useMemo(() => {
    const totalViews = analytics.reduce((sum, a) => sum + Number(a.views), 0);
    const totalClicks = analytics.reduce((sum, a) => sum + Number(a.clicks), 0);
    const avgEngagement = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';
    
    // Mock data for additional metrics (would come from backend in production)
    const totalUsers = 1247;
    const activeRewards = 12;
    const tokenCirculation = 125000;
    const adRevenue = 8450;
    const activeAds = 7;

    return {
      totalDApps: projectEntries.length,
      totalViews,
      totalClicks,
      avgEngagement,
      totalUsers,
      activeRewards,
      tokenCirculation,
      adRevenue,
      activeAds,
    };
  }, [analytics, projectEntries]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Dashboard Access Required</CardTitle>
            <CardDescription>Please log in to view the unified analytics dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Track campaign participation, advertising impact, DApp usage, and global engagement metrics.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Brain className="h-10 w-10 text-primary" />
          Unified Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          {userProfile ? `Welcome back, ${userProfile.name}!` : 'Comprehensive platform-wide metrics and AI-powered insights'}
        </p>
      </div>

      {/* Global Dashboard Image */}
      <div className="mb-8">
        <img 
          src="/assets/generated/global-dashboard.dim_800x500.png" 
          alt="Global Dashboard" 
          className="w-full max-w-4xl mx-auto rounded-lg shadow-lg"
        />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-chart-1/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active platform participants</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-accent/10 border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total DApps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDApps}</div>
            <p className="text-xs text-muted-foreground">Listed applications</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-4/10 border-chart-3/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{metrics.avgEngagement}%</div>
                <p className="text-xs text-muted-foreground">Average click-through rate</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-5/10 border-chart-4/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeRewards}</div>
            <p className="text-xs text-muted-foreground">Live reward campaigns</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-5/10 to-primary/10 border-chart-5/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Circulation</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.tokenCirculation.toLocaleString()} ICP</div>
            <p className="text-xs text-muted-foreground">Total distributed rewards</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-chart-2/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <div className="text-2xl font-bold animate-pulse">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(metrics.totalViews + metrics.totalClicks).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Views + Clicks combined</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advertising Impact Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-orange-500" />
              Advertising Impact
            </CardTitle>
            <CardDescription>Revenue and campaign performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ad Revenue (USD)</span>
              <span className="text-2xl font-bold text-orange-500">${metrics.adRevenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Campaigns</span>
              <span className="text-2xl font-bold text-red-500">{metrics.activeAds}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revenue Shared</span>
              <span className="text-lg font-bold text-chart-1">${(metrics.adRevenue * 0.7).toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              Wallet System Activity
            </CardTitle>
            <CardDescription>Real-time balance and transaction metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total ICP Held</span>
              <span className="text-2xl font-bold text-blue-500">45,230 ICP</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fiat Balance (USD)</span>
              <span className="text-2xl font-bold text-purple-500">$127,450</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transactions Today</span>
              <span className="text-lg font-bold text-chart-2">342</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Participation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Campaign Participation Tracking</CardTitle>
          <CardDescription>User engagement across all reward programs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">DApp Views</span>
              <span className="text-2xl font-bold text-primary">{metrics.totalViews.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">DApp Launches</span>
              <span className="text-2xl font-bold text-chart-1">{metrics.totalClicks.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reward Participants</span>
              <span className="text-2xl font-bold text-chart-2">847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Referral Network Size</span>
              <span className="text-2xl font-bold text-chart-3">3,421</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance & Referral Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance & Referral Analytics</CardTitle>
          <CardDescription>Reward program effectiveness and network growth metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Top Performing Campaigns
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-sm font-medium">Welcome Airdrop</span>
                    <Badge variant="outline" className="ml-2 text-xs">Airdrop</Badge>
                  </div>
                  <span className="text-sm font-bold text-primary">1,247 participants</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-sm font-medium">Referral Bonus</span>
                    <Badge variant="outline" className="ml-2 text-xs">Referral</Badge>
                  </div>
                  <span className="text-sm font-bold text-chart-1">892 participants</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <div>
                    <span className="text-sm font-medium">Learn & Earn</span>
                    <Badge variant="outline" className="ml-2 text-xs">Education</Badge>
                  </div>
                  <span className="text-sm font-bold text-chart-2">654 participants</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Referral Growth Tracking
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-sm">This Week</span>
                  <span className="text-sm font-bold text-chart-3">+127 referrals</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-sm">This Month</span>
                  <span className="text-sm font-bold text-chart-4">+543 referrals</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-sm">All Time</span>
                  <span className="text-sm font-bold text-chart-5">3,421 referrals</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
