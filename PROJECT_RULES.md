# Project Rules & Manifest

## UI/UX & Performance Rules

### 1. Prevent Full Re-renders on Data Updates
**Rule:** When a user performs an action (adding, editing, deleting) that requires a data refresh, **NEVER** trigger a full-page loading state (e.g., `setLoading(true)`) that unmounts the main content.

**Why:**
-   It destroys the DOM and resets the scroll position to the top.
-   It causes a jarring "flash" for the user.
-   It disrupts the user's workflow.

**Implementation:**
-   **Initial Load:** Use `setLoading(true)` only for the initial component mount (e.g., inside `useEffect`).
-   **Updates:** Pass a flag (e.g., `isBackground: true`) to your fetch function.
    -   `fetchData(isBackground = false)`
    -   `if (!isBackground) setLoading(true)`
-   **Optimistic Updates:** Where possible, update the local state immediately (optimistically) while the background fetch syncs with the server.

### 2. Feedback Loops
-   Use inline loading indicators (e.g., inside the "Save" button) instead of global loaders.
-   Disable form inputs during submission to prevent conflicting edits.

## Code Style
-   **Facebook-like Updates:** Prioritize "silently" updating the feed/list without refreshing the entire page.
