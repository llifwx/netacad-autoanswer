![ccnap_resize](https://github.com/user-attachments/assets/0cb6200c-c304-42fa-ad0f-fa68fa0c4fac)

# NetAcad Assistant

NetAcad Assistant is a browser extension for Cisco NetAcad. Press a hotkey and it sends the question currently on screen to Google Gemini AI, then briefly shows the suggested answer as a small, faded note in the corner of the page.

> Fork of [vbatecan/netacad-autoanswer](https://github.com/vbatecan/netacad-autoanswer).

## What Does It Do?
- **On demand only:** nothing happens until you press the hotkey (or the popup button). No auto-processing on page load or question switch.
- **One request per question:** sends only the question you're looking at (the most visible one on the page).
- **Discreet answer:** shows the answer as tiny, faint gray text in the bottom-right corner for ~7 seconds, then fades out. A new answer replaces the previous one; it doesn't block clicks or change the page layout.
- **Supports** single-answer, multi-answer (checkbox) and matching questions. Multiple answers are shown one per line.

## How to Install and Use
1. **Clone or download** this repository.
2. **Get a Google Gemini API key** at [Google AI Studio](https://aistudio.google.com/app/apikey).
3. **Load the extension in Chrome:**
   - Go to `chrome://extensions/`.
   - Enable "Developer mode" (top right).
   - Click "Load unpacked" and select the project folder.
4. **Configure:** click the extension icon, enter your API key, pick a model and click **Save**. The popup is compact and follows your system light/dark theme.
5. **Use on NetAcad:** open a quiz and press **Alt+Z** (or click **Run** in the popup). The answer appears in the bottom-right corner.

Status marks in the corner: `!` = API error (details in the page console), `?` = the question couldn't be read.

**Show answers** in the popup turns the extension off without uninstalling it.

### Hotkey not working?
Chrome applies the default hotkey only on first install, and silently skips it if the combination is already taken. Set it manually at `chrome://extensions/shortcuts` → **NetAcad Scraper → Process Questions on this Page**, then reload the quiz tab.

## Customization
In `ui.js`: `TOAST_MS` sets how long the answer stays on screen; the `showToast` styles control position, size, color and opacity.

## How It Works
- **background.js** listens for the hotkey and forwards it to the content scripts in the tab.
- **scraper.js** walks NetAcad's shadow DOM, picks the question with the largest visible area, extracts its text and options.
- **api.js** sends one Gemini request for that question.
- **ui.js** holds the extractors and the corner toast.

## API Key & Privacy
- Your Gemini API key is stored locally in your browser's extension storage and is sent only to the Google Gemini API.
- You can change or remove it at any time in the popup.

## License
MIT License. See [LICENSE](LICENSE) for details.
