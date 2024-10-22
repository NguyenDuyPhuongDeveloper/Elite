// src/components/Header.js
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="logo">
          <img src="/logo.png" alt="Logo" className="h-10" />
        </div>
        <nav className="flex space-x-4">
          <a href="/" className="text-gray-700">Home</a>
          <a href="/notifications" className="text-gray-700">Notifications</a>
          <a href="/messages" className="text-gray-700">Messages</a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
