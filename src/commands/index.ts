import { CommandService } from "../dtos/CommandDTO";

import ping from "./ping";
import player from "./player";

const commands: CommandService[] = [...player, ping];

export default commands;
