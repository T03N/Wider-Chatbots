const slider = document.getElementById('widthSlider');
const valueDisplay = document.getElementById('widthValue');
const buttons = document.querySelectorAll('.presets button');
const toggleSwitch = document.getElementById('enableToggle');
const controlsDiv = document.getElementById('controls');
const presetsDiv = document.getElementById('presets');

let currentWidth = 1000;
let isEnabled = true;

// Grab saved settings
chrome.storage.sync.get(['chatWidth', 'isEnabled'], (result) => {
    currentWidth = result.chatWidth || 1000;
    isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    
    slider.value = currentWidth;
    valueDisplay.textContent = currentWidth;
    toggleSwitch.checked = isEnabled;
    updateUI();
});

function updateUI() {
    slider.disabled = !isEnabled;
    buttons.forEach(btn => btn.disabled = !isEnabled);
    controlsDiv.style.opacity = isEnabled ? '1' : '0.4';
    presetsDiv.style.opacity = isEnabled ? '1' : '0.4';
}

// Update tab preview instantly
function updateLivePreview() {
    valueDisplay.textContent = currentWidth;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { 
                action: 'updateSettings', 
                width: currentWidth, 
                isEnabled: isEnabled 
            }).catch(() => {});
        }
    });
}

// Save and sync with other tabs
function saveSettings() {
    chrome.storage.sync.set({ chatWidth: currentWidth, isEnabled: isEnabled });

    
    chrome.tabs.query({ url: ["*://gemini.google.com/*", "*://chatgpt.com/*"] }, (tabs) => {
        tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, { 
                action: 'updateSettings', 
                width: currentWidth, 
                isEnabled: isEnabled 
            }).catch(() => {}); 
        });
    });
}

// Toggle power
toggleSwitch.addEventListener('change', (e) => {
    isEnabled = e.target.checked;
    updateUI();
    updateLivePreview();
    saveSettings();
});

// Live slider preview
slider.addEventListener('input', (e) => {
    currentWidth = e.target.value;
    updateLivePreview(); 
});

// Save on slider release
slider.addEventListener('change', (e) => {
    currentWidth = e.target.value;
    saveSettings();
});

// Handle presets
buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (!isEnabled) return;
        currentWidth = e.target.getAttribute('data-width');
        slider.value = currentWidth;
        updateLivePreview();
        saveSettings();
    });
});