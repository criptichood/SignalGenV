import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';

interface AddWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (address: string, label: string) => void;
}

export const AddWalletModal = ({ isOpen, onClose, onAdd }: AddWalletModalProps) => {
    const [address, setAddress] = useState('');
    const [label, setLabel] = useState('');
    const [error, setError] = useState('');

    const handleAdd = () => {
        if (!address.trim()) {
            setError('Wallet address is required.');
            return;
        }
        // Basic address format check
        if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
            setError('Please enter a valid Ethereum address (0x...).');
            return;
        }
        
        onAdd(address.trim(), label.trim() || `Wallet ${address.slice(0, 6)}`);
        setAddress('');
        setLabel('');
        setError('');
    };

    const footer = (
        <div className="flex justify-end gap-3">
            <Button onClick={onClose} className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold">
                Cancel
            </Button>
            <Button onClick={handleAdd}>Add Wallet</Button>
        </div>
    );
    
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Add New Wallet" footer={footer}>
            <div className="space-y-4">
                 <div className="space-y-1">
                    <Label htmlFor="wallet-label">Wallet Label (Optional)</Label>
                    <Input
                        id="wallet-label"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="e.g., My Savings"
                    />
                </div>
                <div className="space-y-1">
                    <Label htmlFor="wallet-address">Wallet Address</Label>
                    <Input
                        id="wallet-address"
                        value={address}
                        onChange={(e) => {
                            setAddress(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder="0x..."
                    />
                    {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
                </div>
            </div>
        </Dialog>
    );
};