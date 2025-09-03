// components/Header/SearchBar.js
import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = () => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input
      type="text"
      placeholder="Search..."
      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default SearchBar;