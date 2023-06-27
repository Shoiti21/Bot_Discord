import { SlashCommandBuilder } from "@discordjs/builders";

const pingCommand = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Verifique se esta interação é responsiva");

export default pingCommand.toJSON();
