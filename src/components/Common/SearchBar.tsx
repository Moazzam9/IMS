import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface FilterOption {
  key: string;
  label: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string, activeFilter: string) => void;
  filterOptions: FilterOption[];
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  filterOptions,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState(filterOptions[0]?.key || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Ensure we're passing the raw value without type conversion
    onSearch(value, activeFilter);
  };

  const handleFilterChange = (filterKey: string) => {
    setActiveFilter(filterKey);
    onSearch(searchTerm, filterKey);
    setIsFilterOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center w-full">
        <div className="relative flex-grow">
          <input
            type="text"
            className="w-full px-4 py-2 pl-10 pr-4 border border-nihal-yellow rounded-md focus:outline-none focus:ring-2 focus:ring-nihal-yellow"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleSearch}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-nihal-yellow" />
          </div>
        </div>
        
        {filterOptions.length > 0 && (
          <div className="relative ml-2">
          <button
            type="button"
            className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-nihal-blue bg-white border border-nihal-yellow rounded-md shadow-sm hover:bg-nihal-yellow hover:text-white focus:outline-none focus:ring-2 focus:ring-nihal-yellow"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            {filterOptions.find(option => option.key === activeFilter)?.label || 'Filter'}
          </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-nihal-yellow ring-opacity-50 focus:outline-none">
                <div className="py-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.key}
                      className={`block w-full px-4 py-2 text-left text-sm ${activeFilter === option.key ? 'bg-nihal-yellow text-white' : 'text-nihal-blue'} hover:bg-nihal-yellow hover:text-white`}
                      onClick={() => handleFilterChange(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;