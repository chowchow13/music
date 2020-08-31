exports.run = (client, message, args) => {
  const serverQueue = message.client.queue.get(message.guild.id);
  if (serverQueue && !serverQueue.playing) {
    serverQueue.playing = true;
    serverQueue.connection.dispatcher.resume();
    return message.channel.send("<:A84_Love_ThaTim:748944528097935531> | Đã tiếp tục phát nhạc");
  }
  return message.channel.send("There is nothing playing.");
};
