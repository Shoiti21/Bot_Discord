import express from "express";
import { Client, GatewayIntentBits, Events, Routes } from "discord.js";
import { REST } from "@discordjs/rest";
import { Player } from "discord-player";
import commands from "./commands";
require("dotenv").config();

// Variáveis de ambiente.
const PORT = process.env.PORT || "";
const TOKEN = process.env.TOKEN || "";
const CLIENT_ID = process.env.CLIENT_ID || "";
const GUILD_ID = process.env.GUILD_ID || "";

// Somente para ter endpoint para "pingar"
const app = express();
app.get("/", (req, res) => {
  res.sendStatus(200);
});
app.listen(PORT);

// Crie gerenciadores REST
const rest = new REST({ version: "10" }).setToken(TOKEN);

// Crie um client para emitir eventos.
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

// Adicione o player no cliente
// Singleton faz com que a instancia fique salva e posso utilizar da mesma instancia em outro lugar
const player = Player.singleton(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
  },
});

// Ouça o evento ready.
client.once(Events.ClientReady, async (c) => {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commands.map((c) => c.command),
  });
  // Este método carregará todos os extractors do pacote @discord-player/extractor
  await player.extractors.loadDefault();
  console.log(`Pronto! Logadoo no ${c.user.tag}`);
});

// Eventos de interactions
client.on(Events.InteractionCreate, async (interaction) => {
  try {
    // Se for um commando
    if (interaction.isCommand()) {
      await interaction.deferReply();
      // Encontrar comando
      const command = commands.find(
        (c) => c.command.name === interaction.commandName
      );
      // Se encontra o comando
      if (command) {
        const service = command.service;
        await service(interaction);
      }
    }
  } catch (error) {
    console.error("Erro no InteractionCreate");
  }
});

// Inicia a conexão.
client.login(TOKEN);
