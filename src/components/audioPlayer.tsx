import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  src: string;
  isAgent: boolean;
}

const formatTime = (time: number) => {
  if (isNaN(time) || time === 0) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function AudioPlayer({ src, isAgent }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const setAudioData = () => setDuration(audio.duration);
      const setAudioTime = () => setCurrentTime(audio.currentTime);
      const handleAudioEnd = () => setIsPlaying(false);

      audio.addEventListener("loadedmetadata", setAudioData);
      audio.addEventListener("timeupdate", setAudioTime);
      audio.addEventListener("ended", handleAudioEnd);

      return () => {
        audio.removeEventListener("loadedmetadata", setAudioData);
        audio.removeEventListener("timeupdate", setAudioTime);
        audio.removeEventListener("ended", handleAudioEnd);
      };
    }
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const controlColor = isAgent ? "text-white" : "text-gray-600";
  const progressBgColor = isAgent ? "bg-white/30" : "bg-gray-200";
  const progressFillColor = isAgent ? "bg-white" : "bg-primary-million";

  return (
    <div className="flex w-64 items-center gap-2">
      <audio ref={audioRef} src={src} preload="metadata" />

      <Button
        onClick={togglePlayPause}
        variant="ghost"
        size="icon"
        className={`h-8 w-8 shrink-0 rounded-full hover:bg-white/20 ${controlColor}`}
      >
        {isPlaying ? (
          <Pause size={16} />
        ) : (
          <Play size={16} className="ml-0.5" />
        )}
      </Button>
      <div className="flex-1">
        <div className={`h-1 w-full rounded-full ${progressBgColor}`}>
          <div
            className={`h-1 rounded-full ${progressFillColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <span className={`w-10 text-xs ${controlColor}`}>
        {formatTime(currentTime)}
      </span>
    </div>
  );
}
