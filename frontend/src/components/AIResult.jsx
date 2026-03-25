function AIResult({data}){

if(!data) return null

return(

<div className="bg-gray-800 text-white p-4 mt-5 rounded">

<h2>AI Vulnerability Prediction</h2>

<p>Score: {data.score}</p>

<p>Risk Level: {data.level}</p>

</div>

)

}

export default AIResult