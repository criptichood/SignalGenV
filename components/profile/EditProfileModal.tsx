import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Loader2Icon } from '../icons/Loader2Icon';
import { CameraIcon } from '../icons/CameraIcon';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onSave: (updatedProfile: UserProfile) => void;
}

export const EditProfileModal = ({ isOpen, onClose, userProfile, onSave }: EditProfileModalProps) => {
    const [formData, setFormData] = useState(userProfile);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(userProfile);
        }
    }, [isOpen, userProfile]);

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };
    
    const handleSocialChange = (field: 'twitter' | 'youtube' | 'discord' | 'website', value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [field]: value
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => { // Simulate async save
            onSave(formData);
            setIsSaving(false);
            onClose();
        }, 1000);
    };

    const footer = (
        <div className="flex justify-end">
            <Button type="submit" form="edit-profile-form" disabled={isSaving}>
                 {isSaving ? <><Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : 'Save'}
            </Button>
        </div>
    );
    
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Edit Profile" footer={footer} maxWidth="max-w-2xl">
            <form id="edit-profile-form" onSubmit={handleSubmit}>
                <div className="relative h-40 bg-gray-700 rounded-lg mb-16">
                    {formData.bannerUrl && <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover rounded-lg" />}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <label htmlFor="banner-url-input" className="cursor-pointer p-2 bg-black/50 rounded-full text-white">
                            <CameraIcon className="w-6 h-6"/>
                        </label>
                    </div>
                     <div className="absolute top-28 left-6 w-28 h-28 rounded-full border-4 border-gray-800 bg-gray-600">
                        {formData.avatarUrl && <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />}
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full opacity-0 hover:opacity-100 transition-opacity">
                             <label htmlFor="avatar-url-input" className="cursor-pointer p-2 bg-black/50 rounded-full text-white">
                                <CameraIcon className="w-5 h-5"/>
                             </label>
                         </div>
                    </div>
                </div>
                
                {/* Hidden inputs for URL changes */}
                <input id="banner-url-input" type="text" value={formData.bannerUrl || ''} onChange={e => handleChange('bannerUrl', e.target.value)} className="hidden" />
                <input id="avatar-url-input" type="text" value={formData.avatarUrl || ''} onChange={e => handleChange('avatarUrl', e.target.value)} className="hidden" />


                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={formData.username} disabled className="bg-gray-800 cursor-not-allowed" />
                        <p className="text-xs text-gray-500 px-1">Usernames cannot be changed to maintain data integrity.</p>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} />
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-700">
                        <h3 className="text-sm font-semibold text-cyan-400">Social Links</h3>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" value={formData.socialLinks?.website || ''} onChange={e => handleSocialChange('website', e.target.value)} placeholder="https://"/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="twitter">Twitter</Label>
                            <Input id="twitter" value={formData.socialLinks?.twitter || ''} onChange={e => handleSocialChange('twitter', e.target.value)} placeholder="https://twitter.com/username"/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="youtube">YouTube</Label>
                            <Input id="youtube" value={formData.socialLinks?.youtube || ''} onChange={e => handleSocialChange('youtube', e.target.value)} placeholder="https://youtube.com/channel/..."/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="discord">Discord</Label>
                            <Input id="discord" value={formData.socialLinks?.discord || ''} onChange={e => handleSocialChange('discord', e.target.value)} placeholder="Username#1234 or server invite link"/>
                        </div>
                    </div>
                </div>
            </form>
        </Dialog>
    );
};
