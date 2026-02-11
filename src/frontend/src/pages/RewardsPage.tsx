import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetRewardCampaigns, useJoinRewardCampaign, useCompleteRewardCampaign, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Trophy, Users, GraduationCap, Coins, Star, Zap, Heart, Briefcase, Wrench, Brain, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RewardCampaignType } from '../backend';

const campaignTypeIcons: Record<string, any> = {
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
  airdrop: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  bonus: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  commission: 'bg-green-500/10 text-green-600 border-green-500/20',
  contest: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  earning: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  education: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  referral: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  reward: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  special: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  volunteer: 'bg-red-500/10 text-red-600 border-red-500/20',
  workshop: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
};

export default function RewardsPage() {
  const { identity } = useInternetIdentity();
  const { data: campaigns = [], isLoading: campaignsLoading, error: campaignsError } = useGetRewardCampaigns();
  const { data: userProfile } = useGetCallerUserProfile();
  const joinCampaign = useJoinRewardCampaign();
  const completeCampaign = useCompleteRewardCampaign();

  const isAuthenticated = !!identity;
  const userPrincipal = identity?.getPrincipal().toString();

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      await joinCampaign.mutateAsync(campaignId);
      toast.success('Successfully joined the campaign!');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to join campaign';
      toast.error(errorMessage);
    }
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    try {
      await completeCampaign.mutateAsync(campaignId);
      toast.success('Campaign completed! Rewards added to your wallet.');
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to complete campaign';
      toast.error(errorMessage);
    }
  };

  const isParticipant = (campaign: any) => {
    if (!userPrincipal) return false;
    return campaign.participants.some((p: any) => p.toString() === userPrincipal);
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Rewards Access Required</CardTitle>
            <CardDescription>Please log in to participate in reward campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Join campaigns, earn rewards, and participate in the SeriesSuites ecosystem.
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
          AI-personalized reward campaigns tailored to your preferences and activity
        </p>
      </div>

      {campaignsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-12 w-12 bg-muted rounded-lg mb-4" />
                <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : campaignsError ? (
        <Card className="text-center py-12 border-destructive/50">
          <CardContent>
            <Gift className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <CardTitle className="mb-2 text-destructive">Error Loading Campaigns</CardTitle>
            <p className="text-muted-foreground">
              {campaignsError instanceof Error ? campaignsError.message : 'Failed to load reward campaigns. Please try again later.'}
            </p>
          </CardContent>
        </Card>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <CardTitle className="mb-2">No Campaigns Available</CardTitle>
            <p className="text-muted-foreground">
              There are no active reward campaigns at the moment. Check back soon for new opportunities!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const Icon = campaignTypeIcons[campaign.campaignType] || Gift;
            const colorClass = campaignTypeColors[campaign.campaignType] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
            const hasJoined = isParticipant(campaign);

            return (
              <Card key={campaign.id} className={`hover:shadow-lg transition-all duration-300 border-2 ${colorClass}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {campaign.campaignType}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{campaign.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <span className="text-sm font-medium">Reward</span>
                    <span className="text-lg font-bold text-primary">
                      {(Number(campaign.rewardAmount) / 100000000).toFixed(2)} ICP
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{campaign.participants.length} participants</span>
                  </div>
                  {hasJoined ? (
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleCompleteCampaign(campaign.id)}
                      disabled={completeCampaign.isPending}
                    >
                      {completeCampaign.isPending ? (
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
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => handleJoinCampaign(campaign.id)}
                      disabled={joinCampaign.isPending}
                    >
                      {joinCampaign.isPending ? (
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
          })}
        </div>
      )}
    </div>
  );
}
