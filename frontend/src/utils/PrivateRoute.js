import React from 'react'
import { Navigate, useLocation} from 'react-router-dom'
import { useContext } from 'react'
import AuthContext from '../context/AuthContext'

const PrivateRoute = ({children, ...rest}) => {
  const location = useLocation();
  let {user} = useContext(AuthContext);

  return !user ? <Navigate to='/login' state={{from: location}} /> : children;
}

export default PrivateRoute