import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      {/* This was the problematic line */}
      {/* <a>
        <Link to="/contact">Contact</Link>
      </a> */}
       <Link to="/contact">Contact</Link>

    </nav>
  );
};

export default Navbar;