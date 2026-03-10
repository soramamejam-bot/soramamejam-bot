require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 1. 関数の読み込み (ファイルの先頭の方で行う)
const { createOmikujiResponse } = require('./omikuji.js');
const { createChallengeResponse } = require('./challenge.js');

// 2. Clientの初期化 (ここが client.on より先にないとエラーになります！)
const client = new Client({ 
    intents: [ GatewayIntentBits.Guilds ] 
});

// 3. Webサーバーの設定 (Render用)
const app = express();
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
app.listen(3000, () => console.log('Webサーバー起動中'));

// 4. イベントハンドラー (client を作った後なので、ここで使ってOK！)
client.once('clientReady', (c) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ボット稼働開始！: ${c.user.tag}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

client.on('interactionCreate', async interaction => {
    const isOmikuji = (interaction.isChatInputCommand() && interaction.commandName === 'omikuji') || 
                      (interaction.isUserContextMenuCommand() && interaction.commandName === 'おみくじを引く') ||
                      (interaction.isButton() && interaction.customId === 'retry_omikuji');

    const isChallenge = (interaction.isChatInputCommand() && interaction.commandName === 'challenge') || 
                        (interaction.isUserContextMenuCommand() && interaction.commandName === '今日のチャレンジ楽曲');

    try {
        if (isOmikuji) {
            const response = createOmikujiResponse(interaction.user);
            if (interaction.isButton()) await interaction.update(response);
            else await interaction.reply(response);
        } 
        else if (isChallenge) {
            const response = createChallengeResponse(interaction.user);
            await interaction.reply(response);
        }
    } catch (error) {
        console.error('インタラクションエラー:', error);
    }
});

// 5. ログイン
client.login(process.env.DISCORD_TOKEN?.trim());