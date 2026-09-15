
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Layout from "./component/Layout";
import Dashboard from "./pages/Dashboard";
import Login from "./component/login";
import Signup from "./component/Signup";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Get transactions from localStorage
const getTransactionFromStorage = () => {
  const saved = localStorage.getItem("transactions");

  return saved ? JSON.parse(saved) : [];
};

//  ProtectedRoute 

const ProtectedRoute = ({ user, children }) => {
  const localtoken = localStorage.getItem("token");
  const sessiontoken = sessionStorage.getItem("token");

  const hasToken = localtoken || sessiontoken;

  if (!user || !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// Scroll to top when page changes
const ScrollTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  return null;
};


const App = () => {
  const [user, setuser] = useState(null);
  const [token, settoken] = useState(null);
  const [transaction, settransaction] = useState([]);
  const [isloading, setisloading] = useState(true);

  const navigate = useNavigate();


  // --------------------------------
  // Save user and token
  // --------------------------------

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


  // --------------------------------
  // Clear authentication
  // --------------------------------

  const clearAuth = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");

    } catch (error) {
      console.log(
        "auth error",
        error
      );
    }

    setuser(null);
    settoken(null);
  };


  // --------------------------------
  // Update user in storage
  // --------------------------------

  const updateuserdata = (updatedUser) => {
    setuser(updatedUser);

    const localtoken =
      localStorage.getItem("token");

    const sessiontoken =
      sessionStorage.getItem("token");

    if (localtoken) {
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
    } else if (sessiontoken) {
      sessionStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
    }
  };


  // --------------------------------
  // Load user from local/session storage
  // --------------------------------

  useEffect(() => {
    (async () => {
      try {
        const localuserRaw =
          localStorage.getItem("user");

        const sessionuserRaw =
          sessionStorage.getItem("user");

        const localtoken =
          localStorage.getItem("token");

        const sessiontoken =
          sessionStorage.getItem("token");

        const storeduser = localuserRaw
          ? JSON.parse(localuserRaw)
          : sessionuserRaw
          ? JSON.parse(sessionuserRaw)
          : null;

        const storedtoken =
          localtoken ||
          sessiontoken ||
          null;

        const tokenfromlocal =
          !!localtoken;


        // If user already exists in storage
        if (storeduser) {
          setuser(storeduser);
          settoken(storedtoken);
          return;
        }


        // If only token exists
        if (storedtoken) {
          try {
            const res = await axios.get(
              `${API_URL}/user/getuser`,
              {
                headers: {
                  Authorization:
                    `Bearer ${storedtoken}`,
                },
              }
            );

            const profile = res.data;

            persistAuth(
              profile,
              storedtoken,
              tokenfromlocal
            );

          } catch (fetcherr) {
            console.log(
              "fetch error updateuser",
              fetcherr
            );

            clearAuth();
          }
        }

      } catch (error) {
        console.log(
          "Auth error",
          error
        );

      } finally {
        setisloading(false);

        try {
          settransaction(
            getTransactionFromStorage()
          );

        } catch (error) {
          console.log(
            "transaction is not set",
            error
          );
        }
      }
    })();
  }, []);


  // --------------------------------
  // Save transactions
  // --------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(
        "transactions",
        JSON.stringify(transaction)
      );

    } catch (error) {
      console.log(
        "transaction not found",
        error
      );
    }
  }, [transaction]);


  // --------------------------------
  // Add transaction
  // --------------------------------

  const addTransaction = (newTransaction) => {
    settransaction((prev) => [
      newTransaction,
      ...prev,
    ]);
  };


  // --------------------------------
  // Edit transaction
  // --------------------------------

  const editTransaction = (
    id,
    updatedTransaction
  ) => {
    settransaction((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...updatedTransaction,
              id,
            }
          : t
      )
    );
  };


  // --------------------------------
  // Delete transaction
  // --------------------------------

  const deleteTransaction = (id) => {
    settransaction((prev) =>
      prev.filter(
        (t) => t.id !== id
      )
    );
  };

   if (isloading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  // --------------------------------
  // Refresh transactions
  // --------------------------------

  const refreshTransactions = () => {
    settransaction(
      getTransactionFromStorage()
    );
  };


  // --------------------------------
  // Signup
  // --------------------------------

  const handleSignup = (
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


  // --------------------------------
  // Login
  // --------------------------------

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


  // --------------------------------
  // Logout
  // --------------------------------

  const handleLogout = () => {
    clearAuth();

    navigate("/login");
  };


  // --------------------------------
  // Loading screen
  // --------------------------------

  if (isloading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }


  // --------------------------------
  // Routes
  // --------------------------------

  return (
    <>
      <ScrollTop />

      <Routes>

        {/* Login */}
        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
            />
          }
        />


        {/* Signup */}
        <Route
          path="/signup"
          element={
            <Signup
              onSignup={handleSignup}
            />
          }
        />


        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute user={user}>
              <Layout
                user={user}
                onLogout={handleLogout}
                 transaction={transaction}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                refreshTransactions={refreshTransactions}
              />
            </ProtectedRoute> 
          
  
          }
        >

          <Route
            path="/"
            element={
              <Dashboard
                user={user}
                transaction={transaction}
                addTransaction={addTransaction}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
                refreshTransactions={refreshTransactions}
              />
            }
          />

        </Route>

      </Routes>
    </>
  );
};

export default App;
