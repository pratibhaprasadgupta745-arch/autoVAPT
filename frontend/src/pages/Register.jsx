import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"
import { addUser } from "../api"
import "./login.css"

function Register() {

  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()

    try {

      const response = await addUser({
        email: email.trim(),
        password: password.trim(),
        role: "user"
      })

      console.log("Server response:", response)

      alert("Registration successful!")

      navigate("/")

    } catch (error) {

      console.error("Register error:", error)

      if (error.response) {
        alert(error.response.data.detail || "Registration failed")
      } else {
        alert("Server connection error")
      }

    }
  }

  return (

    <div className="login-container">

      <div className="login-card">

        <h1 className="logo">🛡 AutoVAPT</h1>

        <p className="subtitle">
          Create your AutoVAPT account
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Email */}
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password */}
          <label>Password</label>

          <div className="password-box">

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>

          </div>

          <button className="login-btn">
            Register
          </button>

        </form>

        <div className="links">

          <span
            className="link"
            onClick={() => navigate("/")}
          >
            Already have an account?
          </span>

          <span
            className="link"
            onClick={() => navigate("/")}
          >
            Login
          </span>

        </div>

      </div>

    </div>

  )
}

export default Register