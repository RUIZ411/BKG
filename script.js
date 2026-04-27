function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.add('hidden'));
  document.getElementById(page).classList.remove('hidden');
}

function toggleTheme(){
  document.body.classList.toggle('light');
}

function createInputs(id,count){
  const box=document.getElementById(id);
  for(let i=1;i<=count;i++){
    box.innerHTML+=`<input placeholder="플레이어 ${i}">`;
  }
}

createInputs('baramInputs',10);
createInputs('watchInputs',12);
createInputs('chessInputs',8);

function shuffleTeam(inputId,aId,bId,size){
  const inputs=[...document.querySelectorAll(`#${inputId} input`)]
    .map(i=>i.value)
    .filter(v=>v);

  inputs.sort(()=>Math.random()-0.5);

  document.getElementById(aId).innerHTML=inputs.slice(0,size).join('<br>');
  document.getElementById(bId).innerHTML=inputs.slice(size,size*2).join('<br>');
}

const maps={
  쟁탈:["네팔","리장타워","부산","오아시스","일리오스","남극반도"],
  호위:["66번국도","지브롤터","도라도","쓰레기촌","리알토","샴발리","하바나"],
  혼합:["눔바니","아이헨발데","왕의길","할리우드","미드타운","블리자드월드","파라이수"],
  밀기:["뉴 퀸 스트리트","이스페란사","콜로세오","루나시피"],
  플래시포인트:["뉴 정크시티","수라바사","아틀리스"]
};

const mzMaps=[
  "남극반도","리알토","샴발리","하바나",
  "미드타운","블리자드월드","파라이수",
  "뉴 퀸 스트리트","이스페란사","콜로세오","루나시피",
  "뉴 정크시티","수라바사","아틀리스"
];

function renderMaps(){
  const mapList=document.getElementById('mapList');

  for(let category in maps){
    let html=`<h4>${category}</h4>`;

    maps[category].forEach(map=>{
      const cls=mzMaps.includes(map)?'red':'';
      html+=`<label><input type="checkbox" checked value="${map}"> <span class="${cls}">${map}</span></label><br>`;
    });

    mapList.innerHTML+=html;
  }
}

renderMaps();

function drawMap(){
  const checked=[...document.querySelectorAll('#mapList input:checked')]
    .map(c=>c.value);

  const pick=checked[Math.floor(Math.random()*checked.length)];

  document.getElementById('mapResult').innerText=pick;
}
