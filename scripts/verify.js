"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { execFileSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  ".gitignore",
  "AGENTS.md",
  "README.md",
  "index.html",
  "script.js",
  "style.css",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function verifyStaticContracts() {
  requiredFiles.forEach((file) => {
    const fullPath = path.join(root, file);
    assert(fs.existsSync(fullPath), `Missing required file: ${file}`);
    assert(fs.statSync(fullPath).size > 0, `Required file is empty: ${file}`);
  });

  execFileSync(process.execPath, ["--check", path.join(root, "script.js")], { stdio: "pipe" });

  const html = read("index.html");
  const css = read("style.css");
  const script = read("script.js");
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  assert(duplicateIds.length === 0, `Duplicate HTML IDs: ${duplicateIds.join(", ")}`);
  assert(html.includes('href="style.css"'), "index.html does not load local style.css");
  assert(html.includes('src="script.js"'), "index.html does not load local script.js");
  assert(!/https?:\/\//i.test(html), "index.html contains an unexpected external URL");

  for (const match of html.matchAll(/\b(?:aria-describedby|aria-labelledby)="([^"]+)"/g)) {
    for (const reference of match[1].trim().split(/\s+/)) {
      assert(ids.includes(reference), `ARIA references missing ID: ${reference}`);
    }
  }

  const reactionIds = [...script.matchAll(/\bid: "([^"]+)"/g)].map((match) => match[1]);
  assert(reactionIds.length === 10, `Expected 10 reactions, found ${reactionIds.length}`);
  assert(new Set(reactionIds).size === 10, "Reaction IDs must be unique");
  reactionIds.forEach((id) => {
    assert(css.includes(`[data-reaction="${id}"]`), `Missing CSS state for reaction: ${id}`);
  });
  assert(css.includes("@media (prefers-reduced-motion: reduce)"), "Reduced-motion support is missing");

  let depth = 0;
  let quote = null;
  let comment = false;
  for (let index = 0; index < css.length; index += 1) {
    const character = css[index];
    const next = css[index + 1];
    if (!quote && !comment && character === "/" && next === "*") {
      comment = true;
      index += 1;
      continue;
    }
    if (comment && character === "*" && next === "/") {
      comment = false;
      index += 1;
      continue;
    }
    if (comment) continue;
    if ((character === '"' || character === "'") && css[index - 1] !== "\\") {
      quote = quote === character ? null : quote || character;
    }
    if (quote) continue;
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    assert(depth >= 0, "CSS contains an unexpected closing brace");
  }
  assert(depth === 0 && !quote && !comment, "CSS contains an unclosed block, string, or comment");

  return script;
}

function createClassList() {
  const values = new Set();
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    toggle: (name, force) => (force ? values.add(name) : values.delete(name)),
    contains: (name) => values.has(name),
  };
}

function createNode() {
  const listeners = {};
  const attributes = {};
  return {
    listeners,
    attributes,
    classList: createClassList(),
    dataset: {},
    style: { setProperty: () => {}, removeProperty: () => {} },
    textContent: "",
    value: "",
    addEventListener: (type, callback) => { listeners[type] = callback; },
    setAttribute: (name, value) => { attributes[name] = value; },
    focus: () => {},
  };
}

function verifyInteraction(script) {
  class FakeElement {}
  class FakeInput extends FakeElement {}
  class FakeTextArea extends FakeElement {}

  const nodes = Object.fromEntries(
    ["app", "computer", "screen", "message", "power", "keyboard", "keyboardStatus", "count", "status", "sound", "soundLabel", "reset", "alarm"]
      .map((name) => [name, createNode()]),
  );
  const meter = Array.from({ length: 8 }, createNode);
  const selectors = new Map([
    ["#app", nodes.app], [".computer", nodes.computer], ["#screen", nodes.screen],
    ["#screenMessage", nodes.message], ["#powerButton", nodes.power], ["#keyboard", nodes.keyboard],
    ["#keyboardStatus", nodes.keyboardStatus], ["#attemptCount", nodes.count],
    ["#statusAnnouncement", nodes.status], ["#soundToggle", nodes.sound],
    ["#soundLabel", nodes.soundLabel], ["#resetButton", nodes.reset], ["#alarmTime", nodes.alarm],
  ]);
  const documentListeners = {};
  let timer = 0;
  let clock = 0;
  const context = vm.createContext({
    Date,
    HTMLInputElement: FakeInput,
    HTMLTextAreaElement: FakeTextArea,
    Intl,
    Math,
    document: {
      querySelector: (selector) => selectors.get(selector),
      querySelectorAll: (selector) => (selector === ".attempt-meter span" ? meter : []),
      addEventListener: (type, callback) => { documentListeners[type] = callback; },
    },
    performance: { now: () => (clock += 250) },
    window: {
      setTimeout: () => (timer += 1),
      clearTimeout: () => {},
      AudioContext: undefined,
      webkitAudioContext: undefined,
    },
  });

  vm.runInContext(script, context, { filename: "script.js" });
  assert(nodes.count.textContent === "0 / 8", "Initial attempt count is incorrect");

  let prevented = false;
  documentListeners.keydown({
    key: "w",
    repeat: false,
    target: { isContentEditable: false },
    preventDefault: () => { prevented = true; },
  });
  assert(prevented, "The W keyboard shortcut does not prevent its default action");

  const seen = new Set([nodes.computer.dataset.reaction]);
  nodes.keyboard.listeners.click();
  seen.add(nodes.computer.dataset.reaction);
  for (let attempt = 3; attempt <= 7; attempt += 1) {
    nodes.power.listeners.click();
    seen.add(nodes.computer.dataset.reaction);
    assert(nodes.count.textContent === `${attempt} / 8`, `Attempt ${attempt} was not tracked`);
  }
  assert(seen.size === 7, "A reaction repeated before the seventh attempt");

  nodes.power.listeners.click();
  assert(nodes.computer.dataset.reaction === "awake", "The computer did not wake on attempt eight");
  assert(nodes.message.textContent === "Fine. I’m awake.", "The final message is incorrect");
  assert(nodes.app.classList.contains("is-awake"), "The final app state is missing");

  nodes.reset.listeners.click();
  assert(nodes.count.textContent === "0 / 8", "Reset did not clear attempts");
  assert(nodes.computer.dataset.reaction === "idle", "Reset did not restore sleep");

  nodes.sound.listeners.click();
  assert(nodes.sound.attributes["aria-pressed"] === "false", "Sound toggle state is incorrect");
  assert(nodes.soundLabel.textContent === "Sound off", "Sound toggle label is incorrect");
}

try {
  const script = verifyStaticContracts();
  verifyInteraction(script);
  console.log("FiveMoreMinutes production verification passed.");
  console.log("Checked files, syntax, HTML/ARIA, CSS, 10 reactions, inputs, attempt 8, reset, and sound.");
} catch (error) {
  console.error(`Verification failed: ${error.message}`);
  process.exitCode = 1;
}
