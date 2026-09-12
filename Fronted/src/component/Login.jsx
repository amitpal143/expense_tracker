import React, { useState } from "react";
import { loginStyles } from "../assets/dummystyle";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link} from "react-router-dom";
import axios from "axios";

const Login = ({
  onLogin,
  API_URL = "http://localhost:5000/api",
}) => {

  // -----------------------------
  // States
  // -----------------------------

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [remeberme, setrememberme] = useState(false);
  const [error, seterror] = useState("");
  const [isloading, setisloading] = useState(false);

  const navigate = useNavigate();


  // -----------------------------
  // Fetch Profile
  // -----------------------------

  const fetchProfile = async (token) => {

    if (!token) return null;

    const res = await axios.get(
      `${API_URL}/user/getuser`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data?.user ?? res.data ?? null;
  };


  // -----------------------------
  // Save Authentication Data
  // -----------------------------

  const persistAuth = (profile, token) => {

    const storage = remeberme
      ? localStorage
      : sessionStorage;

    try {

      if (token) {
        storage.setItem("token", token);
      }

      if (profile) {
        storage.setItem(
          "user",
          JSON.stringify(profile)
        );
      }

      // Remove old data from other storage
      const otherStorage = remeberme
        ? sessionStorage
        : localStorage;

      otherStorage.removeItem("token");
      otherStorage.removeItem("user");

    } catch (err) {

      console.error(
        "Storage error:",
        err
      );

    }
  };


  // -----------------------------
  // Login Submit
  // -----------------------------

  const handleSubmit = async (e) => {

    e.preventDefault();

    setisloading(true);
    seterror("");

    try {

      // Login API
      const res = await axios.post(
        `${API_URL}/user/login`,
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );


      // Response data
      const data = res.data || {};

      const token = data.token || null;


      // -----------------------------
      // Get User Profile
      // -----------------------------

      let profile = data.user ?? null;


      // If user is not directly returned
      if (!profile) {

        const copy = {
          ...data,
        };

        delete copy.token;
        delete copy.user;

        if (
          Object.keys(copy).length > 0
        ) {
          profile = copy;
        }
      }


      // If profile still doesn't exist,
      // fetch it using token
      if (!profile && token) {

        try {

          profile = await fetchProfile(token);

        } catch (fetcherr) {

          console.error(
            "Fetch profile error:",
            fetcherr
          );

          profile = {
            email,
          };
        }
      }


      // Last fallback
      if (!profile) {

        profile = {
          email,
        };
      }


      // -----------------------------
      // Save Auth Data
      // -----------------------------

      persistAuth(
        profile,
        token
      );


      // -----------------------------
      // Send Data to App.jsx
      // -----------------------------

      if (typeof onLogin === "function") {

        onLogin(
          profile,
          remeberme,
          token
        );

      } else {

        navigate("/");

      }


      // Clear password
      setpassword("");

    } catch (err) {

      console.error(
        "Login error:",
        err?.response || err
      );

      const serverMsg =
        err?.response?.data?.message ||
        (
          err?.response?.data
            ? JSON.stringify(
                err.response.data
              )
            : null
        ) ||
        err?.message ||
        "Login failed. Please check your email and password.";

      seterror(serverMsg);

    } finally {

      setisloading(false);

    }
  };


  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className={loginStyles.pageContainer}>

      <div className={loginStyles.cardContainer}>

        {/* Header */}

        <div className={loginStyles.header}>

          <div className={loginStyles.avatar}>

            <User className="w-10 h-10 text-white" />

          </div>

          <h1 className={loginStyles.headerTitle}>
            Welcome Back
          </h1>

          <p className={loginStyles.headerSubtitle}>
            Sign in to Your Expense Tracker
          </p>

        </div>


        {/* Form */}

        <div className={loginStyles.formContainer}>

          {/* Error */}

          {error && (

            <div className={loginStyles.errorContainer}>

              <div className={loginStyles.errorIcon}>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >

                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />

                </svg>

              </div>

              <span className={loginStyles.errorText}>
                {error}
              </span>

            </div>

          )}


          <form onSubmit={handleSubmit}>

            {/* Email */}

            <div className="mb-6">

              <label
                htmlFor="email"
                className={loginStyles.label}
              >
                Email address
              </label>

              <div className={loginStyles.inputContainer}>

                <div className={loginStyles.inputIcon}>

                  <Mail className="w-5 h-5" />

                </div>

                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) =>
                    setemail(e.target.value)
                  }
                  className={loginStyles.input}
                  placeholder="Enter your mail @example.com"
                  required
                />

              </div>

            </div>


            {/* Password */}

            <div className="mb-6">

              <label
                htmlFor="password"
                className={loginStyles.label}
              >
                Password
              </label>

              <div className={loginStyles.inputContainer}>

                <div className={loginStyles.inputIcon}>

                  <Lock className="w-5 h-5" />

                </div>

                <input
                  type={
                    showpassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  value={password}
                  onChange={(e) =>
                    setpassword(e.target.value)
                  }
                  className={loginStyles.passwordInput}
                  placeholder="Enter your password"
                  required
                />

                {/* Show / Hide Password */}

                <button
                  type="button"
                  onClick={() =>
                    setshowpassword(
                      !showpassword
                    )
                  }
                  className={loginStyles.passwordToggle}
                >
                  {showpassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}

                </button>

              </div>

            </div>


            {/* Remember Me */}

            <div className={loginStyles.checkboxContainer}>

              <input
                type="checkbox"
                id="remember"
                checked={remeberme}
                onChange={(e) =>
                  setrememberme(
                    e.target.checked
                  )
                }
                className="mr-2"
              />

              <label
                htmlFor="remember"
                className={loginStyles.checkboxLabel}
              >
                Remember me
              </label>

            </div>


            {/* Submit */}
<button
  type="submit"
  disabled={isloading}
  className={`${loginStyles.button} ${
    isloading ? loginStyles.buttonDisabled : ""
  }`}
>
  {isloading ? (
    <>
      <svg
        className={loginStyles.spinner}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />

        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>

      Signing in...
    </>
  ) : (
    "sign in"
  )}
</button>
          </form>
          <div className={loginStyles.signUpContainer}>
     <p className={loginStyles.signUpText}>
  Don't have an account{" "}
  <Link to='/Signup' className={loginStyles.signUpLink}>
    Create One
  </Link>
</p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;