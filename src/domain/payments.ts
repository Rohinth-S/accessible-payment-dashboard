export type PaymentStatus = "settled" | "pending" | "failed" | "refunded";
export type Payment = { id:string; merchant:string; customer:string; amount:number; currency:string; status:PaymentStatus; createdAt:string; riskScore:number };
export const payments: Payment[] = [
 {id:"pay_8F2A",merchant:"Northwind Books",customer:"Aarav Sharma",amount:129.5,currency:"USD",status:"settled",createdAt:"2026-10-31T10:20:00Z",riskScore:12},
 {id:"pay_8F2B",merchant:"Orbit Coffee",customer:"Meera Iyer",amount:18.25,currency:"USD",status:"pending",createdAt:"2026-10-31T11:04:00Z",riskScore:31},
 {id:"pay_8F2C",merchant:"Harbor Labs",customer:"Noah Williams",amount:840,currency:"USD",status:"failed",createdAt:"2026-10-30T16:45:00Z",riskScore:77},
 {id:"pay_8F2D",merchant:"Northwind Books",customer:"Priya Nair",amount:56.2,currency:"USD",status:"refunded",createdAt:"2026-10-29T08:11:00Z",riskScore:18}
];
export function filterPayments(rows:Payment[], query:string, status:"all"|PaymentStatus):Payment[]{const q=query.trim().toLowerCase(); return rows.filter(row=>(status==='all'||row.status===status)&&(!q||[row.id,row.merchant,row.customer].some(v=>v.toLowerCase().includes(q))));}
export function summarize(rows:Payment[]){return rows.reduce((acc,row)=>{acc.count++; acc.gross+=row.amount; if(row.status==='settled') acc.settled+=row.amount; if(row.status==='failed') acc.failures++; return acc;},{count:0,gross:0,settled:0,failures:0});}
