"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { updateLessonProgressApi } from "../apis/courses.api";
import { CheckCircle2, Clock, Play, RotateCcw } from "lucide-react";

interface Props {
  lessonId: string;
  youtubeVideoId: string;
  initialPositionSeconds?: number;
  initialPercentage?: number;
  isCompleted?: boolean;
  onProgressUpdated?: (percentage: number, isCompleted: boolean) => void;
}

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function LessonVideoPlayer({
  lessonId,
  youtubeVideoId,
  initialPositionSeconds = 0,
  initialPercentage = 0,
  isCompleted: initialCompleted = false,
  onProgressUpdated,
}: Props) {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentSec, setCurrentSec] = useState(initialPositionSeconds);
  const [durationSec, setDurationSec] = useState(0);
  const [percentage, setPercentage] = useState(initialPercentage);
  const [completed, setCompleted] = useState(initialCompleted);
  const [hasResumed, setHasResumed] = useState(false);

  const sendProgress = useCallback(
    async (isEnded = false) => {
      if (!playerRef.current?.getCurrentTime) return;
      try {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        if (duration > 0) {
          const calcPct = Math.min(100, Math.round((currentTime / duration) * 100));
          const calcCompleted = isEnded || calcPct >= 85;

          setCurrentSec(currentTime);
          setDurationSec(duration);
          setPercentage(calcPct);
          if (calcCompleted) setCompleted(true);

          onProgressUpdated?.(calcPct, calcCompleted);

          await updateLessonProgressApi(lessonId, {
            currentPositionSeconds: currentTime,
            durationSeconds: duration,
            isEnded,
          });
        }
      } catch {
        // Silently capture any network hiccups during heartbeat
      }
    },
    [lessonId, onProgressUpdated]
  );

  const handleStateChange = useCallback(
    (event: any) => {
      // 1 = PLAYING
      if (event.data === 1) {
        sendProgress(false); // send immediate heartbeat on start
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => sendProgress(false), 5000); // 5s heartbeat
        }
      } else {
        // PAUSED (2) or ENDED (0)
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        sendProgress(event.data === 0);
      }
    },
    [sendProgress]
  );

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted) return;
      try {
        playerRef.current = new (window as any).YT.Player("youtube-player", {
          width: "100%",
          height: "100%",
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 0,
            enablejsapi: 1,
            start: Math.floor(initialPositionSeconds),
            rel: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (e: any) => {
              if (isMounted) {
                setIsReady(true);
                const d = e.target.getDuration();
                if (d > 0) setDurationSec(d);
              }
            },
            onStateChange: handleStateChange,
          },
        });
      } catch {
        // Player init error
      }
    };

    if (!(window as any).YT || !(window as any).YT.Player) {
      // Load YouTube IFrame API script tag dynamically
      const existingTag = document.getElementById("youtube-iframe-api");
      if (!existingTag) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }

      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      sendProgress(false);
      try {
        playerRef.current?.destroy?.();
      } catch {
        // Ignore destroy error
      }
    };
  }, [youtubeVideoId, initialPositionSeconds, handleStateChange, sendProgress]);

  const handleResumeClick = () => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(initialPositionSeconds, true);
      playerRef.current.playVideo();
      setHasResumed(true);
    }
  };

  const handleRestartClick = () => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
      setHasResumed(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Video Container */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9.5] min-h-[380px] sm:min-h-[480px] lg:min-h-[520px] max-h-[640px] w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl [&_iframe]:h-full [&_iframe]:w-full">
        <div id="youtube-player" className="h-full w-full" />
      </div>

      {/* Progress & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {completed ? (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>مكتمل المشاهدة (أحسنت! 🎉)</span>
            </div>
          ) : percentage > 0 ? (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-600">
              <Clock className="h-4 w-4" />
              <span>قيد المشاهدة ({percentage}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              <span>لم تبدأ المشاهدة بعد</span>
            </div>
          )}

          {durationSec > 0 && (
            <span className="text-xs text-muted-foreground">
              {formatTime(currentSec)} / {formatTime(durationSec)} دقيقة
            </span>
          )}

          {!completed && (
            <button
              onClick={() => sendProgress(true)}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500/20"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>تأكيد إكمال المشاهدة ✅</span>
            </button>
          )}
        </div>

        {/* Resume prompt if student previously stopped halfway */}
        {initialPositionSeconds > 10 && !completed && !hasResumed && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleResumeClick}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow transition hover:opacity-90"
            >
              <Play className="h-3.5 w-3.5" />
              <span>متابعة من {formatTime(initialPositionSeconds)}</span>
            </button>
            <button
              onClick={handleRestartClick}
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>من البداية</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
