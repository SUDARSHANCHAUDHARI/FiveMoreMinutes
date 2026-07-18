"use strict";

const WAKE_ATTEMPTS = 8;
const REACTION_DURATION = 4300;

const app = document.querySelector("#app");
const computer = document.querySelector(".computer");
const screen = document.querySelector("#screen");
const screenMessage = document.querySelector("#screenMessage");
const powerButton = document.querySelector("#powerButton");
const keyboard = document.querySelector("#keyboard");
const keyboardStatus = document.querySelector("#keyboardStatus");
const attemptCount = document.querySelector("#attemptCount");
const meterSegments = [...document.querySelectorAll(".attempt-meter span")];
const statusAnnouncement = document.querySelector("#statusAnnouncement");
const soundToggle = document.querySelector("#soundToggle");
const soundLabel = document.querySelector("#soundLabel");
const resetButton = document.querySelector("#resetButton");
const alarmTime = document.querySelector("#alarmTime");

let attempts = 0;
let isAwake = false;
let soundEnabled = true;
let audioContext = null;
let reactionBag = [];
let reactionTimers = [];
let inputLockedUntil = 0;

const reactions = [
  {
    id: "wake-sleep",
    message: "Oh— wait. Never mind.",
    announcement: "The screen wakes for a moment, then immediately goes back to sleep.",
    sound: "bootFail",
  },
  {
    id: "yawn",
    message: "y a a a w n…",
    announcement: "The computer lets out a long digital yawn.",
    sound: "yawn",
  },
  {
    id: "five-minutes",
    message: "Five more minutes.",
    announcement: "The screen says, Five more minutes.",
    sound: "mumble",
  },
  {
    id: "button-dodges",
    message: "Missed me.",
    announcement: "The power button scoots away from you.",
    sound: "dodge",
    setup() {
      const x = Math.random() > 0.5 ? "-6.8rem" : "-4.5rem";
      const y = Math.random() > 0.5 ? "-0.8rem" : "0.5rem";
      computer.style.setProperty("--dodge-x", x);
      computer.style.setProperty("--dodge-y", y);
    },
  },
  {
    id: "blanket-up",
    message: "Can’t see you.",
    announcement: "The monitor pulls its little blanket up over the screen.",
    sound: "rustle",
  },
  {
    id: "fake-update",
    message: "",
    announcement: "A suspicious nap update begins and stalls at eighty-four percent.",
    sound: "update",
  },
  {
    id: "keyboard-disconnect",
    message: "INPUT DEVICE? NEVER MET HER.",
    announcement: "The keyboard disconnects itself to avoid helping.",
    sound: "disconnect",
    setup() {
      keyboardStatus.textContent = "Keyboard disconnected itself";
    },
  },
  {
    id: "sleepy-face",
    message: "",
    announcement: "A very sleepy face appears on the dark screen.",
    sound: "snore",
  },
  {
    id: "alarm",
    message: "",
    announcement: "The computer sets an alarm for two minutes from now.",
    sound: "alarm",
    setup() {
      const alarm = new Date(Date.now() + 2 * 60 * 1000);
      alarmTime.textContent = new Intl.DateTimeFormat([], {
        hour: "2-digit",
        minute: "2-digit",
      }).format(alarm);
    },
  },
  {
    id: "brightness-drop",
    message: "Too bright. Absolutely not.",
    announcement: "The screen turns on, complains about the brightness, and dims itself again.",
    sound: "powerDown",
  },
];

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function refillReactionBag() {
  reactionBag = shuffle(reactions);
}

function queueTimer(callback, delay) {
  const timer = window.setTimeout(callback, delay);
  reactionTimers.push(timer);
  return timer;
}

function clearReactionTimers() {
  reactionTimers.forEach((timer) => window.clearTimeout(timer));
  reactionTimers = [];
}

function setAnnouncement(message) {
  statusAnnouncement.textContent = "";
  queueTimer(() => {
    statusAnnouncement.textContent = message;
  }, 30);
}

function updateAttempts() {
  attemptCount.value = `${attempts} / ${WAKE_ATTEMPTS}`;
  attemptCount.textContent = `${attempts} / ${WAKE_ATTEMPTS}`;
  meterSegments.forEach((segment, index) => {
    segment.classList.toggle("is-filled", index < attempts);
  });
}

function clearReaction() {
  clearReactionTimers();
  computer.dataset.reaction = "idle";
  computer.style.removeProperty("--dodge-x");
  computer.style.removeProperty("--dodge-y");
  screenMessage.textContent = "zzZ";
  keyboardStatus.textContent = "Keyboard connected · reluctantly";
  screen.setAttribute("aria-label", "The computer screen is dark and asleep");
}

function nextReaction() {
  if (reactionBag.length === 0) {
    refillReactionBag();
  }

  return reactionBag.pop();
}

function tryWakeComputer(source = "power button") {
  const now = performance.now();
  if (now < inputLockedUntil) return;
  inputLockedUntil = now + 180;

  ensureAudio();

  if (isAwake) {
    setAnnouncement("The computer is already awake, though not especially pleased about it.");
    playSound("acknowledge");
    return;
  }

  clearReaction();
  attempts += 1;
  updateAttempts();
  playSound("button");

  if (attempts >= WAKE_ATTEMPTS) {
    wakeFully();
    return;
  }

  const reaction = nextReaction();
  computer.dataset.reaction = reaction.id;
  screenMessage.textContent = reaction.message;
  screen.setAttribute("aria-label", reaction.announcement);
  reaction.setup?.();
  setAnnouncement(`Attempt ${attempts} of ${WAKE_ATTEMPTS}, using the ${source}. ${reaction.announcement}`);
  queueTimer(() => playSound(reaction.sound), 110);

  queueTimer(() => {
    if (!isAwake) clearReaction();
  }, REACTION_DURATION);
}

