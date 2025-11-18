import React from 'react';
import type { UserProfile } from '../../types';
import { Button } from '../ui/Button';
import { MailIcon } from '../icons/MailIcon';
import { UserPlusIcon } from '../icons/UserPlusIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { LinkIcon } from '../icons/LinkIcon';
import { LocationPinIcon } from '../icons/LocationPinIcon';
import { VerifiedIcon } from '../icons/VerifiedIcon';
import { TwitterIcon } from '../icons/TwitterIcon';
import { YoutubeIcon } from '../icons/YoutubeIcon';
import { DiscordIcon } from '../icons/DiscordIcon';

interface ProfileBannerProps {
    displayedProfile: UserProfile;
    currentUser: UserProfile;
    isOwnProfile: boolean;
    onEdit: () => void;
    onFollow: (username: string) => void;
    onUnfollow: (username: string) => void;
    onOpenMessage: (username: string) => void;
    onOpenFollowList: (type: 'followers' | 'following') => void;
}

export const ProfileBanner = ({
    displayedProfile,
    currentUser,
    isOwnProfile,
    onEdit,
    onFollow,
    onUnfollow,
    onOpenMessage,
    onOpenFollowList
}: ProfileBannerProps) => {
    const isFollowing = currentUser.following.includes(displayedProfile.username);

    const joinedDate = new Date(displayedProfile.joinedAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });
    
    const hasSocialLinks = displayedProfile.socialLinks && (
        displayedProfile.socialLinks.website || 
        displayedProfile.socialLinks.twitter || 
        displayedProfile.socialLinks.youtube || 
        displayedProfile.socialLinks.discord
    );
    
    return (
        <div className="relative">
            {/* Banner Image */}
            <div className="h-48 bg-gray-700 rounded-t-lg">
                {displayedProfile.bannerUrl && (
                    <img src={displayedProfile.bannerUrl} alt="Banner" className="w-full h-full object-cover rounded-t-lg" />
                )}
            </div>

            {/* Avatar and Edit Button */}
            <div className="absolute top-32 left-6 flex items-end justify-between w-[calc(100%-48px)]">
                <div className="w-32 h-32 rounded-full border-4 border-black bg-gray-800">
                    {displayedProfile.avatarUrl && (
                         <img src={displayedProfile.avatarUrl} alt={displayedProfile.name} className="w-full h-full object-cover rounded-full" />
                    )}
                </div>
                {isOwnProfile ? (
                    <Button onClick={onEdit} className="h-9 px-4 text-sm bg-transparent border border-gray-600 hover:bg-gray-700">
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button onClick={() => onOpenMessage(displayedProfile.username)} className="h-9 px-4 text-sm bg-transparent border border-gray-600 hover:bg-gray-700">
                            <MailIcon className="w-4 h-4" />
                        </Button>
                        {isFollowing ? (
                            <Button onClick={() => onUnfollow(displayedProfile.username)} className="h-9 px-4 text-sm bg-transparent border border-gray-600 hover:bg-gray-700">
                                Unfollow
                            </Button>
                        ) : (
                            <Button onClick={() => onFollow(displayedProfile.username)} className="h-9 px-4 text-sm">
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Follow
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="pt-20 px-6 pb-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{displayedProfile.name}</h2>
                    {displayedProfile.isVerified && <VerifiedIcon className="w-5 h-5 text-cyan-400" />}
                </div>
                <p className="text-gray-400">@{displayedProfile.username}</p>
                <p className="mt-3 text-gray-300 whitespace-pre-wrap">{displayedProfile.bio}</p>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400 mt-3">
                    {displayedProfile.location && (
                        <div className="flex items-center gap-1.5">
                            <LocationPinIcon className="w-4 h-4"/> {displayedProfile.location}
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4"/> Joined {joinedDate}
                    </div>

                    {hasSocialLinks && <span className="hidden md:inline text-gray-600">|</span>}
                    
                    <div className="flex items-center gap-4">
                        {displayedProfile.socialLinks?.website && (
                             <a href={displayedProfile.socialLinks.website} target="_blank" rel="noopener noreferrer" title="Website" className="text-gray-400 hover:text-cyan-400">
                                <LinkIcon className="w-5 h-5"/>
                            </a>
                        )}
                        {displayedProfile.socialLinks?.twitter && (
                             <a href={displayedProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" className="text-gray-400 hover:text-cyan-400">
                                <TwitterIcon className="w-5 h-5"/>
                            </a>
                        )}
                        {displayedProfile.socialLinks?.youtube && (
                             <a href={displayedProfile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" className="text-gray-400 hover:text-cyan-400">
                                <YoutubeIcon className="w-5 h-5"/>
                            </a>
                        )}
                        {displayedProfile.socialLinks?.discord && (
                             <a href={displayedProfile.socialLinks.discord} target="_blank" rel="noopener noreferrer" title="Discord" className="text-gray-400 hover:text-cyan-400">
                                <DiscordIcon className="w-5 h-5"/>
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                    <button onClick={() => onOpenFollowList('following')} className="hover:underline">
                        <span className="font-bold text-white">{displayedProfile.following.length}</span> <span className="text-gray-400">Following</span>
                    </button>
                    <button onClick={() => onOpenFollowList('followers')} className="hover:underline">
                        <span className="font-bold text-white">{displayedProfile.followers.length}</span> <span className="text-gray-400">Followers</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
