import React from 'react'
import { useContext } from 'react';
import {Link, useLocation} from 'react-router-dom';
import AuthContext from './context/AuthContext';

const Header = () => {
  let {user, logoutUser} = useContext(AuthContext);

  const location = useLocation();

  return (
    <div className='app-header'>StreamHelp
    {user ? (
      <button className='logout-button' onClick={logoutUser}>Logout</button>
    ): (
      
      <Link to='/login' state={{from: location}}>
        <button className='login-button'>Login
        </button>
      </Link>
      
    )}
    </div>
  )
}

export default Header