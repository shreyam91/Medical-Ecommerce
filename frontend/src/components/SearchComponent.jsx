import { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import debounce from 'lodash.debounce';

const mockSuggestions = [
  "ReactJS", "Vite", "Tailwind CSS", "JavaScript", "TypeScript", "Node.js", "OpenAI", "ChatGPT", "AI Tools"
];

export default function SearchComponent() {
  const [query, setQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  // Debounced handler
  const debouncedSearch = useRef(
    debounce((text) => {
      if (text.length > 0) {
        const filtered = mockSuggestions.filter((sug) =>
          sug.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredSuggestions(filtered);
      } else {
        setFilteredSuggestions([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="flex flex-col items-center justify-center w-full min-h-[120px] py-12"
      ref={dropdownRef}
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-700 drop-shadow-sm">
        Search your medicine here
      </h1>
      <div className={`relative w-full max-w-xl transition-all duration-300 ease-in-out`}>  
        <FiSearch
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-transform duration-300 ${
            isFocused ? 'text-blue-500 scale-110' : 'scale-100'
          }`}
          size={22}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search your medicine here... "
          className="w-full pl-10 pr-4 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-300 shadow-md focus:shadow-xl bg-white text-lg"
        />
      </div>
      {isFocused && filteredSuggestions.length > 0 && (
        <ul className="absolute w-full max-w-xl bg-white rounded-lg shadow-lg mt-2 z-10 overflow-hidden">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                setQuery(suggestion);
                setIsFocused(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
