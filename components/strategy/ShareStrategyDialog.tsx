import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ShareStrategyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (username: string) => void;
}

export const ShareStrategyDialog = ({ isOpen, onClose, onShare }: ShareStrategyDialogProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleShare = () => {
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    onShare(username.trim());
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Share Strategy">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">Share this strategy with another user. You must be following them to share.</p>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
            }}
            placeholder="Enter username..."
            className="mt-1"
          />
          {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
        </div>
        <div className="pt-2 flex justify-end gap-3">
            <Button type="button" onClick={onClose} className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold">
                Cancel
            </Button>
            <Button type="button" onClick={handleShare}>
                Share
            </Button>
        </div>
      </div>
    </Dialog>
  );
};
