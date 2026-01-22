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

    useEffect(() => {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        window.onYouTubeIframeAPIReady = () => {
            playerRef.current = new window.YT.Player("yt", {
                videoId,
                playerVars: {
                    autoplay: 1,
                    controls: 0,
                },
            });
        };
    }, [videoId]);

    return <div id="yt" style={{ display: "none" }} />;
}
