import { useEffect, useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setUrl(tabs[0].url);
    });
  }, []);

  return (
    <div style={{ padding: "1rem", width: 500, height: 300}}>
      <h3>Текущий URL:</h3>
      <p>{url}</p>
    </div>
  );
}