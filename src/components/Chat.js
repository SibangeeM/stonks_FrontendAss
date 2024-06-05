import React, { useState, useEffect } from "react";
import data from "@emoji-mart/data"; // Importing emoji data

function Chat({ messages, setMessages, setIsChatOpen }) {
  const [message, setMessage] = useState(""); // State to hold the input message
  const [showEmojis, setShowEmojis] = useState(false); // State to toggle emoji picker display
  const [searchResults, setSearchResults] = useState([]); // Holds search results for emoji suggestions
  const [tagSuggestions, setTagSuggestions] = useState([]); // Holds user tag suggestions
  const [commandSuggestions, setCommandSuggestions] = useState([]); // Holds command suggestions

  // Array of predefined commands
  const commands = [
    { command: '/mute @user', description: 'Mute the user.' },
    { command: '/ban @user', description: 'Ban the user.' },
    { command: '/title set a title for the current stream', description: 'Set a stream title.' },
    { command: '/description set a description for the current stream', description: 'Set a stream description.' }
  ];

  // Effect to close chat on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsChatOpen(false); // Close the chat interface
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setIsChatOpen]);

  // Function to handle sending messages
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage("");
      setShowEmojis(false);
      setTagSuggestions([]);
      setCommandSuggestions([]);
    }
  };

  // Get the appropriate emoji character
  const getNativeEmoji = (emoji) => {
    return emoji.skins && emoji.skins.length > 0 && emoji.skins[0].native
      ? emoji.skins[0].native
      : "🚫";
  };

  // Add an emoji to the message
  const addEmoji = (emoji) => {
    const newText = message.replace(/:[a-zA-Z0-9_]+$/, getNativeEmoji(emoji)); // Replace the colon-coded emoji with the actual emoji
    setMessage(newText);
    setShowEmojis(false);
    setSearchResults([]);
  };

   // Handle input changes to provide real-time suggestions
  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    handleEmojiSuggestions(text); // Update emoji suggestions based on input
    handleTagSuggestions(text); // Update tag suggestions based on input
    handleCommandSuggestions(text);  // Update command suggestions based on input
  };

  // Function to suggest emojis based on input
  const handleEmojiSuggestions = (text) => {
    const emojiRegex = /:([a-zA-Z0-9_]+)$/;
    const match = text.match(emojiRegex);
    if (match && match[1]) {
      const searchTerm = match[1].toLowerCase();
      const filteredEmojis = Object.values(data.emojis).filter(
        emoji => emoji.name.toLowerCase().includes(searchTerm) ||
        (emoji.keywords &&
          emoji.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        )
      );
      setSearchResults(filteredEmojis);
      setShowEmojis(true);
    } else {
      setSearchResults([]);
      setShowEmojis(false);
    }
  };

  // Function to suggest tags based on input
  const handleTagSuggestions = (text) => {
    const tagRegex = /@([a-zA-Z0-9_]+)$/;  // Regex to identify tags
    const match = text.match(tagRegex);
    if (match) {
      fetch(`https://665621609f970b3b36c4625e.mockapi.io/users?search=${match[1]}`) // Fetch user data for tags
        .then(res => res.json())
        .then(data => {
          // Only set tag suggestions if data is an array
          setTagSuggestions(Array.isArray(data) ? data : []); // Update tag suggestions
        })
        .catch(err => {
          console.error('Fetch error:', err);
          setTagSuggestions([]);
        });
    } else {
      setTagSuggestions([]);
    }
  };

  // Function to suggest commands based on input
  const handleCommandSuggestions = (text) => {
    const commandRegex = /^\/(\w*)$/;
    const match = text.match(commandRegex);
    if (match) {
      const searchTerm = match[1].toLowerCase();
      setCommandSuggestions(commands.filter(command => command.command.startsWith('/' + searchTerm)));
    } else {
      setCommandSuggestions([]);
    }
  };

  // The return contains the main chat interface elements, including message display, input, emoji picker, and suggestions for tags and commands
  return (
    <div className="chat-container w-full h-full flex flex-col">
      {/* CSS styles for emoji picker, suggestions, and chat interface are defined here. */}
      <style>
        {`
          .emoji-search-results {
            position: absolute;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            padding: 5px;
            background-color: #f1f1f1;
            border: 1px solid #d3d3d3;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 300px;
            z-index: 1000;
            overflow-y: auto;
            max-height: 150px;
          }
          .emoji-btn {
            padding: 5px;
            font-size: 24px;
            background: none;
            border: none;
            cursor: pointer;
            outline: none;
          }
          .emoji-btn:hover {
            background-color: #e2e2e2;
          }
          .tag-suggestions, .command-suggestions {
            max-height: 150px;
            overflow-y: auto;
            background-color: #fff;
            border: 1px solid #d3d3d3;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          .suggestion, .command-item {
            padding: 8px;
            cursor: pointer;
          }
          .suggestion:hover, .command-item:hover {
            background-color: #e2e2e2;
          }
        `}
      </style>
      <div className="messages-container overflow-y-auto flex-1 bg-white border border-gray-300 rounded-lg p-4 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`message mb-2 last:mb-0 p-2 rounded ${msg.includes('@Domenica18') ? 'bg-gray-200' : 'bg-transparent'}`}>
            <div className="font-bold">Domenica18</div>
            <div>{msg}</div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 relative">
        <input type="text" placeholder="Type a message..." value={message} onChange={handleInputChange} className="flex-1 px-4 py-2 border border-gray-300 rounded" />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Send</button>
        <button type="button" onClick={() => setShowEmojis(!showEmojis)} className={`emoji-button px-4 py-2 rounded ${showEmojis ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`} aria-pressed={showEmojis} title="Toggle emoji picker">😀</button>
        {showEmojis && searchResults.length > 0 && (
          <div className="emoji-search-results bottom-full mb-2 w-full">
            {searchResults.map((emoji, index) => (
              <button key={index} onClick={() => addEmoji(emoji)} className="emoji-btn">{getNativeEmoji(emoji)}</button>
            ))}
          </div>
        )}
        {tagSuggestions.length > 0 && (
          <div className="tag-suggestions absolute bottom-full mb-2 w-full">
            {tagSuggestions.map(user => (
              <div key={user.id} onClick={() => setMessage(prev => `${prev.replace(/@[\w]+$/, `@${user.username}`)} `)} className="suggestion py-1 px-2 hover:bg-gray-100 cursor-pointer">@{user.username}</div>
            ))}
          </div>
        )}
        {commandSuggestions.length > 0 && (
          <div className="command-suggestions absolute bottom-full mb-2 w-full">
            {commandSuggestions.map((item, index) => (
              <div key={index} className="command-item py-1 px-2 hover:bg-gray-100 cursor-pointer">{item.command}</div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default Chat;
