"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Point {
  x: number;
  y: number;
}

interface Message {
  id: string;
  text: string;
  likes: number;
  dislikes: number;
  createdAt: string;
}

type BreathingPhase =
  | "idle"
  | "waiting"
  | "inhale"
  | "inhaling"
  | "hold"
  | "exhale"
  | "exhaling";

type Stage =
  | "start"
  | "warpIn"
  | "eyesOpening"
  | "wakeUp"
  | "anxiety"
  | "peak"
  | "turning"
  | "recovery"
  | "calm"
  | "arrival";

type SortOption = "newest" | "mostLiked" | "mostDisliked";

const stageContent: Record<string, string[]> = {
  wakeUp: [
    "Where... am I?",
    "The train... when did I get on?",
    "How did I get here?",
    "Where is everyone?",
    "This is scary and I don't like it.",
    "Why is it so hard to breathe?",
    "I need to... focus.",
  ],
  anxiety: [
    "My heart is beating too fast.",
    "I feel dizzy, please make it stop.",
    "People might be staring.",
    "What if I'm having a heart attack?",
    "I can't seem to get enough air.",
    "I need to get off this train.",
    "Am I going to die?",
    "SOMEBODY HELP ME!",
  ],
  peak: [
    "I CAN'T BREATHE!",
    "I'M GOING TO PASS OUT!",
    "*panting*",
    "IM GOING TO DIE",
    "MAKE IT STOP",
  ],
  turning: [
    "It's happened before.",
    "This is just panic.",
    "I need to breathe.",
    "In through the nose...",
    "Out through the mouth...",
  ],
  recovery: [
    "The feeling is passing.",
    "My body is calming down.",
    "I can breathe again.",
    "I'm still here.",
    "I made it through.",
  ],
  calm: [
    "The panic always ends.",
    "I survived again.",
    "The train keeps moving.",
    "And so do I.",
    "One moment at a time.",
  ],
  arrival: [
    "You're not alone in this journey.",
    "Every panic attack ends.",
    "You're stronger than you know.",
    "It's okay to ask for help.",
    "There's light after every tunnel.",
  ],
};

