import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useJoinRewardCampaign, useCompleteRewardCampaign, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Trophy, Users, GraduationCap, Coins, Star, Zap, Heart, Briefcase, Wrench, Brain, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { RewardCampaignType } from '../backend';

// Mock reward campaigns - in production these would come from backend
const mockCampaigns = [
  {
    id: 'airdrop-1',
    name: 'Welcome Airdrop',
    campaignType: RewardCampaignType.airdrop,
    rewardAmount: 1000000000n,
    description: 'Get 10 ICP tokens just for joining the platform!',
    participants: [],
  },
  {
    id: 'referral-1',
    name: 'Referral Bonus',
    campaignType: RewardCampaignType.referral,
    rewardAmount: 500000000n,
    description: 'Earn 5 ICP for each friend you refer to the platform.',
    participants: [],
  },
  {
    id: 'education-1',
    name: 'Learn & Earn',
    campaignType: RewardCampaignType.education,
    rewardAmount: 300000000n,
    description: 'Complete educational modules about Web3 and earn 3 ICP.',
    participants: [],
  },
  {
    id: 'contest-1',
    name: 'DApp Discovery Contest',
    campaignType: RewardCampaignType.contest,
    rewardAmount: 2000000000n,
    description: 'Win 20 ICP by discovering and reviewing the most DApps this month!',
    participants: [],
  },
  {
    id: 'commission-1',
    name: 'Creator Commission',
    campaignType: RewardCampaignType.commission,
    rewardAmount: 750000000n,
    description: 'Earn 7.5 ICP commission for promoting featured DApps.',
    participants: [],
  },
  {
    id: 'bonus-1',
    name: 'Activity Bonus',
    campaignType: RewardCampaignType.bonus,
    rewardAmount: 400000000n,
    description: 'Get 4 ICP bonus for consistent daily platform engagement.',
    participants: [],
  },
];

const campaignIcons: Record<string, any> = {
  airdrop: Coins,
  bonus: Star,
  commission: Briefcase,
  contest: Trophy,
  earning: Coins,
  education: GraduationCap,
  referral: Users,
  reward: Gift,
  special: Zap,
  volunteer: Heart,
  workshop: Wrench,
};

export default function RewardsPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const joinCampaign = useJoinRewardCampaign();
  const completeCampaign = useCompleteRewardCampaign();

  const isAuthenticated = !!identity;

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      await joinCampaign.mutateAsync(campaignId);
      toast.success('Successfully joined campaign!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join campaign');
    }
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    try {
      await completeCampaign.mutateAsync(campaignId);
      toast.success('Reward claimed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim reward');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Rewards Access Required</CardTitle>
            <CardDescription>Please log in to participate in AI-personalized reward campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Gift className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Earn rewards through airdrops, referrals, contests, and more with AI-powered personalization!
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
          Enhanced SeriesSuites Rewards Engine
        </h1>
        <p className="text-muted-foreground">
          {userProfile ? `Welcome ${userProfile.name}! ` : ''}
          Participate in AI-personalized campaigns and earn rewards
        </p>
      </div>

      {/* Rewards Engine Dashboard Image */}
      <div className="mb-8">
        <img 
          src="/assets/generated/rewards-engine-dashboard.dim_600x400.png" 
          alt="Rewards Engine Dashboard" 
          className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
        />
      </div>

      {/* AI Personalization Notice */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI-Powered Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our AI analyzes your engagement patterns, preferences, and activity history to recommend the most relevant reward campaigns for you. 
            The campaigns below are personalized based on your profile and behavior. The more you participate, the better your recommendations become!
          </p>
        </CardContent>
      </Card>

      {/* Campaign Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {Object.entries(campaignIcons).map(([type, Icon]) => (
          <Card key={type} className="text-center hover:shadow-lg transition-shadow cursor-pointer border-primary/10">
            <CardContent className="pt-6">
              <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium capitalize">{type}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Campaigns */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Personalized Campaigns for You</h2>
          <Badge variant="outline" className="gap-1">
            <Brain className="h-3 w-3" />
            AI Curated
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCampaigns.map((campaign) => {
            const Icon = campaignIcons[campaign.campaignType] || Gift;
            return (
              <Card key={campaign.id} className="hover:shadow-xl transition-all duration-300 border-primary/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <Badge variant="outline" className="capitalize mt-1">
                          {campaign.campaignType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription>{campaign.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reward</p>
                      <p className="text-lg font-bold text-primary">
                        {(Number(campaign.rewardAmount) / 100000000).toFixed(2)} ICP
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Participants</p>
                      <p className="text-lg font-bold">{campaign.participants.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleJoinCampaign(campaign.id)}
                      disabled={joinCampaign.isPending}
                      className="flex-1"
                    >
                      {joinCampaign.isPending ? 'Joining...' : 'Join Campaign'}
                    </Button>
                    <Button 
                      onClick={() => handleCompleteCampaign(campaign.id)}
                      disabled={completeCampaign.isPending}
                      variant="outline"
                      className="flex-1"
                    >
                      {completeCampaign.isPending ? 'Claiming...' : 'Claim Reward'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
