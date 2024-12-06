import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
  let {loginUser} = useContext(AuthContext)
  console.log("in user page");
  return (
    <div className='login-page'>
      <form className='login-form' onSubmit={loginUser}>
        <input type="text" name='username' placeholder='Enter username'/>
        <input type="text" name='password' placeholder='Enter password'/>
        <input type="submit" />
      </form>
    </div>
  )
}

export default LoginPage