require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const choices = [
    { name: '部屋A', value: '0' },
    { name: '部屋B', value: '1' },
    { name: '部屋C', value: '2' },
    { name: '一般', value: '3' }
];

const commands = [
    new SlashCommandBuilder()
        .setName('resetvc')
        .setDescription('全員のVC参加者ロールをまとめて外します'),
    
    new SlashCommandBuilder()
        .setName('move')
        .setDescription('指定したユーザーをVCに強制移動させます')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('移動させるユーザー')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('room')
                .setDescription('移動先のVCを選択')
                .setRequired(true)
                .addChoices(...choices)),

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
                .addChoices(...choices)),

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
                .addChoices(...choices))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN?.trim());

(async () => {
    try {
        console.log('コマンドの更新を開始します...');
        const clientId = process.env.CLIENT_ID || 'ここにボットのCLIENT_IDを貼り付ける'; 

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands },
        );

        console.log('✅ 新しいコマンドの登録が完了しました！');
    } catch (error) {
        console.error('コマンド登録エラー:', error);
    }
})();