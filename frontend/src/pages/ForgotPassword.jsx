import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./login.css"

function ForgotPassword(){

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")

const handleReset = async(e)=>{

e.preventDefault()

try{

const res = await fetch("http://127.0.0.1:8000/auth/reset-password",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
email:email,
new_password:password
})

})

const data = await res.json()

if(res.ok){

alert("Password updated")

navigate("/")

}else{

alert(data.detail || "Error")

}

}catch(error){

alert("Server error")

}

}

return(

<div className="login-container">

<div className="login-card">

<h1 className="logo">🛡 AutoVAPT</h1>

<p className="subtitle">
Reset your password
</p>

<form onSubmit={handleReset}>

<label>Email</label>

<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<label>New Password</label>

<input
type="password"
placeholder="Enter new password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button className="login-btn">
Reset Password
</button>

</form>

<div className="links">

<span
className="link"
onClick={()=>navigate("/")}>
Back to Login
</span>

</div>

</div>

</div>

)

}

export default ForgotPassword