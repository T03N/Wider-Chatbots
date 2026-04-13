const styleId = 'wider-chatbots-style';

function injectStyles() {
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            :root {
                --custom-chat-width: 1000px;
            }
            
// Gemini stuff
            body.wider-chatbots-on .conversation-container,
            body.wider-chatbots-on .chat-container,
            body.wider-chatbots-on .input-area-container,
            body.wider-chatbots-on input-container,
            body.wider-chatbots-on upload-card,
            body.wider-chatbots-on .upload-card,
            body.wider-chatbots-on [class*="drop-zone"],
            body.wider-chatbots-on [class*="drag-over"],
            body.wider-chatbots-on .mat-menu-panel {
                max-width: var(--custom-chat-width) !important;
                margin-left: auto !important;
                margin-right: auto !important;
                transition: max-width 0.1s ease-out;
            }

            body.wider-chatbots-on .conversation-container user-query {
                max-width: 100% !important;
            }

// ChatGPT stuff
// Override ChatGPT vars
            body.wider-chatbots-on, 
            body.wider-chatbots-on * {
                --thread-content-max-width: var(--custom-chat-width) !important;
            }

            body.wider-chatbots-on .agent-turn,
            body.wider-chatbots-on [class*="max-w-(--thread-content-max-width)"],
            body.wider-chatbots-on [class*="max-w-[48rem]"],
            body.wider-chatbots-on [class*="max-w-[40rem]"],
            body.wider-chatbots-on form {
                max-width: var(--custom-chat-width) !important;
                transition: max-width 0.1s ease-out;
            }
        `;
        document.head.appendChild(style);
    }
}

function updateSettings(width, isEnabled) {
    document.documentElement.style.setProperty('--custom-chat-width', `${width}px`);
    
    if (isEnabled) {
        document.body.classList.add('wider-chatbots-on');
    } else {
        document.body.classList.remove('wider-chatbots-on');
    }
}

// Startup logic
chrome.storage.sync.get(['chatWidth', 'isEnabled'], (result) => {
    injectStyles();
    const width = result.chatWidth || 1000;
    const isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    updateSettings(width, isEnabled);
});

// Handle popup messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateSettings') {
        updateSettings(request.width, request.isEnabled);
        sendResponse({ success: true });
    }
});