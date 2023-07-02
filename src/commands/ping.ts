import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { CommandService } from "../dtos/CommandDTO";

const ping: CommandService = {
  command: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Verifique se esta interação é responsiva")
    .toJSON(),
  service: async (interaction: CommandInteraction) => {
    await interaction.editReply({
      content: "Pong!",
    });
  },
};

export default ping;
