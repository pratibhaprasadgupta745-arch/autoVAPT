import { useState } from "react"
import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import "../styles/layout.css"

function MainLayout(){

  const [collapsed,setCollapsed] = useState(false)

  return(
    <div className={`layout ${collapsed ? "collapsed" : ""}`}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div className="main-content">
        <Outlet/> 
      </div>
    </div>
  )
}

export default MainLayout 