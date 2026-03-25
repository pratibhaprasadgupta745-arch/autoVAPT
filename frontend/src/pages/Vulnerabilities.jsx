import { useState, useEffect } from "react"
import "../styles/vulnerabilities.css"

function Vulnerabilities(){

const [vulnerabilities,setVulnerabilities] = useState([])
const [search,setSearch] = useState("")
const [filter,setFilter] = useState("All")
const [sort,setSort] = useState("severity")
const [stats,setStats] = useState({
critical:0,
high:0,
medium:0,
low:0
})


// ================= FETCH VULNERABILITIES =================

useEffect(()=>{

fetch("http://localhost:8000/vulnerabilities")
.then(res=>res.json())
.then(data=>{

const formatted = data.map(v => ({

id:v.id,
name:v.name,
cve:v.cve_id || "N/A",
severity:v.severity,
url:v.path,
status:v.status || "Open",
fix:v.fix,
cvss:v.cvss_score || 0,
owasp:v.owasp_category || "N/A"

// 🧠 Risk Score
,risk: Math.min(100, Math.round((v.cvss_score || 5) * 10))

}))

setVulnerabilities(formatted)

})

},[])


// ================= FETCH STATS =================

useEffect(()=>{

fetch("http://localhost:8000/vulnerabilities/stats")
.then(res=>res.json())
.then(data=>{
setStats(data)
})

},[])


// ================= FILTER =================

let filtered = vulnerabilities.filter(v =>
(v.name.toLowerCase().includes(search.toLowerCase())) &&
(filter==="All" || v.severity===filter)
)


// ================= SORT =================

if(sort==="severity"){

const order = {Critical:1,High:2,Medium:3,Low:4}

filtered.sort((a,b)=>order[a.severity]-order[b.severity])

}

if(sort==="risk"){

filtered.sort((a,b)=>b.risk-a.risk)

}


// ================= EXPORT CSV =================

const exportCSV = () => {

const rows = [
["Vulnerability","Severity","Risk","URL","Status","OWASP","Fix"],
...filtered.map(v => [v.name,v.severity,v.risk,v.url,v.status,v.owasp,v.fix])
]

let csvContent = "data:text/csv;charset=utf-8,"
+ rows.map(e => e.join(",")).join("\n")

const link = document.createElement("a")
link.setAttribute("href",csvContent)
link.setAttribute("download","vulnerabilities.csv")
document.body.appendChild(link)

link.click()

}


// ================= BADGE =================

const getBadge = (severity)=>{

if(severity==="Critical") return "badge critical"
if(severity==="High") return "badge high"
if(severity==="Medium") return "badge medium"
if(severity==="Low") return "badge low"

}

const getRiskColor = (risk)=>{
if(risk > 80) return "risk critical"
if(risk > 60) return "risk high"
if(risk > 40) return "risk medium"
return "risk low"
}


// ================= UI =================

return(

<div className="vuln-page">

<h1 className="page-title">Vulnerability Management</h1>


{/* Stats */}

<div className="vuln-stats">

<div className="stat critical">
<h2>{stats.critical}</h2>
<p>Critical</p>
</div>

<div className="stat high">
<h2>{stats.high}</h2>
<p>High</p>
</div>

<div className="stat medium">
<h2>{stats.medium}</h2>
<p>Medium</p>
</div>

<div className="stat low">
<h2>{stats.low}</h2>
<p>Low</p>
</div>

</div>


{/* Toolbar */}

<div className="toolbar">

<input
placeholder="Search vulnerability..."
onChange={(e)=>setSearch(e.target.value)}
/>

<select onChange={(e)=>setFilter(e.target.value)}>
<option>All</option>
<option>Critical</option>
<option>High</option>
<option>Medium</option>
<option>Low</option>
</select>

<select onChange={(e)=>setSort(e.target.value)}>
<option value="severity">Sort by Severity</option>
<option value="risk">Sort by Risk</option>
</select>

<button onClick={exportCSV}>Export CSV</button>

</div>


{/* Table */}

<div className="table-card">

<table>

<thead>

<tr>
<th>Vulnerability</th>
<th>Severity</th>
<th>Risk</th>
<th>OWASP</th>
<th>URL</th>
<th>Status</th>
<th>Fix</th>
</tr>

</thead>

<tbody>

{filtered.map(v => (

<tr key={v.id}>

<td>
<strong>{v.name}</strong>
<br/>
<small>{v.cve}</small>
</td>

<td>
<span className={getBadge(v.severity)}>
{v.severity}
</span>
</td>

<td>
<span className={getRiskColor(v.risk)}>
{v.risk}
</span>
</td>

<td>{v.owasp}</td>

<td>{v.url}</td>

<td>
<span className="status-open">
{v.status}
</span>
</td>

<td>{v.fix}</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)

}

export default Vulnerabilities