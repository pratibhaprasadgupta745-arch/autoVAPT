import React from "react"

function SeverityCard({ title, count, color }) {

return (

<div className={`${color} text-white p-4 rounded-lg shadow flex items-center justify-between`}>

<div>

<h3 className="text-lg font-semibold">{title}</h3>

<p className="text-2xl font-bold">{count}</p>

</div>

</div>

)

}

export default SeverityCard 