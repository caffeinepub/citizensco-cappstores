import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRewardCampaign } from '../hooks/useQueries';
import { RewardCampaignType } from '../backend';
import { toast } from 'sonner';

interface CreateRewardCampaignModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateRewardCampaignModal({ open, onClose }: CreateRewardCampaignModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [campaignType, setCampaignType] = useState<RewardCampaignType>(RewardCampaignType.reward);
  const [rewardAmount, setRewardAmount] = useState('');

  const createCampaign = useCreateRewardCampaign();

  const handleSubmit = async () => {
    if (!name || !description || !rewardAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = BigInt(Math.floor(parseFloat(rewardAmount) * 100000000));

    try {
      await createCampaign.mutateAsync({
        id: `campaign-${Date.now()}`,
        name,
        description,
        campaignType,
        rewardAmount: amount,
        participants: [],
      });
      toast.success('Reward campaign created successfully!');
      onClose();
      setName('');
      setDescription('');
      setRewardAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create campaign');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Reward Campaign</DialogTitle>
          <DialogDescription>
            Set up a new reward campaign for users to participate in
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Welcome Airdrop"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-type">Campaign Type</Label>
            <Select value={campaignType} onValueChange={(value) => setCampaignType(value as RewardCampaignType)}>
              <SelectTrigger id="campaign-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RewardCampaignType.airdrop}>Airdrop</SelectItem>
                <SelectItem value={RewardCampaignType.bonus}>Bonus</SelectItem>
                <SelectItem value={RewardCampaignType.commission}>Commission</SelectItem>
                <SelectItem value={RewardCampaignType.contest}>Contest</SelectItem>
                <SelectItem value={RewardCampaignType.earning}>Earning</SelectItem>
                <SelectItem value={RewardCampaignType.education}>Education</SelectItem>
                <SelectItem value={RewardCampaignType.referral}>Referral</SelectItem>
                <SelectItem value={RewardCampaignType.reward}>Reward</SelectItem>
                <SelectItem value={RewardCampaignType.special}>Special</SelectItem>
                <SelectItem value={RewardCampaignType.volunteer}>Volunteer</SelectItem>
                <SelectItem value={RewardCampaignType.workshop}>Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward-amount">Reward Amount (ICP)</Label>
            <Input
              id="reward-amount"
              type="number"
              step="0.00000001"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="10.00000000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign-description">Description</Label>
            <Textarea
              id="campaign-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the campaign and how users can participate..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={createCampaign.isPending}>
              {createCampaign.isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
