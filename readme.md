# Reflect - Text Yourself & Journal

Reflect is a mobile-first Progressive Web Application (PWA) designed for self-dialogue, perspective-taking, and organized journaling. It combines a two-sided chat interface for thinking through thoughts interactively with a structured document system for traditional reflection.

Try it here: https://sofamr.github.io/self-reflection-app/
---

## Features

### Dual-Voice Self-Chat

* **Two Perspectives**: Switch between Voice 1 (left side) and Voice 2 (right side) to dialogue with yourself, weigh decisions, or play devil's advocate.


* **Automatic Voice Alternation**: An optional toggle automatically swaps voices after sending a message to maintain momentum.


* **Custom Chat Geometry**: Dynamically computed SVG speech bubbles adjust to variable content lengths while maintaining consistent corner fins.


* **Conversation Management**: Create new reflections, search message histories, rename chats, and export conversations to Markdown.



### Hierarchical Journal Library

* **Structured Organization**: Organize long-form entries using a three-tier system: `Folders -> Notebooks -> Entries`.


* **Single-View Workflow**: Seamlessly swaps the chat container for the journal view without leaving the primary interface.


* **Inline Actions**: Dedicated menus on folders, notebooks, and entries allow you to rename or delete items at each level.


* **Auto-Saving**: Entry titles and text contents save locally in real-time as you write.



### Customization & Settings

* **Dark / Light Appearance**: Manual toggle or system-preference detection with persistent local state.


* **Font Selection**: Switch between system Inter, Cantarell, and Alata.


* **Message Alignment**: Set bubble text alignment to left, center, or right.


* **Color Schemes**: Choose from multiple curated palettes:
* Emerald Ocean
* Sunset Coral
* Violet Indigo
* Rose Amber





### Offline & Storage

* **Local-First Storage**: All chats, settings, folders, and notebooks persist via the browser's `localStorage` API.


* **PWA & Offline Capable**: Includes a web app manifest and Service Worker registration for installability and offline use.



---

## Tech Stack

* **Markup**: HTML5


* **Styling**: Tailwind CSS (CDN) + Custom CSS variables (`styles.css`)


* **Typography**: Google Fonts (Inter, Cantarell, Alata)


* **Logic & State**: Vanilla JavaScript (ES6+)


* **Icons**: Inline SVGs



---

## File Structure

```text
reflect/
├── index.html        # App shell, views, modals, and header controls
├── styles.css        # Custom CSS variables, safe-area padding, bubble styles
├── app.js            # Core application state, view switching, and data logic
├── manifest.json     # Web App Manifest for mobile installation
├── sw.js             # Service Worker for offline caching
├── favicon.png       # App icon / favicon
└── icon-192.png      # PWA home screen icon

```

---

## Getting Started

Because Reflect runs entirely in vanilla JavaScript and uses CDN dependencies, it does not require a build step or dependency installations.

### Prerequisites

A modern browser (Chrome, Safari, Firefox, or Edge) with JavaScript and LocalStorage enabled.

### Running Locally

1. Clone or download the repository files into a directory:
```bash
git clone <repository-url>
cd reflect

```


2. Serve the directory with any local static HTTP server (required for Service Worker registration):
```bash
# Using Python 3:
python3 -m http.server 8000

# Or using Node.js:
npx serve .

```


3. Open your browser and navigate to `http://localhost:8000`.

---

## Usage Guide

### Using the Chat Interface

1. Tap the **New Reflection** button on the home screen to open a fresh thread.


2. Use the toggle switch next to the text input to set your active perspective (Voice 1 / Voice 2).


3. Type your thought and tap the arrow button or press Enter to submit.


4. Tap the title in the top bar to rename the conversation, or tap the three-dot menu to copy your conversation as Markdown.



### Accessing the Journal

1. Tap the **Book** icon in the header to open the Journal Library inside the current view.


2. Select **+ New Folder** to group your notes.


3. Open a folder and click **+ New Notebook**.


4. Open a notebook to create, edit, or delete individual entries.


5. Tap the **Book** icon again at any point to toggle back to your active chat.



### Adjusting Preferences

1. Tap the **Settings** (gear) icon in the top navigation bar.


2. Configure your preferred theme mode, voice switching behavior, typography, bubble alignment, or theme colors.


3. All preferences are applied immediately and saved locally.



---

## License

This project is open source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
