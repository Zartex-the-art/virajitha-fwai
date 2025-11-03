import React, { useState } from 'react';
import { GeneratedPost } from '../types.ts';
import { CopyIcon, CheckIcon } from './IconComponents.tsx';

interface PostCardProps {
  post: GeneratedPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.caption);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 transition-all duration-300 hover:shadow-sky-400/20 hover:border-sky-700">
      <div className="aspect-square bg-slate-700 flex items-center justify-center">
         {post.imageUrl ? (
            <img src={post.imageUrl} alt={post.idea} className="w-full h-full object-cover" />
         ) : (
            <div className="text-slate-500">Generating image...</div>
         )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-lg text-sky-400">{post.idea}</h4>
            <button 
                onClick={handleCopy}
                className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors"
            >
                {isCopied ? <CheckIcon className="w-4 h-4 mr-1 text-green-400"/> : <CopyIcon className="w-4 h-4 mr-1"/>}
                {isCopied ? 'Copied!' : 'Copy'}
            </button>
        </div>
        <p className="text-slate-300 text-sm whitespace-pre-wrap">{post.caption}</p>
      </div>
    </div>
  );
};