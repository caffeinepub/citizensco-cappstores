import { useState } from 'react';
import { useAddProjectEntry, useGetProjectEntries } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ExternalBlob } from '../backend';

interface AddDAppModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDAppModal({ open, onClose }: AddDAppModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [revenueShareConfigId, setRevenueShareConfigId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const addEntry = useAddProjectEntry();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim() || !url.trim() || !category.trim() || !logoFile) {
      toast.error('Please fill in all required fields and upload a logo');
      return;
    }

    try {
      setUploading(true);
      
      // Convert file to bytes
      const arrayBuffer = await logoFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const logo = ExternalBlob.fromBytes(bytes);

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        description: description.trim(),
        url: url.trim(),
        category: category.trim(),
        logo,
        revenueShareConfigId: revenueShareConfigId || undefined,
      };

      await addEntry.mutateAsync(entry);
      toast.success('DApp added successfully!');
      onClose();
      
      // Reset form
      setName('');
      setDescription('');
      setUrl('');
      setCategory('');
      setLogoFile(null);
      setRevenueShareConfigId('');
    } catch (error) {
      toast.error('Failed to add DApp');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New DApp</DialogTitle>
          <DialogDescription>
            Add a new decentralized application to the marketplace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">DApp Name *</Label>
            <Input
              id="name"
              placeholder="My Awesome DApp"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe what your DApp does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              placeholder="DeFi, Gaming, Social, etc."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="logo">Logo Image *</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {logoFile && (
              <p className="text-xs text-muted-foreground">
                Selected: {logoFile.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="revenueConfig">Revenue Share Config (Optional)</Label>
            <Input
              id="revenueConfig"
              placeholder="Enter config ID if applicable"
              value={revenueShareConfigId}
              onChange={(e) => setRevenueShareConfigId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Link this DApp to a revenue sharing configuration
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={uploading || addEntry.isPending}>
              {uploading || addEntry.isPending ? 'Adding DApp...' : 'Add DApp'}
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
