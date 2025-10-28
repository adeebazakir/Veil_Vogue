// frontend/src/LoginScreen.jsx (UPDATED WITH ROLE REDIRECT)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Css/Auth.css';

const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password }, config);
            localStorage.setItem('userInfo', JSON.stringify(data));

            // Role-based redirect
            if (data.role === 'admin') navigate('/admin/dashboard');
            else if (data.role === 'seller') navigate('/seller/products');
            else navigate('/');

            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <div className="loginsignup">
          <div className="loginsignup-container">
            <h1>Sign In</h1>

            {error && <p style={{color:'#b00020', textAlign:'center', marginBottom:10}}>{error}</p>}

            <form className="loginsignup-fields" onSubmit={submitHandler}>
              <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
              <button type="submit">Continue</button>
            </form>

            <p className="loginsignup-login">New here? <Link to="/register"><span>Register</span></Link></p>

            <div className="loginsignup-agree">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
          </div>
        </div>
    );
};

export default LoginScreen;