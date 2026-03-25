import React from "react"

function ReportDownload() {

const downloadReport = () => {

alert("PDF Report Generated")

}

return (

<div className="bg-gray-900 p-6 rounded-lg shadow mt-6">

<h2 className="text-lg font-semibold mb-4">
Vulnerability Report
</h2>

<button
onClick={downloadReport}
className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
>

Download PDF Report

</button>

</div>

)

}

export default ReportDownload