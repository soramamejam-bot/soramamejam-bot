require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// 既存の機能の読み込み（中身は残しておく）
const { createOmikujiResponse } = require('./omikuji.js');
const { createChallengeResponse } = require('./challenge.js');

// ★ボットの初期化（VC検知とメンバー取得の権限を追加！）
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates, // VCへの入退室を検知するため
        GatewayIntentBits.GuildMembers      // ロールを一括剥奪する際にメンバー一覧を取得するため
    ] 
});

// Render用Webサーバー
const app = express();
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
app.listen(process.env.PORT || 10000, () => console.log('Webサーバー起動中'));

client.once('clientReady', (c) => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ ボット稼働開始！: ${c.user.tag}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ==========================================
// ★ 設定エリア：DiscordでコピーしたIDをここに貼る
// ==========================================
const TARGET_VC_IDS = [
    '1548448589724778607', //VC1
    '1548448655906705439', //VC2
    '1548448681064276129'  //VC3
];
const TARGET_ROLE_ID = '1548447608433803416'; //ロール

// ==========================================
// ★ 新機能 1: VCに入ったユーザーにロールを付与
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    // ユーザーが入った先のVCが、指定した3つのどれかだった場合
    if (newState.channelId && TARGET_VC_IDS.includes(newState.channelId)) {
        // マイクのミュート切り替え等ではなく、純粋に「チャンネルを移動/入室」してきた場合のみ処理
        if (oldState.channelId !== newState.channelId) {
            const member = newState.member;
            if (member) {
                try {
                    await member.roles.add(TARGET_ROLE_ID);
                    console.log(`🟢 ${member.user.tag} にロールを付与しました。`);
                } catch (error) {
                    console.error('ロール付与エラー (権限不足の可能性があります):', error);
                }
            }
        }
    }
});

// ==========================================
// ★ 新機能 2 & 既存コマンドの無効化
// ==========================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const commandName = interaction.commandName;

    try {
        // ▼ 新しいコマンド：全員からロールを剥奪する
if (commandName === 'resetvc') {
            // ▼カッコの中に { ephemeral: true } を入れる
            await interaction.deferReply({ ephemeral: true }); // 考え中...

            const guild = interaction.guild;
            const role = await guild.roles.fetch(TARGET_ROLE_ID);

            if (!role) {
                return interaction.editReply('指定されたロールが見つかりませんでした。コード内のIDを確認してください。');
            }

            // このロールを持っている全メンバーを取得
            const membersWithRole = role.members;
            let removedCount = 0;

            // 一人ずつロールを外す
            for (const [memberId, member] of membersWithRole) {
                await member.roles.remove(TARGET_ROLE_ID);
                removedCount++;
            }

            await interaction.editReply(`✅ 処理完了！ ${removedCount} 人のユーザーからロールを外しました。`);
        } 
        
        // ▼ 既存コマンド：中身は使わずに、無効化メッセージを返す
        else if (commandName === 'omikuji' || commandName === 'challenge') {
            // ephemeral: true にすると、実行した本人にしか見えないメッセージになります
            await interaction.reply({ content: '現在、このコマンドはメンテナンス中（無効化）です。', ephemeral: true });
        }

    } catch (error) {
        console.error('インタラクションエラー:', error);
        if (interaction.deferred) {
            await interaction.editReply('エラーが発生しました。');
        }
    }
});

client.login(process.env.DISCORD_TOKEN?.trim());