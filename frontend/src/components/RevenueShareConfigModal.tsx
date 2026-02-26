import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRevenueShareConfig } from '../hooks/useQueries';
import { RevenueShareParticipant } from '../types';
import { Principal } from '@dfinity/principal';

interface RevenueShareConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RevenueShareConfigModal({ open, onClose }: RevenueShareConfigModalProps) {
  const [configId, setConfigId] = useState('');
  const [participants, setParticipants] = useState<Array<{ principal: string; stripeId: string; percentage: string }>>([
    { principal: '', stripeId: '', percentage: '' },
  ]);

  const createConfig = useCreateRevenueShareConfig();

  const addParticipant = () => {
    setParticipants([...participants, { principal: '', stripeId: '', percentage: '' }]);
  };

  const removeParticipant = (index: number) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const updateParticipant = (index: number, field: string, value: string) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate total percentage
    const totalPercentage = participants.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    // Validate participants
    const validParticipants: RevenueShareParticipant[] = participants.map(p => {
      const participant: RevenueShareParticipant = {
        percentage: BigInt(Math.round(parseFloat(p.percentage) * 100)),
      };

      if (p.principal) {
        try {
          participant.principal = Principal.fromText(p.principal);
        } catch (error) {
          throw new Error(`Invalid principal: ${p.principal}`);
        }
      }

      if (p.stripeId) {
        participant.stripeId = p.stripeId;
      }

      if (!participant.principal && !participant.stripeId) {
        throw new Error('Each participant must have either a principal or Stripe ID');
      }

      return participant;
    });

    try {
      await createConfig.mutateAsync({
        id: configId,
        participants: validParticipants,
      });
      toast.success('Revenue share configuration created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create configuration');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Revenue Share Configuration</DialogTitle>
          <DialogDescription>
            Define how revenue will be split among participants. Total must equal 100%.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="configId">Configuration ID</Label>
            <Input
              id="configId"
              value={configId}
              onChange={(e) => setConfigId(e.target.value)}
              placeholder="e.g., config-001"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Participants</Label>
              <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Participant
              </Button>
            </div>

            {participants.map((participant, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Participant {index + 1}</span>
                  {participants.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeParticipant(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>ICP Principal (optional)</Label>
                    <Input
                      value={participant.principal}
                      onChange={(e) => updateParticipant(index, 'principal', e.target.value)}
                      placeholder="aaaaa-aa..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stripe ID (optional)</Label>
                    <Input
                      value={participant.stripeId}
                      onChange={(e) => updateParticipant(index, 'stripeId', e.target.value)}
                      placeholder="acct_..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Percentage</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={participant.percentage}
                    onChange={(e) => updateParticipant(index, 'percentage', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            ))}

            <div className="text-sm text-muted-foreground">
              Total: {participants.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0).toFixed(2)}%
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createConfig.isPending} className="flex-1">
              {createConfig.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Configuration'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
