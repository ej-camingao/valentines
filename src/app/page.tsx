'use client';

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type NoPosition = {
  top: number;
  left: number;
  rotation: number;
  scale: number;
};

const playfulMessages = [
  "Nice try \uD83D\uDE0C",
  "That option seems unavailable",
  "The universe says no to \u2018No\u2019",
  "Sly, but no dice",
  "Destiny prefers \u2018Yes\u2019"
];

const backgroundOptions = [
  "radial-gradient(circle at 20% 20%, rgba(255, 182, 193, 0.3), transparent 35%), radial-gradient(circle at 80% 10%, rgba(255, 105, 180, 0.28), transparent 30%), linear-gradient(135deg, #2b0f2f 0%, #401036 40%, #2f0a23 100%)",
  "radial-gradient(circle at 15% 30%, rgba(255, 204, 229, 0.35), transparent 32%), radial-gradient(circle at 75% 20%, rgba(255, 150, 200, 0.32), transparent 30%), linear-gradient(135deg, #2a0d26 0%, #3a1030 45%, #2c0b22 100%)",
  "radial-gradient(circle at 25% 25%, rgba(255, 180, 210, 0.32), transparent 35%), radial-gradient(circle at 70% 25%, rgba(255, 130, 190, 0.3), transparent 28%), linear-gradient(135deg, #34102f 0%, #45113a 40%, #320c27 100%)"
];

