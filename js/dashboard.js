// d:\Coding Files\CoffeeBot\CoffeeBot\js\dashboard.js
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const dashboardContainer = document.querySelector('.dashboard-container');
    const initialSection = document.getElementById('initial-section');

    // Focus on input when page loads
    userInput.focus();

    // Main function to handle sending messages
    function handleSend() {
        const text = userInput.value.trim();
        
        if (text === "") return;

        // 1. Transition UI State (if this is the first message)
        if (!dashboardContainer.classList.contains('chat-active')) {
            dashboardContainer.classList.add('chat-active');
            initialSection.classList.add('hidden');
            chatHistory.classList.add('visible');
        }

        // 2. Add User Message
        addMessage(text, 'user');
        userInput.value = ''; // Clear input

        // 3. Simulate AI "Thinking"
        const loadingId = showLoadingDots();

        // 4. Simulate AI Response (Dummy Script)
        setTimeout(() => {
            removeLoadingDots(loadingId);
            const response = getDummyResponse(text);
            addMessage(response, 'ai');
        }, 1500); // 1.5 second delay for realism
    }

    // Function to add a message bubble to the DOM
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message', 'animate-entry');

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        contentDiv.textContent = text;

        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
        scrollToBottom();
    }

    // Function to show loading dots
    function showLoadingDots() {
        const id = 'loading-' + Date.now();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'ai-message');
        messageDiv.id = id;

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content', 'dots'); // 'dots' class triggers CSS animation
        
        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
        scrollToBottom();
        return id;
    }

    // Function to remove loading dots
    function removeLoadingDots(id) {
        const element = document.getElementById(id);
        if (element) element.remove();
    }

    // Helper to keep chat scrolled to bottom
    function scrollToBottom() {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Dummy Response Generator (Experimentation Script)
    function getDummyResponse(input) {
        const lowerInput = input.toLowerCase();
        
        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            return "Hello! I'm your Coffee Bot. Ready to brew something special?";
        } else if (lowerInput.includes('recipe')) {
            return "I can help with that! Are you looking for V60, Espresso, or French Press recipes?";
        } else if (lowerInput.includes('bean') || lowerInput.includes('roast')) {
            return "We have some excellent Ethiopian Yirgacheffe (Light Roast) in stock today.";
        } else if (lowerInput.includes('thank')) {
            return "You're welcome! Enjoy your coffee. ☕";
        } else {
            return "That sounds interesting! I'm still learning about coffee tastes. Could you tell me more about your favorite roast?";
        }
    }

    // Send Event Listeners
    sendBtn.addEventListener('click', handleSend);
    
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    
});
