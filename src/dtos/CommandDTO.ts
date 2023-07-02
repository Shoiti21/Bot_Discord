import { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord.js";

export interface CommandService {
  command: RESTPostAPIChatInputApplicationCommandsJSONBody;
  service: any;
}
