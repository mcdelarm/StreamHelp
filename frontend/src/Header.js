import React from 'react'
import { useContext } from 'react';
import {Link, useLocation} from 'react-router-dom';
import AuthContext from './context/AuthContext';

const Header = () => {
  let {user, logoutUser} = useContext(AuthContext);

  const location = useLocation();

  return (
    <header className='app-header'>
      <div className='header-left'>StreamHelp</div>

      <div className='header-center'>
        <button className={`nav-button ${location.pathname === '/discover' ? 'active' : ''}`}>
          <Link to={'/discover'} className='nav-link'>Discover</Link>
          </button>
        <button className={`nav-button ${location.pathname === '/watched' ? 'active' : ''}`}>
          <Link to={'/watched'} className='nav-link'>Watched</Link>
        </button>
      </div>

      <div className='header-right'>
    {user ? (
      <button className='logout-button' onClick={logoutUser}>Logout</button>
    ): (
      
      <Link to='/login' state={{from: location}}>
        <button className='login-button'>Login
        </button>
      </Link>
      
    )}
    </div>
    </header>
    
  )
}

export default Header