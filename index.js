require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// --- 1. Webサーバーの設定 (Renderの稼働維持用) ---
const app = express();
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
app.listen(3000, () => console.log('Webサーバー起動完了 (Port: 3000)'));

// --- 2. Discord Botの設定 (最小限の権限) ---
const client = new Client({ 
    intents: [ GatewayIntentBits.Guilds ] 
});

// 詳細ログを表示して原因を突き止める
client.on('debug', m => console.log('詳細ログ:', m));
client.on('error', e => console.error('重大なエラー:', e));

client.once('ready', (c) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ログイン成功！`);
    console.log(`Bot名: ${c.user.tag}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// --- 3. ログイン実行 ---
console.log('今からDiscordにログインを試みます...');

client.login(process.env.DISCORD_TOKEN?.trim())
    .catch(err => {
        console.error('❌ ログイン失敗:', err.message);
        if (err.message.includes('TOKEN_INVALID')) {
            console.error('ヒント: トークンが間違っているか、コピペミス（前後の空白など）の可能性があります。');
        }
    });