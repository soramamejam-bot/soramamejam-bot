require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const { createOmikujiResponse } = require('./omikuji.js');

// --- 1. Webサーバー (Render維持用) ---
const app = express();
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
app.listen(3000, () => console.log('Webサーバー起動中'));

// --- 2. Botの設定 (おみくじに必要な権限) ---
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds,
        // スラッシュコマンドだけならGuildsだけでOKです
    ] 
});

// ログイン完了時の処理 (警告が出ないよう clientReady を使用)
client.once('clientReady', (c) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ おみくじボット稼働開始！`);
    console.log(`ログイン名: ${c.user.tag}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// おみくじの反応処理
// ... (上の部分は省略)

client.on('interactionCreate', async interaction => {
    // スラッシュコマンド、またはユーザーコマンド（アプリボタン）が押されたかチェック
    const isCommand = interaction.isChatInputCommand() && interaction.commandName === 'omikuji';
    const isAppButton = interaction.isUserContextMenuCommand() && interaction.commandName === 'おみくじを引く';
    const isRetryButton = interaction.isButton() && interaction.customId === 'retry_omikuji';

    if (isCommand || isAppButton || isRetryButton) {
        try {
            // おみくじの結果を生成
            const response = createOmikujiResponse(interaction.user);

            if (isRetryButton) {
                await interaction.update(response);
            } else {
                await interaction.reply(response);
            }
        } catch (error) {
            console.error('エラー発生:', error);
        }
    }
});

// --- 3. ログイン ---
client.login(process.env.DISCORD_TOKEN?.trim());