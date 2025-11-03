require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Función para cargar payasos
function cargarPayasos(){ 
    return JSON.parse(fs.readFileSync("./payasos.json","utf8")); 
}
let payasos = cargarPayasos();

// Historia base
const historiaBase = [
  { id:1, title:"Primer contacto", description:"El jugador llega al Motel Clown y escucha ruidos extraños.", choices:[{id:"c1",text:"Explorar habitación"},{id:"c2",text:"Salir corriendo"}]},
  { id:2, title:"Payaso misterioso", description:"Un payaso aparece en el pasillo con ojos brillantes.", choices:[{id:"c1",text:"Esconderse"},{id:"c2",text:"Enfrentar"}]}
];

const playersState = {};

app.post("/api/scene", async (req,res)=>{
  try{
    const playerId = req.body.playerId;
    const choice = req.body.choice;
    if(!playerId) return res.status(400).json({ok:false,error:"playerId requerido"});
    if(!playersState[playerId]) playersState[playerId]={currentScene:0,history:[],fear:0,inventory:[]};
    const player = playersState[playerId];

    if(choice && player.currentScene>0) player.history.push({sceneId:player.currentScene,choice});
    if(player.currentScene>=historiaBase.length){
      return res.json({ok:true,data:{title:"FIN",description:"¡Has completado todas las aventuras!",choices:[],fear:player.fear,inventory:player.inventory}});
    }

    let scene = historiaBase[player.currentScene];
    var payasosPrompt = payasos.map(function(p){ return p.nombre + ": debilidad = " + p.debilidad; }).join("\n");

    var prompt = "Jugador tiene miedo: " + player.fear + "%\n" +
                 "Inventario: " + (player.inventory.join(", ") || "Nada") + "\n" +
                 "Payasos del Motel Clown:\n" + payasosPrompt + "\n" +
                 "Genera un JSON válido con título, descripción y opciones de historieta basado en esto:\n" +
                 "Título: " + scene.title + "\n" +
                 "Descripción: " + scene.description + "\n" +
                 "Opciones: " + scene.choices.map(function(c){ return c.text; }).join(", ");

    try{
      const completion = await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[{role:"user",content:prompt}],
        max_tokens:400,
        temperature:0.9
      });
      scene = JSON.parse(completion.choices[0].message.content);
    }catch(e){
      console.warn("OpenAI falló, usando escena base.");
    }

    if(Math.random()<0.3){ player.fear += 10; }

    player.currentScene++;
    res.json({ok:true,data:Object.assign({}, scene, {fear:player.fear, inventory:player.inventory})});
  }catch(err){ console.error(err); res.status(500).json({ok:false,error:err.message}); }
});

const port = process.env.PORT || 3000;
app.listen(port,()=>console.log("✅ Motel Clown backend corriendo en puerto " + port));
