const { REST, Routes, ApplicationCommandType } = require('discord.js');
require('dotenv').config();

    // 1. スラッシュコマンド (/omikuji)
    const commands = [
    // おみくじ（既存）
    { name: 'omikuji', description: '今日のおみくじを引きます' },
    { name: 'おみくじを引く', type: ApplicationCommandType.User },
    
    // --- ここから追加 ---
    {
        name: 'challenge',
        description: '今日のチャレンジライブ楽曲は？',
    },
    {
        name: '今日のチャレンジ楽曲',
        type: ApplicationCommandType.User, // アプリボタン（ユーザーコマンド）
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