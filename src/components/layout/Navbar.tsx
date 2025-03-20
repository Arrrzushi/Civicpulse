
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link to="/" className="flex items-center px-3 py-2">Home</Link>
            <Link to="/submit" className="flex items-center px-3 py-2">Submit</Link>
            <Link to="/feed" className="flex items-center px-3 py-2">Feed</Link>
            <Link to="/profile" className="flex items-center px-3 py-2">Profile</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
