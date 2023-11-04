import "./App.css";
import lens from "./assets/lens.png";
import loadingGif from "./assets/loading.gif";
import { useState, useEffect } from "react";
import Avatar from "@mui/material/Avatar";
import PersonIcon from "@mui/icons-material/Person";
import BotIcon from "@mui/icons-material/Android";

function App() {
  const [prompt, updatePrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  useEffect(() => {
    if (prompt !== null && prompt.trim() === "") {
      // Do nothing when the prompt is cleared
    }
  }, [prompt]);

  const sendPrompt = async (event) => {
    console.log("sendPrompt called");
    if (event.key !== "Enter") {
      return;
    }
    setConversationHistory((prevHistory) => [
      ...prevHistory,
      { type: "user", text: prompt },
    ]);
    try {
      setLoading(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      };
      const res = await fetch(`http://0.0.0.0:8080/api/ask`, requestOptions);

      if (!res.ok) {
        throw new Error("Something went wrong");
      }

      const data = await res.json();
      const responseText = data.answer; // Extracting the response_text
      console.log(responseText);
      setConversationHistory((prevHistory) => [
        ...prevHistory,
        { type: "bot", text: responseText },
      ]);
    } catch (err) {
      console.error(err, "err");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <h1 className="page_title">
          Welcome to your Personal Teaching Assistant
        </h1>
        <div className="spotlight__wrapper">
          <input
            type="text"
            className="spotlight__input"
            placeholder="Ask me anything..."
            disabled={loading}
            style={{
              backgroundImage: loading ? `url(${loadingGif})` : `url(${lens})`,
            }}
            onChange={(e) => updatePrompt(e.target.value)}
            onKeyDown={(e) => sendPrompt(e)}
          />
          <div className="conversation-history">
            {conversationHistory.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <Avatar>
                  {message.type === "user" ? <PersonIcon /> : <BotIcon />}
                </Avatar>
                <div className="message-text">{message.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
