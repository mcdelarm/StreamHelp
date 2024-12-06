import React from 'react'
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav className='app-nav'>
      <button className='nav-button'>
        <Link to={'/discover'} className='nav-link'>Discover New Movies</Link>
      </button>
      <button className='nav-button'>
        <Link to={'watched'} className='nav-link'>Previously Watched Movies</Link>
      </button>
    </nav>
  )
}

export default Nav