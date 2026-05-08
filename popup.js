const slider = document.getElementById('widthSlider');
const valueDisplay = document.getElementById('widthValue');
const buttons = document.querySelectorAll('.presets button');
const toggleSwitch = document.getElementById('enableToggle');
const controlsDiv = document.getElementById('controls');
const presetsDiv = document.getElementById('presets');

// Settings UI elements
const settingsBtn = document.getElementById('settingsBtn');
const mainView = document.getElementById('mainView');
const settingsPanel = document.getElementById('settingsPanel');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const btnPreset1 = document.getElementById('btnPreset1');
const btnPreset2 = document.getElementById('btnPreset2');
const btnPreset3 = document.getElementById('btnPreset3');

const preset1Name = document.getElementById('preset1Name');
const preset1Width = document.getElementById('preset1Width');
const preset2Name = document.getElementById('preset2Name');
const preset2Width = document.getElementById('preset2Width');
const preset3Name = document.getElementById('preset3Name');
const preset3Width = document.getElementById('preset3Width');

let currentWidth = 1000;
let isEnabled = true;
let presets = [
    { name: 'Narrow', width: 800 },
    { name: 'Wide', width: 1200 },
    { name: 'Ultra', width: 1500 }
];

// Grab saved settings
chrome.storage.sync.get(['chatWidth', 'isEnabled', 'presets'], (result) => {
    currentWidth = result.chatWidth || 1000;
    isEnabled = result.isEnabled !== undefined ? result.isEnabled : true;
    if (result.presets && result.presets.length === 3) {
        presets = result.presets;
    }

    slider.value = currentWidth;
    valueDisplay.textContent = currentWidth;
    toggleSwitch.checked = isEnabled;
    applyPresets();
    updateUI();
});

function applyPresets() {
    btnPreset1.textContent = presets[0].name;
    btnPreset1.setAttribute('data-width', presets[0].width);

    btnPreset2.textContent = presets[1].name;
    btnPreset2.setAttribute('data-width', presets[1].width);

    btnPreset3.textContent = presets[2].name;
    btnPreset3.setAttribute('data-width', presets[2].width);
}

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
            }).catch(() => { });
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
            }).catch(() => { });
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

// Settings Panel Logic
settingsBtn.addEventListener('click', () => {
    preset1Name.value = presets[0].name;
    preset1Width.value = presets[0].width;
    preset2Name.value = presets[1].name;
    preset2Width.value = presets[1].width;
    preset3Name.value = presets[2].name;
    preset3Width.value = presets[2].width;

    mainView.classList.add('hidden');
    settingsPanel.classList.remove('hidden');
});

cancelSettingsBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
    mainView.classList.remove('hidden');
});

saveSettingsBtn.addEventListener('click', () => {
    presets[0] = { name: preset1Name.value || 'Narrow', width: parseInt(preset1Width.value) || 800 };
    presets[1] = { name: preset2Name.value || 'Wide', width: parseInt(preset2Width.value) || 1200 };
    presets[2] = { name: preset3Name.value || 'Ultra', width: parseInt(preset3Width.value) || 1500 };

    chrome.storage.sync.set({ presets: presets }, () => {
        applyPresets();
        settingsPanel.classList.add('hidden');
        mainView.classList.remove('hidden');
    });
});