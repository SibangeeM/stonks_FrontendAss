import React, { useState, useEffect, useRef } from "react";
import data from "@emoji-mart/data";

function Chat({ messages, setMessages, setIsChatOpen }) {
  const [message, setMessage] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [focusedEmojiIndex, setFocusedEmojiIndex] = useState(0);
  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [focusedTagIndex, setFocusedTagIndex] = useState(0);
  const [commandSuggestions, setCommandSuggestions] = useState([]);
  const [focusedCommandIndex, setFocusedCommandIndex] = useState(0);

  // Ref for the messages container
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to scroll to the bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const commands = [
    { command: "/mute @user", description: "Mute the user." },
    { command: "/ban @user", description: "Ban the user." },
    {
      command: "/title set a title for the current stream",
      description: "Set a stream title.",
    },
    {
      command: "/description set a description for the current stream",
      description: "Set a stream description.",
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsChatOpen(false);
        setShowEmojis(false);
      } else if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        if (showEmojis && searchResults.length) {
          navigateEmojiSuggestions(e);
          e.preventDefault();
        } else if (tagSuggestions.length) {
          navigateTagSuggestions(e);
          e.preventDefault();
        } else if (commandSuggestions.length) {
          navigateCommandSuggestions(e);
          e.preventDefault();
        }
      } else if (e.key === "Enter") {
        if (showEmojis && searchResults.length) {
          addEmoji(searchResults[focusedEmojiIndex]);
          e.preventDefault(); // Prevent form submission
        } else if (tagSuggestions.length) {
          setMessage(`@${tagSuggestions[focusedTagIndex].username}`);
          e.preventDefault();
        } else if (commandSuggestions.length) {
          setMessage(commandSuggestions[focusedCommandIndex].command);
          e.preventDefault();
        } else {
          sendMessage(e); // Call sendMessage if no suggestion is active
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    setIsChatOpen,
    showEmojis,
    searchResults,
    focusedEmojiIndex,
    tagSuggestions,
    focusedTagIndex,
    commandSuggestions,
    focusedCommandIndex,
  ]);

  // Navigate through emojis
  const navigateEmojiSuggestions = (e) => {
    e.preventDefault();
    const emojisPerRow = 6; // Change this as per your UI
    let newIndex = focusedEmojiIndex;
    switch (e.key) {
      case "ArrowUp":
        newIndex -= emojisPerRow;
        break;
      case "ArrowDown":
        newIndex += emojisPerRow;
        break;
      case "ArrowLeft":
        newIndex -= 1;
        break;
      case "ArrowRight":
        newIndex += 1;
        break;
    }
    newIndex = (newIndex + searchResults.length) % searchResults.length;
    setFocusedEmojiIndex(newIndex);
  };

  // Navigate through tag suggestions

  const navigateTagSuggestions = (e) => {
    e.preventDefault();
    let newIndex = focusedTagIndex;
    switch (e.key) {
      case "ArrowUp":
        newIndex -= 1;
        break;
      case "ArrowDown":
        newIndex += 1;
        break;
    }
    newIndex = (newIndex + tagSuggestions.length) % tagSuggestions.length;
    setFocusedTagIndex(newIndex);
  };

  // Navigate through command suggestions

  const navigateCommandSuggestions = (e) => {
    e.preventDefault();
    let newIndex = focusedCommandIndex;
    switch (e.key) {
      case "ArrowUp":
        newIndex -= 1;
        break;
      case "ArrowDown":
        newIndex += 1;
        break;
    }
    newIndex =
      (newIndex + commandSuggestions.length) % commandSuggestions.length;
    setFocusedCommandIndex(newIndex);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessages([...messages, message]);
      setMessage("");
      setShowEmojis(false);
      setFocusedEmojiIndex(0);
      setTagSuggestions([]);
      setCommandSuggestions([]);
    }
  };

  const getNativeEmoji = (emoji) => {
    return emoji.skins && emoji.skins.length > 0 && emoji.skins[0].native
      ? emoji.skins[0].native
      : "🚦";
  };

  const addEmoji = (emoji) => {
    const newText = message.replace(/:[a-zA-Z0-9_]+$/, getNativeEmoji(emoji));
    setMessage(newText);
    setShowEmojis(false);
    setSearchResults([]);
    setFocusedEmojiIndex(0);
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setMessage(text);
    handleEmojiSuggestions(text);
    handleTagSuggestions(text);
    handleCommandSuggestions(text);
  };

  const handleTagSuggestions = (text) => {
    const lastAtPos = text.lastIndexOf("@");
    if (lastAtPos !== -1) {
      const query = text.substring(lastAtPos + 1).toLowerCase();
      if (query.length > 0) {
        fetch(`https://665621609f970b3b36c4625e.mockapi.io/users?limit=100`)
          .then((res) => res.json())
          .then((data) => {
            console.log("Fetched data:", data); // Debugging output
            const fuzzyMatch = (user, query) => {
              let score = 0;
              let tokenIndex = 0;
              let queryIndex = 0;
              const name = user.username.toLowerCase();

              while (queryIndex < query.length && tokenIndex < name.length) {
                if (name[tokenIndex] === query[queryIndex]) {
                  score++;
                  queryIndex++;
                }
                tokenIndex++;
              }
              return score / query.length; // Returning match percentage
            };

            const filteredUsers = data.filter(
              (user) => fuzzyMatch(user, query) > 0.6
            ); // Adjust the threshold as needed
            setTagSuggestions(
              Array.isArray(filteredUsers) ? filteredUsers : []
            );
          })
          .catch((err) => {
            console.error("Fetch error:", err);
            setTagSuggestions([]); // Ensure array even in case of error
          });
      } else {
        // If there's just an '@' with no text following, fetch the top 5 users
        fetch("https://665621609f970b3b36c4625e.mockapi.io/users?limit=5")
          .then((res) => res.json())
          .then((data) => {
            console.log("Fallback data:", data); // Debugging output
            setTagSuggestions(Array.isArray(data) ? data : []);
          })
          .catch((err) => {
            console.error("Fetch error:", err);
            setTagSuggestions([]); // Ensure array even in case of error
          });
      }
    } else {
      setTagSuggestions([]);
    }
  };

  const handleCommandSuggestions = (text) => {
    const commandRegex = /^\/(\w*)$/;
    const match = text.match(commandRegex);
    if (match) {
      const searchTerm = match[1].toLowerCase();
      setCommandSuggestions(
        commands.filter((command) =>
          command.command.startsWith("/" + searchTerm)
        )
      );
    } else {
      setCommandSuggestions([]);
    }
  };

  const handleEmojiSuggestions = (text) => {
    const emojiRegex = /:([a-zA-Z0-9_]+)$/;
    const match = text.match(emojiRegex);
    if (match && match[1]) {
      const searchTerm = match[1].toLowerCase();
      const filteredEmojis = Object.values(data.emojis).filter(
        (emoji) =>
          emoji.name.toLowerCase().includes(searchTerm) ||
          (emoji.keywords &&
            emoji.keywords.some((keyword) =>
              keyword.toLowerCase().includes(searchTerm)
            ))
      );
      setSearchResults(filteredEmojis);
      setShowEmojis(true);
      setFocusedEmojiIndex(0);
    } else {
      setSearchResults([]);
      setShowEmojis(false);
    }
  };

  return (
    <div className="chat-container w-full h-full flex flex-col">
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
          .emoji-btn:hover, .emoji-btn.focused {
            background-color: #e2e2e2; /* Light grey background for focused or hovered emoji */
          }
          
        `}
      </style>
      <div className="messages-container overflow-y-auto flex-1 bg-white border border-gray-300 rounded-lg p-4 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message mb-2 last:mb-0 p-2 rounded ${
              msg.includes("@Domenica18") ? "bg-gray-200" : "bg-transparent"
            }`}
          >
            <div className="font-bold">Domenica18</div>
            <div>{msg}</div>
          </div>
        ))}
         {/* Element to reference for auto-scrolling */}
         <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 relative">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={handleInputChange}
          className="flex-1 px-4 py-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
        {showEmojis && searchResults.length > 0 && (
          <div className="emoji-search-results bottom-full mb-2 w-full">
            {searchResults.map((emoji, index) => (
              <button
                key={index}
                onClick={() => addEmoji(emoji)}
                className={`emoji-btn ${
                  index === focusedEmojiIndex ? "focused" : ""
                }`}
              >
                {getNativeEmoji(emoji)}
              </button>
            ))}
          </div>
        )}
        {tagSuggestions.length > 0 && (
          <div className="tag-suggestions absolute bottom-full mb-2 w-full">
            {tagSuggestions.map((user) => (
              <div
                key={user.id}
                onClick={() => setMessage(`@${user.username}`)}
                className="suggestion py-1 px-2 hover:bg-gray-100 cursor-pointer"
              >
                @{user.username}
              </div>
            ))}
          </div>
        )}
        {commandSuggestions.length > 0 && (
          <div className="command-suggestions absolute bottom-full mb-2 w-full">
            {commandSuggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => setMessage(item.command)}
                className="command-item py-1 px-2 hover:bg-gray-100 cursor-pointer"
              >
                {item.command}
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

export default Chat;
