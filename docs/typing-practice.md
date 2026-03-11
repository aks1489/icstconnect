# Typing Practice Documentation

## Overview
The Typing Practice module acts as a fully distinct, immersive experience located at `/typing-practice`. It simulates a modern, clean code-typing or gaming environment, removing standard navigation components to focus user attention entirely on the text input. 

## Features
- **Dynamic 3-Line Text Rendering**: The typing view limits the display to 3 lines of text simultaneously. Once a user types past the visible top line, the text block smoothly shifts up. This keeps focus anchored in the middle of the screen.
- **Competition Progression System**:
  - Contains four test levels: `10s`, `20s`, `60s`, and `90s`.
  - The `10s` level is unlocked by default. Subsequent levels unlock securely through completing the preceding level and achieving strict target metrics:
    - **Minimum WPM Target**: `10 WPM`
    - **Minimum Accuracy Target**: `95%`
  - Unlocked progress persists securely in browser `localStorage`.
- **Custom Typing Engine (`useTypingEngine`)**:
  - Handles the complex logic mapping user keystrokes into correct/incorrect character evaluations.
  - Automatically fetches supplementary word data randomly to supply an endless stream of words while typing.
  - Exposes robust data points to consumers including Net WPM, live countdown timer, accuracy calculations, errors, and pure total keystrokes.

## File Architecture
- `src/pages/TypingPractice.tsx`: The standalone wrapper component. Manages localStorage persistence logic, locking/unlocking states, and the top-level competition UI (selection header).
- `src/components/typing/TypingTest.tsx`: The view renderer. Consumes stats from the core engine hook, evaluates keystroke colors (red for errors, standard for success), generates the "Success/Failure" stats banner conditionally, and physically handles the line-height scrolling animation for the 3-line view.
- `src/components/typing/useTypingEngine.ts`: The state hook. Stores timestamps, calculates real-time variables, interprets `KeyboardEvent` inputs securely across different contexts (ignoring modifiers, disabling space scrolling, processing backspaces, etc.).

## Visual Flow
1. **Waiting State**: Text is muted, the caretaker cursor blinks on the first character.
2. **Start State**: When any acceptable keystroke begins, the live timer decrements from the total allocated duration. Mistakes are highlighted natively.
3. **Finished State**: Once duration zeroes out, a visual stats breakdown pops upwards showing net performance, pass/failure metrics against benchmarks, and a button to replay or hit the next level.
