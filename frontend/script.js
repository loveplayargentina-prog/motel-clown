const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let fear = 0;
let inventory = [];
let payasos = [];
let playerId = "jugador1";
const bgSound = document.getElementById("bgSound");

async function loadScene(choice){
  const res = await fetch("http://localhost:3000/api/scene",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({playerId, choice})
  });
  const scene = await res.json();
  
  document.getElementById("title").innerText = scene.data.title;
  document.getElementById("description").innerText = scene.data.description;
  fear = scene.data.fear;
  inventory = scene.data.inventory;

  updateStatus();

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  scene.data.choices.forEach(c=>{
    const btn = document.createElement("button");
    btn.innerText = c.text;
    btn.onclick = ()=>loadScene(c.id);
    choicesDiv.appendChild(btn);
  });

  // Sonido de fondo
  if(scene.data.sound){
    bgSound.src = "assets/sonidos/" + scene.data.sound;
    bgSound.play();
  }

  // Fondo alucinógeno
  if(scene.data.bgImage){
    const bg = new Image();
    bg.src = "assets/bg/" + scene.data.bgImage;
    bg.onload = ()=>ctx.drawImage(bg,0,0,canvas.width,canvas.height);
  }

  // Spawn payasos
  payasos = [];
  if(scene.data.spawnClown){
    let clown = new Image();
    clown.src = "assets/payasos/" + scene.data.spawnClown;
    payasos.push({sprite: clown, x:canvas.width, y:Math.random()*canvas.height, w:100, h:100, speed:2+Math.random()*3});
  }

  triggerRandomEvent();
}

function triggerRandomEvent(){
  if(Math.random()<0.3){
    fear += 10;
    shakeScreen();
    alert("¡Un payaso alucinógeno apareció!");
    updateStatus();
  }
}

function shakeScreen(){
  const intensity = 5;
  let i = 0;
  const interval = setInterval(()=>{
    canvas.style.transform = `translate(${Math.random()*intensity}px,${Math.random()*intensity}px)`;
    i++;
    if(i>10){ clearInterval(interval); canvas.style.transform=''; }
  },30);
}

function updateStatus(){
  document.getElementById("fear").innerText = fear;
  document.getElementById("inventory").innerText = inventory.join(", ") || "Nada";
  if(fear>=100){
    alert("¡Has perdido! La pesadilla te venció...");
    fear=0;
    loadScene();
  }
}

function drawPayasos(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  payasos.forEach(p=>{
    ctx.drawImage(p.sprite,p.x,p.y,p.w,p.h);
    p.x -= p.speed;
    if(p.x<-p.w)p.x=canvas.width;
  });
  requestAnimationFrame(drawPayasos);
}

drawPayasos();
loadScene();
updateStatus();