export default function EnhancedTrainOfThought(): React.ReactElement {
  const supportMessages: string[] = [
    "I used to have panic attacks daily. With help, now they're rare moments instead of my whole life.",
    "What helped me most was learning that panic can't actually harm me - it's just an adrenaline rush.",
    "Breathing techniques changed everything for me. They bring me back when I feel lost.",
    "Finding a therapist who understood panic disorder was my turning point.",
    "You're not broken. Your body's alarm system is just a little too sensitive right now.",
  ];

  const [stage, setStage] = useState<Stage>("start");
  const [warpProgress, setWarpProgress] = useState<number>(0);
  const [eyesOpenProgress, setEyesOpenProgress] = useState<number>(0);
  const [blinking, setBlinking] = useState<boolean>(false);
  const [panicLevel, setPanicLevel] = useState<number>(0);
  const [textIndex, setTextIndex] = useState<number>(0);
  const [currentText, setCurrentText] = useState<string>("");
  const [textComplete, setTextComplete] = useState<boolean>(false);
  const [textPosition, setTextPosition] = useState<Point>({ x: 50, y: 50 });
  const [textStyle, setTextStyle] = useState<React.CSSProperties>({});
  const [endingAnimation, setEndingAnimation] = useState<boolean>(false);

  const [cameraShake, setCameraShake] = useState<number>(0);
  const [lightLevel, setLightLevel] = useState<number>(0.7);
  const [blurAmount, setBlurAmount] = useState<number>(0);
  const [vignetteIntensity, setVignetteIntensity] = useState<number>(0);

  const [heartRate, setHeartRate] = useState<number>(70);
  const [heartScale, setHeartScale] = useState<number>(1);
  const [heartGlow, setHeartGlow] = useState<number>(0);

  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>("idle");
  const phaseRef = useRef<BreathingPhase>("idle");
  useEffect(() => {
    phaseRef.current = breathingPhase;
  }, [breathingPhase]);
  const [breathProgress, setBreathProgress] = useState<number>(0);
  const [breathCycles, setBreathCycles] = useState<number>(0);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [breathingSuccess, setBreathingSuccess] = useState<boolean>(false);

  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [savedMessages, setSavedMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [messageLikes, setMessageLikes] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [messageDislikes, setMessageDislikes] = useState<{
    [key: string]: boolean;
  }>({});
  const [isReturningToStart, setIsReturningToStart] = useState<boolean>(false);

  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);

  const sceneRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const breathingCircleRef = useRef<HTMLDivElement>(null);
  const trainAudioRef = useRef<HTMLAudioElement | null>(null);
  const heartbeatAudioRef = useRef<HTMLAudioElement | null>(null);
  const breathingAudioRef = useRef<HTMLAudioElement | null>(null);
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {}, [stage]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?sortBy=${sortOption}`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setSavedMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);

      const savedMsgs = localStorage.getItem("trainOfThoughtMessages");
      if (savedMsgs) {
        try {
          const parsed = JSON.parse(savedMsgs);
          if (Array.isArray(parsed)) {
            setSavedMessages(parsed.slice(0, 10));
          }
        } catch (e) {
          console.error("Error parsing saved messages:", e);
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        trainAudioRef.current = new Audio("/assets/audio/train.mp3");
        heartbeatAudioRef.current = new Audio("/assets/audio/heartbeat.mp3");
        breathingAudioRef.current = new Audio("/assets/audio/breathing.mp3");
        typingAudioRef.current = new Audio("/assets/audio/typing.mp3");
        ambientAudioRef.current = new Audio("/assets/audio/ambient.mp3");

        if (trainAudioRef.current) trainAudioRef.current.loop = true;
        if (heartbeatAudioRef.current) heartbeatAudioRef.current.loop = true;
        if (breathingAudioRef.current) breathingAudioRef.current.loop = true;
        if (ambientAudioRef.current) ambientAudioRef.current.loop = true;

        if (trainAudioRef.current) trainAudioRef.current.volume = 0.3;
        if (heartbeatAudioRef.current) heartbeatAudioRef.current.volume = 0.2;
        if (breathingAudioRef.current) breathingAudioRef.current.volume = 0.1;
        if (typingAudioRef.current) typingAudioRef.current.volume = 0.3;
        if (ambientAudioRef.current) ambientAudioRef.current.volume = 0.1;

        fetchMessages();
      } catch (e) {
        console.error("Error initializing audio:", e);
      }
    }

    return () => {
      if (trainAudioRef.current) {
        trainAudioRef.current.pause();
        trainAudioRef.current.src = "";
      }
      if (heartbeatAudioRef.current) {
        heartbeatAudioRef.current.pause();
        heartbeatAudioRef.current.src = "";
      }
      if (breathingAudioRef.current) {
        breathingAudioRef.current.pause();
        breathingAudioRef.current.src = "";
      }
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current.src = "";
      }
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
        ambientAudioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (showMessages) {
      fetchMessages();
    }
  }, [sortOption, showMessages]);

  const safelyPlayAudio = (
    audioRef: React.RefObject<HTMLAudioElement | null>,
  ): void => {
    if (!audioRef.current) return;

    audioRef.current.play().catch((error) => {
      console.error("Audio play error:", error);
    });
  };

  const fadeAudio = (
    audioRef: React.RefObject<HTMLAudioElement | null>,
    targetVolume: number,
    duration: number,
  ): void => {
    if (!audioEnabled || !audioRef.current) return;

    const startVolume = audioRef.current.volume;
    const volumeDiff = targetVolume - startVolume;
    const startTime = performance.now();

    const updateVolume = (): void => {
      if (!audioRef.current) return;

      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / duration);
      audioRef.current.volume = startVolume + volumeDiff * progress;

      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      }
    };

    requestAnimationFrame(updateVolume);
  };

  const returnToStart = () => {
    if (isReturningToStart) return;

    setIsReturningToStart(true);
    setEndingAnimation(true);

    if (audioEnabled) {
      fadeAudio(trainAudioRef, 0, 2000);
      fadeAudio(ambientAudioRef, 0, 2000);
      fadeAudio(heartbeatAudioRef, 0, 2000);
    }

    setTimeout(() => {
      setEndingAnimation(false);
      setStage("start");
      setShowMessages(false);
      setIsReturningToStart(false);
    }, 2000);
  };

  const startExperience = (enableAudio = false): void => {
    setAudioEnabled(enableAudio);
    if (enableAudio) {
      trainAudioRef.current?.play().catch(console.error);
      ambientAudioRef.current?.play().catch(console.error);
      heartbeatAudioRef.current?.play().catch(console.error);

      trainAudioRef.current!.volume = 0;
      ambientAudioRef.current!.volume = 0;
      heartbeatAudioRef.current!.volume = 0;

      fadeAudio(trainAudioRef, 0.2, 3000);
      fadeAudio(ambientAudioRef, 0.5, 3000);
      fadeAudio(heartbeatAudioRef, 0.2, 3000);
    }

    setStage("warpIn");
    setWarpProgress(0);

    const warpInterval = setInterval(() => {
      setWarpProgress((prev) => {
        const newValue = prev + 0.02;
        if (newValue >= 1) {
          clearInterval(warpInterval);
          startEyesOpeningSequence();
          return 1;
        }
        return newValue;
      });
    }, 20);
  };

  const startEyesOpeningSequence = (): void => {
    setStage("eyesOpening");
    setEyesOpenProgress(0);
    setLightLevel(0.01);
    setBlurAmount(10);

    setTimeout(() => {
      const blinkSequence = async (): Promise<void> => {
        await animateEyesOpening(0.3, 1000);
        await new Promise((resolve) => setTimeout(resolve, 800));

        setBlinking(true);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setBlinking(false);

        await animateEyesOpening(0.6, 1200);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setBlinking(true);
        await new Promise((resolve) => setTimeout(resolve, 200));
        setBlinking(false);

        await animateEyesOpening(0.9, 1500);
        setLightLevel(0.4);
        setBlurAmount(2);

        await new Promise((resolve) => setTimeout(resolve, 1500));
        beginStory();
      };

      blinkSequence();
    }, 1000);
  };

  const animateEyesOpening = (
    targetValue: number,
    duration: number,
  ): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const startValue = eyesOpenProgress;

      const updateProgress = (): void => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easeOutCubic(progress);

        setEyesOpenProgress(
          startValue + (targetValue - startValue) * easedProgress,
        );

        if (progress < 1) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(updateProgress);
    });
  };

  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  const beginStory = (): void => {
    setStage("wakeUp");

    setTimeout(() => {
      setTextIndex(0);
      setTextPosition({ x: 30, y: 30 });
      setTextStyle({
        fontSize: "2.5rem",
        fontWeight: "300",
        textShadow: "0 0 10px rgba(255,255,255,0.5)",
      });

      startTextAnimation("wakeUp", 0);

      if (audioEnabled) {
        safelyPlayAudio(heartbeatAudioRef);
        fadeAudio(heartbeatAudioRef, 0.3, 2000);
      }
    }, 100);
  };

  const startTextAnimation = (currentStage: string, index: number): void => {
    console.log(
      "Starting text animation for stage:",
      currentStage,
      "index:",
      index,
    );

    const stageTexts = stageContent[currentStage];
    if (!stageTexts || index >= stageTexts.length) {
      console.error("No content found for stage:", currentStage);
      return;
    }

    const text = stageTexts[index];
    setCurrentText("");
    setTextComplete(false);

    let currentLetter = 0;
    const typeInterval = setInterval(() => {
      if (currentLetter < text.length) {
        currentLetter++;
        setCurrentText(text.substring(0, currentLetter));

        if (audioEnabled && typingAudioRef.current) {
          typingAudioRef.current.currentTime = 0;
          safelyPlayAudio(typingAudioRef);
        }
      } else {
        clearInterval(typeInterval);
        typingAudioRef.current?.pause();
        setTextComplete(true);
      }
    }, 60);

    setTimeout(() => {
      if (!textComplete) {
        clearInterval(typeInterval);
        setCurrentText(text);
        setTextComplete(true);
      }
    }, 10000);
  };

  const advanceText = (): void => {
    const currentStageContent = stageContent[stage];
    if (!currentStageContent) return;

    if (stage === "turning") {
      if (textIndex + 1 < currentStageContent.length) {
        const newIndex = textIndex + 1;
        setTextIndex(newIndex);
        setTextComplete(false);

        const newX = 30 + Math.random() * 40;
        const newY = 30 + Math.random() * 40;
        setTextPosition({ x: newX, y: newY });

        setTimeout(() => {
          startTextAnimation(stage, newIndex);
        }, 100);

        updateVisualEffects(stage, newIndex);
      } else {
        setBreathingActive(true);
      }
      return;
    }

    if (textIndex + 1 < currentStageContent.length) {
      const newIndex = textIndex + 1;
      setTextIndex(newIndex);
      setTextComplete(false);

      const newX = 30 + Math.random() * 40;
      const newY = 30 + Math.random() * 40;
      setTextPosition({ x: newX, y: newY });

      setTimeout(() => {
        startTextAnimation(stage, newIndex);
      }, 100);

      updateVisualEffects(stage, newIndex);
    } else {
      moveToNextStage();
    }
  };

  const moveToNextStage = (): void => {
    const stageOrder: Stage[] = [
      "wakeUp",
      "anxiety",
      "peak",
      "turning",
      "recovery",
      "calm",
      "arrival",
    ];
    const currentIndex = stageOrder.indexOf(stage);

    if (currentIndex >= 0 && currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];

      setStage(nextStage);
      setTextIndex(0);
      updateStageEffects(nextStage);

      setTimeout(() => {
        startTextAnimation(nextStage, 0);
      }, 100);
    }
  };

  const updateVisualEffects = (currentStage: string, idx: number): void => {
    const total = stageContent[currentStage]?.length || 1;
    const progress = idx / total;

    switch (currentStage) {
      case "wakeUp":
        setHeartRate(70 + progress * 10);
        setCameraShake(0.2 + progress * 0.3);
        setLightLevel(0.4 - progress * 0.1);
        setVignetteIntensity(0.3 + progress * 0.2);
        break;

      case "anxiety":
        setHeartRate(80 + progress * 20);
        setCameraShake(0.5 + progress * 0.5);
        setLightLevel(0.3 - progress * 0.1);
        setBlurAmount(1 + progress * 2);
        setVignetteIntensity(0.5 + progress * 0.3);
        setPanicLevel(0.3 + progress * 0.4);

        if (audioEnabled) {
          fadeAudio(heartbeatAudioRef, 0.5, 2000);
        }
        break;

      case "peak":
        setHeartRate(100 + progress * 30);
        setCameraShake(1 + progress * 0.5);
        setLightLevel(0.2 - progress * 0.05);
        setBlurAmount(3 + progress * 3);
        setVignetteIntensity(0.8 + progress * 0.2);
        setPanicLevel(0.7 + progress * 0.3);

        if (audioEnabled) {
          fadeAudio(heartbeatAudioRef, 0.8, 1000);
          fadeAudio(trainAudioRef, 0.2, 3000);
        }
        break;

      case "recovery":
        setHeartRate(Math.max(70, 100 - progress * 30));
        setCameraShake(Math.max(0.1, 0.7 - progress * 0.6));
        setLightLevel(0.3 + progress * 0.3);
        setBlurAmount(Math.max(0, 2 - progress * 2));
        setVignetteIntensity(Math.max(0.2, 0.7 - progress * 0.5));
        setPanicLevel(Math.max(0, 0.6 - progress * 0.6));

        if (audioEnabled) {
          fadeAudio(heartbeatAudioRef, 0.3, 3000);
          fadeAudio(trainAudioRef, 0.5, 2000);
        }
        break;

      case "calm":
        setHeartRate(Math.max(60, 70 - progress * 10));
        setCameraShake(Math.max(0.05, 0.1 - progress * 0.05));
        setLightLevel(0.6 + progress * 0.2);
        setBlurAmount(0);
        setVignetteIntensity(Math.max(0.1, 0.2 - progress * 0.1));
        setPanicLevel(0);

        if (audioEnabled) {
          fadeAudio(heartbeatAudioRef, 0.1, 4000);
        }
        break;

      case "arrival":
        setHeartRate(60);
        setCameraShake(0);
        setLightLevel(0.8 + progress * 0.2);
        setBlurAmount(0);
        setVignetteIntensity(0.1);

        if (progress > 0.7 && !showMessages) {
          setShowMessages(true);

          fetchMessages();
        }

        if (audioEnabled) {
          fadeAudio(heartbeatAudioRef, 0.3, 5000);
          fadeAudio(trainAudioRef, 0, 3000);
          fadeAudio(ambientAudioRef, 0.4, 3000);
        }
        break;
    }
  };

  const updateStageEffects = (newStage: Stage): void => {
    const styles: Record<Stage, React.CSSProperties> = {
      start: {},
      warpIn: {},
      eyesOpening: {},
      wakeUp: {
        fontSize: "2.5rem",
        fontWeight: "300",
        textShadow: "0 0 10px rgba(255,255,255,0.5)",
      },
      anxiety: {
        fontSize: "2.8rem",
        fontWeight: "400",
        textShadow: "0 0 15px rgba(150,150,255,0.6)",
      },
      peak: {
        fontSize: "3rem",
        fontWeight: "600",
        textShadow: "0 0 20px rgba(255,150,150,0.7)",
      },
      turning: {
        fontSize: "2.7rem",
        fontWeight: "300",
        textShadow: "0 0 15px rgba(150,255,255,0.6)",
      },
      recovery: {
        fontSize: "2.5rem",
        fontWeight: "300",
        textShadow: "0 0 10px rgba(150,255,150,0.6)",
      },
      calm: {
        fontSize: "2.5rem",
        fontWeight: "300",
        textShadow: "0 0 12px rgba(255,255,255,0.7)",
      },
      arrival: {
        fontSize: "2.6rem",
        fontWeight: "300",
        textShadow: "0 0 15px rgba(255,255,255,0.8)",
      },
    };

    setTextStyle(styles[newStage]);
    updateVisualEffects(newStage, 0);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      if (stage === "arrival" && showMessages) {
        if (e.target instanceof Element) {
          let targetElement = e.target as Element;
          let messageBoard = document.querySelector(".message-board");

          let isInMessageBoard = false;
          while (targetElement && targetElement !== document.body) {
            if (targetElement === messageBoard) {
              isInMessageBoard = true;
              break;
            }
            targetElement = targetElement.parentElement as Element;
          }

          if (!isInMessageBoard && !isReturningToStart) {
            returnToStart();
            return;
          }
        }
      }

      if (breathingActive) return;
      if (stage === "turning") {
        console.log(
          "In turning stage handler, textIndex:",
          textIndex,
          "breathingActive:",
          breathingActive,
        );
      }

      if (
        textComplete &&
        stage !== "start" &&
        stage !== "warpIn" &&
        stage !== "eyesOpening"
      ) {
        if (stage === "turning") {
          const currentStageTexts = stageContent[stage];
          const nextIndex = textIndex + 1;

          console.log(
            "Turning stage: trying to advance to text index",
            nextIndex,
            "of",
            currentStageTexts.length,
          );

          if (nextIndex < currentStageTexts.length) {
            setTextIndex(nextIndex);
            setTextComplete(false);

            const newX = 30 + Math.random() * 40;
            const newY = 30 + Math.random() * 40;
            setTextPosition({ x: newX, y: newY });

            setTimeout(() => {
              startTextAnimation(stage, nextIndex);
            }, 100);

            updateVisualEffects(stage, nextIndex);
          } else if (!breathingActive) {
            console.log(
              "Starting breathing exercise - end of turning stage texts",
            );
            setBreathingActive(true);
          }
        } else {
          advanceText();
        }
      }

      if (stage === "turning") {
        setUserInteracted(true);
      }
    };

    const handleKeyPress = (e: KeyboardEvent): void => {
      if (e.key === " " || e.key === "Enter") {
        if (!breathingActive) {
          const clickEvent = new MouseEvent("click");
          document.dispatchEvent(clickEvent);
        }
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [
    textComplete,
    stage,
    textIndex,
    breathingActive,
    showMessages,
    isReturningToStart,
  ]);

  useEffect(() => {
    if (stage === "start" || stage === "warpIn" || stage === "eyesOpening")
      return;

    let animationFrameId: number;

    const updateCameraPosition = (timestamp: number): void => {
      if (!sceneRef.current) return;

      const time = timestamp / 1000;
      const baseShake = cameraShake * 10;

      const sideToSide = Math.sin(time * 1.5) * baseShake * 0.7;
      const bumpIntensity =
        Math.sin(time * 0.7) > 0.7 ? Math.sin(time * 20) * baseShake * 0.3 : 0;
      const jitterX = (Math.random() - 0.5) * baseShake * 0.2;
      const jitterY = (Math.random() - 0.5) * baseShake * 0.2;

      const xPosition = sideToSide + jitterX;
      const yPosition = bumpIntensity + jitterY;

      if (panicLevel > 0) {
        const panicMovement = Math.sin(time * 3) * panicLevel * 5;

        if (panicLevel > 0.7) {
          sceneRef.current.style.transform = `translate(${xPosition + panicMovement}px, ${yPosition}px) rotate(${panicMovement * 0.1}deg)`;
        } else {
          sceneRef.current.style.transform = `translate(${xPosition + panicMovement}px, ${yPosition}px)`;
        }
      } else {
        sceneRef.current.style.transform = `translate(${xPosition}px, ${yPosition}px)`;
      }

      animationFrameId = requestAnimationFrame(updateCameraPosition);
    };

    animationFrameId = requestAnimationFrame(updateCameraPosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraShake, panicLevel, stage]);

  useEffect(() => {
    if (
      stage === "start" ||
      stage === "warpIn" ||
      stage === "eyesOpening" ||
      !heartRef.current
    )
      return;

    const beatInterval = 60000 / heartRate;
    const systoleDuration = beatInterval * 0.3;

    const heartbeatInterval = setInterval(() => {
      setHeartScale(1.2);
      setHeartGlow(heartRate / 60);

      if (audioEnabled && heartbeatAudioRef.current) {
        heartbeatAudioRef.current.playbackRate = heartRate / 70;
      }

      setTimeout(() => {
        setHeartScale(1);
        setHeartGlow(0);
      }, systoleDuration);
    }, beatInterval);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [heartRate, stage, audioEnabled]);

  useEffect(() => {
    if (!breathingActive) return;
    setBreathingPhase("inhale");
    setBreathProgress(0);
    setBreathingSuccess(false);
    setBreathCycles(0);

    if (audioEnabled) {
      safelyPlayAudio(breathingAudioRef);
      fadeAudio(trainAudioRef, 0, 1000);
      fadeAudio(breathingAudioRef, 1, 2000);
    }

    setTimeout(() => {
      setBreathingPhase("inhale");
    }, 1500);

    return () => {
      if (audioEnabled) {
        fadeAudio(breathingAudioRef, 1, 1000);
      }
    };
  }, [breathingActive, audioEnabled]);

  useEffect(() => {
    if (!breathingActive) return;

    const circle = breathingCircleRef.current;
    if (!circle) return;

    /* hold latest timers across re-renders */
    const inhaleRef = { current: null as NodeJS.Timeout | null };
    const exhaleRef = { current: null as NodeJS.Timeout | null };

    const beginInhale = () => {
      if (phaseRef.current !== "inhale") return;
      setBreathingPhase("inhaling");
      clearInterval(exhaleRef.current!);
      inhaleRef.current = setInterval(() => {
        setBreathProgress((p) => {
          if (p >= 100) {
            clearInterval(inhaleRef.current!);
            setBreathingPhase("hold");
            setTimeout(() => setBreathingPhase("exhale"), 3000);
            return 100;
          }
          return p + 2;
        });
      }, 40);
    };

    const beginExhale = () => {
      const phase = phaseRef.current;
      if (phase !== "exhale" && phase !== "hold" && phase !== "inhaling")
        return;
      setBreathingPhase("exhaling");
      clearInterval(inhaleRef.current!);
      exhaleRef.current = setInterval(() => {
        setBreathProgress((p) => {
          if (p <= 0) {
            clearInterval(exhaleRef.current!);
            setBreathCycles((prev) => {
              const done = prev + 1;

              setHeartRate((h) => Math.max(60, h - 8));

              if (done >= 4) {
                setBreathingActive(false);
                moveToNextStage();
              } else {
                setTimeout(() => setBreathingPhase("inhale"), 1000);
              }

              return done;
            });
            return 0;
          }
          return p - 1.5;
        });
      }, 40);
    };

    const down = () => beginInhale();
    const up = () => beginExhale();

    circle.addEventListener("pointerdown", down);
    circle.addEventListener("pointerup", up);
    circle.addEventListener("pointercancel", up);

    return () => {
      clearInterval(inhaleRef.current!);
      clearInterval(exhaleRef.current!);
      circle.removeEventListener("pointerdown", down);
      circle.removeEventListener("pointerup", up);
      circle.removeEventListener("pointercancel", up);
    };
  }, [breathingActive]);

  useEffect(() => {
    if (breathingActive && !userInteracted) {
      const autoAdvanceTimer = setTimeout(() => {
        setBreathCycles(4);
        setBreathingActive(false);
        moveToNextStage();
      }, 15000);

      return () => clearTimeout(autoAdvanceTimer);
    }
  }, [breathingActive, userInteracted, moveToNextStage]);

  const handleReaction = async (id: string, action: "like" | "dislike") => {
    try {
      if (action === "like" && messageLikes[id]) return;
      if (action === "dislike" && messageDislikes[id]) return;

      if (action === "like") {
        setMessageLikes((prev) => ({ ...prev, [id]: true }));
        setMessageDislikes((prev) => ({ ...prev, [id]: false }));
      } else {
        setMessageDislikes((prev) => ({ ...prev, [id]: true }));
        setMessageLikes((prev) => ({ ...prev, [id]: false }));
      }

      const response = await fetch("/api/messages", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }

      fetchMessages();
    } catch (error) {
      console.error("Error updating reaction:", error);

      if (action === "like") {
        setMessageLikes((prev) => ({ ...prev, [id]: false }));
      } else {
        setMessageDislikes((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleSubmitMessage = async (): Promise<void> => {
    if (!userMessage.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message");
      }

      setUserMessage("");
      fetchMessages();

      setTimeout(() => {
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error saving message:", error);

      const newMessage = {
        id: Date.now().toString(),
        text: userMessage.trim(),
        likes: 0,
        dislikes: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedMessages = [newMessage, ...savedMessages].slice(0, 20);

      try {
        localStorage.setItem(
          "trainOfThoughtMessages",
          JSON.stringify(updatedMessages),
        );
        setSavedMessages(updatedMessages);
        setUserMessage("");
      } catch (e) {
        console.error("Error saving to localStorage:", e);
      }

      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getBreathingCircleStyle = (): React.CSSProperties => {
    const size = 20 + breathProgress * 0.6;

    let color: string, shadow: string, border: string;

    switch (breathingPhase) {
      case "inhale":
      case "inhaling":
        color = "rgba(100, 150, 255, 0.15)";
        shadow = `0 0 ${20 + breathProgress / 2}px rgba(100, 150, 255, 0.4)`;
        border = "2px solid rgba(100, 150, 255, 0.6)";
        break;
      case "hold":
        color = "rgba(150, 150, 255, 0.2)";
        shadow = `0 0 ${30 + breathProgress / 2}px rgba(150, 150, 255, 0.5)`;
        border = "2px solid rgba(150, 150, 255, 0.7)";
        break;
      case "exhale":
      case "exhaling":
        color = "rgba(150, 100, 255, 0.15)";
        shadow = `0 0 ${20 + breathProgress / 2}px rgba(150, 100, 255, 0.4)`;
        border = "2px solid rgba(150, 100, 255, 0.6)";
        break;
      default:
        color = "rgba(100, 100, 100, 0.1)";
        shadow = "0 0 10px rgba(100, 100, 100, 0.3)";
        border = "2px solid rgba(100, 100, 100, 0.5)";
    }

    return {
      width: `${size}rem`,
      height: `${size}rem`,
      backgroundColor: color,
      boxShadow: shadow,
      border,
      borderRadius: "50%",
      transition: breathingPhase === "hold" ? "none" : "all 0.1s ease-out",
      cursor: "pointer",
    };
  };

  const getBreathingInstruction = (): string => {
    switch (breathingPhase) {
      case "waiting":
        return "Get ready to breathe";
      case "inhale":
        return "PRESS & HOLD TO BREATHE IN";
      case "inhaling":
        return "BREATHE IN...";
      case "hold":
        return "HOLD...";
      case "exhale":
        return "RELEASE TO BREATHE OUT";
      case "exhaling":
        return "BREATHE OUT...";
      default:
        return "";
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-black select-none"
    >
      {stage === "warpIn" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className="absolute inset-0 bg-black"
            style={{
              background: `radial-gradient(circle, rgba(0,0,0,1) ${10 + warpProgress * 80}%, rgba(0,20,40,${0.5 + warpProgress * 0.5}) 100%)`,
              transform: `scale(${1 + warpProgress * 1.5})`,
              opacity: 1,
              transition: "all 0.05s ease-out",
            }}
          />

          <div className="relative z-10 text-white text-center opacity-80">
            <div className="text-3xl mb-4 font-light tracking-widest animate-pulse">
              ENTERING
            </div>
            <div className="text-6xl font-extralight tracking-[0.3em] transform scale-y-150">
              TRAIN OF THOUGHT
            </div>
          </div>
        </div>
      )}

      {stage === "eyesOpening" && (
        <div
          className="fixed inset-0 z-50 bg-black transition-opacity pointer-events-none"
          style={{
            opacity: blinking ? 1 : 1 - eyesOpenProgress,
            transition: blinking
              ? "opacity 0.1s ease-in-out"
              : "opacity 0.8s cubic-bezier(0.4, 0.0, 0.2, 1)",
          }}
        />
      )}

      {endingAnimation && (
        <div
          className="fixed inset-0 z-50 bg-black transition-opacity pointer-events-none"
          style={{
            opacity: 0,
            animation: "fadeToBlack 2s forwards",
          }}
        />
      )}

      <div
        ref={sceneRef}
        className="relative w-full h-screen overflow-hidden will-change-transform"
        style={{
          transition: "transform 0.1s ease-out",
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: "url('/assets/images/RainTrain.png')",
            filter: `brightness(${lightLevel}) contrast(1.05) saturate(0.9) blur(${blurAmount}px)`,
            transform: "scale(1.1)",
          }}
        />

        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(circle, transparent ${Math.max(0, 50 - vignetteIntensity * 40)}%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
            mixBlendMode: "multiply",
            transition: "all 1s ease-out",
          }}
        />

        {stage !== "start" && stage !== "warpIn" && stage !== "eyesOpening" && (
          <div className="fixed top-6 left-6 z-40">
            <div className="flex items-center">
              <div
                ref={heartRef}
                className="relative w-10 h-10 transition-all"
                style={{
                  transform: `scale(${heartScale})`,
                  filter: `drop-shadow(0 0 ${5 + heartGlow * 5}px rgba(255,0,0,${heartGlow * 0.7}))`,
                  transition: "all 0.2s ease-out",
                  willChange: "transform, opacity, filter",
                }}
              >
                <svg
                  viewBox="0 0 512 512"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M340.8,98.4c50.7,0,91.9,41.3,91.9,92.3c0,26.2-10.9,49.8-28.3,66.6L256,407.1L105,254.6c-15.8-16.6-25.6-39.1-25.6-63.9
                    c0-51,41.1-92.3,91.9-92.3c38.2,0,70.9,23.4,84.8,56.8C269.8,121.9,302.6,98.4,340.8,98.4"
                    fill="rgba(255, 87, 87, 0.8)"
                    stroke="#FF2929"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <g
                    style={{
                      opacity:
                        heartRate > 90 ? 0.9 : heartRate > 70 ? 0.6 : 0.3,
                    }}
                  >
                    <path
                      d="M170,120 C160,160 180,200 256,280"
                      stroke="#FF5757"
                      strokeWidth={3 + (heartRate - 60) / 15}
                      strokeOpacity={0.6 + (heartRate - 60) / 200}
                      fill="none"
                      style={{ animation: "pulse 0.8s ease-in-out infinite" }}
                    />
                    <path
                      d="M342,120 C352,160 332,200 256,280"
                      stroke="#FF5757"
                      strokeWidth={3 + (heartRate - 60) / 15}
                      strokeOpacity={0.6 + (heartRate - 60) / 200}
                      fill="none"
                      style={{
                        animation: "pulse 0.8s ease-in-out infinite",
                        animationDelay: "0.4s",
                      }}
                    />

                    <path
                      d="M256,280 C240,250 220,200 256,180"
                      stroke="#FF3030"
                      strokeWidth={2 + (heartRate - 60) / 20}
                      strokeOpacity={0.7 + (heartRate - 60) / 150}
                      fill="none"
                      style={{
                        animation: "pulse 0.8s ease-in-out infinite",
                        animationDelay: "0.2s",
                      }}
                    />
                    <path
                      d="M256,280 C272,250 292,200 256,180"
                      stroke="#FF3030"
                      strokeWidth={2 + (heartRate - 60) / 20}
                      strokeOpacity={0.7 + (heartRate - 60) / 150}
                      fill="none"
                      style={{
                        animation: "pulse 0.8s ease-in-out infinite",
                        animationDelay: "0.6s",
                      }}
                    />
                  </g>

                  {heartRate > 90 && (
                    <circle cx="256" cy="220" r="130" fill="url(#heartGlow)" />
                  )}

                  <defs>
                    <radialGradient
                      id="heartGlow"
                      cx="0.5"
                      cy="0.5"
                      r="0.5"
                      fx="0.5"
                      fy="0.5"
                    >
                      <stop offset="70%" stopColor="rgba(255,0,0,0)" />
                      <stop offset="97%" stopColor="rgba(255,0,0,0.3)" />
                      <stop offset="100%" stopColor="rgba(255,0,0,0)" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              <div
                className="ml-2 text-white text-sm font-mono transition-all duration-500"
                style={{
                  color:
                    heartRate > 100
                      ? "rgb(255, 150, 150)"
                      : heartRate > 80
                        ? "rgb(255, 200, 150)"
                        : "rgb(200, 255, 200)",
                  textShadow:
                    heartRate > 100 ? "0 0 5px rgba(255,100,100,0.7)" : "none",
                }}
              >
                <span>{heartRate.toFixed(0)}</span>
                <span className="text-xs ml-1 opacity-80">BPM</span>
              </div>
            </div>
          </div>
        )}

        {stage !== "start" && stage !== "warpIn" && stage !== "eyesOpening" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="absolute transition-all duration-1000 text-left max-w-2xl p-4"
              style={{
                top: `${textPosition.y}%`,
                left: `${textPosition.x}%`,
                transform: "translate(-50%, -50%)",
                ...textStyle,
                color: "white",
                opacity:
                  panicLevel > 0.5 ? 0.9 + Math.sin(Date.now() / 100) * 0.1 : 1,
              }}
            >
              <span
                className="relative inline-block"
                style={{
                  animation:
                    panicLevel > 0.7 ? "textShake 0.05s infinite" : "none",
                }}
              >
                {currentText}
              </span>

              {!textComplete && (
                <span className="inline-block w-3 h-6 ml-1 bg-white opacity-70 animate-blink"></span>
              )}

              {textComplete && stage !== "turning" && (
                <div className="absolute left-1/2 -bottom-16 transform -translate-x-1/2 text-sm opacity-70 whitespace-nowrap animate-pulse">
                  Click anywhere to continue
                </div>
              )}
            </div>
          </div>
        )}

        {breathingActive && (
          <div className="fixed inset-0 flex flex-col items-center justify-center z-40 pointer-events-auto">
            <div
              className="mb-10 text-white text-3xl font-light tracking-widest"
              style={{
                opacity: breathingPhase === "waiting" ? 0.7 : 1,
                transform:
                  breathingPhase === "waiting" ? "scale(0.95)" : "scale(1)",
                transition: "all 0.5s ease-out",
              }}
            >
              {getBreathingInstruction()}
            </div>

            <div className="relative">
              <div
                ref={breathingCircleRef}
                id="breathing-circle"
                className="rounded-full flex items-center justify-center backdrop-blur-sm cursor-pointer select-none"
                style={getBreathingCircleStyle()}
              >
                <div
                  className="text-white text-xl font-light tracking-wider opacity-90"
                  style={{
                    transform:
                      breathingPhase === "hold" ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.5s ease-out",
                  }}
                >
                  {breathingPhase === "inhaling"
                    ? "expand"
                    : breathingPhase === "hold"
                      ? "hold"
                      : breathingPhase === "exhaling"
                        ? "release"
                        : ""}
                </div>

                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke={
                      breathingPhase === "inhaling" ||
                      breathingPhase === "inhale"
                        ? "rgba(100, 150, 255, 0.7)"
                        : breathingPhase === "hold"
                          ? "rgba(150, 150, 255, 0.8)"
                          : "rgba(150, 100, 255, 0.7)"
                    }
                    strokeWidth="2.5"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 - (301.59 * breathProgress) / 100}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
                  />
                </svg>
              </div>

              {breathingSuccess && (
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-full animate-ping"
                    style={{
                      animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
                    }}
                  />
                </div>
              )}

              <div className="absolute inset-0 pointer-events-none overflow-visible">
                {(breathingPhase === "inhaling" ||
                  breathingPhase === "inhale") &&
                  Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={`inhale-${i}`}
                      className="absolute w-2 h-2 rounded-full bg-blue-300"
                      style={{
                        left: `${50 + Math.cos((i / 20) * Math.PI * 2) * 150}%`,
                        top: `${50 + Math.sin((i / 20) * Math.PI * 2) * 150}%`,
                        opacity: Math.random() * 0.5 * (breathProgress / 100),
                        transform: `scale(${Math.random() * 2})`,
                        animation: "particleInhale 4s ease-out forwards",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}

                {(breathingPhase === "exhaling" ||
                  breathingPhase === "exhale") &&
                  Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={`exhale-${i}`}
                      className="absolute w-2 h-2 rounded-full bg-purple-300"
                      style={{
                        left: `${50 + Math.cos((i / 20) * Math.PI * 2) * 50}%`,
                        top: `${50 + Math.sin((i / 20) * Math.PI * 2) * 50}%`,
                        opacity:
                          Math.random() * 0.5 * (1 - breathProgress / 100),
                        transform: `scale(${Math.random() * 2})`,
                        animation: "particleExhale 6s ease-in forwards",
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
              </div>
            </div>

            <div className="mt-16 text-white">
              <div className="flex space-x-4 justify-center">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full transition-all duration-500 transform"
                      style={{
                        backgroundColor:
                          i < breathCycles
                            ? "rgba(150, 220, 255, 0.9)"
                            : "rgba(255,255,255,0.3)",
                        transform: i < breathCycles ? "scale(1.2)" : "scale(1)",
                        boxShadow:
                          i < breathCycles
                            ? "0 0 10px rgba(150, 220, 255, 0.7)"
                            : "none",
                      }}
                    />
                    <div
                      className="mt-1 text-xs opacity-70"
                      style={{
                        opacity: i < breathCycles ? 0.9 : 0.3,
                      }}
                    >
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-white text-sm opacity-60 max-w-xs text-center px-4">
              {breathingPhase === "inhale"
                ? "Press and hold to breathe in deeply through your nose"
                : breathingPhase === "exhale"
                  ? "Release to exhale slowly through your mouth"
                  : ""}
            </div>
          </div>
        )}

        {showMessages && (
          <div className="fixed inset-x-0 bottom-10 z-40 px-4 message-board">
            <div className="bg-black bg-opacity-80 backdrop-blur-md p-8 rounded-xl max-w-5xl mx-auto shadow-2xl border border-blue-400 border-opacity-20">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-light tracking-wider text-white">
                  Messages from fellow travelers
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSortOption("newest")}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${sortOption === "newest" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => setSortOption("mostLiked")}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${sortOption === "mostLiked" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                  >
                    Most Helpful
                  </button>
                  <button
                    onClick={() => setSortOption("mostDisliked")}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${sortOption === "mostDisliked" ? "bg-blue-500 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
                  >
                    Most Discussed
                  </button>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto px-2">
                {[
                  ...savedMessages,
                  ...supportMessages.map((msg) => ({
                    id: `support-${msg.substring(0, 10)}`,
                    text: msg,
                    likes: Math.floor(Math.random() * 30),
                    dislikes: Math.floor(Math.random() * 5),
                    createdAt: new Date(
                      Date.now() -
                        Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
                    ).toISOString(),
                  })),
                ]
                  .slice(0, 12)
                  .map((message) => (
                    <div
                      key={message.id}
                      className="bg-gray-900 bg-opacity-80 p-5 rounded-lg transition-all duration-300 hover:shadow-lg border border-gray-800 hover:border-gray-700"
                    >
                      <p className="text-white font-light leading-relaxed mb-4">
                        "{message.text}"
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="text-gray-400 text-xs">
                          {formatDate(message.createdAt)}
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleReaction(message.id, "like")}
                            className={`flex items-center space-x-1 text-sm ${messageLikes[message.id] ? "text-blue-400" : "text-gray-400 hover:text-blue-300"}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                              />
                            </svg>
                            <span>{message.likes}</span>
                          </button>
                          <button
                            onClick={() =>
                              handleReaction(message.id, "dislike")
                            }
                            className={`flex items-center space-x-1 text-sm ${messageDislikes[message.id] ? "text-red-400" : "text-gray-400 hover:text-red-300"}`}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                              />
                            </svg>
                            <span>{message.dislikes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="border-t border-gray-700 pt-6">
                <h3 className="text-lg mb-3 font-light text-white">
                  Share your experience:
                </h3>
                <textarea
                  className="w-full p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-900 bg-opacity-70 text-white"
                  placeholder="Your words might help someone else find their way..."
                  rows={3}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                />
                <div className="flex justify-between items-center mt-4">
                  <p className="text-gray-400 text-sm">
                    Click anywhere outside this panel to continue
                  </p>
                  <button
                    className={`group relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl ${isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:from-blue-600 hover:to-purple-700"}`}
                    onClick={handleSubmitMessage}
                    disabled={isSubmitting || !userMessage.trim()}
                  >
                    <span className="relative z-10 font-medium">
                      {isSubmitting ? "Sending..." : "Share Your Light"}
                    </span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "start" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
            <div className="text-center p-8 max-w-4xl relative">
              <div className="absolute inset-0 bg-black opacity-50 rounded-3xl blur-xl transform scale-105 -z-10" />

              <h1 className="text-white text-7xl mb-8 font-extralight tracking-widest">
                <span
                  className="block transform translate-y-8 opacity-0 animate-fadeInDown"
                  style={{
                    animationDelay: "0.3s",
                    animationFillMode: "forwards",
                  }}
                >
                  TRAIN
                </span>
                <span
                  className="block transform translate-y-8 opacity-0 animate-fadeInDown"
                  style={{
                    animationDelay: "0.6s",
                    animationFillMode: "forwards",
                  }}
                >
                  OF
                </span>
                <span
                  className="block transform translate-y-8 opacity-0 animate-fadeInDown"
                  style={{
                    animationDelay: "0.9s",
                    animationFillMode: "forwards",
                  }}
                >
                  THOUGHT
                </span>
              </h1>

              <div
                className="mb-10 transform translate-y-8 opacity-0 animate-fadeInDown"
                style={{
                  animationDelay: "1.2s",
                  animationFillMode: "forwards",
                }}
              >
                <p className="text-white text-xl font-light tracking-wide leading-relaxed max-w-2xl mx-auto">
                  An immersive journey through anxiety and healing.
                </p>
                <p className="text-blue-200 text-sm mt-6 opacity-80 max-w-3xl mx-auto">
                  Having experienced panic attacks firsthand, I created this
                  interactive experience to help others understand what anxiety
                  feels like and how we can find our way through it. This
                  project draws inspiration from those vulnerable moments on
                  late-night trains when the world feels overwhelming but
                  recovery remains possible.
                </p>
              </div>

              <div
                className="flex justify-center space-x-6 my-8 transform translate-y-8 opacity-0 animate-fadeInDown"
                style={{
                  animationDelay: "1.6s",
                  animationFillMode: "forwards",
                }}
              >
                <Link
                  href="https://github.com/Midyan3"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GitHub
                </Link>
                <Link
                  href="https://www.linkedin.com/in/midyan-elghazali-901b06247/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </Link>
                <Link
                  href="https://3-drpg-portfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors duration-300 flex items-center"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                  Website
                </Link>
              </div>

              <div
                className="mt-8 space-y-4 transform translate-y-8 opacity-0 animate-fadeInDown"
                style={{
                  animationDelay: "1.8s",
                  animationFillMode: "forwards",
                }}
              >
                <p className="text-white text-sm opacity-70">
                  Would you like sound with your experience?
                </p>

                <div className="flex justify-center space-x-8 mt-4">
                  <button
                    className="group relative overflow-hidden bg-transparent text-white border border-white border-opacity-30 px-12 py-4 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-500"
                    onClick={() => startExperience(false)}
                  >
                    <span className="font-light tracking-wider">
                      WITHOUT SOUND
                    </span>
                  </button>

                  <button
                    className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-500 shadow-lg hover:shadow-xl"
                    onClick={() => startExperience(true)}
                  >
                    <span className="font-light tracking-wider">
                      WITH SOUND
                    </span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage !== "start" && stage !== "warpIn" && stage !== "eyesOpening" && (
          <div className="fixed top-6 right-6 z-45">
            <button
              className="bg-blue-600 bg-opacity-60 backdrop-blur-sm text-white px-4 py-2 text-sm rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              onClick={() =>
                window.open(
                  "https://www.nami.org/Support-Education/Mental-Health-Education/NAMI-HelpLine",
                  "_blank",
                )
              }
            >
              Mental Health Resources
            </button>
          </div>
        )}

        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-black p-3 z-50"
        >
          Skip experience
        </a>
      </div>

      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeToBlack {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes particleInhale {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 0.7;
          }
          100% {
            transform: translate(-150px, -150px) scale(0);
            opacity: 0;
          }
        }

        @keyframes particleExhale {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          100% {
            transform: translate(150px, 150px) scale(0);
            opacity: 0;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        @keyframes textShake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-1px);
          }
          75% {
            transform: translateX(1px);
          }
        }

        @keyframes blink {
          0%,
          100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out forwards;
        }

        body {
          overflow: hidden;
          margin: 0;
          font-family: "Inter", sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
