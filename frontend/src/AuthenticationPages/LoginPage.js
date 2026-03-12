import React, { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const LoginPage = () => {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/discover";
  let { loginUser } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const username = e.target.username.value;
    const password = e.target.password.value;

    const success = await loginUser(username, password, from);

    if (!success) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-header">
          <p className="login-title">Welcome back</p>
          <p className="login-description">
            Sign in to your account to continue
          </p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="login-input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter username"
            required
          />
        </div>
        <div className="login-input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            required
          />
        </div>
        <input type="submit" value="Sign In" />
        <p className="login-link">
          Don’t have an account?{" "}
          <Link to="/sign-up" state={{ from: { pathname: from } }}>
            Sign up here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
