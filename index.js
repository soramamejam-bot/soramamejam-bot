require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
// 1. さっき作ったおみくじ職人を呼び出す
const { createOmikujiResponse } = require('./omikuji.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => console.log('整理整頓完了！Bot起動！'));

client.on('interactionCreate', async interaction => {
    // 2. コマンドかボタンかを判別して、おみくじレスポンスを投げるだけ！
    const isOmikujiCommand = interaction.isChatInputCommand() && interaction.commandName === 'omikuji';
    const isRetryButton = interaction.isButton() && interaction.customId === 'retry_omikuji';

    if (isOmikujiCommand || isRetryButton) {
        const response = createOmikujiResponse(interaction.user);

        if (isRetryButton) {
            await interaction.update(response);
        } else {
            await interaction.reply(response);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);