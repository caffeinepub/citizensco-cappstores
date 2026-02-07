import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRevenueShareConfig } from '../hooks/useQueries';
import { Principal } from '@icp-sdk/core/principal';
import { RevenueShareParticipant } from '../backend';

interface RevenueShareConfigModalProps {
  open: boolean;
  onClose: () => void;
}

interface ParticipantForm {
  id: string;
  type: 'icp' | 'stripe';
  identifier: string;
  percentage: string;
}

export default function RevenueShareConfigModal({ open, onClose }: RevenueShareConfigModalProps) {
  const [configName, setConfigName] = useState('');
  const [participants, setParticipants] = useState<ParticipantForm[]>([
    { id: '1', type: 'icp', identifier: '', percentage: '' }
  ]);
  const createConfig = useCreateRevenueShareConfig();

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), type: 'icp', identifier: '', percentage: '' }
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const updateParticipant = (id: string, field: keyof ParticipantForm, value: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const totalPercentage = useMemo(() => {
    return participants.reduce((sum, p) => {
      const pct = parseFloat(p.percentage) || 0;
      return sum + pct;
    }, 0);
  }, [participants]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!configName.trim()) {
      toast.error('Please enter a configuration name');
      return;
    }

    if (participants.some(p => !p.identifier.trim() || !p.percentage.trim())) {
      toast.error('Please fill in all participant fields');
      return;
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      toast.error('Total percentage must equal 100%');
      return;
    }

    try {
      const configParticipants: RevenueShareParticipant[] = participants.map(p => {
        const percentage = BigInt(Math.round(parseFloat(p.percentage)));
        
        if (p.type === 'icp') {
          try {
            const principal = Principal.fromText(p.identifier);
            return {
              principal,
              percentage,
            };
          } catch (error) {
            throw new Error(`Invalid ICP Principal: ${p.identifier}`);
          }
        } else {
          return {
            stripeId: p.identifier,
            percentage,
          };
        }
      });

      const config = {
        id: `config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        participants: configParticipants,
      };

      await createConfig.mutateAsync(config);
      toast.success('Revenue share configuration created successfully!');
      onClose();
      
      // Reset form
      setConfigName('');
      setParticipants([{ id: '1', type: 'icp', identifier: '', percentage: '' }]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create revenue share configuration');
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Revenue Share Configuration</DialogTitle>
          <DialogDescription>
            Define how revenue will be split between multiple participants
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="configName">Configuration Name *</Label>
            <Input
              id="configName"
              placeholder="e.g., Project Alpha Revenue Split"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Participants</Label>
              <Button type="button" variant="outline" size="sm" onClick={addParticipant} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Participant
              </Button>
            </div>

            <div className="space-y-3">
              {participants.map((participant, index) => (
                <Card key={participant.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Participant {index + 1}
                      </CardTitle>
                      {participants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(participant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label>Payment Type</Label>
                      <div className="flex gap-2">
                        <Badge
                          variant={participant.type === 'icp' ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => updateParticipant(participant.id, 'type', 'icp')}
                        >
                          ICP Token
                        </Badge>
                        <Badge
                          variant={participant.type === 'stripe' ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => updateParticipant(participant.id, 'type', 'stripe')}
                        >
                          Stripe (Fiat)
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>
                        {participant.type === 'icp' ? 'ICP Principal' : 'Stripe Account ID'}
                      </Label>
                      <Input
                        placeholder={
                          participant.type === 'icp'
                            ? 'e.g., aaaaa-aa...'
                            : 'e.g., acct_...'
                        }
                        value={participant.identifier}
                        onChange={(e) => updateParticipant(participant.id, 'identifier', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Percentage Share (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="e.g., 33.33"
                        value={participant.percentage}
                        onChange={(e) => updateParticipant(participant.id, 'percentage', e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className={totalPercentage === 100 ? 'border-primary' : 'border-destructive'}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Percentage:</span>
                  <Badge variant={totalPercentage === 100 ? 'default' : 'destructive'}>
                    {totalPercentage.toFixed(2)}%
                  </Badge>
                </div>
                {totalPercentage !== 100 && (
                  <p className="text-xs text-destructive mt-2">
                    Total must equal 100%. Current: {totalPercentage.toFixed(2)}%
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2">
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={createConfig.isPending || totalPercentage !== 100}
            >
              {createConfig.isPending ? 'Creating...' : 'Create Configuration'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function useMemo<T>(factory: () => T, deps: React.DependencyList): T {
  return React.useMemo(factory, deps);
}

import React from 'react';
