
import React from 'react';
import { PROGRAMMING_LANGUAGES } from '../constants';
import { Language } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelectLanguage: (language: Language) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onSelectLanguage }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {PROGRAMMING_LANGUAGES.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelectLanguage(lang)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${
            selectedLanguage.id === lang.id
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {lang.name}
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
