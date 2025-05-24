<script>
  import { onMount } from "svelte";

  export let lines = [];
  export let prompt = "Lambda-3>";
  export let baseSpeed = 30;

  let displayedLines = [];
  let cursorVisible = true;
  let isTyping = false;

  function optimizeParts(parts) {
    return parts.reduce((acc, part) => {
      const last = acc[acc.length - 1];
      const key = `${part.class || ""}|${part.animation || ""}|${part.speed || baseSpeed}`;

      if (last && last.key === key) {
        last.text += part.text;
      } else {
        acc.push({
          text: part.text,
          class: part.class || "",
          animation: part.animation || "",
          speed: part.speed || baseSpeed,
          key: key,
        });
      }
      return acc;
    }, []);
  }

  async function typeText() {
    isTyping = true;

    for (const line of lines) {
      const optimizedParts = optimizeParts(line.parts);
      const newLine = { parts: [] };
      displayedLines = [...displayedLines, newLine];

      for (const part of optimizedParts) {
        if (part.animation === "typewriter" || !part.animation) {
          for (let i = 0; i < part.text.length; i++) {
            await new Promise((resolve) => setTimeout(resolve, part.speed));
            newLine.parts = [
              ...newLine.parts.filter((p) => p.key !== part.key),
              {
                ...part,
                displayText: part.text.slice(0, i + 1),
              },
            ];
            displayedLines = displayedLines;
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, part.speed));
          newLine.parts = [
            ...newLine.parts,
            {
              ...part,
              displayText: part.text,
            },
          ];
          displayedLines = displayedLines;
        }
      }

      if (line.delayAfter) {
        await new Promise((resolve) => setTimeout(resolve, line.delayAfter));
      }
    }

    isTyping = false;
  }

  onMount(() => {
    const cursorInterval = setInterval(() => {
      cursorVisible = !cursorVisible;
    }, 500);

    typeText();

    return () => clearInterval(cursorInterval);
  });
</script>

<div class="terminal bg-zinc-900">
  <div class="scanlines"></div>

  <div class="terminal-output">
    {#each displayedLines as line}
      <div class="terminal-line">
        <span class="prompt text-violet-400">{prompt}</span>
        {#each line.parts as part}
          <span
            class="part {part.class}"
            class:animate-pulse={part.animation === "pulse"}
            class:animate-blink={part.animation === "blink"}
          >
            {part.displayText}
          </span>
        {/each}
      </div>
    {/each}

    <div class="cursor-line">
      <span class="prompt">{prompt}</span>
      <span class="cursor" class:invisible={!cursorVisible || isTyping}>_</span>
    </div>
  </div>
</div>

<style>
  .terminal {
    position: relative;
    border: 1px solid rgba(74, 222, 255, 0.4);
    box-shadow:
      0 0 8px rgba(74, 222, 255, 0.6),
      inset 0 0 10px rgba(0, 0, 0, 0.8);
    overflow: hidden;
    font-family: "Courier New", monospace;
    padding: 1rem;
    animation: pulse-glow 3s ease-in-out infinite;
    font-size: 0.875rem;
    /* color: #67e8f9; */
  }

  .terminal::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse at center,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.5) 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      box-shadow:
        0 0 8px rgba(74, 222, 255, 0.6),
        inset 0 0 10px rgba(0, 0, 0, 0.8);
    }
    50% {
      box-shadow:
        0 0 16px rgba(74, 222, 255, 0.8),
        inset 0 0 12px rgba(0, 0, 0, 0.6);
    }
  }

  .terminal-output {
    margin: 0;
    padding: 0;
    animation: crt-flicker 10s linear infinite;
  }

  @keyframes crt-flicker {
    0%,
    100% {
      opacity: 1;
    }
    2%,
    60%,
    64%,
    68% {
      opacity: 0.95;
    }
    3%,
    61%,
    65%,
    69% {
      opacity: 0.85;
    }
  }

  .terminal-line {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 0;
    min-height: 1em;
    white-space: pre-wrap;
    word-break: keep-all;
  }

  .part {
    display: inline;
    white-space: pre;
    margin: 0;
    padding: 0;
  }

  .prompt {
    display: inline;
    margin-right: 0.5em;
  }

  .cursor-line {
    display: flex;
    align-items: center;
    height: 1em;
  }

  .cursor {
    display: inline;
    animation: blink 1s step-end infinite;
  }

  .cursor.invisible {
    opacity: 0;
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }

  .animate-blink {
    animation: blink-fast 0.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes blink-fast {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  .scanlines {
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.2) 50%,
      transparent 100%
    );
    background-size: 100% 4px;
    animation: scan 0.1s linear infinite;
    pointer-events: none;
    z-index: 2;
    /* mix-blend-mode: overlay; */
    mix-blend-mode: screen;
  }

  @keyframes scan {
    from {
      background-position: 0 0;
    }
    to {
      background-position: 0 4px;
    }
  }
</style>
