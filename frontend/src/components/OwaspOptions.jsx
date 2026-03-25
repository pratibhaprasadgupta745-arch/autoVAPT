import React, { useState } from "react";

function OwaspOptions({ onChange }) {

const [options,setOptions] = useState({

sql:true,
xss:true,
csrf:false,
headers:true,
auth:false

})

const toggle = (key)=>{

const updated = {...options,[key]:!options[key]}

setOptions(updated)

if(onChange){
onChange(updated)
}

}

return (

<div className="bg-slate-900 p-6 rounded-lg shadow text-white">

<h2 className="text-lg font-semibold mb-4">
OWASP Top-10 Options
</h2>

<div className="space-y-2">

<label className="flex gap-2">
<input type="checkbox" checked={options.sql} onChange={()=>toggle("sql")}/>
SQL Injection
</label>

<label className="flex gap-2">
<input type="checkbox" checked={options.xss} onChange={()=>toggle("xss")}/>
Cross Site Scripting
</label>

<label className="flex gap-2">
<input type="checkbox" checked={options.csrf} onChange={()=>toggle("csrf")}/>
CSRF
</label>

<label className="flex gap-2">
<input type="checkbox" checked={options.headers} onChange={()=>toggle("headers")}/>
Security Headers
</label>

<label className="flex gap-2">
<input type="checkbox" checked={options.auth} onChange={()=>toggle("auth")}/>
Authentication Issues
</label>

</div>

</div>

)

}

export default OwaspOptions