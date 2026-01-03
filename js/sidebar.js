// d:\Coding Files\CoffeeBot\CoffeeBot\js\dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const newChatBtn = document.getElementById('new-chat-btn');
    const dashboardContainer = document.querySelector('.dashboard-container');
    const initialSection = document.getElementById('initial-section');
    const chatHistory = document.getElementById('chat-history');
    const userInput = document.getElementById('user-input');
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    const themeToggle = document.getElementById('theme-toggle');
    
    // New Chat Functionality
    newChatBtn.addEventListener('click', () => {
        dashboardContainer.classList.remove('chat-active');
        initialSection.classList.remove('hidden');
        chatHistory.classList.remove('visible');
        chatHistory.innerHTML = ''; // Clear chat history
        userInput.value = '';
        userInput.focus();
    });

    
    // Move modal to body to ensure it sits on top of everything (fixes z-index stacking)
    document.body.appendChild(settingsModal);

    // Settings Modal Logic
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Close modal when clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.add('hidden');
        }
    });

    // Dark Mode Toggle
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
    });
});
