import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { rates, snfValues } from "./rates.js";

const firebaseConfig = {
  apiKey: "AIzaSyD_4wQmuzFPJjid-Co9Y-6vgEb70jxWTSY",
  authDomain: "dairy-mill-production.firebaseapp.com",
  databaseURL: "https://dairy-mill-production-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dairy-mill-production",
  storageBucket: "dairy-mill-production.firebasestorage.app",
  messagingSenderId: "721651192386",
  appId: "1:721651192386:web:b5613cedce06deed1e13db",
  measurementId: "G-YQ2BDHS8HG"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const code=document.getElementById('code');
const fat=document.getElementById('fat');
const snf=document.getElementById('snf');
const qty=document.getElementById('qty');
const addBtn=document.getElementById('addBtn');
const milkTable=document.getElementById('milkTable');
const ownerMilk=document.getElementById('ownerMilk');

function getRate(f,s){
  const row=rates[f];
  if(!row) return 0;
  const idx=snfValues.indexOf(parseFloat(s));
  if(idx===-1) return 0;
  return row[idx];
}

addBtn?.addEventListener('click',()=>{
  const f=parseFloat(fat.value);
  const s=parseFloat(snf.value);
  const q=parseFloat(qty.value);
  const rate=getRate(f,s);
  const total=q*rate;

  push(ref(db,'milk'),{
    code:code.value,fat:f,snf:s,qty:q,rate:rate,total:total,
    date:new Date().toLocaleDateString()
  });
});

onValue(ref(db,'milk'),(snapshot)=>{
  let html="";
  let cans=0;
  snapshot.forEach(child=>{
    const d=child.val();
    html+=`<tr>
    <td>${d.code}</td><td>${d.fat}</td><td>${d.snf}</td>
    <td>${d.qty}</td><td>${d.rate.toFixed(2)}</td><td>${d.total.toFixed(2)}</td></tr>`;
    cans+=parseFloat(d.qty)/40; // one can=40L
  });
  milkTable.innerHTML=html;
  if(ownerMilk) ownerMilk.textContent=`आजचे एकूण कॅन: ${cans.toFixed(1)}`;
});
