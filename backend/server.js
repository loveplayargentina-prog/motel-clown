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

const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});

function cargarPayasos(){ return JSON.parse(fs.readFileSync("./payasos.json","utf8")); }
let payasos = cargarPayasos();


// 🩸 HISTORIA PSICÓTICA OFFLINE — “El Motel de las Caras Pintadas”
const historiaBase = [
  {
    id: 1,
    title: "Entrada prohibida",
    description:
      "El neón parpadea sobre la puerta del Motel Clown. El aire huele a óxido y perfume barato. Desde adentro se oyen risas… distorsionadas, como si salieran de una radio rota.",
    choices: [
      { id: "c1", text: "Entrar al vestíbulo" },
      { id: "c2", text: "Mirar por la ventana" }
    ],
    bgImage: "entrada.png",
    sound: "neon-buzz.mp3",
    spawnClown: "duvi.png"
  },
  {
    id: 2,
    title: "El vestíbulo rojo",
    description:
      "La luz roja titila sobre las paredes manchadas. En el suelo, un globo inflado palpita como si tuviera pulso. Detrás del mostrador, un payaso con mandíbula rota te sonríe y dice: 'Check-in… o check-out eterno'.",
    choices: [
      { id: "c1", text: "Hablar con el payaso" },
      { id: "c2", text: "Correr hacia el pasillo" }
    ],
    bgImage: "lobby.png",
    sound: "heartbeat.mp3",
    spawnClown: "lulu.png"
  },
  {
    id: 3,
    title: "Habitación 13",
    description:
      "El espejo está empañado, pero ves figuras detrás de tu reflejo. Una voz susurra tu nombre, aunque nunca lo dijiste. En la cama, un disfraz de payaso te espera, doblado cuidadosamente.",
    choices: [
      { id: "c1", text: "Ponerte el disfraz" },
      { id: "c2", text: "Romper el espejo" }
    ],
    bgImage: "room13.png",
    sound: "whispers.mp3",
    spawnClown: "pipo.png"
  },
  {
    id: 4,
    title: "La sonrisa del reflejo",
    description:
      "El espejo no se rompe. En cambio, sonríe. Tu reflejo empieza a moverse sin vos, inclinando la cabeza como un payaso curioso. Del vidrio gotea pintura blanca y roja.",
    choices: [
      { id: "c1", text: "Tocar el espejo" },
      { id: "c2", text: "Apagar la luz" }
    ],
    bgImage: "mirror.png",
    sound: "glass-drip.mp3",
    spawnClown: "fifi.png"
  },
  {
    id: 5,
    title: "El pasillo de las risas",
    description:
      "Cada puerta que pasás tiene una voz detrás. Algunos lloran, otros ríen, otros gritan. Un altavoz chisporrotea: 'El espectáculo está por comenzar...'. Las luces se apagan.",
    choices: [
      { id: "c1", text: "Seguir las risas" },
      { id: "c2", text: "Entrar en la primera habitación abierta" }
    ],
    bgImage: "hallway2.png",
    sound: "laughter.mp3",
    spawnClown: "joko.png"
  },
  {
    id: 6,
    title: "El show final",
    description:
      "Estás en un escenario. La audiencia son payasos sin ojos que aplauden sin parar. Detrás de ti, una voz familiar susurra: 'Ahora sos uno de nosotros'. Te sentís liviano, vacío, y la pantalla empieza a derretirse.",
    choices: [],
    bgImage: "stage.png",
    sound: "applause-distorted.mp3",
    spawnClown: "final.png"
  }
];
