'use client';
import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import PageContainer from '../../components/PageContainer';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [error, setError] = useState('');

  const getPlaceholder = (lang) => {
    return lang === 'hi' 
      ? 'यहां हिंदी टेक्स्ट लिखें...' 
      : 'Enter English text here...';
  };

  const getLabel = (lang) => {
    return lang === 'hi' 
      ? 'हिंदी टेक्स्ट दर्ज करें' 
      : 'Enter English Text';
  };

  const translate = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const fromLang = sourceLang === 'en' ? 'English' : 'Hindi';
      const toLang = targetLang === 'en' ? 'English' : 'Hindi';
      
      const prompt = `Translate the following ${fromLang} text to ${toLang}. Only provide the translation, no explanations:
      
      ${inputText}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedContent = response.text();
      
      setTranslatedText(translatedContent.trim());
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed. Please try again.');
      setTranslatedText('');
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  return (
    <PageContainer>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            AI Translator
          </h1>
          <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
            Translate between Hindi and English with AI assistance
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Language Selection Buttons */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => {
                  setSourceLang('en');
                  setTargetLang('hi');
                }}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-200
                  ${sourceLang === 'en' && targetLang === 'hi'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                English → हिंदी
              </button>
              
              <button
                onClick={swapLanguages}
                className="p-3 rounded-full hover:bg-blue-100 text-blue-600 transition-all duration-200 hover:scale-110"
                title="Swap languages"
              >
                <ArrowsRightLeftIcon className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => {
                  setSourceLang('hi');
                  setTargetLang('en');
                }}
                className={`px-6 py-3 rounded-lg text-lg font-medium transition-all duration-200
                  ${sourceLang === 'hi' && targetLang === 'en'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
              >
                हिंदी → English
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative space-y-2">
              <label 
                htmlFor="inputText" 
                className="block text-sm font-medium text-blue-900"
              >
                {getLabel(sourceLang)}
              </label>
              <textarea
                id="inputText"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getPlaceholder(sourceLang)}
                className="w-full h-64 p-6 border-2 border-blue-200 rounded-xl bg-white shadow-sm 
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                  text-blue-900 placeholder-blue-400 resize-none"
              />
              <div className="absolute bottom-4 right-4 text-sm text-blue-600">
                {inputText.length} characters
              </div>
            </div>
            
            <div className="relative space-y-2">
              <label className="block text-sm font-medium text-blue-900">
                {getLabel(targetLang)}
              </label>
              <div className="w-full h-64 p-6 border-2 border-blue-200 rounded-xl bg-blue-50 shadow-sm overflow-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 font-medium">{error}</div>
                ) : (
                  <div className="text-blue-900 font-medium">
                    {translatedText || getPlaceholder(targetLang)}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={translate}
              disabled={!inputText.trim() || loading}
              className={`
                px-8 py-4 rounded-xl font-semibold text-white
                transform transition-all duration-200
                ${!inputText.trim() || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'
                }
              `}
            >
              {loading ? 'Translating...' : 'Translate'}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}