import React from 'react';
import { Link } from 'react-router-dom';
import './style/style.css';

const NavLink = ({ to, children }) => {
  return (
    <Link to={to} className='nav-link'>
      <div>
        <p>{children}</p>
      </div>
    </Link>
  );
};

const Nav = () => {
  return (
    <div className='nav'>
      <Link to='/' className='nav-link'>
        <p>Home</p>
      </Link>
      <NavLink to='/completion'>Completion</NavLink>
      <NavLink to='/stream'>Stream</NavLink>
      <NavLink to='/chat'>Chat</NavLink>
      <NavLink to='/pdf-summary'>PDF Summary</NavLink>
      <NavLink to='/chat-function'>Chat Function</NavLink>
      <NavLink to='/chatbot'>Chatbot</NavLink>
    </div>
  );
};

export default Nav;
