// components/Header/Header.js
import React, { useEffect, useState } from 'react';

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

  const timeStr = dateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome Back!</h1>
          <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{timeStr}</p>
          <p className="text-xs text-gray-500 mt-0.5">IST</p>
        </div>
      </div>
    </header>
  );
};

export default Header;