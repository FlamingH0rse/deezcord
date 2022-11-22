const botconfig = require('./config.json');
const fs = require('fs')
const readline = require('readline')

const sound = require('sound-play')
//discord:
const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent] });

client.commands = new Discord.Collection()

const slashCommandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for (const file of slashCommandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command);
}

const rl = readline.createInterface({input: process.stdin, output: process.stdout})
let currentChannelId = botconfig.channelId
let currentGuildId = botconfig.guildId
client.once('ready', async () => {
    console.log('Connected to Discord')
    client.user.setActivity("My Slave", {
        type: "PLAYING",
        url: "https://www.lol.com"
    });
    /*
    let owner = await client.users.fetch(botconfig.ownerID)
    if (owner) {
        client.user.setUsername(owner.username)
        client.user.setAvatar(owner.displayAvatarURL())
    }
    */
    let currentGuild = client.guilds.cache.get(currentGuildId)
    let currentChannel = currentGuild.channels.cache.get(currentChannelId)

    rl.on('line', msg => {
        if (msg && msg.length < 2000) currentChannel.send(msg)
    })
})

client.on('messageCreate', async message => {
    if (message.author.bot) return
    sound.play('D:\\Projects\\discord\\message.wav', 1)    
    console.log(`\n${message.author.username} > ${message.content}`)
})

client.login(botconfig.token)