import React, {useContext, useState} from 'react'
import AuthContext from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const SignUpPage = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || '/discover';
  let {signupUser} = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const username = e.target.username.value.trim();
    const password = e.target.password.value;
    const email = e.target.email.value.trim();
    
    const result = await signupUser({username, password, email}, from);

    if (!result.success) {
      if (result.errors?.detail) {
        setError(result.errors.detail);
      } else {
        setError('Signup failed. Please try again.');
      }
    }
  }

  return (
    <div className='login-page'>
      <form className='login-form' onSubmit={handleSubmit}>
        <h2>Create an Account</h2>
        {error && <div className='error-message'>{error}</div>}
        
        <label htmlFor='email'>Email</label>
        <input type="email" name="email" placeholder='Enter email' required/>
        <label htmlFor='username'>Username</label>
        <input type="text" name='username' placeholder='Enter username' required/>
        <label htmlFor='password'>Password</label>
        <input type="password" name='password' placeholder='Enter password' required/>
        <input type="submit" value='Sign Up'/>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#ccc' }}>
        Already have an account? <Link to="/login" state={{from: {pathname: from}}}>Login here</Link>
      </p>
      </form>
    </div>
  )
}

export default SignUpPage