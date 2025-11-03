require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cargarPayasos() {
    try {
        return JSON.parse(fs.readFileSync(path.join(__dirname,'payasos.json'),'utf8'));
    } catch {
        return [];
    }
}

let payasos = cargarPayasos();

const historiaBase = [
    { id:1, title:"Primer contacto", description:"El jugador llega al Motel Clown y escucha ruidos extraños.", choices:[{id:"c1",text:"Explorar habitación"},{id:"c2",text:"Salir corriendo"}]},
    { id:2, title:"Payaso misterioso", description:"Un payaso aparece en el pasillo con ojos brillantes.", choices:[{id:"c1",text:"Esconderse"},{id:"c2",text:"Enfrentar"}]}
];

const playersState = {};

app.post("/api/scene", async (req,res) => {
    try {
        const { playerId, choice } = req.body;
        if(!playerId) return res.status(400).json({ok:false,error:"playerId requerido"});
        if(!playersState[playerId]) playersState[playerId] = {currentScene:0,history:[],fear:0,inventory:[]};
        const player = playersState[playerId];
        if(choice && player.currentScene>0) player.history.push({sceneId:player.currentScene, choice});
        if(player.currentScene >= historiaBase.length){
            return res.json({ok:true, data:{title:"FIN", description:"¡Has completado todas las aventuras!", choices:[], fear:player.fear, inventory:player.inventory}});
        }
        let scene = historiaBase[player.currentScene];
        const payasosPrompt = payasos.map(p=>`${p.nombre}: debilidad = ${p.debilidad}`).join("\n");
        const prompt = `Jugador tiene miedo: ${player.fear}%\nInventario: ${player.inventory.join(", ") || "Nada"}\nPayasos del Motel Clown:\n${payasosPrompt}\nGenera un JSON válido con título, descripción y opciones de historieta basado en esto:\nTítulo: ${scene.title}\nDescripción: ${scene.description}\nOpciones: ${scene.choices.map(c=>c.text).join(", ")}`;
        let aiScene;
        try{
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{role:"user", content: prompt}]
            });
            aiScene = JSON.parse(completion.choices[0].message.content);
        }catch(e){
            console.log("OpenAI falló, usando escena base.", e.message);
            aiScene = {title: scene.title, description: scene.description, choices: scene.choices};
        }
        player.currentScene++;
        res.json({ok:true, data: {...aiScene, fear:player.fear, inventory:player.inventory}});
    }catch(e){
        console.log(e);
        res.status(500).json({ok:false,error:e.message});
    }
});

// Servir frontend estático (desde la raíz del repo)
app.use(express.static(path.join(__dirname,'../frontend')));
app.get('*', (req,res) => {
    res.sendFile(path.join(__dirname,'../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`✅ Motel Clown backend corriendo en puerto ${PORT}`));
