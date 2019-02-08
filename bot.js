const Discord = require('discord.js')
const ytdl = require("ytdl-core");
const { Client, Util } = require('discord.js');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');
const YouTube = require('simple-youtube-api');
const youtube = new YouTube("AIzaSyAdORXg7UZUo7sePv97JyoDqtQVi3Ll0b8");
const queue = new Map();
const client = new Discord.Client();
 
client.on('ready', function(){
 console.log(`Logged in as ${client.user.tag}!`);
    
   // var s = ['483063515981283354','483063446376677386','483063378726879232','483063354332545045','483063463179190293'];
   var s = ['483055660209012736','480169573530861578','483055655800930315'];
    setInterval(function (){
    client.user.setPresence({
 game: { 
    type: 1,
     url: 'https://www.twitch.tv/skwadraa',
    name: 'I AM CUTE',
    application_id: '477187715658547201',
     assets: {
         large_image:   `${s[Math.floor(Math.random() * s.length)]}`,
  
    }
  }
    });
    }, 5000);
});
const devs = ["439187325503930369","370308123153661974"];
const prefix = "a"
client.on('message', async msg => {
    if (msg.author.bot) return undefined;
  if (!devs.includes(msg.author.id)) return;
    if (!msg.content.startsWith(prefix)) return undefined;
    const args = msg.content.split(' ');

    const searchString = args.slice(1).join(' ');
    const url = args[1] ? args[1] .replace(/<(.+)>/g, '$1') : '';
    const serverQueue = queue.get(msg.guild.id);
    let command = msg.content.toLowerCase().split(" ")[0];
    command = command.slice(prefix.length)
    if (command === `play`) {
        const voiceChannel = msg.member.voiceChannel;
        if (!voiceChannel) return msg.channel.send('يجب توآجد حضرتك بروم صوتي .').then(message =>{message.delete(2000)})
        const permissions = voiceChannel.permissionsFor(msg.client.user);
        if (!permissions.has('CONNECT')) {
            return msg.channel.send('لا يتوآجد لدي صلاحية للتكلم بهذآ الروم').then(message =>{message.delete(2000)})
        }
        if (!permissions.has('SPEAK')) {
            return msg.channel.send('لا يتوآجد لدي صلاحية للتكلم بهذآ الروم').then(message =>{message.delete(2000)})
        }
 
       
        if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
            const playlist = await youtube.getPlaylist(url);
            const videos = await playlist.getVideos();
            for (const video of Object.values(videos)) {
                const video2 = await youtube.getVideoByID(video.id);
                await handleVideo(video2, msg, voiceChannel, true);
            }
            return msg.channel.send(` **${playlist.title}** تم الإضآفة إلى قأئمة التشغيل`).then(message =>{message.delete(2000)})
        } else {
            try {
 
                var video = await youtube.getVideo(url);
 
            } catch (error) {
                try {
                                            var fast = {};
                    var videos = await youtube.searchVideos(searchString, 5);
                    let index = 0;
                   
                    msg.channel.send(`**
${videos.map(video2 => `[\`${++index}\`]${video2.title}`).join('\n')}**`).then(message =>{
 
                        message.delete(15000)
 
 
                    });
                    try {
                        var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 5, {
                            maxMatches: 1,
                            time: 20000,
                            errors: ['time']
                        })
 
                        }catch(err) {
                        console.error(err);
                        return msg.channel.send('لم يتم إختيآر مقطع صوتي').then(message =>{message.delete(2000)})
                        }
                    const videoIndex = parseInt(response.first().content);
                    var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
                } catch (err) {
                    console.error(err);
                    return msg.channel.send(':x: لا يتوفر نتآئج بحث ').then(message =>{message.delete(2000)})
                }
        }
 
            return handleVideo(video, msg, voiceChannel);
        }
    } else if (command === `skip`) {
        if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .').then(message =>{message.delete(2000)})
        if (!serverQueue) return msg.channel.send('لا يتوفر مقطع لتجآوزه').then(message =>{message.delete(2000)})
        serverQueue.connection.dispatcher.end('تم تجآوز هذآ المقطع').then(message =>{message.delete(2000)})
        return undefined;
    } else if (command === `stop`) {
        if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .').then(message =>{message.delete(2000)})
        if (!serverQueue) return msg.channel.send('لا يتوفر مقطع لإيقآفه');
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end('تم إيقآف هذآ المقطع').then(message =>{message.delete(2000)})
        return undefined;
    } else if (command === `vol`) {
        if (!msg.member.voiceChannel) return msg.channel.send('أنت لست بروم صوتي .').then(message =>{message.delete(2000)})
        if (!serverQueue) return msg.channel.send('لا يوجد شيء شغآل.').then(message =>{message.delete(2000)})
        if (!args[1]) return msg.channel.send(`:loud_sound: مستوى الصوت **${serverQueue.volume}**`).then(message =>{message.delete(2000)})
        serverQueue.volume = args[1];
        serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 50);
        return msg.channel.send(`:speaker: تم تغير الصوت الي **${args[1]}**`).then(message =>{message.delete(2000)})
    } else if (command === `np`) {
        if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.').then(message =>{message.delete(2000)})
        const embedNP = new Discord.RichEmbed()
    .setDescription(`:notes: الان يتم تشغيل : **${serverQueue.songs[0].title}**`).then(message =>{message.delete(2000)})
        return msg.channel.sendEmbed(embedNP);
    } else if (command === `replay`) {
        if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.').then(message =>{message.delete(2000)})
        const embedNP = new Discord.RichEmbed()
    .setDescription(`سيتم اعاده تشغيل الفديو :**${serverQueue.songs[0].title}**`)
    msg.channel.send({embed: embedNP})
     return handleVideo(video, msg, msg.member.voiceChannel);
 
    } else if (command === `queue`) {
        if (!serverQueue) return msg.channel.send('لا يوجد شيء حالي ف العمل.').then(message =>{message.delete(2000)})
        let index = 0;
        const embedqu = new Discord.RichEmbed()
.setDescription(`**Songs Queue**
${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}
**الان يتم تشغيل** ${serverQueue.songs[0].title}`).then(message =>{message.delete(2000)})
        return msg.channel.sendEmbed(embedqu);
    } else if (command === `pause`) {
        if (serverQueue && serverQueue.playing) {
            serverQueue.playing = false;
            serverQueue.connection.dispatcher.pause();
            return msg.channel.send('تم إيقاف الموسيقى مؤقتا!').then(message =>{message.delete(2000)})
        }
        return msg.channel.send('لا يوجد شيء حالي ف العمل.').then(message =>{message.delete(2000)})
    } else if (command === "resume") {
        if (serverQueue && !serverQueue.playing) {
            serverQueue.playing = true;
            serverQueue.connection.dispatcher.resume();
            return msg.channel.send('استأنفت الموسيقى بالنسبة لك !').then(message =>{message.delete(2000)})
        }
        return msg.channel.send('لا يوجد شيء حالي في العمل.').then(message =>{message.delete(2000)})
    }
 
    return undefined;
async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    const song = {
        id: video.id,
        title: Util.escapeMarkdown(video.title),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        time:`${video.duration.hours}:${video.duration.minutes}:${video.duration.seconds}`,
        xnx:`${video.thumbnails.high.url}`,
        best:`${video.channel.title}`,
        bees:`${video.raw.snippet.publishedAt}`,
        shahd:`${video.raw.kind}`,
        zg:`${video.raw.snippet.channelId}`,
        views:`${video.raw.views}`,
        like:`${video.raw.likeCount}`,
        dislike:`${video.raw.dislikeCount}`,
        hi:`${video.raw.id}`
    };
    if (!serverQueue) {
        const queueConstruct = {
            textChannel: msg.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true
        };
        queue.set(msg.guild.id, queueConstruct);
        queueConstruct.songs.push(song);
        try {
            var connection = await voiceChannel.join();
            queueConstruct.connection = connection;
            play(msg.guild, queueConstruct.songs[0]);
        } catch (error) {
            console.error(`I could not join the voice channel: ${error}`);
            queue.delete(msg.guild.id);
            return msg.channel.send(`لا أستطيع دخول هذآ الروم ${error}`).then(message =>{message.delete(2000)})
        }
    } else {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        if (playlist) return undefined;
        else return msg.channel.send(` **${song.title}** تم اضافه الاغنية الي القائمة!`).then(message =>{message.delete(2000)})
    }
    return undefined;
}
 
function play(guild, song) {
    const serverQueue = queue.get(guild.id);
 
    if (!song) {
      serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    console.log(serverQueue.songs);
    const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
        .on('end', reason => {
            if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
            else console.log(reason);
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        })
        .on('error', error => console.error(error));
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
        fetchVideoInfo(`${song.hi}`, function (err, fuck) {
  if (err) throw new Error(err);

      const yyyy = {}
  if(!yyyy[msg.guild.id]) yyyy[msg.guild.id] = {
    like: `${fuck.likeCount}`,
    dislike: `${fuck.dislikeCount}`
  }
    serverQueue.textChannel.send({embed : new Discord.RichEmbed()
  .setTitle(`**${fuck.title}**`)
  .setURL(fuck.url)
  .addField('Time The Video :' , `${song.time}`, true)
  .addField('Channel Name :' , `${song.best}`, true)
  .addField('Channel ID :' , `${song.zg}`, true)
  .addField('Video Created at :' , `${fuck.datePublished}`, true)
  .addField('Views :' , `${fuck.views}`, true)
  .addField('Like?? :' , `${fuck.likeCount}`, true)
  .addField('dislike?? :' , `${fuck.dislikeCount}`, true)
  .addField('comments :' , `${fuck.commentCount}`, true)
    .setThumbnail(`${song.xnx}`)
    .setColor('#ff0000')
    .setTimestamp()
    }).then(love => {
       
        love.delete(2000)
   
 //.then(message =>{message.delete(2000)})
  
})
})
}
});
client.on('message' , message => {
  var prefix = "*";
  if(message.author.bot) return;
 
  if(message.content.startsWith(prefix + "xo")) {
 let array_of_mentions = message.mentions.users.array();
  let symbols = [':o:', ':heavy_multiplication_x:']
  var grid_message;
 
  if (array_of_mentions.length == 1 || array_of_mentions.length == 2) {
    let random1 = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
    let random2 = Math.abs(random1 - 1);
    if (array_of_mentions.length == 1) {
      random1 = 0;
      random2 = 0;
    }
    var player1_id = message.author.id
    let player2_id = array_of_mentions[random2].id;
    var turn_id = player1_id;
    var symbol = symbols[0];
    let initial_message = `Game match between <@${player1_id}> and <@${player2_id}>!`;
    if (player1_id == player2_id) {
      initial_message += '\n_(What a loser, playing this game with yourself :joy:)_'
    }
    message.channel.send(`Xo ${initial_message}`)
    .then(console.log("Successful tictactoe introduction"))
    .catch(console.error);
    message.channel.send(':one::two::three:' + '\n' +
                         ':four::five::six:' + '\n' +
                         ':seven::eight::nine:')
    .then((new_message) => {
      grid_message = new_message;
    })
    .then(console.log("Successful tictactoe game initialization"))
    .catch(console.error);
    message.channel.send('Loading... Please wait for the :ok: reaction.')
    .then(async (new_message) => {
      await new_message.react('1?');
      await new_message.react('2?');
      await new_message.react('3?');
      await new_message.react('4?');
      await new_message.react('5?');
      await new_message.react('6?');
      await new_message.react('7?');
      await new_message.react('8?');
      await new_message.react('9?');
      await new_message.react('??');
      await new_message.edit(`It\'s <@${turn_id}>\'s turn! Your symbol is ${symbol}`)
      .then((new_new_message) => {
        require('./xo.js')(client, message, new_new_message, player1_id, player2_id, turn_id, symbol, symbols, grid_message);
      })
      .then(console.log("Successful tictactoe listener initialization"))
      .catch(console.error);
    })
    .then(console.log("Successful tictactoe react initialization"))
    .catch(console.error);
  }
  else {
    message.channel.send(`try *xo @uesr`)
    .then(console.log("Successful error reply"))
    .catch(console.error);
  }
}
 });

client.login(process.env.BOT_TOKEN);