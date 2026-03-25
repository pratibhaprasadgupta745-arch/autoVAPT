import React, { useState } from "react";

function ScanForm({ onStart }) {

const [target,setTarget] = useState("")
const [scanType,setScanType] = useState("quick")

const handleScan = ()=>{

if(!target){
alert("Target URL is required")
return
}

if(onStart){
onStart({target,scanType})
}

}

return (

<div className="bg-slate-900 p-6 rounded-lg shadow text-white">

<h2 className="text-lg font-semibold mb-4">
Start New Scan
</h2>

<input
type="text"
placeholder="https://example.com"
value={target}
onChange={(e)=>setTarget(e.target.value)}
className="w-full p-2 mb-3 rounded bg-slate-800 border border-slate-700"
/>

<select
value={scanType}
onChange={(e)=>setScanType(e.target.value)}
className="w-full p-2 mb-3 rounded bg-slate-800 border border-slate-700"
>

<option value="quick">Quick Scan</option>
<option value="full">Full Scan</option>
<option value="custom">Custom Scan</option>

</select>

<button
onClick={handleScan}
className="bg-cyan-600 px-4 py-2 rounded hover:bg-cyan-700"
>
Start Scan
</button>

</div>

)

}

export default ScanForm