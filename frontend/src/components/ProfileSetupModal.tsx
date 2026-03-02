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
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { UserProfile } from '../backend';
import { getReadableErrorMessage } from '../utils/errors';
import { validateName, validateEmail, NAME_MIN_LENGTH, NAME_MAX_LENGTH } from '../utils/profileValidation';

interface ProfileSetupModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function ProfileSetupModal({ open, onComplete }: ProfileSetupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitError, setSubmitError] = useState('');

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setNameError('');
    setEmailError('');

    // validateName returns ValidationError | null
    const nameErr = validateName(name);
    if (nameErr !== null) {
      setNameError(nameErr.message);
      return;
    }

    if (email.trim()) {
      const emailErr = validateEmail(email);
      if (emailErr !== null) {
        setEmailError(emailErr.message);
        return;
      }
    }

    const profile: UserProfile = {
      name: name.trim(),
      email: email.trim() || undefined,
      pendingRewardCampaigns: [],
      createdAt: BigInt(0),
    };

    try {
      await saveProfile.mutateAsync(profile);
      onComplete();
    } catch (err) {
      setSubmitError(getReadableErrorMessage(err));
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set up your profile</DialogTitle>
          <DialogDescription>
            Tell us a bit about yourself to get started. You can update this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="profile-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="profile-name"
              placeholder="Your display name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError('');
              }}
              minLength={NAME_MIN_LENGTH}
              maxLength={NAME_MAX_LENGTH}
              required
            />
            {nameError && <p className="text-xs text-destructive">{nameError}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="profile-email">Email (optional)</Label>
            <Input
              id="profile-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>

          {submitError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
              {submitError}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saveProfile.isPending} className="w-full">
              {saveProfile.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                'Save Profile'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
