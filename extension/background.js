chrome.action.onClicked.addListener(async (tab) => {
    try {
      // Inject the content script programmatically
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Send message to content script
      chrome.tabs.sendMessage(tab.id, { action: "captureContent" });
    } catch (err) {
      console.error('Failed to execute content script:', err);
    }
  });