import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  CheckCircle2,
  Coins,
  Gift,
  GraduationCap,
  Heart,
  Loader2,
  Sparkles,
  Star,
  Trophy,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type RewardCampaign, RewardCampaignType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCompleteRewardCampaign,
  useGetCallerUserProfile,
  useGetRewardCampaigns,
  useJoinRewardCampaign,
} from "../hooks/useQueries";

const campaignTypeIcons: Record<string, React.ElementType> = {
  airdrop: Gift,
  bonus: Star,
  commission: Coins,
  contest: Trophy,
  earning: Coins,
  education: GraduationCap,
  referral: Users,
  reward: Gift,
  special: Sparkles,
  volunteer: Heart,
  workshop: Wrench,
};

const campaignTypeColors: Record<string, string> = {
  airdrop: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  bonus: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  commission: "bg-green-500/10 text-green-600 border-green-500/20",
  contest: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  earning: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  education: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  referral: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  reward: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  special: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  volunteer: "bg-red-500/10 text-red-600 border-red-500/20",
  workshop: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
};

function CampaignCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-12 w-12 rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full rounded-md" />
      </CardContent>
    </Card>
  );
}

interface CampaignCardProps {
  campaign: RewardCampaign;
  userPrincipal: string | undefined;
  pendingCampaigns: string[];
  joinCampaign: ReturnType<typeof useJoinRewardCampaign>;
  completeCampaign: ReturnType<typeof useCompleteRewardCampaign>;
  onJoin: (id: string) => void;
  onComplete: (id: string) => void;
}

