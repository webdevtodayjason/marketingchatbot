(function() {
    // CSS for the chat widget
    const css = `
        #chatbot-widget-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 300px;
            height: 400px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-radius: 10px;
            overflow: hidden;
            z-index: 1000;
            display: none;
            flex-direction: column;
            font-family: Arial, sans-serif;
        }

        #chatbot-header {
            background-color: #0052cc;
            color: white;
            padding: 10px;
            cursor: pointer;
        }

        #chatbot-messages {
            flex-grow: 1;
            padding: 10px;
            overflow-y: auto;
            background: #f9f9f9;
        }

        #chatbot-input-container {
            display: flex;
            padding: 10px;
            background: #fff;
            border-top: 1px solid #ccc;
        }

        #chatbot-input {
            flex-grow: 1;
            padding: 8px;
            margin-right: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        #chatbot-send-btn {
            padding: 8px 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        #chatbot-minimize {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background-color: #0052cc;
            color: white;
            border-radius: 25px;
            text-align: center;
            line-height: 50px;
            font-size: 24px;
            cursor: pointer;
            z-index: 1000;
        }
    `;

    // Add CSS to the page
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // HTML for the chat widget
    const chatHtml = `
        <div id="chatbot-header">Chat with Us!</div>
        <div id="chatbot-messages"></div>
        <div id="chatbot-input-container">
            <input type="text" id="chatbot-input" placeholder="Type a message..." />
            <button id="chatbot-send-btn">Send</button>
        </div>
    `;

    // Create the chat widget container
    const chatContainer = document.createElement("div");
    chatContainer.id = "chatbot-widget-container";
    chatContainer.innerHTML = chatHtml;
    document.body.appendChild(chatContainer);

    // Create the minimize button
    const minimizeButton = document.createElement("div");
    minimizeButton.id = "chatbot-minimize";
    minimizeButton.innerHTML = '<i class="fas fa-comment-dots"></i>'; // Using Font Awesome icon
    document.body.appendChild(minimizeButton);

    // Function to toggle the chat window
    function toggleChat() {
        const chatWidget = document.getElementById("chatbot-widget-container");
        if (chatWidget.style.display === "none") {
            chatWidget.style.display = "flex";
            minimizeButton.style.display = "none";
        } else {
            chatWidget.style.display = "none";
            minimizeButton.style.display = "block";
        }
    }

    // Event listeners
    document.getElementById("chatbot-header").addEventListener("click", toggleChat);
    minimizeButton.addEventListener("click", toggleChat);

    // Send message to the server and append to messages
    async function sendMessage() {
        const inputField = document.getElementById("chatbot-input");
        const userText = inputField.value;
        inputField.value = "";

        if (userText.trim()) {
            appendMessage("User", userText);
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userText, messages: [{ role: "user", text: userText }] }),
            });

            if (response.ok) {
                const data = await response.json();
                appendMessage("Bot", data.response);
            } else {
                appendMessage("Bot", "Sorry, I can't respond at the moment.");
            }
        }
    }

    // Append messages to the chat window
    function appendMessage(sender, message) {
        const messagesContainer = document.getElementById("chatbot-messages");
        const messageDiv = document.createElement("div");
        messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Send button listener
    document.getElementById("chatbot-send-btn").addEventListener("click", sendMessage);
    document.getElementById("chatbot-input").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    // Initially show the minimize button
    minimizeButton.style.display = "block";
})();