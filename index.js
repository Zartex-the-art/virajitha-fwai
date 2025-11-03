import { generateViralContent } from './services/geminiService.js';
import { fetchTopNews } from './services/newsService.js';

const INDUSTRIES = ['Healthcare', 'Technology', 'Finance', 'Renewable Energy', 'E-commerce'];

// DOM Elements
const apiKeyScreen = document.getElementById('api-key-screen');
const appScreen = document.getElementById('app-screen');
const selectKeyBtn = document.getElementById('select-key-btn');
const apiKeyError = document.getElementById('api-key-error');

const industrySelector = document.getElementById('industry-selector');
const generateBtn = document.getElementById('generate-btn');
const appError = document.getElementById('app-error');
const loader = document.getElementById('loader');
const loaderMessage = document.getElementById('loader-message');
const resultsContainer = document.getElementById('results-container');
const postsGrid = document.getElementById('posts-grid');

// State
let isKeyReady = false;

// --- UI Functions ---
const showApiKeyScreen = (error = null) => {
    apiKeyScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    if (error) {
        apiKeyError.textContent = error;
        apiKeyError.classList.remove('hidden');
    } else {
        apiKeyError.classList.add('hidden');
    }
};

const showAppScreen = () => {
    apiKeyScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
};

const setLoading = (isLoading, message = '') => {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        loader.classList.remove('hidden');
        loaderMessage.textContent = message;
        resultsContainer.classList.add('hidden');
        postsGrid.innerHTML = '';
        appError.classList.add('hidden');
    } else {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Posts';
        loader.classList.add('hidden');
    }
};

const displayError = (message, isApiKeyError = false) => {
    if (isApiKeyError) {
        showApiKeyScreen(message);
    } else {
        appError.innerHTML = `<strong class="font-bold">Error: </strong><span class="block sm:inline">${message}</span>`;
        appError.classList.remove('hidden');
    }
};

const createPostCardHTML = (post) => {
    const placeholder = `<div class="text-slate-500">Generating image...</div>`;
    const image = post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.idea}" class="w-full h-full object-cover">` : placeholder;

    return `
        <div class="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 transition-all duration-300 hover:shadow-sky-400/20 hover:border-sky-700">
            <div class="aspect-square bg-slate-700 flex items-center justify-center">${image}</div>
            <div class="p-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-lg text-sky-400">${post.idea}</h4>
                    <button data-caption="${encodeURIComponent(post.caption)}" class="copy-btn flex items-center text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-1 px-3 rounded-md transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.5c0-.621.504-1.125 1.125-1.125H7.5"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 3.75H9.75a1.125 1.125 0 0 0-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V7.5L15 3.75Z"></path></svg>
                        <span>Copy</span>
                    </button>
                </div>
                <p class="text-slate-300 text-sm whitespace-pre-wrap">${post.caption}</p>
            </div>
        </div>
    `;
};


// --- API Key Logic ---
const checkApiKey = async () => {
    try {
        isKeyReady = await window.aistudio.hasSelectedApiKey();
        return isKeyReady;
    } catch (e) {
        console.error("aistudio API not available.", e);
        isKeyReady = false;
        return false;
    }
};

const handleSelectKey = async () => {
    try {
        await window.aistudio.openSelectKey();
        isKeyReady = true;
        showAppScreen();
    } catch (e) {
        console.error("Failed to open key selection.", e);
        displayError("Could not open the API key selection dialog.", true);
    }
};

// --- App Logic ---
const handleGenerateClick = async () => {
    if (!(await checkApiKey())) {
        displayError("Please select your API key before generating posts.", true);
        return;
    }

    setLoading(true);
    const selectedIndustry = industrySelector.value;

    try {
        setLoading(true, 'Fetching latest news...');
        const articles = await fetchTopNews(selectedIndustry);

        setLoading(true, 'Generating viral ideas & captions...');
        const contentIdeas = await generateViralContent(articles, selectedIndustry);
        
        resultsContainer.classList.remove('hidden');
        const posts = [];
        for (let i = 0; i < contentIdeas.length; i++) {
            setLoading(true, `Creating image ${i + 1} of ${contentIdeas.length}...`);
            posts.push(contentIdeas[i]);
            // Update UI incrementally
            postsGrid.innerHTML = posts.map(createPostCardHTML).join('');
        }
    } catch (err) {
        console.error(err);
        const errorMessage = err.message || 'An unknown error occurred.';
        if (errorMessage.includes("API key") || errorMessage.includes("Requested entity was not found")) {
            displayError("Your API key seems invalid. Please select your key again.", true);
        } else {
            displayError(errorMessage);
        }
    } finally {
        setLoading(false);
    }
};

const handleCopyClick = (e) => {
    const copyBtn = e.target.closest('.copy-btn');
    if (!copyBtn) return;

    const caption = decodeURIComponent(copyBtn.dataset.caption);
    navigator.clipboard.writeText(caption);
    
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-1 text-green-400"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"></path></svg>
        <span>Copied!</span>
    `;
    setTimeout(() => {
        copyBtn.innerHTML = originalText;
    }, 2000);
};

// --- Initialization ---
const init = async () => {
    // Populate selector
    industrySelector.innerHTML = INDUSTRIES.map(ind => `<option value="${ind}" class="bg-slate-800 text-white">${ind}</option>`).join('');

    // Add event listeners
    selectKeyBtn.addEventListener('click', handleSelectKey);
    generateBtn.addEventListener('click', handleGenerateClick);
    postsGrid.addEventListener('click', handleCopyClick);
    
    // Check for API key and show appropriate screen
    if (await checkApiKey()) {
        showAppScreen();
    } else {
        showApiKeyScreen();
    }
};

// Start the app
init();
