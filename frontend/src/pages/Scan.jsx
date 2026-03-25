import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/scan.css"

import ScanLogs from "../components/ScanLogs"
import ScanProgress from "../components/ScanProgress"

function Scan(){

const navigate = useNavigate()

const [url,setUrl] = useState("")
const [port,setPort] = useState("")
const [scanType,setScanType] = useState("full")
const [progress,setProgress] = useState(0)
const [scanning,setScanning] = useState(false)
const [results,setResults] = useState(null)
const [scanId,setScanId] = useState(null)
const [status,setStatus] = useState("Idle")
const [logs,setLogs] = useState([])

// ---------------- TARGET VALIDATION ----------------
const isValidTarget = (input) => {
return /^(https?:\/\/)?([\w.-]+)(:\d+)?(\/.*)?$/.test(input)
}

// ---------------- WEBSOCKET ----------------
useEffect(() => {

if (!scanId) return

let ws = new WebSocket(`ws://127.0.0.1:8000/ws/logs/${scanId}`)

ws.onopen = () => {
console.log("✅ WS Connected")
}

ws.onmessage = (event) => {
setLogs(prev => [...prev, event.data])
}

ws.onerror = (err) => {
console.log("WS Error:", err)
}

ws.onclose = () => {
console.log("⚠ WS Closed")
}

return () => {
if(ws) ws.close()
}

}, [scanId])


// ---------------- START SCAN ----------------
const startScan = async () => {

if(!url){
alert("Enter target URL / IP")
return
}

if(!isValidTarget(url)){
alert("Invalid target format")
return
}

setScanning(true)
setResults(null)
setProgress(10)
setLogs([])
setStatus("Queued")

let finalTarget = url

if(port){
finalTarget = `${url}:${port}`
}

try{

const response = await fetch("http://localhost:8000/scans",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
target: finalTarget
})
})

const data = await response.json()

console.log("SCAN RESPONSE:", data)

if(!data.scan_id){
throw new Error("No scan_id returned")
}

setScanId(data.scan_id)
pollScanStatus(data.scan_id)

}catch(error){
console.log(error)
alert("Scan failed")
setScanning(false)
setStatus("Failed")
}

}


// ---------------- POLLING ----------------
const pollScanStatus = (id) => {

if(!id) return

let interval = setInterval(async () => {

try{

const res = await fetch(`http://localhost:8000/scans/${id}/status`)
const data = await res.json()

if(data.error){
clearInterval(interval)
setScanning(false)
setStatus("Error")
return
}

// 🔥 smooth progress
if(data.status === "Running"){
setProgress(prev => prev < 90 ? prev + 5 : prev)
}

setStatus(data.status)

// ---------------- COMPLETED ----------------
if(data.status === "Completed"){

clearInterval(interval)

const vulRes = await fetch(`http://localhost:8000/vulnerabilities/scan/${id}`)
const vulns = await vulRes.json()

let critical = 0
let high = 0
let medium = 0
let low = 0

vulns.forEach(v=>{
if(v.severity === "Critical") critical++
if(v.severity === "High") high++
if(v.severity === "Medium") medium++
if(v.severity === "Low") low++
})

setResults({critical,high,medium,low})

setProgress(100)
setScanning(false)
setStatus("Completed")

}

}catch(err){
console.log(err)
clearInterval(interval)
setScanning(false)
setStatus("Failed")
}

},2000)

}


return(

<div className="scan-page">

<h1 className="scan-title">
AutoVAPT - Advanced Vulnerability Scanner
</h1>

<div className="scan-card">

<label>Target (Domain / IP)</label>

<input
type="text"
placeholder="example.com or 192.168.1.1"
value={url}
onChange={(e)=>setUrl(e.target.value)}
/>

<label>Port (Optional)</label>

<input
type="text"
placeholder="80, 443, 8080"
value={port}
onChange={(e)=>setPort(e.target.value)}
/>

<label>Scan Type</label>

<select
value={scanType}
onChange={(e)=>setScanType(e.target.value)}
>
<option value="quick">⚡ Quick Scan</option>
<option value="full">🔥 Full Scan</option>
<option value="owasp">🛡 OWASP Top 10</option>
</select>

<button
className="scan-btn"
onClick={startScan}
disabled={scanning}
>
{scanning ? "Scanning..." : "Start Scan"}
</button>

<div className={`status-badge status-${status.toLowerCase()}`}>
Status: {status}
</div>

</div>

{scanning && (
<div className="mt-4">
<ScanProgress progress={progress} />
</div>
)}

{scanning && (
<div className="mt-4">
<h3 className="text-white mb-2">Live Scan Logs</h3>
<ScanLogs logs={logs} />
</div>
)}

{results && (

<div className="result-section">

<h2>Scan Results</h2>

<div className="result-grid">

<div className="result critical">
<h3>{results.critical}</h3>
<p>Critical</p>
</div>

<div className="result high">
<h3>{results.high}</h3>
<p>High</p>
</div>

<div className="result medium">
<h3>{results.medium}</h3>
<p>Medium</p>
</div>

<div className="result low">
<h3>{results.low}</h3>
<p>Low</p>
</div>

</div>

<div className="scan-actions">

<button
className="view-btn"
onClick={()=>navigate(`/scan-report/${scanId}`)}
>
View Full Report
</button>

<button
className="new-btn"
onClick={()=>{
setResults(null)
setProgress(0)
setUrl("")
setPort("")
setLogs([])
setStatus("Idle")
}}
>
New Scan
</button>

</div>

</div>

)}

</div>

)

}

export default Scan