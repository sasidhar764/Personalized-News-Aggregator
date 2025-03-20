import React, { useState, useEffect, useRef } from 'react';
import './chatbot.css';

const NewsChatBot = ({ newsData }) => {
  const user = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };
  const username = user.username;

  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages
      ? JSON.parse(savedMessages)
      : [{ text: `Hello ${username}! How may I assist you with news today? Specific categories or trending topics you're interested in?`, sender: 'bot' }];
  });
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesRef = useRef(null);

  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    setMessages((prev) => [...prev, { text: trimmedInput, sender: 'user' }]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/news/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          context: { username }, // Only sending username in context
          preferredModel: 'huggingface',
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const botResponse = data.response?.trim() || "Sorry, I couldn't fetch a clear answer. Try asking differently!";
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: botResponse, sender: 'bot' }]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error in NewsChatBot:', error);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { text: "Oops! Something went wrong. Please try again later.", sender: 'bot', error: true },
        ]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleResetChat = () => {
    const defaultMessage = [{ text: `Hello ${username}! How may I assist you with news today? Specific categories or trending topics you're interested in?`, sender: 'bot' }];
    setMessages(defaultMessage);
    localStorage.removeItem('chatMessages'); // Clear chat messages from local storage
  };  

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>News Assistant</h3>
        <div>
          <button className="reset-chat-button" onClick={handleResetChat}>Reset Chat</button>
        </div>
      </div>
      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender} ${message.error ? 'error' : ''}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && (
          <div className="message bot loading">
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
            <span className="loading-dot"></span>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Ask me about the news..."
          className="chat-input"
          disabled={isLoading}
        />
        <button type="submit" className={`send-button ${isLoading ? 'disabled' : ''}`} disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default NewsChatBot;