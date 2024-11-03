'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Music2, User, Pause, Play } from 'lucide-react';

const TikTokInterface = () => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [showPlayPauseIcon, setShowPlayPauseIcon] = useState(false);

    // Sample video data
    const videos = [
        {
          id: 1,
          username: "@Ksgk",
          description: "Why so serious? #Joke", 
          likes: "- 1K",
          comments: "-10.5K",
          shares: "-5.2K",
          songName: "you wish",
          videoUrl: "/videos/eureka_zoomout.mp4"
        },
    ];

    const [progress, setProgress] = useState(0);
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const video = videoRef.current as HTMLVideoElement;
            const progress = (video.currentTime / video.duration) * 100;
            setProgress(progress);
        }
    };

    const [isLoading, setIsLoading] = useState(true);
    const handleVideoLoad = () => {
        if (videoRef.current) {
            // Only set loading to false if the video is actually ready to play
            if (videoRef.current.readyState >= 3) {
                setIsLoading(false);
            }
        }
    };

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Prevent video click event
        if (videoRef.current) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const clickPosition = e.clientX - rect.left;
            const percentage = (clickPosition / rect.width) * 100;
            const newTime = (percentage / 100) * videoRef.current.duration;
            videoRef.current.currentTime = newTime;
            setProgress(percentage);
        }
    };

    interface LikedState {
        [key: number]: boolean;
    }
    const [liked, setLiked] = useState<LikedState>({});
    const toggleLike = (videoId: number) => {
        setLiked(prev => ({
            ...prev,
            [videoId]: !prev[videoId]
        }));
    };

    const handleScroll = (direction: 'up' | 'down') => {
        if (direction === 'up' && currentVideoIndex > 0) {
            setCurrentVideoIndex(prev => prev - 1);
        } else if (direction === 'down' && currentVideoIndex < videos.length - 1) {
            setCurrentVideoIndex(prev => prev + 1);
        }
    };

    const handleTouchStart = (e: TouchEvent) => {
        const touchStart = e.touches[0].clientY;
        
        const handleTouchMove = (e: TouchEvent) => {
            const touchEnd = e.touches[0].clientY;
            const diff = touchStart - touchEnd;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    handleScroll('down');
                } else {
                    handleScroll('up');
                }
                document.removeEventListener('touchmove', handleTouchMove);
            }
        };
        
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', () => {
            document.removeEventListener('touchmove', handleTouchMove);
        }, { once: true });
    };

    const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
        e.preventDefault(); // Add this to ensure click is captured
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
            
            // Show the icon
            setShowPlayPauseIcon(true);
            // Hide it after 500ms
            setTimeout(() => {
                setShowPlayPauseIcon(false);
            }, 500);
        }
    };

    const [error, setError] = useState(false);
    const handleVideoError = () => {
        setError(true);
    };

    useEffect(() => {
        // Reset loading state when video source changes
        setIsLoading(true);
        
        if (videoRef.current) {
            // Only attempt autoplay after user interaction
            const playVideo = async () => {
                try {
                    await videoRef.current?.play();
                    setIsPlaying(true);
                } catch (error) {
                    console.error("Video autoplay failed:", error);
                    setIsPlaying(false); // Ensure we show the correct play state
                    setError(false); // Don't show error state for autoplay failure
                }
            };

            // Add interaction listener
            const handleFirstInteraction = () => {
                playVideo();
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('touchstart', handleFirstInteraction);
            };

            document.addEventListener('click', handleFirstInteraction);
            document.addEventListener('touchstart', handleFirstInteraction);

            // Cleanup
            return () => {
                document.removeEventListener('click', handleFirstInteraction);
                document.removeEventListener('touchstart', handleFirstInteraction);
            };
        }
    }, [currentVideoIndex]);

    return (
        <div className="h-screen w-full bg-black text-white relative overflow-hidden">
            <div className="h-full w-full relative flex items-center justify-center">
                <div className="relative w-full max-w-[400px] aspect-[9/16]">
                <video
                    onLoadedData={handleVideoLoad}
                    onCanPlay={handleVideoLoad}
                    onTimeUpdate={handleTimeUpdate}
                    ref={videoRef}
                    src={videos[currentVideoIndex].videoUrl}
                    onError={handleVideoError}
                    onClick={handleVideoClick}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="absolute top-0 left-0 w-full h-full object-contain cursor-pointer"
                    loop
                    playsInline
                    controls={false}
                />

                    {showPlayPauseIcon && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-4 animate-fade-out">
                                {isPlaying ? (
                                    <Pause className="w-12 h-12 text-white" />
                                ) : (
                                    <Play className="w-12 h-12 text-white" />
                                )}
                            </div>
                        </div>
                    )}

                    <div 
                        className="absolute top-0 left-0 w-full h-1.5 bg-gray-600/50 cursor-pointer z-10"
                        onClick={handleProgressBarClick}
                    >
                        <div 
                            className="h-full bg-white transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    {(isLoading || error) && (
                        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                            ) : (
                                <span className="text-red-500">Error loading video</span>
                            )}
                        </div>
                    )}

                    <div className="absolute inset-0 flex items-center justify-between px-4">
                        <button 
                            onClick={() => handleScroll('up')}
                            className="text-white/50 hover:text-white transition-colors"
                            disabled={currentVideoIndex === 0}
                        >
                            ▲
                        </button>
                        <button 
                            onClick={() => handleScroll('down')}
                            className="text-white/50 hover:text-white transition-colors"
                            disabled={currentVideoIndex === videos.length - 1}
                        >
                            ▼
                        </button>
                    </div>
                </div>

                <div className="absolute right-2 bottom-20 flex flex-col items-center gap-6">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6" />
                        </div>
                    </div>

                    <button 
                        onClick={() => toggleLike(videos[currentVideoIndex].id)}
                        className="flex flex-col items-center"
                    >
                        <Heart 
                            className={`w-8 h-8 ${liked[videos[currentVideoIndex].id] ? 'text-red-500' : 'text-white'}`}
                            fill={liked[videos[currentVideoIndex].id] ? 'currentColor' : 'none'}
                        />
                        <span className="text-xs mt-1">{videos[currentVideoIndex].likes}</span>
                    </button>

                    <button className="flex flex-col items-center">
                        <MessageCircle className="w-8 h-8" />
                        <span className="text-xs mt-1">{videos[currentVideoIndex].comments}</span>
                    </button>

                    <button className="flex flex-col items-center">
                        <Share2 className="w-8 h-8" />
                        <span className="text-xs mt-1">{videos[currentVideoIndex].shares}</span>
                    </button>
                </div>

                <div className="absolute bottom-4 left-4 right-16 max-w-[400px] mx-auto">
                    <h2 className="font-bold mb-2">{videos[currentVideoIndex].username}</h2>
                    <p className="text-sm mb-2">{videos[currentVideoIndex].description}</p>
                    <div className="flex items-center">
                        <Music2 className="w-4 h-4 mr-2" />
                        <span className="text-sm">{videos[currentVideoIndex].songName}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TikTokInterface;