function wakeFully() {
  clearReactionTimers();
  isAwake = true;
  app.classList.add("is-awake");
  computer.dataset.reaction = "awake";
  screenMessage.textContent = "Fine. I’m awake.";
  keyboardStatus.textContent = "Keyboard connected · suspiciously cooperative";
  screen.setAttribute("aria-label", "The computer is fully awake and says, Fine. I’m awake.");
  setAnnouncement("Attempt 8 of 8. The computer wakes fully and says, Fine. I’m awake.");
  playSound("awake");
}

function resetExperience() {
  clearReactionTimers();
  attempts = 0;
  isAwake = false;
  inputLockedUntil = 0;
  app.classList.remove("is-awake");
  clearReaction();
  refillReactionBag();
  updateAttempts();
  setAnnouncement("Reset complete. The computer is asleep. Zero of eight wake attempts.");
  playSound("reset");
  powerButton.focus({ preventScroll: true });
}

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function ensureAudio() {
  if (soundEnabled) getAudioContext();
}

function tone(frequency, start, duration, options = {}) {
  const context = getAudioContext();
  if (!context || !soundEnabled) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const beginsAt = context.currentTime + start;
  const endsAt = beginsAt + duration;
  const endFrequency = options.endFrequency ?? frequency;

  oscillator.type = options.type ?? "sine";
  oscillator.frequency.setValueAtTime(frequency, beginsAt);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), endsAt);
  gain.gain.setValueAtTime(0.0001, beginsAt);
  gain.gain.exponentialRampToValueAtTime(options.volume ?? 0.04, beginsAt + Math.min(0.025, duration / 3));
  gain.gain.exponentialRampToValueAtTime(0.0001, endsAt);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(beginsAt);
  oscillator.stop(endsAt + 0.02);
}

function noise(start, duration, volume = 0.018) {
  const context = getAudioContext();
  if (!context || !soundEnabled) return;

  const sampleCount = Math.ceil(context.sampleRate * duration);
  const buffer = context.createBuffer(1, sampleCount, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let index = 0; index < sampleCount; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();
  const beginsAt = context.currentTime + start;

  filter.type = "lowpass";
  filter.frequency.value = 650;
  gain.gain.setValueAtTime(0.0001, beginsAt);
  gain.gain.exponentialRampToValueAtTime(volume, beginsAt + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, beginsAt + duration);

  source.buffer = buffer;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(beginsAt);
}

function playSound(name) {
  if (!soundEnabled) return;

  const sounds = {
    button() {
      tone(170, 0, 0.06, { type: "square", volume: 0.022, endFrequency: 130 });
    },
    bootFail() {
      tone(220, 0, 0.2, { volume: 0.04, endFrequency: 520 });
      tone(520, 0.22, 0.3, { volume: 0.035, endFrequency: 80 });
    },
    yawn() {
      tone(185, 0, 1.3, { type: "triangle", volume: 0.035, endFrequency: 72 });
      noise(0.1, 1.4, 0.012);
    },
    mumble() {
      tone(105, 0, 0.42, { type: "triangle", volume: 0.025, endFrequency: 92 });
      tone(92, 0.5, 0.46, { type: "triangle", volume: 0.022, endFrequency: 70 });
    },
    dodge() {
      tone(580, 0, 0.1, { type: "sine", volume: 0.03, endFrequency: 940 });
      tone(760, 0.1, 0.1, { type: "sine", volume: 0.025, endFrequency: 1100 });
    },
    rustle() {
      noise(0, 0.8, 0.02);
      noise(0.28, 0.65, 0.012);
    },
    update() {
      tone(420, 0, 0.1, { type: "sine", volume: 0.025 });
      tone(620, 0.14, 0.1, { type: "sine", volume: 0.025 });
      tone(780, 0.28, 0.16, { type: "sine", volume: 0.02 });
    },
    disconnect() {
      tone(480, 0, 0.16, { type: "square", volume: 0.022, endFrequency: 300 });
      tone(260, 0.19, 0.3, { type: "square", volume: 0.018, endFrequency: 70 });
    },
    snore() {
      tone(74, 0, 0.8, { type: "sine", volume: 0.025, endFrequency: 92 });
      noise(0.15, 0.75, 0.009);
    },
    alarm() {
      tone(660, 0, 0.13, { type: "square", volume: 0.025 });
      tone(660, 0.23, 0.13, { type: "square", volume: 0.025 });
      tone(660, 0.46, 0.13, { type: "square", volume: 0.025 });
    },
    powerDown() {
      tone(440, 0, 0.7, { type: "sine", volume: 0.035, endFrequency: 48 });
    },
    awake() {
      [262, 330, 392, 523].forEach((frequency, index) => {
        tone(frequency, index * 0.13, 0.45, { type: "triangle", volume: 0.035 });
      });
    },
    acknowledge() {
      tone(430, 0, 0.08, { volume: 0.02 });
      tone(540, 0.1, 0.08, { volume: 0.02 });
    },
    reset() {
      tone(340, 0, 0.2, { volume: 0.025, endFrequency: 190 });
    },
  };

  sounds[name]?.();
}

powerButton.addEventListener("click", () => tryWakeComputer("power button"));
keyboard.addEventListener("click", () => tryWakeComputer("keyboard"));

document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() !== "w" || event.repeat) return;

  const target = event.target;
  const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
  if (isTyping) return;

  event.preventDefault();
  tryWakeComputer("W key");
});

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  soundLabel.textContent = soundEnabled ? "Sound on" : "Sound off";

  if (soundEnabled) {
    ensureAudio();
    playSound("acknowledge");
  }
});

resetButton.addEventListener("click", resetExperience);

refillReactionBag();
updateAttempts();
