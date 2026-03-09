const { REST, Routes, ApplicationCommandType } = require('discord.js');
require('dotenv').config();

const commands = [
    // 1. スラッシュコマンド (/omikuji)
    {
        name: 'omikuji',
        description: '今日のおみくじを引きます',
    },
    // 2. アプリボタン (ユーザーコマンド)
    {
        name: 'おみくじを引く',
        type: ApplicationCommandType.User, // これでプロフィールなどの「アプリ」欄にボタンが出ます
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('コマンド登録中...');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID), // ここに自分のApplication IDが必要
            { body: commands },
        );
        console.log('✅ コマンドの登録に成功しました！');
    } catch (error) {
        console.error(error);
    }
})();