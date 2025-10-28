import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';
import { API_BASE_URL } from '../config/api';

// Font Awesome for cart icon and profile icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUserCircle } from '@fortawesome/free-solid-svg-icons';

const Navbar = () =>{
    const [menu,setmenu]= useState('shop');
    const [cartCount, setCartCount] = useState(0);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    const fetchCartCount = async () => {
        if (!userInfo) {
            setCartCount(0);
            return;
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`${API_BASE_URL}/api/cart`, config);
            // Calculate total quantity from all cart items
            const totalCount = data.cartItems.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(totalCount);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setCartCount(0);
        }
    };

    useEffect(() => {
        fetchCartCount();

        // Listen for custom cart update events
        const handleCartUpdate = () => {
            fetchCartCount();
        };

        window.addEventListener('cartUpdated', handleCartUpdate);

        // Poll cart count every 5 seconds to keep it fresh
        const interval = setInterval(fetchCartCount, 5000);

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            clearInterval(interval);
        };
    }, [userInfo]);

    return(
        <div className='navbar'>
            <div className="nav-logo">
                <div className="logo-badge">V & V</div>
                <p>VEIL & VOGUE</p>
            </div>
            <ul className="nav-menu">
                <li onClick={()=>{setmenu('home')}}><Link style={{textDecoration:'none'}} to='/'>Home</Link>{menu==='home'?<hr/>:<></>}</li>
                <li onClick={()=>{setmenu('suits')}}><Link style={{textDecoration:'none'}} to='/suits'>Suits</Link>{menu==='suits'?<hr/>:<></>}</li>
                <li onClick={()=>{setmenu('abayas')}}><Link style={{textDecoration:'none'}} to='/abayas'>Abayas</Link>{menu==='abayas'?<hr/>:<></>}</li>
                <li onClick={()=>{setmenu('hijabs')}}><Link style={{textDecoration:'none'}} to='/hijabs'>Hijabs</Link>{menu==='hijabs'?<hr/>:<></>}</li>
                <li onClick={()=>{setmenu('accessories')}}><Link style={{textDecoration:'none'}} to='/accessories'>Accessories</Link>{menu==='accessories'?<hr/>:<></>}</li>
            </ul>
            <div className="nav-login-cart">
               <Link to='/login'><button>Login</button></Link>
               <Link to='/cart' className="cart-link"><FontAwesomeIcon icon={faShoppingCart} size="lg" /></Link>
                <div className="nav-cart-count">{cartCount}</div>
               <Link to='/profile' className="profile-link" title="Edit Profile">
                    <FontAwesomeIcon icon={faUserCircle} size="lg" />
               </Link>
            </div>
        </div>
    )
}

export default Navbar;