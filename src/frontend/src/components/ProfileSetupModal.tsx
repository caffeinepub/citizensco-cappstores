import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { validateProfile, ValidationError } from '../utils/profileValidation';
import { getReadableErrorMessage } from '../utils/errors';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous field errors
    setFieldErrors({});

    // Validate profile
    const errors = validateProfile({ name, email: email || undefined });
    
    if (errors.length > 0) {
      // Convert errors to field error map
      const errorMap: Record<string, string> = {};
      errors.forEach((error: ValidationError) => {
        errorMap[error.field] = error.message;
      });
      setFieldErrors(errorMap);
      
      // Show first error in toast
      toast.error(errors[0].message);
      return;
    }

    try {
      const profile = {
        name: name.trim(),
        email: email.trim() || undefined,
      };

      await saveProfile.mutateAsync(profile);
      toast.success('Profile created successfully!');
    } catch (error: unknown) {
      const errorMessage = getReadableErrorMessage(error);
      toast.error(errorMessage);
      console.error('Profile creation error:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome! Set Up Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your name to get started. This helps us personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear field error on change
                if (fieldErrors.name) {
                  setFieldErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              autoFocus
              required
              className={fieldErrors.name ? 'border-destructive' : ''}
            />
            {fieldErrors.name && (
              <p className="text-sm text-destructive">{fieldErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Clear field error on change
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: '' }));
                }
              }}
              className={fieldErrors.email ? 'border-destructive' : ''}
            />
            {fieldErrors.email && (
              <p className="text-sm text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
