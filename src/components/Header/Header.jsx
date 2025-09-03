// components/Header/Header.js
import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';

const Header = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer); 
  }, []);

  const dateStr = dateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome!</h1>
          <p className="text-sm text-gray-600">Today is {dateStr}</p>
        </div>
        <div className="flex items-center space-x-4">
          <SearchBar />
        </div>
      </div>
    </header>
  );
};

export default Header;