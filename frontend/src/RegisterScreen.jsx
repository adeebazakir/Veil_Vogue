// frontend/src/RegisterScreen.jsx (Refactored with Tailwind CSS)

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Css/Auth.css';

const RegisterScreen = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };
            const { data } = await axios.post('http://localhost:5000/api/users/register', { name, email, password, role }, config);
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate('/');
            window.location.reload();
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
      <div className="loginsignup">
        <div className="loginsignup-container">
          <h1>Create Account</h1>

          {error && <p style={{color:'#b00020', textAlign:'center', marginBottom:10}}>{error}</p>}

          <form className="loginsignup-fields" onSubmit={submitHandler}>
            <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
            <button type="submit">Continue</button>
          </form>

          <p className="loginsignup-login">Already have an account? <Link to="/login"><span>Login here</span></Link></p>
        </div>
      </div>
    );
};

export default RegisterScreen;