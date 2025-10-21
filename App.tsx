import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Language, TypingStatus, TypingStats, TypingSession } from './types';
import { PROGRAMMING_LANGUAGES } from './constants';
import { generateCodeSnippet } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import TypingChallenge from './components/TypingChallenge';
import Metrics from './components/Metrics';
import ProgressModal from './components/ProgressModal';
import useLocalStorage from './hooks/useLocalStorage';


const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const RestartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10M20 20l-1.5-1.5A9 9 0 003.5 14" />
    </svg>
);

const NextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

const ProgressIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8M4 4h8m0 0v8m0-8l-8 8" />
    </svg>
);

const FocusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
);


const App: React.FC = () => {
    const [language, setLanguage] = useState<Language>(PROGRAMMING_LANGUAGES[0]);
    const [challengeId, setChallengeId] = useState<number>(0);
    const [challengeText, setChallengeText] = useState<string>('');
    const [userInput, setUserInput] = useState<string>('');
    const [status, setStatus] = useState<TypingStatus>(TypingStatus.Waiting);
    const [stats, setStats] = useState<TypingStats>({ wpm: 0, accuracy: 100, time: 0 });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isProgressOpen, setIsProgressOpen] = useState<boolean>(false);
    const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
    const [typingHistory, setTypingHistory] = useLocalStorage<TypingSession[]>('typingHistory', []);
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    const resetState = () => {
        setUserInput('');
        setStatus(TypingStatus.Waiting);
        setStats({ wpm: 0, accuracy: 100, time: 0 });
        startTimeRef.current = null;
        if(timerRef.current) clearInterval(timerRef.current);
    };

    const fetchChallenge = useCallback(async () => {
        setIsLoading(true);
        resetState();
        try {
            const snippet = await generateCodeSnippet(language.name);
            setChallengeText(snippet);
        } catch (error) {
            console.error(error);
            setChallengeText("// Failed to load challenge. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    useEffect(() => {
        fetchChallenge();
    }, [fetchChallenge, challengeId]);

    useEffect(() => {
        if (status !== TypingStatus.Typing) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        timerRef.current = window.setInterval(() => {
            if (!startTimeRef.current) return;
            const now = Date.now();
            const timeElapsed = (now - startTimeRef.current) / 1000;
            
            let correctChars = 0;
            for (let i = 0; i < userInput.length; i++) {
                if (userInput[i] === challengeText[i]) {
                    correctChars++;
                }
            }
            
            const accuracy = userInput.length > 0 ? (correctChars / userInput.length) * 100 : 100;
            const wpm = userInput.length > 0 ? (userInput.length / 5) / (timeElapsed / 60) : 0;

            setStats({ time: timeElapsed, wpm, accuracy });
        }, 1000);
        
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, userInput, challengeText]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFocusMode(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (status === TypingStatus.Finished) return;

        const value = e.target.value;
        
        if (status === TypingStatus.Waiting && value.length > 0) {
            setStatus(TypingStatus.Typing);
            startTimeRef.current = Date.now();
        }

        setUserInput(value);
        
        if (value.length === challengeText.length) {
            setStatus(TypingStatus.Finished);
            if (timerRef.current) clearInterval(timerRef.current);

            // Final calculation and save session
            const finalTime = (Date.now() - (startTimeRef.current || Date.now())) / 1000;
            let correctChars = 0;
            for (let i = 0; i < value.length; i++) {
                if (value[i] === challengeText[i]) {
                    correctChars++;
                }
            }
            const finalAccuracy = (correctChars / value.length) * 100;
            const finalWpm = (value.length / 5) / (finalTime / 60);
            
            const finalStats = { wpm: finalWpm, accuracy: finalAccuracy, time: finalTime };
            setStats(finalStats);

            const newSession: TypingSession = {
                id: Date.now(),
                language: language.name,
                ...finalStats,
                timestamp: Date.now(),
            };
            setTypingHistory(prev => [...prev, newSession]);
        }
    };
    
    const handleRestart = () => {
        resetState();
    };

    const handleNewChallenge = () => {
        setChallengeId(prev => prev + 1);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-900 to-gray-800">
             <ProgressModal 
                isOpen={isProgressOpen} 
                onClose={() => setIsProgressOpen(false)}
                history={typingHistory}
                onClearHistory={() => setTypingHistory([])}
             />
            <header className={`text-center mb-8 transition-all duration-300 ease-in-out ${isFocusMode ? 'opacity-0 scale-95 -translate-y-4 pointer-events-none' : 'opacity-100'}`}>
                <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    CodeTyper AI
                </h1>
                <p className="text-gray-400 mt-2">Sharpen your coding fingers with AI-generated challenges.</p>
            </header>

            <main className="w-full flex flex-col items-center">
                <div className={`transition-all duration-300 ease-in-out ${isFocusMode ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100'}`}>
                    <LanguageSelector selectedLanguage={language} onSelectLanguage={(lang) => { setLanguage(lang); handleNewChallenge(); }} />
                    <Metrics stats={stats} />
                </div>

                <div className={`w-full max-w-4xl min-h-[200px] flex items-center justify-center transition-transform duration-300 ease-in-out ${isFocusMode ? 'scale-105' : 'scale-100'}`}>
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <TypingChallenge
                        challengeText={challengeText}
                        userInput={userInput}
                        onInputChange={handleInputChange}
                        isFocused={status !== TypingStatus.Finished}
                        isFocusMode={isFocusMode}
                    />
                )}
                </div>

                <div className="mt-6 flex gap-4">
                     <button onClick={() => setIsProgressOpen(true)} className={`flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out ${isFocusMode ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>
                        <ProgressIcon className="w-5 h-5" />
                        Progress
                    </button>
                    <button onClick={handleRestart} className={`flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out ${isFocusMode ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>
                        <RestartIcon className="w-5 h-5" />
                        Restart
                    </button>
                    <button onClick={handleNewChallenge} className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out ${isFocusMode ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100'}`}>
                        New Challenge
                        <NextIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setIsFocusMode(!isFocusMode)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        <FocusIcon className="w-5 h-5" />
                        {isFocusMode ? 'Exit Focus' : 'Focus'}
                    </button>
                </div>
            </main>
            <footer className={`mt-12 text-center text-gray-500 text-sm transition-all duration-300 ease-in-out ${isFocusMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <p>Powered by Google Gemini</p>
            </footer>
        </div>
    );
};

export default App;