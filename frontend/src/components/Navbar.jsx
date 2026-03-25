import { useLocation } from "react-router-dom"
import { useState } from "react"

function Navbar(){

const location = useLocation()
const [dark,setDark] = useState(false)

const getTitle = () => {

switch(location.pathname){

case "/dashboard":
return "Dashboard"

case "/scan":
return "New Scan"

case "/vulnerabilities":
return "Vulnerabilities"

case "/reports":
return "Reports"

case "/settings":
return "Settings"

case "/admin":
return "Admin Panel"

default:
return "AutoVAPT"

}

}

const toggleDark = () => {

setDark(!dark)

document.body.classList.toggle("bg-slate-900")
document.body.classList.toggle("text-white")

}

return(

<div className="w-full bg-white shadow px-6 py-4 flex justify-between items-center">

{/* Left Title */}

<h2 className="text-xl font-semibold">
{getTitle()}
</h2>

{/* Right Controls */}

<div className="flex items-center gap-5">

{/* Notification */}

<button className="text-xl">
🔔
</button>

{/* Dark Mode */}

<button
onClick={toggleDark}
className="text-xl"
>
🌙
</button>

{/* User */}

<div className="flex items-center gap-2">

<div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
A
</div>

<span className="text-sm">
Admin
</span>

</div>

{/* Logout */}

<button className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">

Logout

</button>

</div>

</div>

)

}

export default Navbar