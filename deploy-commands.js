require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// ★ 新しいコマンドだけを定義します（古いものを書かないことで、メニューから削除されます）
const commands = [
    new SlashCommandBuilder()
        .setName('resetvc')
        .setDescription('全員のVC参加者ロールをまとめて外します'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN?.trim());

(async () => {
    try {
        console.log('コマンドの更新を開始します...');

        // ボットのクライアントID（Application ID）を指定します
        // .env に CLIENT_ID を設定していない場合は、下の '' の中に直接IDを貼り付けてください
        const clientId = process.env.CLIENT_ID || 'ここにボットのCLIENT_IDを貼り付ける'; 

        // グローバルコマンドとして上書き登録
        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ 新しいコマンドの登録（と古いコマンドの削除）が完了しました！');
    } catch (error) {
        console.error('コマンド登録エラー:', error);
    }
})();