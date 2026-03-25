import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../styles/theme.css";

function Settings() {

const [settings,setSettings] = useState({
theme:"dark",
notifications:true,
autoScan:false,
scanDepth:"medium",
apiUrl:"http://localhost:8000",
email:"",
reportFormat:"pdf"
})


// ================= LOAD =================

useEffect(()=>{

const saved = localStorage.getItem("settings")

if(saved){
setSettings(JSON.parse(saved))
}

},[])


// ================= THEME APPLY (FIXED) =================

useEffect(()=>{

document.body.classList.remove("light")

if(settings.theme === "light"){
document.body.classList.add("light")
}

},[settings.theme])


// ================= TOGGLE =================

const toggleSetting = (key)=>{
setSettings({...settings,[key]:!settings[key]})
}


// ================= THEME SWITCH =================

const toggleTheme = () => {
setSettings({
...settings,
theme: settings.theme === "light" ? "dark" : "light"
})
}


// ================= SAVE =================

const saveSettings = ()=>{

localStorage.setItem("settings",JSON.stringify(settings))

alert("Settings saved successfully")

}


// ================= RESET =================

const resetSettings = ()=>{

localStorage.removeItem("settings")

document.body.classList.remove("light")

setSettings({
theme:"dark",
notifications:true,
autoScan:false,
scanDepth:"medium",
apiUrl:"http://localhost:8000",
email:"",
reportFormat:"pdf"
})

alert("Settings reset")

}


// ================= UI =================

return(

<div className="settings-page p-8">

<motion.h1
initial={{opacity:0,y:-20}}
animate={{opacity:1,y:0}}
className="text-3xl font-bold mb-6"
>
VAPT Configuration Panel
</motion.h1>


<motion.div
initial={{opacity:0}}
animate={{opacity:1}}
transition={{delay:.2}}
className="bg-card p-6 rounded shadow card-hover"
>

{/* THEME TOGGLE SWITCH */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">Theme</span>

<div
onClick={toggleTheme}
className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-all
${settings.theme === "light" ? "bg-yellow-400" : "bg-gray-700"}`}
>

<motion.div
layout
transition={{ type: "spring", stiffness: 700, damping: 30 }}
className={`w-5 h-5 bg-white rounded-full shadow-md
${settings.theme === "light" ? "translate-x-7" : "translate-x-0"}`}
/>

</div>

</div>


{/* Notifications */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">Notifications</span>

<motion.input
type="checkbox"
checked={settings.notifications}
onChange={()=>toggleSetting("notifications")}
whileTap={{scale:1.2}}
className="w-5 h-5"
/>

</div>


{/* Auto Scan */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">Auto Scan</span>

<motion.input
type="checkbox"
checked={settings.autoScan}
onChange={()=>toggleSetting("autoScan")}
whileTap={{scale:1.2}}
className="w-5 h-5"
/>

</div>


{/* Scan Depth */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">Scan Depth</span>

<select
value={settings.scanDepth}
onChange={(e)=>setSettings({...settings,scanDepth:e.target.value})}
className="bg-input p-2 rounded"
>
<option value="light">Light</option>
<option value="medium">Medium</option>
<option value="deep">Deep</option>
</select>

</div>


{/* API URL */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">API Endpoint</span>

<input
value={settings.apiUrl}
onChange={(e)=>setSettings({...settings,apiUrl:e.target.value})}
className="bg-input p-2 rounded w-64"
/>

</div>


{/* Email */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">Report Email</span>

<input
placeholder="client@email.com"
value={settings.email}
onChange={(e)=>setSettings({...settings,email:e.target.value})}
className="bg-input p-2 rounded w-64"
/>

</div>


{/* Report Format */}

<div className="flex justify-between items-center mb-6">

<span className="font-medium">Report Format</span>

<select
value={settings.reportFormat}
onChange={(e)=>setSettings({...settings,reportFormat:e.target.value})}
className="bg-input p-2 rounded"
>
<option value="pdf">PDF</option>
<option value="csv">CSV</option>
</select>

</div>


{/* ACTION BUTTONS */}

<div className="flex gap-4 mt-6">

<motion.button
whileHover={{scale:1.05}}
whileTap={{scale:.95}}
onClick={saveSettings}
className="btn-primary"
>
Save Settings
</motion.button>

<motion.button
whileHover={{scale:1.05}}
whileTap={{scale:.95}}
onClick={resetSettings}
className="btn-danger"
>
Reset
</motion.button>

</div>

</motion.div>

</div>

)

}

export default Settings