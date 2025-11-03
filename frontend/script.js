const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let fear = 0;
let inventory = [];
let payasos = []; // aquí se cargarán sprites dinámicos
let playerId = "jugador1";

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

  triggerRandomEvent();
}

function triggerRandomEvent(){
  if(Math.random()<0.2){
    fear += 10;
    updateStatus();
    alert("¡Un payaso te sorprendió! Miedo aumentado.");
  }
}

function updateStatus(){
  document.getElementById("fear").innerText = fear;
  document.getElementById("inventory").innerText = inventory.join(", ") || "Nada";
  if(fear>=100){
    alert("¡Has perdido! El miedo te ha vencido...");
    fear = 0;
    loadScene();
  }
}

// Animación de payasos simple
function drawPayasos(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  payasos.forEach(p=>{
    ctx.drawImage(p.sprite, p.x, p.y, p.w, p.h);
    p.x -= p.speed;
    if(p.x<-p.w) p.x = canvas.width;
  });
  requestAnimationFrame(drawPayasos);
}

drawPayasos();
loadScene();
updateStatus();
