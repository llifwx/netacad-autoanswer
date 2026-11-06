// Runs only on hotkey / popup button; nothing is auto-processed or injected.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "processPage" || !document.querySelector("app-root")) return false;
  if (request.showAnswers === false) {
    sendResponse({ success: true, result: false });
    return false;
  }
  scrapeData()
    .then((result) => sendResponse({ success: true, result }))
    .catch((e) => sendResponse({ success: false, error: String(e) }));
  return true;
});
