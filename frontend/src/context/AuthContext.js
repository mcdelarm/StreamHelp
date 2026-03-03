import React from 'react'
import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
  let [user, setUser] = useState(() => (localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null));
  let [authTokens, setAuthTokens] = useState(() => (localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null));
  let [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  let loginUser = async (username, password, redirectPath = '/discover') => {
    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
      });

      if (response.status === 200) {
        const data = await response.json();
        localStorage.setItem('authTokens', JSON.stringify(data));
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        navigate(redirectPath, {replace: true});
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log("Invalid username and/or password", error);
      return false;
    }
  }

  const signupUser = async (userData, redirectPath = '/discover') => {
    try {
      const response = await fetch('/api/sign-up-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.status === 201) {
        localStorage.setItem('authTokens', JSON.stringify(data));
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        console.log(`SignUp from location: ${redirectPath}`);
        navigate(redirectPath, {replace: true});
        return {sucess:true}
      } else {
        return {sucess:false, errors: data}
      }
    } catch (err) {
      return {success: false, errors: {detail: 'Server error'}}
    }
  };

  let logoutUser = (e) => {
    if (e) {
      e.preventDefault();
    }
    navigate('/discover', {replace: true});

    setTimeout(() => {
      localStorage.removeItem('authTokens');
      setAuthTokens(null);
      setUser(null);
    }, 0);
  };

  const updateToken = async () => {
    const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body:JSON.stringify({refresh:authTokens?.refresh})
    })

    const data = await response.json()
    if (response.status === 200) {
        setAuthTokens(data)
        setUser(jwtDecode(data.access))
        localStorage.setItem('authTokens',JSON.stringify(data))
    } else {
        logoutUser()
    }

    if(loading){
        setLoading(false)
    }
}

useEffect(()=>{
  if(loading) {
    updateToken();
  }
  const REFRESH_INTERVAL = 1000 * 60 * 4 // 4 minutes
  let interval = setInterval(()=>{
      if(authTokens){
          updateToken()
      }
  }, REFRESH_INTERVAL)
  return () => clearInterval(interval)
  //eslint-disable-next-line
},[authTokens, loading]);



  let contextData = {
    user: user,
    authTokens: authTokens,
    loginUser: loginUser,
    logoutUser: logoutUser,
    signupUser: signupUser
  }

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  )
}

