const { Util } = require("discord.js");
const ytdl = require("ytdl-core");
const YouTube = require("simple-youtube-api");

exports.run = async (client, message, args) => {
    const { channel } = message.member.voice;
    if (!channel)
      return message.channel.send(
        "**Bạn phải có mặc trong room voice mới phát nhạc được**"
      );
    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.channel.send(
        "**Bot không thể kết nối với room voice của bạn,hãy đảm bảo tôi có quyền chứ?**"
      );
    if (!permissions.has("SPEAK"))
      return message.channel.send(
        "Bot không thể phát nhạc trong room voice hãy cấp cho tôi quyền nói"
      );
    const youtube = new YouTube(client.config.api);
    var searchString = args.join(" ");
    if (!searchString)
      return message.channel.send("Bạn không còn nhạc để bot phát");
    const serverQueue = message.client.queue.get(message.guild.id);
    var videos = await youtube.searchVideos(searchString).catch(console.log);
    var songInfo = await videos[0].fetch().catch(console.log);

    const song = {
      id: songInfo.video_id,
      title: Util.escapeMarkdown(songInfo.title),
      url: songInfo.url,
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      console.log(serverQueue.songs);
      return message.channel.send(
        `<a:ngoctrai:743362171039252511> | **${song.title}** đã thêm vào danh sách phát`
      );
    }

    const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 4,
      playing: true,
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
      if (!song) {
        queue.voiceChannel.leave();
        message.client.queue.delete(message.guild.id);
        return;
      }

      const dispatcher = queue.connection
        .play(ytdl(song.url))
        .on("finish", () => {
          queue.songs.shift();
          play(queue.songs[0]);
        })
        .on("error", (error) => console.error(error));
      dispatcher.setVolumeLogarithmic(queue.volume / 5);
      queue.textChannel.send(`<:A84_Love_ThaTim:748944528097935531> | Đang phát nhạc bài: **${song.title}**`);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`Bot không thể vào room voice: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return message.channel.send(
        `Bot không thể vào room voice: ${error}`
      );
    }
};
