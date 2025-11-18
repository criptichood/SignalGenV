import React, { useState, useEffect } from 'react';
import type { Strategy } from '@/types';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Loader2 } from 'lucide-react';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Updated the onSave prop type to Omit authorUsername, as the parent component is responsible for adding it.
  onSave: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'authorUsername'> & { id?: string }) => void;
  strategyToEdit: Strategy | null;
}

const getInitialState = (strategy: Strategy | null) => ({
    id: strategy?.id || undefined,
    title: strategy?.title || '',
    description: strategy?.description || '',
    tags: strategy?.tags?.join(', ') || '',
    isPublic: strategy?.isPublic || false,
});

export const StrategyModal = ({ isOpen, onClose, onSave, strategyToEdit }: StrategyModalProps) => {
    const [formData, setFormData] = useState(getInitialState(strategyToEdit));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(getInitialState(strategyToEdit));
            setErrors({});
        }
    }, [strategyToEdit, isOpen]);

    const handleChange = (field: keyof typeof formData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field as string]) setErrors(prev => ({ ...prev, [field as string]: undefined }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Title is required.";
        if (!formData.description.trim()) newErrors.description = "Description is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSaving(true);
        setTimeout(() => {
            const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            onSave({
                id: formData.id,
                title: formData.title,
                description: formData.description,
                tags,
                isPublic: formData.isPublic,
            });
            setIsSaving(false);
        }, 500);
    };

    const title = strategyToEdit ? 'Edit Strategy' : 'Create New Strategy';

    const footer = (
      <div className="flex justify-center">
        <Button type="submit" form="strategy-form" disabled={isSaving}>
            {isSaving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : 'Save Strategy'}
        </Button>
      </div>
    );

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="max-w-2xl">
            <form id="strategy-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g., 5m BTC Breakout Strategy" />
                    {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <Label className="mb-0">Description</Label>
                        <p className="text-xs text-gray-500">Markdown supported</p>
                    </div>
                    <RichTextEditor
                        value={formData.description}
                        onChange={html => handleChange('description', html)}
                        placeholder="Describe your strategy, including entry conditions, risk management, and exit criteria..."
                    />
                    {errors.description && <p className="text-sm text-red-400 mt-1">{errors.description}</p>}
                </div>
                <div className="space-y-1">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input id="tags" value={formData.tags} onChange={e => handleChange('tags', e.target.value)} placeholder="e.g., scalping, btc, market-structure"/>
                </div>
                 <div className="flex items-center justify-between pt-2">
                    <div>
                        <Label htmlFor="isPublic" className="font-medium text-gray-300">Make Public</Label>
                        <p className="text-xs text-gray-500">Allow other users to see this on your profile.</p>
                    </div>
                    <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) => handleChange('isPublic', checked)}
                    />
                </div>
            </form>
        </Dialog>
    );
};