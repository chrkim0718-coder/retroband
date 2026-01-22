"use client";

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function YouTubePlayer({ videoId }: { videoId: string }) {
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load API if not already loaded
        if (!window.YT) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.body.appendChild(tag);
        }

        const initPlayer = () => {
            if (!containerRef.current) return;

            // Create a dedicated child element for the player to replace
            // This ensures we always have a fresh target on re-mounts
            const playerTarget = document.createElement('div');
            containerRef.current.appendChild(playerTarget);

            playerRef.current = new window.YT.Player(playerTarget, {
                videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                    loop: 1,
                    playlist: videoId, // Required for loop to work
                },
                events: {
                    onReady: (event: any) => event.target.playVideo(),
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            // Use a unique name or specific checking?? 
            // Better to just push to a callback queue if managing multiple, 
            // but for this simple app, overriding is "okay" or adding to it.
            // Let's protect against overwriting if it exists
            const prevOnReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (prevOnReady) prevOnReady();
                initPlayer();
            };
        }

        return () => {
            if (playerRef.current) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    console.error("Error destroying player", e);
                }
            }
            // Cleanup container content
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
        };
    }, [videoId]);

    return <div ref={containerRef} style={{ display: "none" }} />;
}
