// src/pages/HomePage.js
import React from 'react';

const HomePage = () => {
  const users = [
    { id: 1, name: 'User 1', image: '/user1.jpg' },
    { id: 2, name: 'User 2', image: '/user2.jpg' },
    // Thêm danh sách người dùng ở đây
  ];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome to My Website - EliteClub</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map(user => (
          <div key={user.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <img src={user.image} alt={user.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600">Some description here...</p>
              <button className="mt-4 bg-blue-500 text-white py-2 px-4 rounded">View Profile</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
