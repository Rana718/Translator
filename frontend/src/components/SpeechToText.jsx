import React, { useState, useEffect } from "react";
import axios from 'axios';
import languages from "./language";

const SpeechToText = () => {
  const [text, setText] = useState('');
  const [manualText, setManualText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [spokenLanguage, setSpokenLanguage] = useState('en-US');
  const [destLang, setDestLang] = useState('bn');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognitionInstance = new window.webkitSpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = spokenLanguage;

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setText(finalTranscript || interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        if (event.error === 'no-speech') {
          console.warn('No speech detected, please try again.');
          setListening(false);
        } else {
          console.error('Speech recognition error', event);
          setListening(false);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, [spokenLanguage]);

  useEffect(() => {
    if (text || manualText) {
      handleTranslation();
    }
  }, [text, manualText, destLang]);

  const toggleListening = () => {
    if (listening) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setListening(!listening);
  };

  const handleSpokenLanguageChange = (e) => {
    setSpokenLanguage(e.target.value);
    if (recognition) {
      recognition.lang = e.target.value;
    }
  };

  const handleTranslation = async () => {
    try {
      const response = await axios.post('http://localhost:5000/translate', {
        text: manualText || text,
        src_lang: spokenLanguage.split('-')[0],
        dest_lang: destLang,
      });
      setTranslatedText(response.data.translated_text);
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  const handleTextToSpeech = async () => {
    try {
      const response = await axios.post('http://localhost:5000/text-to-speech', {
        text: translatedText,
        language_code: destLang,
      });
      const audio = new Audio(`data:audio/wav;base64,${response.data.audio_content}`);
      audio.play();
    } catch (error) {
      console.error('Text-to-Speech error:', error);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto mt-10 bg-gray-200 rounded-lg shadow-md">
      <h1 className="text-center text-2xl font-bold mb-6">Speech-to-Text Translator</h1>
      <div className="flex mb-4">
        <div className="w-1/2 p-2">
          <label htmlFor="spoken-language" className="block mb-2 font-semibold">Spoken Language:</label>
          <select id="spoken-language" value={spokenLanguage} onChange={handleSpokenLanguageChange} className="w-full p-2 border rounded">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="w-1/2 p-2">
          <label htmlFor="dest-lang" className="block mb-2 font-semibold">Destination Language:</label>
          <select id="dest-lang" value={destLang} onChange={(e) => setDestLang(e.target.value)} className="w-full p-2 border rounded">
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code.split('-')[0]}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={toggleListening} className={`w-full mt-4 p-2 rounded text-white ${listening ? 'bg-red-500' : 'bg-blue-500'} flex items-center justify-center`}>
        <img src={listening ? "stop-button.png" : "mic.png"} alt="Microphone" className="mr-2 w-6 h-6" />
        {listening ? 'Stop Listening' : 'Start Listening'}
      </button>

      <div className="mt-4 p-2 bg-white rounded shadow-inner">
        <textarea
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Speak or type your text here..."
          value={manualText || text}
          onChange={(e) => setManualText(e.target.value)}
        />
      </div>

      <div className="mt-4 p-2 bg-white rounded shadow-inner">
        <h2 className="text-lg font-semibold mb-2">Translation:</h2>
        <p className="p-2">{translatedText}</p>
      </div>

      <button onClick={handleTextToSpeech} className="w-full mt-4 p-2 bg-purple-500 text-white rounded flex items-center justify-center">
        <img src="speaker.png" alt="Speaker" className="mr-2 w-6 h-6" />
        Listen to Translation
      </button>
    </div>
  );
};

export default SpeechToText;
