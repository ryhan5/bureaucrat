'use client';
import { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

export default function VoiceNotes() {
  const [notes, setNotes] = useState([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      if (data.success) {
        setNotes(data.data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const correctGrammar = async (text) => {
    setLoading(true);
    try {
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        
        const prompt = `Please correct the grammar and improve the writing style of the following text while maintaining its original meaning. Make it formal and professional:
        "${text}"`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const correctedText = response.text();
        return correctedText.replace(/^["']|["']$/g, ''); // Remove any quotes from the response
    } catch (error) {
      console.error('Grammar correction error:', error);
      return text;
    } finally {
      setLoading(false);
    }
  };

  const translateText = async (text, fromLang, toLang) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      
      const prompt = `Translate the following text from ${fromLang === 'hi' ? 'Hindi' : 'English'} to ${toLang === 'hi' ? 'Hindi' : 'English'}:
      "${text}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  };

  const startListening = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
    setIsTyping(false);
  };

  const stopListening = async () => {
    SpeechRecognition.stopListening();
    try {
      if (transcript && transcript.trim()) {
        const correctedText = await correctGrammar(transcript);
        await addNote(correctedText);
        resetTranscript();
      }
    } catch (error) {
      console.error('Error processing speech:', error);
    }
  };

  const addNote = async (text) => {
    try {
      let finalText = text.trim();
      let finalLanguage = inputLanguage;

      if (autoTranslate && inputLanguage === 'hi') {
        setLoading(true);
        finalText = await translateText(finalText, 'hi', 'en');
        finalLanguage = 'en';
      }

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            text: finalText,
            timestamp: new Date().toISOString(),
            corrected: false,
            language: finalLanguage
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        setInputText('');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      setLoading(false);
    }
  };

  const translateNote = async (note, targetLang) => {
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro"});
      
      const prompt = `Translate the following text to ${targetLang === 'hi' ? 'Hindi' : 'English'}. If the text is already in the target language, return it as is:
      "${note.text}"`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      
      const apiResponse = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: note._id,
          text: translatedText.replace(/^["']|["']$/g, ''),
          language: targetLang
        }),
      });

      const data = await apiResponse.json();
      if (data.success) {
        await fetchNotes();
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypedNote = async () => {
    try {
      if (inputText.trim()) {
        const correctedText = await correctGrammar(inputText);
        await addNote(correctedText);
      }
    } catch (error) {
      console.error('Error processing typed note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const correctNoteGrammar = async (note) => {
    setLoading(true);
    try {
      const correctedText = await correctGrammar(note.text);
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: note._id,
          text: correctedText,
          corrected: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
      }
    } catch (error) {
      console.error('Error correcting note:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">Voice Notes</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2 text-indigo-600">
              <label className="font-medium">Input Language:</label>
              <select 
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
                className="px-3 py-2 rounded-md border-2 border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={listening}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
            {inputLanguage === 'hi' && (
              <div className="flex items-center gap-2 text-indigo-600">
                <label className="font-medium">Auto-translate to English:</label>
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-6">
            <button
                onClick={isTyping ? handleTypedNote : listening ? stopListening : startListening}
                disabled={loading}
                className={`
                flex-1 px-6 py-4 rounded-xl font-semibold text-white
                transform transition-all duration-200
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 
                  listening ? 'bg-red-500 hover:bg-red-600' :
                    'bg-blue-400 hover:bg-blue-600 hover:scale-105 hover:shadow-lg'}
                  `}
                >
                  {loading ? 'Processing...' : 
                   listening ? 'Stop Recording' :
                   isTyping ? 'Save Note' : 'Start Recording'}
                </button>
                <button
                  onClick={() => setIsTyping(!isTyping)}
                  className="px-6 py-4 rounded-xl font-semibold text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
            >
              {isTyping ? 'Switch to Voice' : 'Switch to Typing'}
            </button>
          </div>

          {isTyping ? (
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Type your note in ${inputLanguage === 'hi' ? 'Hindi' : 'English'}...`}
                className="w-full h-40 p-4 border-2 border-indigo-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-900 placeholder-indigo-400 resize-none"
                dir={inputLanguage === 'hi' ? 'auto' : 'ltr'}
              />
              <div className="absolute bottom-4 right-4 text-sm text-indigo-600">
                {inputText.length} characters
              </div>
            </div>
          ) : (
            <div className="bg-indigo-50 rounded-xl p-6 min-h-[10rem] border-2 border-indigo-200">
              <p className="text-indigo-900 font-medium" dir={inputLanguage === 'hi' ? 'auto' : 'ltr'}>
                {transcript || `Start speaking in ${inputLanguage === 'hi' ? 'Hindi' : 'English'}...`}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {notes.map((note) => (
            <div
                key={note._id}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-blue-100"
              >
                <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-blue-600">
                  {new Date(note.timestamp).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => translateNote(note, note.language === 'hi' ? 'en' : 'hi')}
                    disabled={loading}
                    className={`px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 
                      ${loading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : note.language === 'hi' 
                          ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    title={note.language === 'hi' ? 'Translate to English' : 'Translate to Hindi'}
                  >
                    <ArrowsRightLeftIcon className="w-4 h-4" />
                    {note.language === 'hi' 
                      ? 'Translate to English' 
                      : 'Translate to Hindi'}
                  </button>
                  
                  <button
                    onClick={() => correctNoteGrammar(note)}
                    disabled={loading || note.corrected}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      loading || note.corrected
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    Enhance with AI
                  </button>
                  
                  <button
                    onClick={() => deleteNote(note._id)}
                    className="px-3 py-2 text-sm rounded-md text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Note"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
                <p className="text-blue-900 whitespace-pre-wrap" dir={note.language === 'hi' ? 'auto' : 'ltr'}>
                  {note.text}
                </p>
                <div className="flex gap-2 mt-2">
                  {note.corrected && (
                    <span className="text-xs text-blue-600 inline-flex items-center gap-1">
                      ✓ Enhanced with AI
                    </span>
                  )}
                  <span className="text-xs text-blue-600 inline-flex items-center gap-1">
                    {note.language === 'hi' ? 'Hindi' : 'English'}
                  </span>
                </div>
              </div>
              ))}
              {notes.length === 0 && (
              <div className="text-center py-8 text-blue-600">
              No notes yet. Start recording or typing!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}