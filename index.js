require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 各機能の読み込み
const { createOmikujiResponse } = require('./omikuji.js');
const { createChallengeResponse } = require('./challenge.js');

const client = new Client({ 
    intents: [ GatewayIntentBits.Guilds ] 
});

// Renderの「スリープ」を防止するための簡易Webサーバー
const app = express();
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
const PORT = process.env.PORT || 10000; // Render指定のポート、なければ10000を使用
app.listen(PORT, () => console.log(`Webサーバー起動中 (Port ${PORT})`));

client.once('clientReady', (c) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ボット稼働開始！: ${c.user.tag}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

client.on('interactionCreate', async interaction => {
    // 判定ロジック
    const isOmikuji = (interaction.isChatInputCommand() && interaction.commandName === 'omikuji') || 
                      (interaction.isUserContextMenuCommand() && interaction.commandName === 'おみくじを引く');
    const isRetryButton = (interaction.isButton() && interaction.customId === 'retry_omikuji');
    const isChallenge = (interaction.isChatInputCommand() && interaction.commandName === 'challenge') || 
                        (interaction.isUserContextMenuCommand() && interaction.commandName === '今日のチャレンジ楽曲');

    try {
        // --- 1. 応答を確保 (3秒ルール対策) ---
        if (isRetryButton) {
            await interaction.deferUpdate(); // ボタンは既存メッセージの更新
        } else if (isOmikuji || isChallenge) {
            await interaction.deferReply(); // コマンドは新規返信（考え中...を表示）
        } else {
            return; // 知らないインタラクションは無視
        }

        // --- 2. 各機能のレスポンス生成 ---
        let response;
        if (isOmikuji || isRetryButton) {
            response = createOmikujiResponse(interaction.user);
        } 
        else if (isChallenge) {
            response = createChallengeResponse(interaction.user);
        }

        // --- 3. 結果を表示 ---
        if (response) {
            await interaction.editReply(response);
        }

    } catch (error) {
        console.error('詳細なエラー情報:', {
            code: error.code,
            message: error.message,
            command: interaction.commandName || interaction.customId
        });
    }
});

// ログイン（トークンの前後の空白を除去）
client.login(process.env.DISCORD_TOKEN?.trim());