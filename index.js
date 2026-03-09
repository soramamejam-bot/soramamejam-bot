require('dotenv').config();
console.log('診断：トークンは存在しますか？ ->', process.env.DISCORD_TOKEN ? 'はい' : 'いいえ、空っぽです');
const { Client, GatewayIntentBits } = require('discord.js');
// 1. さっき作ったおみくじ職人を呼び出す
const { createOmikujiResponse } = require('./omikuji.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages, // メッセージを扱うなら必須
        GatewayIntentBits.MessageContent // メッセージの中身を読むなら必須
    ] 
});
client.once('ready', () => {
    console.log('整理整頓完了！Bot起動！'); 
});

// ついでにエラーイベントも監視します（適当な場所に追加）
client.on('error', (err) => {
    console.error('Discordクライアントエラー:', err);
});

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

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Bot is running! 🤖');
});

app.listen(port, () => {
    console.log(`Webサーバーがポート ${port} で起動しました！`);
});

console.log('今からDiscordにログインを試みます...');

client.login(process.env.DISCORD_TOKEN)
  .then(() => {
    console.log('ログイン処理自体は成功しました！');
  })
  .catch((error) => {
    console.error('ログインに失敗しました。原因はこちら：', error);
  });