function CampaignCard({
  campaign,
  userPrincipal,
  pendingCampaigns,
  joinCampaign,
  completeCampaign,
  onJoin,
  onComplete,
}: CampaignCardProps) {
  const typeKey = campaign.campaignType as unknown as string;
  const Icon = campaignTypeIcons[typeKey] || Gift;
  const colorClass =
    campaignTypeColors[typeKey] ||
    "bg-gray-500/10 text-gray-600 border-gray-500/20";

  const hasJoined = userPrincipal
    ? campaign.participants.some((p) => p.toString() === userPrincipal)
    : false;
  const hasPending = pendingCampaigns.includes(campaign.id);
  const isCompleted = hasJoined && !hasPending;

  const isJoining =
    joinCampaign.isPending && joinCampaign.variables === campaign.id;
  const isCompleting =
    completeCampaign.isPending && completeCampaign.variables === campaign.id;

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-300 border-2 ${colorClass}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Claimed
              </Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {typeKey}
            </Badge>
          </div>
        </div>
        <CardTitle className="text-xl">{campaign.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {campaign.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <span className="text-sm font-medium">Reward</span>
          <span className="text-lg font-bold text-primary">
            {(Number(campaign.rewardAmount) / 100_000_000).toFixed(4)} ICP
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {campaign.participants.length} participant
            {campaign.participants.length !== 1 ? "s" : ""}
          </span>
        </div>

        {hasJoined && hasPending ? (
          <Button
            className="w-full gap-2"
            onClick={() => onComplete(campaign.id)}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4" />
                Claim Reward
              </>
            )}
          </Button>
        ) : isCompleted ? (
          <Button variant="secondary" className="w-full gap-2" disabled>
            <CheckCircle2 className="h-4 w-4" />
            Reward Claimed
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => onJoin(campaign.id)}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Join Campaign
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Card className="text-center py-12 col-span-full">
      <CardContent>
        <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-semibold mb-1">No Campaigns Found</p>
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

export default function RewardsPage() {
  const { identity } = useInternetIdentity();
  const {
    data: campaigns = [],
    isLoading: campaignsLoading,
    error: campaignsError,
  } = useGetRewardCampaigns();
  const { data: userProfile } = useGetCallerUserProfile();
  const joinCampaign = useJoinRewardCampaign();
  const completeCampaign = useCompleteRewardCampaign();
  const [activeTab, setActiveTab] = useState("all");

  const isAuthenticated = !!identity;
  const userPrincipal = identity?.getPrincipal().toString();
  const pendingCampaigns = userProfile?.pendingRewardCampaigns ?? [];

  const handleJoinCampaign = async (campaignId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to join campaigns");
      return;
    }
    try {
      await joinCampaign.mutateAsync(campaignId);
      toast.success("Successfully joined the campaign!");
    } catch (error: any) {
      toast.error(error.message || "Failed to join campaign");
    }
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    if (!isAuthenticated) {
      toast.error("Please log in to claim rewards");
      return;
    }
    try {
      await completeCampaign.mutateAsync(campaignId);
      toast.success("Campaign completed! Rewards added to your wallet.");
    } catch (error: any) {
      toast.error(error.message || "Failed to complete campaign");
    }
  };

  // Filter campaigns based on tab
  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab === "all") return true;

    const hasJoined = userPrincipal
      ? campaign.participants.some((p) => p.toString() === userPrincipal)
      : false;
    const hasPending = pendingCampaigns.includes(campaign.id);

    if (activeTab === "active") {
      // Active = joined and pending (not yet claimed)
      return hasJoined && hasPending;
    }
    if (activeTab === "completed") {
      // Completed = joined but no longer pending (claimed)
      return hasJoined && !hasPending;
    }
    return true;
  });

  const activeCampaignsCount = campaigns.filter((c) => {
    const hasJoined = userPrincipal
      ? c.participants.some((p) => p.toString() === userPrincipal)
      : false;
    return hasJoined && pendingCampaigns.includes(c.id);
  }).length;

  const completedCampaignsCount = campaigns.filter((c) => {
    const hasJoined = userPrincipal
      ? c.participants.some((p) => p.toString() === userPrincipal)
      : false;
    return hasJoined && !pendingCampaigns.includes(c.id);
  }).length;

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Rewards Access Required</CardTitle>
            <CardDescription>
              Please log in to participate in reward campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Join campaigns, earn rewards, and participate in the SeriesSuites
              ecosystem.
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
          SeriesSuites Rewards Engine
        </h1>
        <p className="text-muted-foreground">
          AI-personalized reward campaigns tailored to your preferences and
          activity
        </p>
      </div>

      {/* Summary stats */}
      {!campaignsLoading && !campaignsError && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-primary">
              {campaigns.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Campaigns</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-chart-2">
              {activeCampaignsCount}
            </div>
            <div className="text-sm text-muted-foreground">Pending Rewards</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-chart-3">
              {completedCampaignsCount}
            </div>
            <div className="text-sm text-muted-foreground">Claimed Rewards</div>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            All
            {!campaignsLoading && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {campaigns.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">
            Active
            {activeCampaignsCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeCampaignsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedCampaignsCount > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {completedCampaignsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {campaignsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const).map(
                (id) => (
                  <CampaignCardSkeleton key={id} />
                ),
              )}
            </div>
          ) : campaignsError ? (
            <Card className="text-center py-12 border-destructive/50">
              <CardContent>
                <Gift className="h-16 w-16 mx-auto mb-4 text-destructive" />
                <p className="text-lg font-semibold mb-1 text-destructive">
                  Error Loading Campaigns
                </p>
                <p className="text-muted-foreground">
                  {campaignsError instanceof Error
                    ? campaignsError.message
                    : "Failed to load reward campaigns. Please try again later."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.length === 0 ? (
                <EmptyState
                  message={
                    activeTab === "active"
                      ? "You have no pending rewards. Join a campaign to get started!"
                      : activeTab === "completed"
                        ? "You have not claimed any rewards yet."
                        : "There are no active reward campaigns at the moment. Check back soon!"
                  }
                />
              ) : (
                filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    userPrincipal={userPrincipal}
                    pendingCampaigns={pendingCampaigns}
                    joinCampaign={joinCampaign}
                    completeCampaign={completeCampaign}
                    onJoin={handleJoinCampaign}
                    onComplete={handleCompleteCampaign}
                  />
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
