import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { IndustrySelector } from './components/IndustrySelector.tsx';
import { PostCard } from './components/PostCard.tsx';
import { Loader } from './components/Loader.tsx';
import { fetchTopNews } from './services/newsService.ts';
import { generateViralContent } from './services/geminiService.ts';
import { GeneratedPost } from './types.ts';
import { INDUSTRIES } from './constants.ts';
import { KeyIcon } from './components/IconComponents.tsx';

// A dedicated component for the API Key selection screen
const ApiKeySelectionScreen: React.FC<{ onSelectKey: () => void; error?: string | null }> = ({ onSelectKey, error }) => (
  <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col">
    <Header />
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-slate-800/50 rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-slate-700">
        <KeyIcon className="w-16 h-16 text-sky-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">API Key Required</h2>
        <p className="text-slate-400 mb-6">
          To use advanced features like image generation, you need to select a Google AI API key for this session.
        </p>
        {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-left" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
        )}
        <button
          onClick={onSelectKey}
          className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
        >
          Select Your API Key
        </button>
         <p className="text-xs text-slate-500 mt-4">
          This project uses Google AI models. Ensure your key is enabled and has billing configured. 
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-sky-400"> Learn more about billing</a>.
        </p>
      </div>
    </main>
  </div>
);


const App: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(INDUSTRIES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isKeyReady, setIsKeyReady] = useState(false);

  const checkApiKey = useCallback(async () => {
    try {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setIsKeyReady(hasKey);
      return hasKey;
    } catch (e) {
      console.error("aistudio API not available.", e);
      setIsKeyReady(false); // Fallback if aistudio is not present
      return false;
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Optimistically assume success to provide a smoother UX
      // The check on generate will confirm validity.
      setIsKeyReady(true);
      setError(null);
    } catch (e) {
      console.error("Failed to open key selection.", e);
      setError("Could not open the API key selection dialog.");
    }
  };
  
  const handleGenerateClick = useCallback(async () => {
    if (!(await checkApiKey())) {
      setError("Please select your API key before generating posts.");
      setIsKeyReady(false);
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setGeneratedPosts([]);

    try {
      setLoadingMessage('Fetching latest news...');
      const articles = await fetchTopNews(selectedIndustry);

      setLoadingMessage('Generating viral ideas & captions...');
      const contentIdeas = await generateViralContent(articles, selectedIndustry);

      const posts: GeneratedPost[] = [];
      for (let i = 0; i < contentIdeas.length; i++) {
        setLoadingMessage(`Creating image ${i + 1} of ${contentIdeas.length}...`);
        posts.push(contentIdeas[i]);
        setGeneratedPosts([...posts]); // Update UI incrementally
      }
      
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      // Catch key-related errors specifically
      if (errorMessage.includes("API key") || errorMessage.includes("Requested entity was not found")) {
        setError("Your API key appears to be invalid or missing required permissions. Please select your key again.");
        setIsKeyReady(false); // Reset state to show the selection screen
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [selectedIndustry, checkApiKey]);
  
  if (!isKeyReady) {
    return <ApiKeySelectionScreen onSelectKey={handleSelectKey} error={error} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-slate-800/50 rounded-2xl shadow-lg p-6 md:p-8 backdrop-blur-sm border border-slate-700">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-sky-400 mb-2">Create Viral Posts in Seconds</h2>
          <p className="text-slate-400 text-center mb-6">
            Select an industry, and let AI generate 10 unique, share-worthy Instagram posts based on the latest news.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <IndustrySelector
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
            />
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="w-full sm:w-auto flex-shrink-0 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-800 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-sky-400/30 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              {isLoading ? 'Generating...' : 'Generate Posts'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>

        {isLoading && <Loader message={loadingMessage} />}
        
        {generatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-3xl font-bold text-center mb-8">Your Generated Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;