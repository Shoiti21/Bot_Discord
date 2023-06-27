import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";
import {
  GatewayDispatchEvents,
  GatewayIntentBits,
  InteractionType,
  MessageFlags,
  Client,
  Routes,
} from "@discordjs/core";
import commands from "./commands";
require("dotenv").config();

// Variáveis de ambiente
const TOKEN = process.env.TOKEN || "";
const CLIENT_ID = process.env.CLIENT_ID || "";
const GUILD_ID = process.env.GUILD_ID || "";

// Crie gerenciadores REST e WebSocket diretamente
const rest = new REST({ version: "10" }).setToken(TOKEN);

const gateway = new WebSocketManager({
  token: TOKEN,
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
});

// Crie um client para emitir eventos.
const client = new Client({ rest, gateway });

// Eventos de interactions
client.on(
  GatewayDispatchEvents.InteractionCreate,
  async ({ data: interaction, api }) => {
    if (
      interaction.type === InteractionType.ApplicationCommand &&
      interaction.data.name
    ) {
      if (interaction.data.name === "ping") {
        await api.interactions.reply(interaction.id, interaction.token, {
          content: "Pong!",
          flags: MessageFlags.Ephemeral,
        });
      }
    }
  }
);

// Ouça o evento pronto
client.once(GatewayDispatchEvents.Ready, () => {
  rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
    body: commands,
  });
  console.log("Ready!");
});

// Inicia a conexão do WebSocket.
gateway.connect();
