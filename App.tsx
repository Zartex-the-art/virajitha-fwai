
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { IndustrySelector } from './components/IndustrySelector';
import { PostCard } from './components/PostCard';
import { Loader } from './components/Loader';
import { fetchTopNews } from './services/newsService';
import { generateViralContent } from './services/geminiService';
import { GeneratedPost } from './types';
import { INDUSTRIES } from './constants';

const App: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>(INDUSTRIES[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [generatedPosts, setGeneratedPosts] = useState<GeneratedPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateClick = useCallback(async () => {
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
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [selectedIndustry]);

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
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center" role="alert">
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
