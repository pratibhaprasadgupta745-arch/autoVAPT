import axios from "axios"

const API = axios.create({

baseURL:"http://localhost:8000"

})

export const login = (data)=>API.post("/login",data)

export const register = (data)=>API.post("/register",data)

export const startScan = (target)=>API.post("/scan",{target})

export const getScans = ()=>API.get("/scans")

export default API