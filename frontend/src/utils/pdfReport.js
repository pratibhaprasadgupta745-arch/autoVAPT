import jsPDF from "jspdf"

export const generatePDF=(scan)=>{

const pdf=new jsPDF()

pdf.text("VAPT Scan Report",20,20)

pdf.text(`Target: ${scan.target}`,20,40)

pdf.text(`Status: ${scan.status}`,20,50)

pdf.save("scan_report.pdf")

}