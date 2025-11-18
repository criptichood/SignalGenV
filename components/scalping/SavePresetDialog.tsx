import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SavePresetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

export const SavePresetDialog = ({ isOpen, onClose, onSave }: SavePresetDialogProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim()) {
      setError('Preset name cannot be empty.');
      return;
    }
    onSave(name.trim());
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Save Scalping Preset">
      <div className="space-y-4">
        <div>
          <Label htmlFor="preset-name">Preset Name</Label>
          <Input
            id="preset-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., High-Risk BTC"
            className="mt-1"
          />
          {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
        </div>
        <div className="pt-2 flex justify-end gap-3">
            <Button type="button" onClick={onClose} className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold w-auto px-6">
                Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="w-auto px-6">
                Save Preset
            </Button>
        </div>
      </div>
    </Dialog>
  );
};