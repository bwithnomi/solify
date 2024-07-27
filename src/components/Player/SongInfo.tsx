"use client";

import Image from "next/image";
import { useSongPlayer } from "@/context/SongPlayerContext";
import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
const songInfoImageStyle = {
  objectFit: "cover",
};

export default function SongInfo() {
  const { currentSong, currentSongArtist } = useSongPlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0.0);
  const [audioVolume, setAudioVolume] = useState<number>(100);
  const [duration, setDuration] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<string>("0:00");
  const [audioLength, setAudioLength] = useState<string>("0:00");
  const computeAudioLength = useMemo(() => {
    const duration = progress;
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60)
      .toString()
      .padStart(2, "0");
    setCurrentProgress(`${minutes}:${seconds}`);
  }, [progress]);

  const changeProgress = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(`changing`);
    const resumeAudio = isPlaying;
    if (audioRef.current) {
      stopAudio();
      audioRef.current.currentTime = parseFloat(event.target.value);
      if (resumeAudio) {
        playAudio();
      }
    }
    return event;
  };

  const changeVolume = (event: ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.volume = parseFloat(event.target.value) / 100;
      setAudioVolume(parseInt(event.target.value));
    }
    return event;
  };

  const toggleAudio = () => {
    if (!isPlaying) {
      audioRef.current?.play();
      setIsPlaying(true);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const playAudio = () => {
    audioRef.current?.play();
    setIsPlaying(true);
  };

  const loadFallbackImage = async (event) => {
    event.currentTarget.src = "/record.svg";
  }

  useEffect(() => {
    const handleLoadedMetadata = () => {
      const duration = audioRef.current?.duration || 0;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60)
        .toString()
        .padStart(2, "0");
      setAudioLength(`${minutes}:${seconds}`);
      setDuration(duration);
    };

    const audio = audioRef.current;
    if (audio && currentSong) {
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }
    };
  }, []);

  useEffect(() => {
    const handleLoadedMetadata = () => {
      const duration = audioRef.current?.duration || 0;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60)
        .toString()
        .padStart(2, "0");
      setAudioLength(`${minutes}:${seconds}`);
      setDuration(duration);
      console.log(duration);
      console.log(audioRef.current?.currentSrc);
      playAudio();
    };

    stopAudio();
    setProgress(0);
    setAudioLength("0:00");
    const audio = audioRef.current;

    if (audio && currentSong) {
      audio.src = currentSong.url;
      audio.currentTime = 0;
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      if (audio) {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }
    };
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current?.ended) {
      stopAudio();
    }
  }, [progress]);

  return (
    <div className="flex flex-row">
      <div className="basis-1/3 flex flex-row gap-2">
        <div className="rounded-md overflow-hidden w-14">
          <img
            width="56"
            height="56"
            src={currentSongArtist?.image || "/images/record.png"}
            alt="record"
            style={songInfoImageStyle}
            onError={() => {
              if (event?.currentTarget) {
                event.currentTarget.src = "/images/record.png"
              }
            }}
          />
        </div>
        <div className="basis-2/3 flex flex-col justify-center">
          <p className="text-white">{currentSong?.name}</p>
          <p className="text-neutral-500 text-sm">{currentSongArtist?.name}</p>
        </div>
      </div>
      {currentSong ? (
        <div className="basis-1/3 flex flex-col justify-center gap-1">
          <audio
            ref={audioRef}
            onTimeUpdate={(event) =>
              setProgress(event.currentTarget.currentTime)
            }
          >
            <source src={currentSong?.url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
          <div className="flex flex-row justify-center h-5">
            {isPlaying ? (
              <Image
                width="15"
                height="0"
                src={`/icons/pause.svg`}
                alt="play"
                onClick={stopAudio}
              ></Image>
            ) : (
              <Image
                width="15"
                height="0"
                src={`/icons/play.svg`}
                alt="play"
                onClick={playAudio}
              ></Image>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-white text-xs">{currentProgress}</p>
            <input
              className="text-red-100 w-96"
              type="range"
              name="progress"
              value={progress}
              id="progress"
              max={duration}
              onChange={changeProgress}
            />
            <p className="text-white text-xs">{audioLength}</p>
          </div>
        </div>
      ) : (
        <div className="basis-1/3 flex flex-col justify-center gap-1">
          <p className="text-white text-center">No song is playing</p>
        </div>
      )}

      <div className="basis-1/3 flex flex-row justify-end gap-2 items-center">
        <input
          className="text-red-100 w-40"
          type="range"
          name="volume"
          value={audioVolume}
          id="volume"
          min={0}
          max={100}
          onChange={changeVolume}
        />
        <p className="text-white text-sm self-center">{audioVolume}</p>
      </div>
    </div>
  );
}
