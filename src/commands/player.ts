import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from "discord.js";
import { QueryType, useMainPlayer, useQueue } from "discord-player";
import { isEmpty } from "lodash";
import { CommandService } from "../dtos/CommandDTO";

const play: CommandService = {
  command: new SlashCommandBuilder()
    .setName("play")
    .setDescription(
      "Coloque uma faixa em fila a partir de um termo/url de pesquisa"
    )
    .addStringOption((option) =>
      option
        .setName("termo")
        .setDescription("Termo que deseja pesquisar")
        .setRequired(true)
    )
    .toJSON(),
  service: async (interaction: CommandInteraction) => {
    try {
      const player = useMainPlayer();
      if (isEmpty(player)) throw new Error("Player não foi inicializado!");

      // Converter interaction.member para o tipo GuildMember e pegar o channel
      const voiceChannel = (interaction.member as GuildMember).voice.channel;

      // Se não estiver conectado em canal de voz
      if (isEmpty(voiceChannel))
        throw new Error("Você não está conectado em canal de voz!");

      const term = (
        interaction.options as CommandInteractionOptionResolver
      ).getString("termo", false);

      // Se não termo
      if (!term) throw new Error("Sem nenhum termo não consigo pesquisar!");

      // Busca por video/audio com discord-player
      const searchResult = await player.search(term, {
        searchEngine: QueryType.YOUTUBE,
      });

      // Se não encontrar nenhuma track
      if (!searchResult.hasTracks())
        throw new Error("Não foi encontrado nenhuma faixa!");

      const track = searchResult.tracks[0];

      // Conectar no canal de voz e executar o audio
      await player
        .play(voiceChannel, track, {
          nodeOptions: {
            metadata: {
              channel: interaction.channel,
              client: interaction.guild?.members.me,
              requestedBy: interaction.user,
            },
          },
        })
        .then(async () => {
          // Montagem embed
          const embed = new EmbedBuilder({
            title: track.title,
            description: track.description,
            url: track.url,
            fields: [
              {
                name: "Plataforma",
                value: track.source.toUpperCase(),
                inline: true,
              },
              { name: "Duração", value: track.duration, inline: true },
              { name: "Autor", value: track.author, inline: true },
            ],
            image: { url: track.thumbnail },
          });

          // Alterar a Resposta
          await interaction.editReply({
            embeds: [embed.data],
          });
        })
        .catch(() => {
          throw Error("Ocorreu um erro ao executar o comando de play!");
        });
    } catch (error) {
      await interaction.editReply({
        content: (error as Error).message,
      });
    }
  },
};

const stop: CommandService = {
  command: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Encerrar serviço de player")
    .toJSON(),
  service: async (interaction: CommandInteraction) => {
    try {
      if (!interaction.guildId) throw Error("Não foi encontrado o servidor!");

      // Buscar a queue
      const queue = useQueue(interaction.guildId);

      if (isEmpty(queue)) throw Error("Não tem nenhuma faixa sendo executado!");

      // Deletar o player
      queue.delete();

      // Montagem embed
      const embed = new EmbedBuilder({
        description: "**A reprodução das faixas parou!**",
      });

      // Alterar a Resposta
      await interaction.editReply({
        embeds: [embed.data],
      });
    } catch (error) {
      await interaction.editReply({
        content: (error as Error).message,
      });
    }
  },
};

const skip: CommandService = {
  command: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Pular a faixa e coloque a próxima da fila")
    .toJSON(),
  service: async (interaction: CommandInteraction) => {
    try {
      if (!interaction.guildId) throw Error("Não foi encontrado o servidor!");

      // Buscar a queue
      const queue = useQueue(interaction.guildId);

      if (isEmpty(queue))
        throw Error("Não tem nenhuma faixa sendo reproduzida!");

      // Track atual
      const { currentTrack } = queue;

      // Montagem embed
      const embed = new EmbedBuilder({
        description: `**O vídeo [${currentTrack?.title}](${currentTrack?.url}) foi pulado!**`,
      });

      // Pular a track
      queue.node.skip();

      // Alterar a Resposta
      await interaction.editReply({
        embeds: [embed.data],
      });
    } catch (error) {
      await interaction.editReply({
        content: (error as Error).message,
      });
    }
  },
};

const pause: CommandService = {
  command: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pausar a reprodução")
    .toJSON(),
  service: async (interaction: CommandInteraction) => {
    try {
      if (!interaction.guildId) throw Error("Não foi encontrado o servidor!");

      // Buscar a queue
      const queue = useQueue(interaction.guildId);

      if (isEmpty(queue)) throw Error("Não tem nenhuma faixa sendo executado!");

      // Pausar o player
      queue.node.pause();

      // Montagem embed
      const embed = new EmbedBuilder({
        description: "**A reprodução das faixas pausou!**",
      });

      // Alterar a Resposta
      await interaction.editReply({
        embeds: [embed.data],
      });
    } catch (error) {
      await interaction.editReply({
        content: (error as Error).message,
      });
    }
  },
};

const resume: CommandService = {
  command: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Retornar a reprodução")
    .toJSON(),
  service: async (interaction: CommandInteraction) => {
    try {
      if (!interaction.guildId) throw Error("Não foi encontrado o servidor!");

      // Buscar a queue
      const queue = useQueue(interaction.guildId);

      if (isEmpty(queue)) throw Error("Não tem nenhuma faixa sendo executado!");

      // Voltar o player
      queue.node.resume();

      // Montagem embed
      const embed = new EmbedBuilder({
        description: "**A reprodução das faixas voltou!**",
      });

      // Alterar a Resposta
      await interaction.editReply({
        embeds: [embed.data],
      });
    } catch (error) {
      await interaction.editReply({
        content: (error as Error).message,
      });
    }
  },
};

export default [play, stop, skip, pause, resume];
