exports.run = (client, message, args) => {
  const serverQueue = message.client.queue.get(message.guild.id);
  if (!serverQueue) return message.channel.send("Không có nhạc để phát");
  return message.channel.send(
    `<:A84_Love_ThaTim:748944528097935531> | Đang phát nhạc bài: **${serverQueue.songs[0].title}**`
  );
};
