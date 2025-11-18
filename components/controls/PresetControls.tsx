import React, { useState } from 'react';
import type { ScalpingPreset, UserParams } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SavePresetDialog } from '@/components/scalping/SavePresetDialog';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { BookmarkIcon } from '@/components/icons/BookmarkIcon';
import { TrashIcon } from '@/components/icons/TrashIcon';
import { SaveIcon } from '@/components/icons/SaveIcon';
import { Label } from '@/components/ui/Label';

interface PresetControlsProps {
  presets: ScalpingPreset[];
  setPresets: React.Dispatch<React.SetStateAction<ScalpingPreset[]>>;
  formData: Partial<UserParams>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<UserParams>>>;
  isDisabled?: boolean;
}

export const PresetControls = ({ presets, setPresets, formData, setFormData, isDisabled }: PresetControlsProps) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const handleSavePreset = (name: string) => {
    const newPreset: ScalpingPreset = { id: crypto.randomUUID(), name, params: formData };
    setPresets(prev => [...prev, newPreset]);
    setIsSaveModalOpen(false);
    setSelectedPresetId(newPreset.id);
  };

  const handleLoadPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;
    const preset = presets.find(p => p.id === presetId);
    if (preset) setFormData(preset.params);
  };

  const handleDeleteClick = () => {
    if (selectedPresetId) setIsDeleteAlertOpen(true);
  };

  const confirmDelete = () => {
    setPresets(prev => prev.filter(p => p.id !== selectedPresetId));
    setSelectedPresetId('');
    setFormData({}); // Clear form after deleting the loaded preset
    setIsDeleteAlertOpen(false);
  };

  return (
    <div className="space-y-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
      <Label className="flex items-center gap-2 font-semibold text-gray-300">
        <BookmarkIcon className="w-4 h-4 text-cyan-400" />
        Configuration Presets
      </Label>
      <div className="flex items-center gap-2">
        <Select id="preset-select" value={selectedPresetId} onValueChange={handleLoadPreset} disabled={isDisabled}>
          <option value="">-- Load Preset --</option>
          {presets.map(preset => (
            <option key={preset.id} value={preset.id}>{preset.name}</option>
          ))}
        </Select>
        {selectedPresetId && (
          <button type="button" onClick={handleDeleteClick} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-red-900/30 disabled:opacity-50" disabled={isDisabled} aria-label="Delete preset">
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <Button type="button" onClick={() => setIsSaveModalOpen(true)} disabled={isDisabled} className="w-full mt-2 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold text-sm py-2">
        <SaveIcon className="w-4 h-4 mr-2" />
        Save Current as Preset
      </Button>
      <SavePresetDialog isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} onSave={handleSavePreset} />
      <AlertDialog isOpen={isDeleteAlertOpen} onClose={() => setIsDeleteAlertOpen(false)} onConfirm={confirmDelete} title="Delete Preset?" description="This will permanently delete this preset." />
    </div>
  );
};