const targetDate = () => {
  const now = new Date();
  const year = now.getMonth() > 1 || (now.getMonth() === 1 && now.getDate() > 13)
    ? now.getFullYear() + 1
    : now.getFullYear();
  return new Date(year, 1, 13, 21, 0, 0);
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const randomInRange = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const calculateTimeLeft = (target: Date): TimeLeft => {
  const diff = target.getTime() - new Date().getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
};

const generateNoPosition = (intensity: number): NoPosition => {
  const top = clamp(40 + randomInRange(-18, 18) + intensity, 15, 80);
  const left = clamp(50 + randomInRange(-28, 28) - intensity * 0.7, 12, 88);
  const rotation = randomInRange(-14, 14);
  const scale = clamp(1 - intensity * 0.04, 0.65, 1);
  return { top, left, rotation, scale };
};

const HeartField = ({ count }: { count: number }) => (
  <div className="hearts">
    {Array.from({ length: count }).map((_, idx) => {
      const size = randomInRange(12, 26);
      const duration = randomInRange(9, 16);
      const delay = randomInRange(0, 6);
      const left = randomInRange(0, 100);
      const top = randomInRange(0, 100);
      const opacity = randomInRange(0.35, 0.85);

      return (
        <span
          key={idx}
          className="heart"
          style={{
            width: size,
            height: size,
            animationDuration: `${duration}s`,
            animationDelay: `-${delay}s`,
            left: `${left}%`,
            top: `${top}%`,
            opacity
          }}
        />
      );
    })}
  </div>
);

export default function Home() {
  const [accepted, setAccepted] = useState(false);
  const [noHoverCount, setNoHoverCount] = useState(0);
  const [noClickAttempts, setNoClickAttempts] = useState(0);
  const [noPosition, setNoPosition] = useState<NoPosition>(() =>
    generateNoPosition(0)
  );
  const [message, setMessage] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetDate())
  );
  const [audioHint, setAudioHint] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const countdownTarget = useMemo(() => targetDate(), []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.35;
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
          setAudioHint("If you don't hear music, tap to allow autoplay.");
        });
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(countdownTarget));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdownTarget]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundOptions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleNoHover = () => {
    setNoHoverCount((prev) => {
      const next = prev + 1;
      setNoPosition(generateNoPosition(next));
      return next;
    });
  };

  const handleNoClick = () => {
    setNoClickAttempts((prev) => prev + 1);
    const index = (noClickAttempts + 1) % playfulMessages.length;
    setMessage(playfulMessages[index]);
    setNoPosition(generateNoPosition(noHoverCount + noClickAttempts + 1));
  };

  const handleToggleAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioHint(null);
        })
        .catch(() => setAudioHint("Tap again to allow music to play."));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const yesScale = noClickAttempts >= 4 ? 1.08 : 1;
  const noScale = noClickAttempts >= 4 ? noPosition.scale * 0.9 : noPosition.scale;

  const renderLanding = () => (
    <div className="landing fade-scale glass card">
      <p className="subtitle">An earnest inquiry, delivered with mischief</p>
      <h1 className="title">Will you be my Valentine?</h1>

      <div className="button-area">
        <div className="buttons">
          <button
            className="btn btn-yes"
            style={{ position: "absolute", top: "50%", left: "35%", transform: `translate(-50%, -50%) scale(${yesScale})` }}
            onClick={() => setAccepted(true)}
          >
            Yes
          </button>
          <button
            className="btn btn-no"
            style={{
              position: "absolute",
              top: `${noPosition.top}%`,
              left: `${noPosition.left}%`,
              transform: `translate(-50%, -50%) rotate(${noPosition.rotation}deg) scale(${noScale})`
            }}
            onMouseEnter={handleNoHover}
            onMouseOver={handleNoHover}
            onClick={handleNoClick}
          >
            No
          </button>
        </div>
      </div>

      <div className="no-message">{message}</div>
      {audioHint && <div className="audio-hint">{audioHint}</div>}
    </div>
  );

  const renderReveal = () => (
    <div className="reveal fade-scale glass card">
      <div className="countdown">
        <label>Until Our Movie Date Begins</label>
        <div className="timer-grid">
          {["Days", "Hours", "Minutes", "Seconds"].map((label, idx) => {
            const value =
              label === "Days"
                ? timeLeft.days
                : label === "Hours"
                  ? timeLeft.hours
                  : label === "Minutes"
                    ? timeLeft.minutes
                    : timeLeft.seconds;
            return (
              <div className="time-block" key={label}>
                <span className="time-value">
                  {value.toString().padStart(2, "0")}
                </span>
                <div className="time-label">{label}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="reveal-grid">
        <div className="section">
          <p className="pill">Feature Presentation</p>
          <h3>Suzume</h3>
          <p>February 13 • 9:00 PM</p>
          <Image
            className="poster"
            src="/suzume-movie.jpg"
            alt="Suzume placeholder poster"
            width={640}
            height={900}
            priority
          />
        </div>

        <div className="section">
          <p className="pill">Proceedings & Etiquette</p>
          <ol className="instructions">
            <li>Download the movie from Amazon Prime in advance.</li>
            <li>Expect a call from your Valentine by 8:50 PM on the appointed date.</li>
            <li>
              The motion picture runs 2 hours and 2 minutes. We shall reconvene via brief
              calls at: <strong>45:00</strong> and <strong>1:30:00</strong>.
            </li>
            <li>After the conclusion of the film, we shall reconvene one final time.</li>
            <li>This methodology safeguards us from the clutches of unreliable internet connections.</li>
          </ol>
        </div>
      </div>

      <div className="section memo">
        <strong>Note:</strong> For dinner, please place your Jollibee order with your Valentine
        and anticipate its arrival at approximately 8:40 PM. Kindly declare your desired meal
        12 hours prior, meaning you are required to inform me of your selection in the morning. :&gt;
      </div>
    </div>
  );

  return (
    <main style={{ background: backgroundOptions[bgIndex] }}>
      <HeartField count={18} />
      <audio
        ref={audioRef}
        src="/bg-music.mp3"
        autoPlay
        loop
        playsInline
        aria-label="Background romantic music"
      />
      <div style={{ position: "fixed", bottom: 16, left: 16, zIndex: 10 }}>
        <button type="button" className="audio-controls" onClick={handleToggleAudio}>
          {isPlaying ? "Pause music" : "Play music"}
        </button>
      </div>
      {accepted ? renderReveal() : renderLanding()}
    </main>
  );
}
