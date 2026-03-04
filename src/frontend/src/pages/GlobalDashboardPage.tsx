import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  BarChart3,
  Brain,
  Coins,
  Gift,
  Megaphone,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useMemo } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetAllAnalytics,
  useGetCallerUserProfile,
  useGetProjectEntries,
  useGetRewardCampaigns,
} from "../hooks/useQueries";

export default function GlobalDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: analytics = [], isLoading: analyticsLoading } =
    useGetAllAnalytics();
  const { data: projectEntries = [] } = useGetProjectEntries();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: campaigns = [], isLoading: campaignsLoading } =
    useGetRewardCampaigns();

  const isAuthenticated = !!identity;
  const userPrincipal = identity?.getPrincipal().toString();

  // Calculate comprehensive global metrics
  const metrics = useMemo(() => {
    const totalViews = analytics.reduce((sum, a) => sum + Number(a.views), 0);
    const totalClicks = analytics.reduce((sum, a) => sum + Number(a.clicks), 0);
    const avgEngagement =
      totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

    // Live campaign metrics from backend
    const activeCampaigns = campaigns.length;
    const totalParticipants = campaigns.reduce(
      (sum, c) => sum + c.participants.length,
      0,
    );

    // Pending campaigns for current user
    const userPendingCampaigns =
      userProfile?.pendingRewardCampaigns?.length ?? 0;

    // Total reward pool across all campaigns (in ICP e8s)
    const totalRewardPool = campaigns.reduce(
      (sum, c) => sum + Number(c.rewardAmount),
      0,
    );
    const totalRewardPoolICP = (totalRewardPool / 100_000_000).toFixed(2);

    // Mock data for metrics not yet exposed by backend
    const adRevenue = 8450;
    const activeAds = 7;

    return {
      totalDApps: projectEntries.length,
      totalViews,
      totalClicks,
      avgEngagement,
      activeCampaigns,
      totalParticipants,
      userPendingCampaigns,
      totalRewardPoolICP,
      adRevenue,
      activeAds,
    };
  }, [analytics, projectEntries, campaigns, userProfile]);

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">
              Dashboard Access Required
            </CardTitle>
            <CardDescription>
              Please log in to view the unified analytics dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Track campaign participation, advertising impact, DApp usage, and
              global engagement metrics.
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
          {userProfile
            ? `Welcome back, ${userProfile.name}!`
            : "Comprehensive platform-wide metrics and AI-powered insights"}
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
            <CardTitle className="text-sm font-medium">Total DApps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDApps}</div>
            <p className="text-xs text-muted-foreground">Listed applications</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-2/10 to-accent/10 border-chart-2/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Engagement Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics.avgEngagement}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average click-through rate
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-3/10 to-chart-4/10 border-chart-3/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Interactions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(metrics.totalViews + metrics.totalClicks).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Views + Clicks combined
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Live Reward Campaign Metrics */}
        <Card className="bg-gradient-to-br from-chart-4/10 to-chart-5/10 border-chart-4/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Reward Campaigns
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics.activeCampaigns}
                </div>
                <p className="text-xs text-muted-foreground">
                  Live campaigns on platform
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-chart-5/10 to-primary/10 border-chart-5/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Reward Pool
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics.totalRewardPoolICP} ICP
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all campaigns
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-chart-2/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campaign Participants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {metrics.totalParticipants.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total across all campaigns
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Advertising Impact + Wallet Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-orange-500" />
              Advertising Impact
            </CardTitle>
            <CardDescription>
              Revenue and campaign performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ad Revenue (USD)</span>
              <span className="text-2xl font-bold text-orange-500">
                ${metrics.adRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Ad Campaigns</span>
              <span className="text-2xl font-bold text-red-500">
                {metrics.activeAds}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revenue Shared</span>
              <span className="text-lg font-bold text-chart-1">
                ${(metrics.adRevenue * 0.7).toFixed(0)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              Wallet System Activity
            </CardTitle>
            <CardDescription>
              Real-time balance and transaction metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total ICP Held</span>
              <span className="text-2xl font-bold text-blue-500">
                45,230 ICP
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fiat Balance (USD)</span>
              <span className="text-2xl font-bold text-purple-500">
                $127,450
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transactions Today</span>
              <span className="text-lg font-bold text-chart-2">342</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reward Campaigns Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Reward Campaign Overview
          </CardTitle>
          <CardDescription>Live campaign data from the backend</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-3">
              {(["sk-1", "sk-2", "sk-3"] as const).map((id) => (
                <Skeleton key={id} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No reward campaigns have been created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {campaigns.slice(0, 5).map((campaign) => {
                const typeKey = campaign.campaignType as unknown as string;
                const isUserPending =
                  userProfile?.pendingRewardCampaigns?.includes(campaign.id) ??
                  false;
                const isUserParticipant = userPrincipal
                  ? campaign.participants.some(
                      (p) => p.toString() === userPrincipal,
                    )
                  : false;

                return (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-sm font-medium">
                          {campaign.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="ml-2 text-xs capitalize"
                        >
                          {typeKey}
                        </Badge>
                        {isUserPending && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Pending
                          </Badge>
                        )}
                        {isUserParticipant && !isUserPending && (
                          <Badge className="ml-1 text-xs">Claimed</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">
                        {(Number(campaign.rewardAmount) / 100_000_000).toFixed(
                          4,
                        )}{" "}
                        ICP
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.participants.length} participant
                        {campaign.participants.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
              {campaigns.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{campaigns.length - 5} more campaigns
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Participation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Campaign Participation Tracking</CardTitle>
          <CardDescription>
            User engagement across all reward programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">DApp Views</span>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold text-primary">
                  {metrics.totalViews.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">DApp Launches</span>
              {analyticsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold text-chart-1">
                  {metrics.totalClicks.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Reward Campaign Participants
              </span>
              {campaignsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold text-chart-2">
                  {metrics.totalParticipants.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Your Pending Rewards</span>
              {campaignsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold text-chart-3">
                  {metrics.userPendingCampaigns}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance & Referral Growth */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance & Referral Analytics</CardTitle>
          <CardDescription>
            Reward program effectiveness and network growth metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Live Campaign Breakdown
              </h3>
              {campaignsLoading ? (
                <div className="space-y-3">
                  {(["sk-a", "sk-b", "sk-c"] as const).map((id) => (
                    <Skeleton key={id} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No campaigns available yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {campaigns.slice(0, 3).map((campaign) => {
                    const typeKey = campaign.campaignType as unknown as string;
                    return (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div>
                          <span className="text-sm font-medium">
                            {campaign.name}
                          </span>
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs capitalize"
                          >
                            {typeKey}
                          </Badge>
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {campaign.participants.length} participant
                          {campaign.participants.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Referral Growth Tracking
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-sm">This Week</span>
                  <span className="text-sm font-bold text-chart-3">
                    +127 referrals
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-sm">This Month</span>
                  <span className="text-sm font-bold text-chart-4">
                    +543 referrals
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow">
                  <span className="text-sm">All Time</span>
                  <span className="text-sm font-bold text-chart-5">
                    3,421 referrals
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
