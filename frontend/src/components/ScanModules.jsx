import React, { useState } from "react";

function ScanModules({onChange}){

const [modules,setModules] = useState({

port_scan:true,
sql:true,
xss:true,
headers:true,
directory:false,
ssl:false

})

const toggle = (key)=>{

const updated = {...modules,[key]:!modules[key]}
setModules(updated)

if(onChange){
onChange(updated)
}

}

return(

<div className="bg-slate-900 p-6 rounded-lg">

<h2 className="text-lg mb-4">Scan Modules</h2>

<div className="grid grid-cols-2 gap-3">

<label>
<input type="checkbox"
checked={modules.port_scan}
onChange={()=>toggle("port_scan")}
/>
Port Scan (Nmap)
</label>

<label>
<input type="checkbox"
checked={modules.sql}
onChange={()=>toggle("sql")}
/>
SQL Injection
</label>

<label>
<input type="checkbox"
checked={modules.xss}
onChange={()=>toggle("xss")}
/>
XSS
</label>

<label>
<input type="checkbox"
checked={modules.headers}
onChange={()=>toggle("headers")}
/>
Security Headers
</label>

<label>
<input type="checkbox"
checked={modules.directory}
onChange={()=>toggle("directory")}
/>
Directory Scan
</label>

<label>
<input type="checkbox"
checked={modules.ssl}
onChange={()=>toggle("ssl")}
/>
SSL Check
</label>

</div>

</div>

)

}

export default ScanModules 