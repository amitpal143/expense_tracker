import React, { useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Layout from './component/Layout'
import Dashboard from './pages/Dashboard'
import Login from './component/login'
import Signup from './component/Signup'

const App = () => {

  const [user, setuser] = useState(null)
  const [token, settoken] = useState(null)

  const navigate = useNavigate()

  // to save the token in localsotrage

    const persistAuth = (
  userObj,
  tokenStr,
  remember = false
) => {

  try {

    const storage = remember
      ? localStorage
      : sessionStorage;

    if (userObj) {
      storage.setItem(
        "user",
        JSON.stringify(userObj)
      );
    }

    if (tokenStr) {
      storage.setItem(
        "token",
        tokenStr
      );
    }

    const otherStorage = remember
      ? sessionStorage
      : localStorage;

    otherStorage.removeItem("user");
    otherStorage.removeItem("token");

    setuser(userObj || null);
    settoken(tokenStr || null);

  } catch (err) {

    console.error(
      "persistAuth error:",
      err
    );

  }
};


  const clearAuth = () => {
    try {
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      sessionStorage.removeItem("user")
      sessionStorage.removeItem("token")
    } catch (error) {
      console.log("autherror", error)
    }

    setuser(null)
    settoken(null)
  }
  //signup

  const handleSignup=(
    userData,
    remember=false,
    tokenFromApi=null
  )=>
  {
    persistAuth(
      userData,
      tokenFromApi,
      remember,
    );

    navigate('/');
  }
  


  
//login
const handleLogin = (
  userData,
  remember = false,
  tokenFromApi = null
) => {

  persistAuth(
    userData,
    tokenFromApi,
    remember
  );

  navigate("/");
};

  //logout 

  const handleLogout = () => {
    clearAuth()
    navigate("/login")
  }

  return (
    <Routes>
    <Route path="/login" element={<Login onLogin={handleLogin}/>}>
    </Route>
    <Route path="/Signup" element={<Signup onSignup={handleSignup}/>}>
    </Route>
      <Route element={<Layout  user={user} onLogout={handleLogout}/>}>
        <Route path="/" element={<Dashboard />} />
      </Route>

    </Routes>
  )
}

export default App