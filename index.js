const botconfig = require('./config.json');
const fs = require('fs')

//discord:
const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });
const { REST } = require('@discordjs/rest'), { Routes } = require('discord-api-types/v9');

//for mongodb
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoClient = new MongoClient(botconfig.uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const insert_pipeline = [{ $match: { operationType: 'insert' } }]

client.commands = new Discord.Collection()
client.events = new Discord.Collection()
client.userState = new Discord.Collection()

const slashCommandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
let slashCommands = []
for (const file of slashCommandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
}

const eventFiles = fs.readdirSync('./events/').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    client.events.set(event.data.name, event)
}

let mongoData = {}
function connectDatabase() {
    mongoClient.connect(async err => {
        if (err) throw new Error(err)
        console.log('Connected to MongoDB')
        let Collections = await mongoClient.db("bot").listCollections().toArray()
        let collList = Collections.map(c => c.name)
        for (let name in collList) {
            mongoData[collList[name]] = mongoClient.db("bot").collection(collList[name])
        }
        console.log('Cached all collections')
    })
    return
}

client.once('ready', async () => {
    console.log('Connected to Discord')
    client.user.setActivity("Anark City", {
        type: "PLAYING",
        url: "https://www.lol.com"
    });
    await connectDatabase()
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        if (client.userState.has(interaction.user.id)) return await interaction.reply({ content: "You're in the middle of a command!", ephemeral: true })
        client.userState.set(interaction.user.id, command)
        await command.execute(interaction, mongoData)
        client.userState.delete(interaction.user.id)
    } catch (error) {
        console.error(error);
        if (interaction.replied) return await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        if (client.userState.has(interaction.user.id)) client.userState.delete(interaction.user.id)
    }
})

const rest = new REST({ version: '9' }).setToken(botconfig.token);
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(botconfig.botID), //comment out guildID to deploy to all guilds
            { body: slashCommands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.login(botconfig.token)