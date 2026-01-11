const SPIN_DURATION=1500;
const rows=4, cols=5, cellH=65;
const symbols=["🍒","🍋","🍉","🔔","💎","🃏","⭐"];
const freeSpinFloat = document.getElementById("freeSpinFloat");
let balance=10000, bet=1000, freeSpins=0, useFreeSpin=true;
let autoSpinModes=[1,4,9], autoSpinIndex=0, isAutoSpinning=false;
const slot=document.getElementById("slot");
const reels=[], balanceEl=document.getElementById("balance"), winFloat=document.getElementById("winFloat");
const freeSpinDisplay=document.getElementById("freeSpinDisplay");
const spinBtn=document.getElementById("spinBtn"), autoSpinBtn=document.getElementById("autoSpinBtn"), toggleFreeSpinBtn=document.getElementById("toggleFreeSpin");
const betButtons=document.querySelectorAll(".bet-buttons button");
for(let c=0;c<cols;c++){
  const reel=document.createElement("div"); reel.className="reel";
  const inner=document.createElement("div");
  for(let i=0;i<rows*15;i++){
    const cell=document.createElement("div"); cell.className="cell";
    cell.textContent=symbols[Math.floor(Math.random()*symbols.length)];
    inner.appendChild(cell);
  }
  reel.appendChild(inner);
  slot.appendChild(reel);
  reels.push(inner);
}
function setBet(v){
  bet=v;
  betButtons.forEach(b=>b.classList.remove("active"));
  [...betButtons].find(b=>{
    if(b.textContent.replace("k","000")==v.toString()){ b.classList.add("active"); return true; }
  });
}
function toggleFreeSpin(){
  if(freeSpins <= 0){
    useFreeSpin=false;
    toggleFreeSpinBtn.classList.remove('active');
    toggleFreeSpinBtn.textContent="OFF";
    toggleFreeSpinBtn.disabled=true;
    toggleFreeSpinBtn.style.opacity=0.5;
    return;
  }
  useFreeSpin=!useFreeSpin;
  toggleFreeSpinBtn.classList.toggle('active', useFreeSpin);
  toggleFreeSpinBtn.textContent = useFreeSpin?"ON":"OFF";
}
function cycleAutoSpin(){ 
  if(autoSpinBtn.classList.contains("disabled")) return;
  autoSpinIndex=(autoSpinIndex+1)%autoSpinModes.length;
  autoSpinBtn.textContent="x"+autoSpinModes[autoSpinIndex]; 
}
function spinAuto(){
  if(isAutoSpinning) return;
  let spins = autoSpinModes[autoSpinIndex];
  if(balance < bet*spins && (!useFreeSpin || freeSpins===0)){ 
    highlightBalance();
    return;
  }
  toggleFreeSpinBtn.disabled = true; 
  toggleFreeSpinBtn.style.opacity = 0.5;
  spinBtn.classList.add("disabled"); 
  autoSpinBtn.classList.add("disabled");
  betButtons.forEach(b => {
    b.disabled = true;
    b.classList.add("disabled");
  });
  isAutoSpinning = true;
  let remainingSpins = spins;
  autoSpinBtn.textContent = "x" + remainingSpins;
  (function loop(){
    if(remainingSpins > 0){
      spinStep();
      remainingSpins--;
      autoSpinBtn.textContent = "x" + remainingSpins;
      setTimeout(loop, SPIN_DURATION+500);
    } else {
      isAutoSpinning = false;
      spinBtn.classList.remove("disabled"); 
      autoSpinBtn.classList.remove("disabled");
      toggleFreeSpinBtn.disabled = false; 
      toggleFreeSpinBtn.style.opacity = 1;
      betButtons.forEach(b => b.disabled = false);
      betButtons.forEach(b => b.classList.remove("disabled"));
      autoSpinBtn.textContent = "x" + autoSpinModes[autoSpinIndex];
      clearReelGlow();
    }
  })();
}
function spinStep(){
  reels.forEach(r => r.parentElement.classList.add("spinning"));
  reels.forEach((reel, c) => {
    reel.style.transition = `transform ${SPIN_DURATION/1000}s ease-out`;
    let stop = Math.floor(Math.random() * (reel.children.length - rows));
    reel.dataset.stop = stop;
    reel.style.transform = `translateY(-${stop * cellH}px)`;
  });
  setTimeout(() => {
    reels.forEach(r => r.parentElement.classList.remove("spinning"));
  }, SPIN_DURATION);
  highlightReelsGlow();
  if(useFreeSpin && freeSpins>0) freeSpins--;
  else{
    if(balance < bet){ highlightBalance(); return; }
    balance -= bet;
  }
  setTimeout(() => {
    reels.forEach(r => r.parentElement.classList.remove("spinning"));
  }, SPIN_DURATION);
  const spinAudio = document.getElementById("spinSound");
  spinAudio.currentTime = 0;
  spinAudio.playbackRate = spinAudio.duration / (SPIN_DURATION/1000);
  spinAudio.play();
  setTimeout(()=>{ spinAudio.pause(); spinAudio.currentTime = 0; }, SPIN_DURATION);
  updateBalance(); 
  updateFreeSpinDisplay();
  reels.forEach((reel, c) => {
  reel.style.transition = `transform ${SPIN_DURATION/1000}s ease-out`;
  let stop = Math.floor(Math.random() * (reel.children.length - rows));
  reel.dataset.stop = stop;
  for (let r = 0; r < rows; r++) {
    let rand = Math.random();
    if (rand < 0.35) {
      reel.children[stop + r].textContent = "⭐";
    } else if (rand < 0.35 + 0.30) { 
      reel.children[stop + r].textContent = "🃏";
    } else {
      reel.children[stop + r].textContent = symbols[Math.floor(Math.random() * symbols.length)];
    }
  }
  reel.style.transform = `translateY(-${stop * cellH}px)`;
});
  setTimeout(()=>{ checkWin(); }, SPIN_DURATION);
}
function highlightReelsGlow(){ reels.forEach((r,i)=>{ setTimeout(()=>r.parentElement.classList.add("hover"),i*80); setTimeout(()=>r.parentElement.classList.remove("hover"),i*50+200); }); }
function clearReelGlow(){ reels.forEach(r=>r.parentElement.classList.remove("hover")); }
function updateBalance(){ balanceEl.textContent=formatBalance(balance); }
function formatBalance(value){ if(value>=1e9) return (value/1e9).toFixed(1).replace(/\.0$/,'')+'B'; if(value>=1e6) return (value/1e6).toFixed(1).replace(/\.0$/,'')+'M'; if(value>=1e3) return (value/1e3).toFixed(1).replace(/\.0$/,'')+'k'; return value.toString(); }
function updateFreeSpinDisplay(){
  freeSpinDisplay.textContent="Free Spins: "+freeSpins;
  if(freeSpins<=0){
    useFreeSpin=false;
    toggleFreeSpinBtn.classList.remove('active'); toggleFreeSpinBtn.textContent="OFF"; toggleFreeSpinBtn.disabled=true; toggleFreeSpinBtn.style.opacity=0.9;
  } else { toggleFreeSpinBtn.disabled=false; toggleFreeSpinBtn.style.opacity=0.9; toggleFreeSpinBtn.classList.toggle('active',useFreeSpin); toggleFreeSpinBtn.textContent=useFreeSpin?"ON":"OFF"; }
}
function highlightBalance(){ let count=0; const i=setInterval(()=>{ balanceEl.style.color=balanceEl.style.color==="red"?"":"red"; count++; if(count>=6){ clearInterval(i); balanceEl.style.color=""; } },50); }
function showWinFloat(text){ winFloat.textContent=text; winFloat.style.opacity=1; winFloat.style.transform="translate(-50%,-35px)";
setTimeout(()=>{ winFloat.style.opacity=0; winFloat.style.transform="translate(-50%,0)"; },1500); }
function showFreeSpinFloat(text){
  freeSpinFloat.textContent = text;
  freeSpinFloat.style.opacity = 1;
  freeSpinFloat.style.transform = "translate(-50%, -35px)";
  setTimeout(()=>{
    freeSpinFloat.style.opacity = 0;
    freeSpinFloat.style.transform = "translate(-50%, 0)";
  }, 1500);
}
function checkWin() {
  let totalWin = 0;
  let freeSpinWin = 0;
  const basePayout = {
    "🍒": 1500,
    "🍋": 1000,
    "🍉": 500,
    "🔔": 100,
    "💎": 5000,
  };
  const jokerPayout = {
    3: 50000,
    4: 200000,
    5: 1000000
  };
  const starFreeSpin = {
    3: 1,
    4: 3,
    5: 5
  };
  for(let r = 0; r < rows; r++){
    let symbolsInRow = [];
    for(let c = 0; c < cols; c++){
      symbolsInRow.push(reels[c].children[parseInt(reels[c].dataset.stop)+r].textContent);
    }
    let c = 0;
    while(c < cols){
      let sym = symbolsInRow[c];
      if(sym === "") { c++; continue; }
      let count = 1;
      let tempSym = sym;
      for(let i = c+1; i < cols; i++){
        if(symbolsInRow[i] === sym || (symbolsInRow[i] === "🃏" && sym !== "🃏" && sym !== "⭐")){
          count++;
        } else break;
      }
      if(basePayout[sym]){
        if(count >= 3){
          let multiplier = count === 3 ? 2 : (count === 4 ? 3 : 5);
          totalWin += basePayout[sym] * multiplier;
    for(let i=0;i<count;i++){
      reels[c+i].children[parseInt(reels[c+i].dataset.stop)+r].classList.add("win");
      setTimeout(() => {
        reels[c+i].children[parseInt(reels[c+i].dataset.stop)+r].classList.remove("win");
      }, 600);
    }
  }
}
if(sym === "🃏" && count >= 3){
  totalWin += jokerPayout[count];
  for(let i=0;i<count;i++){
    if((c+i) < reels.length){
      const reelCell = reels[c+i].children[(parseInt(reels[c+i].dataset.stop) || 0) + r];
      if(reelCell){
        reelCell.classList.add("win");
        setTimeout(() => { reelCell.classList.remove("win"); }, 600);
      }
    }
  }
}
if(sym === "⭐" && count >= 3){
  freeSpinWin += starFreeSpin[count];
  for(let i=0;i<count;i++){
    if((c+i) < reels.length){
      const reelCell = reels[c+i].children[(parseInt(reels[c+i].dataset.stop) || 0) + r];
      if(reelCell){
        reelCell.classList.add("win");
        setTimeout(() => { reelCell.classList.remove("win"); }, 600);
      }
    }
  }
}
      c += count;
    }
  }
  if(totalWin > 0) {
    balance += totalWin;
    showWinFloat(`+${totalWin}`);
    const winAudio = document.getElementById("winSound");
    winAudio.currentTime = 0;
    winAudio.play();  
  }
  if(freeSpinWin > 0){
    freeSpins += freeSpinWin;
    showFreeSpinFloat("+" + freeSpinWin);
    const freeSpinAudio = document.getElementById("freeSpinSound");
    freeSpinAudio.currentTime = 0;
    freeSpinAudio.play();
    }
  updateBalance();
  updateFreeSpinDisplay();
}
updateBalance(); updateFreeSpinDisplay();
