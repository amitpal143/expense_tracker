import React, { useEffect, useRef, useState } from 'react'
import { sidebarStyles, cn } from '../assets/dummystyle'
import { AnimatePresence, motion, scale } from 'framer-motion'
import { useLocation, useNavigate, Link} from 'react-router-dom'

import {
  ArrowDown,
  ArrowUp,
  Home,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
  
} from 'lucide-react'


const MENU_ITEMS = [
  {
    text: "Dashboard",
    path: "/",
    icon: <Home size={20} />
  },
  {
    text: "Income",
    path: "/income",
    icon: <ArrowUp size={20} />
  },
  {
    text: "Expenses",
    path: "/expense",
    icon: <ArrowDown size={20} />
  },
  {
    text: "Profile",
    path: "/profile",
    icon: <User size={20} />
  },
]


const Sidebar = ({ user, isCollapsed, setIsCollapsed }) => {

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const sidebarRef = useRef(null)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeHover, setActiveHover] = useState(null)


  // User data
  const {
    name: username = "user",
    email = "user@4016.com"
  } = user || {}

  const initial = username.charAt(0).toUpperCase()


  // Mobile overflow
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto"

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [mobileOpen])


  // Click outside sidebar
  useEffect(() => {

    const handleClickOutside = (e) => {

      if (
        mobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileOpen(false)
      }

    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }

  }, [mobileOpen])


  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }


  // Toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed((c) => !c)
  }


  // Render menu item
  const renderMenuItem = ({ text, path, icon }) => {

    const isActive = pathname === path

    return (

      <motion.li
        key={text}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >

        <Link
          to={path}

          className={cn(
            sidebarStyles.menuItem.base,

            isActive
              ? sidebarStyles.menuItem.active
              : sidebarStyles.menuItem.inactive,

            isCollapsed
              ? sidebarStyles.menuItem.collapsed
              : sidebarStyles.menuItem.expanded
          )}

          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >

          {/* Icon */}
          <span
            className={
              isActive
                ? sidebarStyles.menuIcon.active
                : sidebarStyles.menuIcon.inactive
            }
          >
            {icon}
          </span>


          {/* Menu Text */}
          {!isCollapsed && (

            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              {text}
            </motion.span>

          )}


          {/* Hover Indicator */}
          {activeHover === text &&
            !isActive &&
            !isCollapsed && (

              <span
                className={sidebarStyles.activeIndicator}
              ></span>

            )}

        </Link>

      </motion.li>

    )
  }


  return (

    <>

      <motion.div
        ref={sidebarRef}

        className={sidebarStyles.sidebarContainer.base}

        initial={{
          x: -100,
          opacity: 0
        }}

        animate={{
          x: 0,
          opacity: 1,
          width: isCollapsed ? 80 : 256
        }}

        transition={{
          type: "spring",
          damping: 25
        }}
      >


        <div className={sidebarStyles.sidebarInner.base}>


          {/* =========================
              TOGGLE BUTTON
          ========================== */}

          <button
            onClick={toggleSidebar}
            className={sidebarStyles.toggleButton.base}
          >

            <motion.div
              transition={{
                duration: 0.3
              }}
            >

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >

                <polyline
                  points={
                    isCollapsed
                      ? "9 18 15 12 9 6"
                      : "15 18 9 12 15 6"
                  }
                />

              </svg>

            </motion.div>

          </button>



          {/* =========================
              USER PROFILE
          ========================== */}

          <div
            className={cn(

              sidebarStyles.userProfileContainer.base,

              isCollapsed
                ? sidebarStyles.userProfileContainer.collapsed
                : sidebarStyles.userProfileContainer.expanded

            )}
          >

            {/* IMPORTANT:
                flex items-center
            */}

            <div className="flex items-center">


              {/* User Initial */}
              <div
                className={sidebarStyles.userInitials.base}
              >
                {initial}
              </div>


              {/* Username + Email */}
              {!isCollapsed && (

                <motion.div
                  className="ml-3 overflow-hidden"

                  initial={{
                    opacity: 0,
                    x: -10
                  }}

                  animate={{
                    opacity: 1,
                    x: 0
                  }}

                  exit={{
                    opacity: 0,
                    x: -10
                  }}
                >

                  <h2 className="text-sm font-bold text-gray-800 truncate">
                    {username}
                  </h2>

                  <p className="text-xs text-gray-500 truncate">
                    {email}
                  </p>

                </motion.div>

              )}

            </div>

          </div>



          {/* =========================
              MENU
          ========================== */}

          {/* flex-1 sirf menu ko diya hai */}

          <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">

            <ul
              className={sidebarStyles.menuList.base}
            >

              {MENU_ITEMS.map(renderMenuItem)}

            </ul>

          </div>



          {/* =========================
              SUPPORT
          ========================== */}

          {/* Support ab flex-1 ke BAHAR hai,
              isliye ekdam bottom me rahega */}

          <div
            className={cn(

              sidebarStyles.footerContainer.base,

              isCollapsed
                ? sidebarStyles.footerContainer.collapsed
                : sidebarStyles.footerContainer.expanded

            )}
          >

            <Link

              className={cn(

                sidebarStyles.footerLink.base,

                isCollapsed &&
                sidebarStyles.footerLink.collapsed

              )}

              to="https://hexagondigitalservices.com/"
            >

              <HelpCircle
                size={20}
                className="text-gray-500"
              />

              {!isCollapsed && (
                <span>
                  Support
                </span>
              )}

            </Link>
            <button onClick={handleLogout}  className={cn(

              sidebarStyles.logoutButton.base,
              isCollapsed && sidebarStyles.logoutButton.collapsed
            )}>
              <LogOut size={20} className="text-gray-500"/>
              {!isCollapsed && (<span>LogOut</span>)}
            

            </button>
          </div>


        </div>

      </motion.div>

      <motion.button 
       onClick={()=>setMobileOpen((prev)=> !prev)}
       className={sidebarStyles.mobileMenuButton}
       whileHover={{scale:1.05}}
       whileTap={{scale: 0.95}}
      >
        {mobileOpen ? <X size={24} /> :< Menu size={24}/>}

      </motion.button>
  <AnimatePresence>
  {mobileOpen && (
     <>
      {/* Mobile Backdrop */}
      <motion.div
        className={sidebarStyles.mobileBackdrop}
        onClick={() => setMobileOpen(false)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Mobile Sidebar */}
      <motion.div
        ref={sidebarRef}
        className={sidebarStyles.mobileSidebar.base}
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200
        }}
      >
      <div className ="realtive flex h-full felx  flex-col">

        <div className={sidebarStyles.mobileHeader}>
          <div className={sidebarStyles.mobileUserContainer}>
            <div className={sidebarStyles.userInitials.base}>
              {initial}
              </div>
              <div className="ml-3 min-w-0">
  <h2 className="text-lg font-bold text-gray-800 truncate">
    {username}
  </h2>
  <p className="text-sm text-gray-500 truncate">
    {email}
  </p>
</div>
            
          </div>
          <button onClick={() => setMobileOpen(false)}
            className={sidebarStyles.mobileCloseButton}>
              <X  size={24} className="text-gray-600"/>

          </button>
        </div>
        <div className="flex-1 overflow -y-auto py-4">

                 <ul className={sidebarStyles.mobileMenuList}>
                    {MENU_ITEMS.map(({ text, path, icon }) => (
                      <motion.li key={text} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={path}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            sidebarStyles.mobileMenuItem.base,
                            pathname === path 
                              ? sidebarStyles.mobileMenuItem.active 
                              : sidebarStyles.mobileMenuItem.inactive
                          )}
                        >
                          <span className={pathname === path ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                            {icon}
                          </span>
                          <span>{text}</span>
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
             
        </div>
        <div className={sidebarStyles.mobileFooter}>
          <Link 
           onClick={()=> setMobileOpen(false)} 
          to = "https://hexagondigitalservices.com/"
            className={sidebarStyles.mobileFooterLink}
            >
              <HelpCircle size={20} className="text-gray-500"/>
              <span>Support</span>
          </Link>
          <button onClick={handleLogout} className={sidebarStyles.mobileLogoutButton}>
            <LogOut size={20} className ="text-gray-500"/>
            <span>LogOut</span>
                
              </button>
          

             </div>
      </div>
        
      </motion.div>
    </>
  )}
</AnimatePresence>
            


      

    </>

  )
}


export default Sidebar