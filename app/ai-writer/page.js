'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import PageContainer from '../../components/PageContainer';
import { 
  PaperClipIcon, 
  PaperAirplaneIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  ClockIcon,
  UserGroupIcon,
  SpeakerWaveIcon,
  LanguageIcon,
  LightBulbIcon,
  PresentationChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

function ChatMessage({ message, isBot }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isBot ? 'bg-violet-50' : ''} p-4 rounded-lg`}
    >
      <div className={`
        w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
        ${isBot ? 'bg-violet-600 text-white' : 'bg-blue-600 text-white'}
      `}>
        {isBot ? 'AI' : 'You'}
      </div>
      <div className="flex-1">
        <p className={`text-sm ${isBot ? 'text-violet-900' : 'text-gray-900'}`}>
          {message}
        </p>
      </div>
    </motion.div>
  );
}

function formatContent(content) {
  if (!content) return null;

  // Split content into sections
  const sections = content.split('\n\n').filter(Boolean);
  const formattedSections = [];

  sections.forEach((section, index) => {
    const lowerSection = section.toLowerCase();
    
    // Helper function to clean section text
    const cleanSectionText = (text) => {
      return text
        .replace(/^(introduction|main point|key point|example|conclusion|timing|note|delivery)[:|-]/i, '')
        .trim();
    };

    if (lowerSection.includes('introduction') || index === 0) {
      formattedSections.push({
        title: 'Introduction',
        content: cleanSectionText(section),
        icon: DocumentTextIcon,
        timing: '2-3 minutes'
      });
    } else if (lowerSection.includes('main point') || lowerSection.includes('key point')) {
      formattedSections.push({
        title: `Key Point ${formattedSections.filter(s => s.title.includes('Key Point')).length + 1}`,
        content: cleanSectionText(section),
        icon: LightBulbIcon,
        timing: '3-4 minutes'
      });
    } else if (lowerSection.includes('example') || lowerSection.includes('illustration')) {
      formattedSections.push({
        title: 'Example',
        content: cleanSectionText(section),
        icon: PresentationChartBarIcon,
        timing: '2-3 minutes'
      });
    } else if (lowerSection.includes('conclusion')) {
      formattedSections.push({
        title: 'Conclusion',
        content: cleanSectionText(section),
        icon: CheckCircleIcon,
        timing: '1-2 minutes'
      });
    } else if (lowerSection.includes('timing') || lowerSection.includes('duration')) {
      formattedSections.push({
        title: 'Timing Guidelines',
        content: cleanSectionText(section),
        icon: ClockIcon
      });
    } else if (lowerSection.includes('note') || lowerSection.includes('delivery')) {
      formattedSections.push({
        title: 'Delivery Notes',
        content: cleanSectionText(section),
        icon: SpeakerWaveIcon
      });
    } else {
      formattedSections.push({
        title: 'Additional Points',
        content: section,
        icon: DocumentTextIcon
      });
    }
  });

  return formattedSections;
}

function ContentSection({ title, content, icon: Icon, timing }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 last:mb-0"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg">{title}</h4>
          {timing && (
            <div className="text-sm text-violet-600 flex items-center gap-1 mt-0.5">
              <ClockIcon className="w-4 h-4" />
              {timing}
            </div>
          )}
        </div>
      </div>
      <div className="pl-13">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-100 rounded-full" />
          <div className="pl-6 space-y-4">
            {content.split('\n').map((paragraph, i) => (
              paragraph.trim() && (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-gray-700 leading-relaxed"
                >
                  {paragraph}
                </motion.p>
              )
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIWriter() {
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [type, setType] = useState('speech');
  const [tone, setTone] = useState('formal');
  const [audience, setAudience] = useState('general');
  const [duration, setDuration] = useState('5');
  const [language, setLanguage] = useState('en');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [accessPassword, setAccessPassword] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setIsLoading(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result;
          
          // Initial message about the uploaded file
          setMessages([
            { text: `I've uploaded "${file.name}". Let's discuss it!`, isBot: false },
            { text: `I've analyzed ${file.name}. What would you like to know about it?`, isBot: true }
          ]);
          
          // Store the document content for future reference
          localStorage.setItem('documentContent', text);
        };
        
        reader.readAsText(file);
      } catch (error) {
        console.error('Error reading file:', error);
        setMessages([{ 
          text: "Sorry, I had trouble reading that file. Please try again.", 
          isBot: true 
        }]);
      }
      
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isBot: false }]);
    setInput('');
    setIsLoading(true);

    try {
      const documentContent = localStorage.getItem('documentContent');
      
      // Prepare the API request
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          document: documentContent
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        text: data.response,
        isBot: true
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        text: "I apologize, but I encountered an error while processing your request. Please try again.",
        isBot: true
      }]);
    }

    setIsLoading(false);
  };

  const generateContent = async () => {
    if (!topic) {
      setError('Please enter a topic');
      return;
    }

    if (isPrivate && !password) {
      setError('Please set a password for private content');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          type,
          duration,
          audience,
          tone,
          language,
          isPrivate,
          password
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      
      if (data.isEncrypted) {
        setIsLocked(true);
        localStorage.setItem('encryptedContent', data.content);
      } else {
        setGeneratedContent(data.content);
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError('Failed to generate content. Please try again.');
    }

    setIsLoading(false);
  };

  const unlockContent = async (e) => {
    e.preventDefault();
    
    try {
      const encryptedContent = localStorage.getItem('encryptedContent');
      if (!encryptedContent) {
        setError('No encrypted content found');
        return;
      }

      // Decrypt content on the client side
      const decipher = crypto.createDecipher('aes-256-cbc', accessPassword);
      let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      setGeneratedContent(decrypted);
      setIsLocked(false);
      setError('');
    } catch (error) {
      console.error('Decryption error:', error);
      setError('Incorrect password');
    }
  };

  const exportContent = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${type}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearChat = () => {
    setMessages([]);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <PageContainer>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center py-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              AI Speech Writer
            </h1>
            <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
              Generate professional speeches and lectures with AI assistance
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 space-y-8 sticky top-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Topic *</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your topic..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      placeholder:text-gray-400 text-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Content Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['speech', 'lecture', 'presentation'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setType(option)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium capitalize
                          ${type === option 
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          } transition-all duration-200`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      bg-white text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="5">5 minutes</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-800">Tone</label>
                  <div className="space-y-2">
                    {['formal', 'professional', 'conversational', 'authoritative'].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center p-3 rounded-lg cursor-pointer
                          ${tone === option 
                            ? 'bg-blue-50 border-2 border-blue-300' 
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          } transition-all duration-200`}
                      >
                        <input
                          type="radio"
                          name="tone"
                          value={option}
                          checked={tone === option}
                          onChange={(e) => setTone(e.target.value)}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm font-medium capitalize text-gray-800">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      bg-white text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="general">General Public</option>
                    <option value="officials">Government Officials</option>
                    <option value="executives">Senior Executives</option>
                    <option value="technical">Technical Experts</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Language</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'en', label: 'English' },
                      { value: 'hi', label: 'Hindi' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setLanguage(option.value)}
                        className={`px-4 py-3 rounded-lg text-sm font-medium
                          ${language === option.value 
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                          } transition-all duration-200`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-800">Privacy Settings</label>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`w-full px-4 py-3 rounded-lg border-2 flex items-center justify-center gap-2
                      ${isPrivate 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      } transition-all duration-200`}
                  >
                    {isPrivate ? <LockClosedIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    <span className="font-medium">{isPrivate ? 'Private Content' : 'Public Content'}</span>
                  </button>
                </div>

                {isPrivate && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Set Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password to protect content..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}

                <button
                  onClick={generateContent}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg font-semibold text-white
                    transform transition-all duration-200
                    ${isLoading 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 hover:shadow-lg'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SpeakerWaveIcon className="w-5 h-5" />
                      Generate Content
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-[800px]">
                {isLocked ? (
                  <div className="p-8 flex-1 flex flex-col items-center justify-center min-h-[600px]">
                    <LockClosedIcon className="w-20 h-20 text-violet-600 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6">Protected Content</h3>
                    <form onSubmit={unlockContent} className="w-full max-w-md space-y-6">
                      <input
                        type="password"
                        value={accessPassword}
                        onChange={(e) => setAccessPassword(e.target.value)}
                        placeholder="Enter password to unlock..."
                        className="w-full px-6 py-4 text-lg border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                      />
                      <button
                        type="submit"
                        className="w-full px-6 py-4 bg-violet-600 text-white rounded-lg hover:bg-violet-700 
                          flex items-center justify-center gap-3 text-lg font-medium"
                      >
                        <EyeIcon className="w-6 h-6" />
                        Unlock Content
                      </button>
                    </form>
                  </div>
                ) : (
                  <>
                    <div className="p-8 border-b border-blue-100 bg-blue-50">
                      <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            {topic || 'Generated Content'}
                          </h2>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="px-4 py-2 bg-blue-100 rounded-full text-base font-medium text-blue-700 flex items-center gap-2">
                              <ClockIcon className="w-5 h-5" />
                              {duration} minutes
                            </div>
                            <div className="px-4 py-2 bg-blue-100 rounded-full text-base font-medium text-blue-700 flex items-center gap-2">
                              <UserGroupIcon className="w-5 h-5" />
                              {audience}
                            </div>
                            <div className="px-4 py-2 bg-blue-100 rounded-full text-base font-medium text-blue-700 flex items-center gap-2">
                              <SpeakerWaveIcon className="w-5 h-5" />
                              {type}
                            </div>
                            <div className="px-4 py-2 bg-blue-100 rounded-full text-base font-medium text-blue-700 flex items-center gap-2">
                              <LanguageIcon className="w-5 h-5" />
                              {language === 'en' ? 'English' : 'Hindi'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigator.clipboard.writeText(generatedContent)}
                            className="p-3 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors flex items-center gap-2 font-medium"
                            title="Copy to clipboard"
                          >
                            <DocumentDuplicateIcon className="w-5 h-5" />
                            Copy
                          </button>
                          <button
                            onClick={exportContent}
                            className="p-3 text-violet-600 hover:bg-violet-100 rounded-lg transition-colors flex items-center gap-2 font-medium"
                            title="Download as file"
                          >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-8">
                      {generatedContent ? (
                        <div className="space-y-10">
                          {formatContent(generatedContent)?.map((section, index) => (
                            <ContentSection
                              key={index}
                              title={section.title}
                              content={section.content}
                              icon={section.icon}
                              timing={section.timing}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-16">
                          <DocumentTextIcon className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                          <p className="text-xl">Generated content will appear here...</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}