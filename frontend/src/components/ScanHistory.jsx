import React, { useEffect, useState } from "react";

function ScanHistory(){

const [scans,setScans] = useState([])

useEffect(()=>{

const fetchScans = async ()=>{

try{

const token = localStorage.getItem("token")

const res = await fetch("http://127.0.0.1:8000/scans",{
headers:{
Authorization:`Bearer ${token}`
}
})

const data = await res.json()

if(res.ok){
setScans(data)
}

}catch(err){

console.log(err)

}

}

fetchScans()

},[])

return(

<div className="bg-slate-900 p-6 rounded-lg shadow text-white">

<h2 className="text-lg font-semibold mb-4">
Scan History
</h2>

<div className="max-h-64 overflow-y-auto">

<table className="w-full text-sm">

<thead>

<tr className="border-b border-slate-700">

<th className="text-left pb-2">Target</th>
<th className="text-left pb-2">Status</th>
<th className="text-left pb-2">Date</th>

</tr>

</thead>

<tbody>

{scans.length===0 ? (

<tr>
<td colSpan="3">No scans yet</td>
</tr>

):(scans.map((s,i)=>(

<tr key={i} className="border-b border-slate-800">

<td className="py-2">{s.target}</td>
<td>{s.status}</td>
<td>{s.created_at?.slice(0,10)}</td>

</tr>

)))}

</tbody>

</table>

</div>

</div>

)

}

export default ScanHistory