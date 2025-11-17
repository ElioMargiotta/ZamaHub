"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';

export function CreateProposalDialog({ spaceId, spaceName }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !proposalType) return;

    setLoading(true);
    try {
      // Here you would call the contract's createProposal function
      // For now, we'll simulate the creation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

      // Reset form
      setTitle('');
      setDescription('');
      setProposalType('');
      setOpen(false);

      // In a real implementation, you'd refresh the proposals list
      alert('Proposal created successfully!');
    } catch (error) {
      console.error('Error creating proposal:', error);
      alert('Failed to create proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex-1 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          New Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Proposal</DialogTitle>
          <DialogDescription>
            Create a governance proposal for {spaceName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Proposal Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter proposal title"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Proposal Type</Label>
            <Select value={proposalType} onValueChange={setProposalType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select proposal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="funding">Funding Request</SelectItem>
                <SelectItem value="parameter">Parameter Change</SelectItem>
                <SelectItem value="text">Text Proposal</SelectItem>
                <SelectItem value="contract">Contract Upgrade</SelectItem>
                <SelectItem value="membership">Membership Change</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail..."
              rows={4}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={loading || !title.trim() || !description.trim() || !proposalType}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Proposal'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}