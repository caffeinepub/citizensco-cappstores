import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { useCreateRevenueShareConfig } from '../hooks/useQueries';
import { RevenueShareParticipant } from '../types';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

interface ParticipantForm {
  id: string;
  idType: 'principal' | 'stripe';
  principal: string;
  stripeId: string;
  percentage: string;
}

interface RevenueShareConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RevenueShareConfigModal({ open, onClose }: RevenueShareConfigModalProps) {
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    { id: crypto.randomUUID(), idType: 'principal', principal: '', stripeId: '', percentage: '' },
  ]);

  const createConfig = useCreateRevenueShareConfig();

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      { id: crypto.randomUUID(), idType: 'principal', principal: '', stripeId: '', percentage: '' },
    ]);
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const updateParticipant = (id: string, field: keyof ParticipantForm, value: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const totalPercentage = participants.reduce((sum, p) => {
    const val = parseFloat(p.percentage);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    const parsed: RevenueShareParticipant[] = [];
    for (const p of participants) {
      const pct = parseFloat(p.percentage);
      if (isNaN(pct) || pct <= 0) {
        toast.error('All participants must have a valid percentage > 0');
        return;
      }

      const participant: RevenueShareParticipant = {
        id: p.id,
        percentage: pct,
      };

      if (p.idType === 'principal') {
        if (!p.principal.trim()) {
          toast.error('Principal ID is required for each participant');
          return;
        }
        try {
          participant.principal = Principal.fromText(p.principal.trim());
        } catch {
          toast.error(`Invalid Principal ID: ${p.principal}`);
          return;
        }
      } else {
        if (!p.stripeId.trim()) {
          toast.error('Stripe ID is required for each participant');
          return;
        }
        participant.stripeId = p.stripeId.trim();
      }

      if (!participant.principal && !participant.stripeId) {
        toast.error('Each participant must have either a Principal ID or Stripe ID');
        return;
      }

      parsed.push(participant);
    }

    try {
      await createConfig.mutateAsync({ participants: parsed });
      toast.success('Revenue share configuration saved');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save configuration';
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Revenue Share Configuration</DialogTitle>
          <DialogDescription>
            Define how revenue is distributed among participants. Total must equal 100%.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {participants.map((p, idx) => (
            <div key={p.id} className="border border-border/60 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Participant {idx + 1}</span>
                {participants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={() => removeParticipant(p.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={p.idType === 'principal' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateParticipant(p.id, 'idType', 'principal')}
                >
                  ICP Principal
                </Button>
                <Button
                  type="button"
                  variant={p.idType === 'stripe' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updateParticipant(p.id, 'idType', 'stripe')}
                >
                  Stripe ID
                </Button>
              </div>

              {p.idType === 'principal' ? (
                <div className="space-y-1">
                  <Label className="text-xs">Principal ID</Label>
                  <Input
                    placeholder="aaaaa-aa..."
                    value={p.principal}
                    onChange={(e) => updateParticipant(p.id, 'principal', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <Label className="text-xs">Stripe Account ID</Label>
                  <Input
                    placeholder="acct_..."
                    value={p.stripeId}
                    onChange={(e) => updateParticipant(p.id, 'stripeId', e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Percentage (%)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={p.percentage}
                  onChange={(e) => updateParticipant(p.id, 'percentage', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" onClick={addParticipant}>
              <Plus className="h-4 w-4 mr-1" />
              Add Participant
            </Button>
            <Badge variant={Math.abs(totalPercentage - 100) < 0.01 ? 'default' : 'destructive'}>
              Total: {totalPercentage.toFixed(2)}%
            </Badge>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createConfig.isPending}>
              {createConfig.isPending ? 'Saving…' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
