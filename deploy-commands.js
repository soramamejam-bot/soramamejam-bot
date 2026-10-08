require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// ★ 新しいコマンドだけを定義します（古いものを書かないことで、メニューから削除されます）
const commands = [
    new SlashCommandBuilder()
        .setName('resetvc')
        .setDescription('全員のVC参加者ロールをまとめて外します'),
        // ▼ここから追加▼
    new SlashCommandBuilder()
        .setName('move')
        .setDescription('指定したユーザーを見えないVCに強制移動させます')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('移動させるユーザー')
                .setRequired(true)) // 必須項目にする
        .addStringOption(option => 
            option.setName('room')
                .setDescription('移動先のVCを選択')
                .setRequired(true)
                .addChoices(
                    { name: '部屋A', value: '0' },
                    { name: '部屋B', value: '1' },
                    { name: '部屋C', value: '2' }
                )),
                // ▼▼ ここから追加 ▼▼
    new SlashCommandBuilder()
        .setName('move_multi')
        .setDescription('複数人をメンションで指定してVCに一斉移動させます')
        .addStringOption(option => 
            option.setName('targets')
                .setDescription('移動させる人をメンションで指定（例: @A @B @C）')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('room')
                .setDescription('移動先のVCを選択')
                .setRequired(true)
                .addChoices(
                    { name: '部屋A', value: '0' },
                    { name: '部屋B', value: '1' },
                    { name: '部屋C', value: '2' }
                )),
                // move_multi の終わりのカッコの後にカンマ(,)を付けて追加します
    // ▼▼ ここから追加 ▼▼
    new SlashCommandBuilder()
        .setName('move_role')
        .setDescription('指定したロールを持つユーザーをVCに一斉移動させます')
        .addRoleOption(option => 
            option.setName('target_role')
                .setDescription('移動させる対象のロールを選択')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('room')
                .setDescription('移動先のVCを選択')
                .setRequired(true)
                .addChoices(
                    { name: '部屋A', value: '0' },
                    { name: '部屋B', value: '1' },
                    { name: '部屋C', value: '2' }
                ))
    // ▲▲ ここまで追加 ▲▲
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN?.trim());

(async () => {
    try {
        console.log('コマンドの更新を開始します...');

        // ボットのクライアントID（Application ID）を指定します
        // .env に CLIENT_ID を設定していない場合は、下の '' の中に直接IDを貼り付けてください
        const clientId = process.env.CLIENT_ID ; 

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