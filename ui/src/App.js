import React, { useState, useEffect } from 'react';
import Live2DAvatar from './components/Live2DAvatar';
import AvatarSelector from './components/AvatarSelector';
import ErrorNotification from './components/ErrorNotification';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [token, setToken] = useState(null);
  const [stickers, setStickers] = useState([]);
  const [showStickers, setShowStickers] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [retryFn, setRetryFn] = useState(null);

  useEffect(() => {
    // Guest login on load
    fetch('http://localhost:8080/auth/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName: 'User' })
    })
    .then(res => res.json())
    .then(data => {
      setToken(data.token);
      loadHistory(data.token);
      loadStickers(data.token);
    })
    .catch(err => console.error('Login failed', err));
  }, []);

  const loadHistory = async (token) => {
    try {
      const response = await fetch('http://localhost:8080/agent/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const history = await response.json();
      setMessages(history);
    } catch (err) {
      console.error('Load history failed', err);
    }
  };

  const loadStickers = async (token) => {
    try {
      const response = await fetch('http://localhost:8080/agent/stickers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const stickerIds = await response.json();
      setStickers(stickerIds);
    } catch (err) {
      console.error('Load stickers failed', err);
    }
  };

  const analyzeEmotion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('awesome')) {
      return 'happy';
    } else if (lowerText.includes('sad') || lowerText.includes('sorry') || lowerText.includes('unfortunately')) {
      return 'sad';
    } else if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('frustrated')) {
      return 'angry';
    } else if (lowerText.includes('surprised') || lowerText.includes('wow') || lowerText.includes('amazing')) {
      return 'surprised';
    } else {
      return 'neutral';
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !token) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:8080/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });
      const reply = await response.text();
      const emotion = analyzeEmotion(reply);
      setCurrentEmotion(emotion);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat failed', err);
    }
  };

  const exportHistory = () => {
    if (!token) return;
    window.open('http://localhost:8080/agent/export', '_blank');
  };

  const uploadSticker = async (event) => {
    const file = event.target.files[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await fetch('http://localhost:8080/agent/upload-sticker', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      loadStickers(token);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const addStickerToMessage = (stickerSrc) => {
    const userMessage = { role: 'user', content: `<img src="${stickerSrc}" alt="sticker" style="max-width: 100px;" />` };
    setMessages(prev => [...prev, userMessage]);
    setShowStickers(false);
    // Optionally send to chat, but for now just display
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      const chunks = [];
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        await transcribeAudio(blob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Recording failed', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'recording.wav');
    try {
      const response = await fetch('http://localhost:8084/voice/stt', {
        method: 'POST',
        body: formData
      });
      const text = await response.text();
      setInput(text);
    } catch (err) {
      console.error('STT failed', err);
    }
  };

  const generateVoice = async () => {
    if (!input.trim()) return;
    try {
      const response = await fetch('http://localhost:8084/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, provider: 'coeiroink' })
      });
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('TTS failed', err);
    }
  };

  return (
    <div className="App">
      <div className="avatar-section">
        <AvatarSelector 
          selectedAvatar={selectedAvatar} 
          onAvatarSelect={setSelectedAvatar} 
        />
        <Live2DAvatar 
          avatar={selectedAvatar} 
          emotion={currentEmotion}
          onEmotionChange={setCurrentEmotion}
        />
      </div>
      <div className="chat-section">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`} dangerouslySetInnerHTML={{ __html: `<strong>${msg.role}:</strong> ${msg.content}` }} />
          ))}
        </div>
        <div className="input-section">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
          <button onClick={isRecording ? stopRecording : startRecording}>
            {isRecording ? 'Stop Recording' : 'Record Voice'}
          </button>
          <button onClick={generateVoice}>Generate Voice</button>
          <button onClick={() => setShowStickers(!showStickers)}>Stickers</button>
          <button onClick={exportHistory}>Export History</button>
          <input type="file" accept="image/*" onChange={uploadSticker} />
        </div>
        {showStickers && (
          <div className="sticker-picker">
            {stickers.map(id => (
              <img key={id} src={`http://localhost:8080/agent/sticker/${id}`} alt="sticker" style={{ width: '50px', cursor: 'pointer' }} onClick={() => addStickerToMessage(`http://localhost:8080/agent/sticker/${id}`)} />
            ))}
            {/* Default stickers */}
            <img src="/stickers/ruri-dragon-1.svg" alt="dragon1" style={{ width: '50px', cursor: 'pointer' }} onClick={() => addStickerToMessage('/stickers/ruri-dragon-1.svg')} />
            <img src="/stickers/ruri-dragon-2.svg" alt="dragon2" style={{ width: '50px', cursor: 'pointer' }} onClick={() => addStickerToMessage('/stickers/ruri-dragon-2.svg')} />
            <img src="/stickers/ruri-dragon-3.svg" alt="dragon3" style={{ width: '50px', cursor: 'pointer' }} onClick={() => addStickerToMessage('/stickers/ruri-dragon-3.svg')} />
          </div>
        )}
      </div>
      <ErrorNotification onRetry={retryFn} />
    </div>
  );
}

export default App;
