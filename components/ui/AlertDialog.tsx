import React from 'react';
import { Dialog } from './Dialog';
import { Button } from './Button';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

export const AlertDialog = ({ isOpen, onClose, onConfirm, title, description }: AlertDialogProps) => {
  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-400">{description}</p>
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose} className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-500 text-white font-bold flex-1">
            Confirm
          </Button>
        </div>
      </div>
    </Dialog>
  );
};