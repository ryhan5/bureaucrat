'use client';
import { useState, useEffect } from 'react';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  ArrowsRightLeftIcon, 
  FolderIcon,
  MagnifyingGlassIcon,
  TagIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Personal', 'Work', 'Ideas', 'Tasks', 'Other'];

export default function VoiceNotes() {
  const [notes, setNotes] = useState([]);
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputLanguage, setInputLanguage] = useState('en');
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchNotes();
    // Add keyboard shortcuts
    const handleKeyPress = (e) => {
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!listening) startListening();
        else stopListening();
      }
      if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsTyping(!isTyping);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [listening, isTyping]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      if (data.success) {
        setNotes(data.data);
      }
    } catch (error) {
      setError('Failed to fetch notes');
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
            language: finalLanguage,
            category: selectedCategory === 'All' ? 'Other' : selectedCategory,
            tags: selectedTags
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchNotes();
        setInputText('');
        setLoading(false);
        showNotification('Note added successfully');
      }
    } catch (error) {
      setError('Failed to save note');
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

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || note.category === selectedCategory;
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => note.tags && note.tags.includes(tag));
    return matchesSearch && matchesCategory && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-600">Voice Notes</h1>

        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
                notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <ExclamationCircleIcon className="w-5 h-5" />
                )}
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Language and Auto-translate controls */}
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

          {/* Recording/Typing controls */}
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
              <span className="flex items-center justify-center gap-2">
                {loading ? 'Processing...' : 
                 listening ? 'Stop Recording (Ctrl+R)' :
                 isTyping ? 'Save Note' : 'Start Recording (Ctrl+R)'}
              </span>
            </button>
            <button
              onClick={() => setIsTyping(!isTyping)}
              className="px-6 py-4 rounded-xl font-semibold text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
            >
              {isTyping ? 'Switch to Voice (Ctrl+T)' : 'Switch to Typing (Ctrl+T)'}
            </button>
          </div>

          {/* Category and Tags */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border-2 border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2 min-h-[38px] p-1 bg-white rounded-md border-2 border-indigo-200">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 border border-indigo-200"
                  >
                    {tag}
                    <button
                      onClick={() => setSelectedTags(tags => tags.filter(t => t !== tag))}
                      className="ml-1 hover:text-indigo-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {showTagInput ? (
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag.trim()) {
                        setSelectedTags(tags => [...tags, newTag.trim()]);
                        setNewTag('');
                        setShowTagInput(false);
                      }
                      if (e.key === 'Escape') {
                        setNewTag('');
                        setShowTagInput(false);
                      }
                    }}
                    className="flex-1 min-w-[100px] px-2 py-1 text-sm border border-indigo-200 rounded-md focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-gray-900 bg-white"
                    placeholder="Add tag..."
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200"
                  >
                    <TagIcon className="w-4 h-4 mr-1" />
                    Add Tag
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Input area */}
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

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full px-4 py-3 pl-12 rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <MagnifyingGlassIcon className="w-6 h-6 text-indigo-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>

        {/* Notes list */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-2 border-blue-100"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-blue-600">
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {note.category || 'Other'}
                    </span>
                    {note.tags && note.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
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
                <p className="text-gray-900 whitespace-pre-wrap" dir={note.language === 'hi' ? 'auto' : 'ltr'}>
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
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && (
            <div className="text-center py-8 text-blue-600">
              No notes found. Try adjusting your search or filters!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}