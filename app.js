import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

/* Firebase Config */
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

/* member list demo */
const memberList = {
  101:"संतोष पाटील",
  102:"राजेश जाधव",
  103:"सुनिता काळे",
  104:"अजय शिंदे",
  105:"योगेश कदम",
  106:"स्मिता सावंत",
  107:"गणेश देशमुख",
  108:"प्रिया पवार",
  109:"माधव माळी",
  110:"सपना मोरे"
};

const perCan = 50;
document.getElementById('perCanLabel').innerText = perCan;

/* UI nav */
window.show = function(id){
  document.querySelectorAll('section').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
};

/* set today's date default */
(() => {
  const d=new Date(); const iso=d.toISOString().slice(0,10);
  const el=document.getElementById('c_date');
  if(el) el.value = iso;
})();

/* auto fill name */
window.autoFillName = function(){
  const no = document.getElementById('memberNo').value;
  document.getElementById('memberName').value = memberList[no] || "";
};

/* calc amount */
window.calcAmount = function(){
  const liters = parseFloat(document.getElementById('c_liter').value || 0);
  const rate = parseFloat(document.getElementById('c_rate').value || 0);
  const amount = (liters * rate).toFixed(2);
  document.getElementById('c_amount').value = isFinite(amount) ? amount : '';
};

/* save collection */
window.saveCollection = function(){
  const no = document.getElementById('memberNo').value.trim();
  const name = document.getElementById('memberName').value.trim();
  const date = document.getElementById('c_date').value;
  const type = document.getElementById('c_type').value;
  const liters = parseFloat(document.getElementById('c_liter').value || 0);
  const fat = document.getElementById('c_fat').value;
  const rate = document.getElementById('c_rate').value;
  const amount = parseFloat(document.getElementById('c_amount').value || (liters * (rate||0))).toFixed(2);

  if(!no || !name){
    alert('मेंबर नंबर योग्य नाही किंवा नाव नसलेले मेंबर आहे.');
    return;
  }
  if(!date || !type || !liters){
    alert('सर्व आवश्यक फील्ड भरा.');
    return;
  }

  push(ref(db,'milkCollection'),{memberNo:no,name,date,type,liters,fat,rate,amount})
    .then(()=> {
      alert('दूध नोंद सेव्ह झाली ✅');
      document.querySelector('form').reset();
      document.getElementById('memberName').value = '';
      document.getElementById('c_date').value = new Date().toISOString().slice(0,10);
    })
    .catch(err => { console.error(err); alert('सेव्ह करताना त्रुटी'); });
};

/* save supplier */
window.saveSupplier = function(){
  const name = document.getElementById('s_name').value.trim();
  const mobile = document.getElementById('s_mobile').value.trim();
  const village = document.getElementById('s_village').value.trim();
  if(!name || !mobile) { alert('नाव व मोबाईल द्या'); return; }
  push(ref(db,'suppliers'),{name,mobile,village})
    .then(()=> {
      alert('पुरवठादार सेव्ह झाला ✅');
      document.getElementById('s_name').value='';
      document.getElementById('s_mobile').value='';
      document.getElementById('s_village').value='';
    })
    .catch(e=>{console.error(e);alert('त्रुटी')});
};

/* listen collections */
onValue(ref(db,'milkCollection'), snapshot => {
  const data = snapshot.val() || {};
  const tbody = document.getElementById('collectionBody');
  tbody.innerHTML = '';
  const todayStr = new Date().toISOString().slice(0,10);
  let todayTotal = 0;

  const keys = Object.keys(data).sort((a,b)=>{
    const da = data[a].date || '', dbv = data[b].date || '';
    return dbv.localeCompare(da);
  });

  for(const k of keys){
    const r = data[k];
    const liters = parseFloat(r.liters || 0);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.memberNo||''}</td>
                    <td>${r.name||''}</td>
                    <td>${r.date||''}</td>
                    <td>${r.type||''}</td>
                    <td>${liters}</td>
                    <td>${r.fat||''}</td>
                    <td>${r.rate||''}</td>
                    <td>${r.amount||''}</td>`;
    tbody.appendChild(tr);
    if(r.date === todayStr){ todayTotal += liters; }
  }
  document.getElementById('todayTotal').innerText = Number(todayTotal.toFixed(2));
  renderCans(todayTotal);
});

/* suppliers listen */
onValue(ref(db,'suppliers'), snap => {
  const data = snap.val() || {};
  const tb = document.getElementById('suppliersBody');
  tb.innerHTML = '';
  for(const k of Object.keys(data)){
    const r = data[k];
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.name||''}</td><td>${r.mobile||''}</td><td>${r.village||''}</td>`;
    tb.appendChild(tr);
  }
});

/* cans render */
const cansRow = document.getElementById('cansRow');
function renderCans(totalLiters){
  cansRow.innerHTML = '';
  const maxCans = 10;
  const neededCans = Math.min(maxCans, Math.ceil(totalLiters / perCan));
  const count = Math.max(1, neededCans);
  let remaining = totalLiters;
  for(let i=0;i<count;i++){
    const lit = Math.min(perCan, Math.max(0, remaining));
    const fillPercent = (lit / perCan) * 100;
    remaining -= lit;
    const canWrap = document.createElement('div');
    canWrap.style.textAlign='center';
    canWrap.innerHTML = `
      <div class="can" role="img" aria-label="milk can">
        <div class="cap"></div>
        <div class="milk-fill" style="height:${fillPercent}%;"><span style="opacity:0.9;font-size:11px">${Math.round(fillPercent)}%</span></div>
      </div>
      <div class="can-label">${Math.round(lit)}L</div>
    `;
    cansRow.appendChild(canWrap);
  }
  if(totalLiters > perCan * maxCans){
    const more = document.createElement('div');
    more.style.padding='8px';
    more.style.fontSize='0
