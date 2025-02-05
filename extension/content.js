async function capturePageContent() {
    const pageContent = {
      url: window.location.href,
      title: document.title,
      text: document.body.innerText,
      html: document.documentElement.outerHTML,
      timestamp: new Date().toISOString()
    };

    console.log('Captured page content:', pageContent);
  
    try {
      const response = await fetch('http://127.0.0.1:5000/extension/content/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageContent)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Success:', data);
      
      // Create and show notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        background-color: #4CAF50;
        color: white;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      notification.textContent = 'Content captured successfully!';
      document.body.appendChild(notification);
      
      // Remove notification after 3 seconds
      setTimeout(() => {
        notification.remove();
      }, 3000);
  
    } catch (error) {
      console.error('Error:', error);
      
      // Show error notification
      const errorNotification = document.createElement('div');
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px;
        background-color: #f44336;
        color: white;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      `;
      errorNotification.textContent = 'Error capturing content. Please try again.';
      document.body.appendChild(errorNotification);
      
      // Remove error notification after 3 seconds
      setTimeout(() => {
        errorNotification.remove();
      }, 3000);
    }
  }
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureContent") {
      capturePageContent();
    }
    return true; // Indicates async response
  });