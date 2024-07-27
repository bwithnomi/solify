"use client";

import Image from "next/image";
import { useSongPlayer } from "@/context/SongPlayerContext";
import { CSSProperties } from "react";

import React, {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
const songInfoImageStyle: CSSProperties = {
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

  const addInterval = () => {
    const resumeAudio = isPlaying;
    if (
      audioRef.current &&
      audioRef.current.currentTime + 10 >= audioRef.current.duration
    ) {
      stopAudio();
      audioRef.current.currentTime = audioRef.current.duration;
    } else if (
      audioRef.current &&
      audioRef.current.currentTime < audioRef.current.duration
    ) {
      stopAudio();
      audioRef.current.currentTime = audioRef.current.currentTime + 10;
      if (resumeAudio) {
        playAudio();
      }
    }
  };

  const decreaseInterval = () => {
    const resumeAudio = isPlaying;
    if (audioRef.current && audioRef.current.currentTime > 0) {
      stopAudio();
      audioRef.current.currentTime =
        audioRef.current.currentTime < 10
          ? 0
          : audioRef.current.currentTime - 10;
      if (resumeAudio) {
        playAudio();
      }
    }
  };

  const changeVolume = (event: ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      audioRef.current.volume = parseFloat(event.target.value) / 100;
      setAudioVolume(parseInt(event.target.value));
    }
    return event;
  };

  const muteAndUnmute = (action: number) => {
    if (audioRef.current) {
      console.log(audioRef.current.volume);
      audioRef.current.volume = action == 0 ? 0 : 0.1;
      console.log(audioRef.current.volume);

      setAudioVolume(action * 10);
    }
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
        <div className="rounded-full w-14 h-14 overflow-hidden object-cover">
          <img
            width="56"
            height="56"
            src={currentSongArtist?.image || "/images/record.png"}
            alt="record"
            style={songInfoImageStyle}
            onError={() => {
              const target = event?.currentTarget as HTMLImageElement;
              if (target) {
                target.src = "/images/record.svg";
              }
            }}
            className="object-cover"
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
          <div className="flex flex-row justify-center h-5 gap-8 items-center">
            <span
              className="text-white text-xs cursor-pointer font-bold font-mono"
              onClick={decreaseInterval}
            >
              10-
            </span>
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
            <span
              className="text-white text-xs cursor-pointer font-bold font-mono"
              onClick={addInterval}
            >
              +10
            </span>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-white text-xs w-10 text-center">
              {currentProgress}
            </p>
            <input
              className="text-red-100 w-96"
              type="range"
              name="progress"
              value={progress}
              id="progress"
              max={duration}
              onChange={changeProgress}
            />
            <p className="text-white text-xs w-10 text-center">{audioLength}</p>
          </div>
        </div>
      ) : (
        <div className="basis-1/3 flex flex-col justify-center gap-1">
          <p className="text-white text-center">No song is playing</p>
        </div>
      )}

      <div className="basis-1/3 flex flex-row justify-end gap-2 items-center">
        {audioVolume >= 50 && (
          <button>
            <Image
              width="20"
              height="0"
              src={`/icons/high-vol.svg`}
              alt="play"
              onClick={() => muteAndUnmute(0)}
            ></Image>
          </button>
        )}
        {audioVolume < 50 && audioVolume >= 20 && (
          <button>
            <Image
              width="15"
              height="0"
              src={`/icons/mid-vol.svg`}
              alt="play"
              onClick={() => muteAndUnmute(0)}
            ></Image>
          </button>
        )}
        {audioVolume < 20 && audioVolume >= 1 && (
          <button>
            <Image
              width="10"
              height="0"
              src={`/icons/low-vol.svg`}
              alt="play"
              onClick={() => muteAndUnmute(0)}
            ></Image>
          </button>
        )}
        {audioVolume == 0 && (
          <button>
            <Image
              width="20"
              height="0"
              src={`/icons/mute.svg`}
              alt="play"
              onClick={() => muteAndUnmute(1)}
            ></Image>
          </button>
        )}

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
        <p className="text-white text-sm self-center w-10 text-start">
          {audioVolume}
        </p>
      </div>
    </div>
  );
}
