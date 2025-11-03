import 'dotenv/config';
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function cargarPayasos() {
    return JSON.parse(fs.readFileSync("./payasos.json", "utf8"));
}
let payasos = cargarPayasos();

const historiaBase = [
    { id:1, title:"Primer contacto", description:"El jugador llega al Motel Clown y escucha ruidos extraños.", choices:[{id:"c1",text:"Explorar habitación"},{id:"c2",text:"Salir corriendo"}]},
    { id:2, title:"Payaso misterioso", description:"Un payaso aparece en el pasillo con ojos brillantes.", choices:[{id:"c1",text:"Esconderse"},{id:"c2",text:"Enfrentar"}]}
];

const playersState = {};

app.post("/api/scene", async (req,res)=>{
    try{
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
        const prompt = `
Jugador tiene miedo: ${player.fear}%
Inventario: ${player.inventory.join(", ") || "Nada"}
Payasos del Motel Clown:
${payasosPrompt}
Genera un JSON válido con título, descripción y opciones de historieta basado en esto:
Título: ${scene.title}
Descripción: ${scene.description}
Opciones: ${scene.choices.map(c=>c.text).join(", ")}
        `;

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

// 🔹 Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route SPA compatible Express 5
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log(`✅ Motel Clown backend corriendo en puerto ${PORT}`));
