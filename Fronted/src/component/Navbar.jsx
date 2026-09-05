import React, { useEffect, useRef, useState } from 'react'
import { navbarStyles } from '../assets/dummystyle'
import image1 from '../assets/image.png'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import axios from'axios'

const Navbar = ({ user: propUser,setuser, onLogout }) => {
  const navigate = useNavigate()
  const menuRef = useRef(null)
 const [menuOpen, setMenuOpen] = useState(false)
   
const toggleMenu =()=> setMenuOpen((prev) => !prev);

const Base_Url = 'http://localhost:5000/api';

  useEffect(()=>
{
    const fetchuserData = async ()=>
    {
try {
     const token = localStorage.getItem("token");

     if(!token) return
     
     const response = await axios.get(`${Base_Url}/user/me`,{
       headers: {
              Authorization: `Bearer ${token}`,
},
        });
        const userData = response.data.user || response.data;
        setuser(userData);
} 

catch (error) {
    console.log("failed upload profile ",error);
}
    }
 if(!propUser)
 {
    fetchuserData();
 }
},[propUser]);

  const user = propUser || {
    name: '',
    email: '',
  }
 const handleLogout = ()=>
{
   setMenuOpen(false);
   localStorage.removeItem("token");
   onLogout?.();
 navigate("/login");
};

 useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, []);


  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>

        {/* Logo */}
        <div
          onClick={() => navigate('/')}
          className={navbarStyles.logoContainer}
        >
          <div className={navbarStyles.logoImage}>
            <img src={image1} alt="logo" />
          </div>

          <span className={navbarStyles.logoText}>
            Expense Tracker
          </span>
        </div>

        {/* User Menu */}
        <div
          className={navbarStyles.userContainer}
          ref={menuRef}
        >
          <button
            onClick={toggleMenu}
            className={navbarStyles.userButton}
          >

            {/* Avatar */}
            <div className="relative">
              <div className={navbarStyles.userAvatar}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>

              <div className={navbarStyles.statusIndicator}></div>
            </div>

            {/* User Information */}
            <div className={navbarStyles.userTextContainer}>
              <p className={navbarStyles.userName}>
                {user?.name || 'User'}
              </p>

              <p className={navbarStyles.userEmail}>
                {user?.email || 'user@example.com'}
              </p>
            </div>

            {/* Arrow */}
            <ChevronDown
              className={navbarStyles.chevronIcon(menuOpen)}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div className={navbarStyles.dropdownMenu}>

              {/* Dropdown Header */}
              <div className={navbarStyles.dropdownHeader}>

                <div className="flex items-center gap-3">

                  {/* Dropdown Avatar */}
                  <div className={navbarStyles.dropdownAvatar}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>

                  {/* Name + Email */}
                  <div>
                    <p className={navbarStyles.dropdownName}>
                      {user?.name || 'User'}
                    </p>

                    <p className={navbarStyles.dropdownEmail}>
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>

                </div>

              </div>

            <div className={navbarStyles.menuItemContainer}>
               <button onClick={()=>{
                setMenuOpen(false);
                navigate("/profile")
               }} className={navbarStyles.menuItem}
               >
                <user className="w-4 h-4"/>
                <span>My profile</span>
               </button>
            </div>

        <div className={navbarStyles.menuItemBorder}>
            <button onClick={handleLogout}
            className={navbarStyles.logoutButton}
            >
                 <logout className ="w-4 h-4"/>
                 <span> Logout</span>
            </button>
        </div>
            </div>
          )}

        </div>

      </div>
    </header>
  )
}

export default Navbar