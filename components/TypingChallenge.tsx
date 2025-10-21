import React, { useRef, useEffect } from 'react';

interface TypingChallengeProps {
  challengeText: string;
  userInput: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isFocused: boolean;
  isFocusMode: boolean;
}

const Character: React.FC<{
  char: string;
  state: 'correct' | 'incorrect' | 'untyped';
  isCursor: boolean;
  isFocusMode: boolean;
  isLastTyped: boolean;
}> = ({ char, state, isCursor, isFocusMode, isLastTyped }) => {
  const stateClasses = {
    correct: 'text-emerald-400',
    incorrect: 'text-red-400 bg-red-500/20 rounded-sm',
    untyped: 'text-gray-500',
  };

  const cursorClass = isCursor
    ? `rounded-sm ${isFocusMode ? 'soft-blink-cursor bg-blue-500' : 'bg-blue-500/50 animate-pulse'}`
    : '';
  
  const animationClass = isLastTyped && state !== 'untyped' ? 'animate-pop-in' : '';

  const displayChar = char === '\n' ? '↵\n' : char;

  return (
    <span className={`${stateClasses[state]} ${cursorClass} ${animationClass} transition-colors duration-150`}>{displayChar}</span>
  );
};

const TypingChallenge: React.FC<TypingChallengeProps> = ({
  challengeText,
  userInput,
  onInputChange,
  isFocused,
  isFocusMode,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const renderContent = () => {
    // Determine the current line index based on the cursor position
    const textUpToCursor = challengeText.substring(0, userInput.length);
    const currentLineIndex = (textUpToCursor.match(/\n/g) || []).length;
    
    const lines = challengeText.split('\n');
    let globalCharIndex = 0;

    return lines.map((line, lineIndex) => {
      const isCurrentLine = lineIndex === currentLineIndex;
      const lineStyle = isFocusMode
        ? `transition-all duration-500 ${isCurrentLine ? 'opacity-100' : 'opacity-30 blur-[1.5px]'}`
        : '';
      
      const charactersInLine = line.split('').map((char) => {
        const index = globalCharIndex;
        const userChar = userInput[index];
        let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';

        if (userChar !== undefined) {
          state = userChar === char ? 'correct' : 'incorrect';
        }

        const isCursor = index === userInput.length;
        const isLastTyped = index === userInput.length - 1;
        
        globalCharIndex++;
        return <Character key={`char_${index}`} char={char} state={state} isCursor={isCursor} isFocusMode={isFocusMode} isLastTyped={isLastTyped}/>;
      });

      // Handle the newline character that joins the lines
      if (lineIndex < lines.length - 1) {
          const newlineIndex = globalCharIndex;
          const userChar = userInput[newlineIndex];
          let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';
          if (userChar !== undefined) { state = userChar === '\n' ? 'correct' : 'incorrect'; }
          const isCursor = newlineIndex === userInput.length;
          const isLastTyped = newlineIndex === userInput.length - 1;
          
          charactersInLine.push(
              <Character key={`newline_${newlineIndex}`} char={'\n'} state={state} isCursor={isCursor} isFocusMode={isFocusMode} isLastTyped={isLastTyped} />
          );
          globalCharIndex++;
      }
      
      return (
        <span key={lineIndex} className={`block ${lineStyle}`}>
          {charactersInLine.length > 0 ? charactersInLine : <span>&nbsp;</span>}
        </span>
      );
    });
  };

  return (
    <div
      className="relative bg-gray-800 p-6 rounded-lg shadow-inner cursor-text w-full max-w-4xl"
      onClick={() => inputRef.current?.focus()}
    >
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={onInputChange}
        className="absolute top-0 left-0 w-full h-full opacity-0 p-6 -z-10"
        spellCheck="false"
        autoCapitalize="off"
        autoCorrect="off"
      />
      <pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap select-none">
        <code>
          {renderContent()}
        </code>
      </pre>
    </div>
  );
};

export default TypingChallenge;