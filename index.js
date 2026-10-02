require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// ボットの初期化
const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers      
    ] 
});

// Render常時稼働用のWebサーバー
const app = express();
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
app.listen(process.env.PORT || 10000, () => console.log('Webサーバー起動中'));

client.once('clientReady', (c) => {
    console.log(`✅ ボット稼働開始！: ${c.user.tag}`);
});

// ==========================================
// ★ 設定エリア
// ==========================================
const TARGET_VC_IDS = [
    '1つ目のVCのIDをここに貼る', 
    '2つ目のVCのIDをここに貼る', 
    '3つ目のVCのIDをここに貼る'
];
const TARGET_ROLE_ID = '付与するロールのIDをここに貼る';

// ==========================================
// VC入室時のロール自動付与
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.channelId && TARGET_VC_IDS.includes(newState.channelId)) {
        if (oldState.channelId !== newState.channelId) {
            const member = newState.member;
            if (member) {
                try {
                    await member.roles.add(TARGET_ROLE_ID);
                    console.log(`🟢 ${member.user.tag} にロールを付与しました。`);
                } catch (error) {
                    console.error('ロール付与エラー:', error);
                }
            }
        }
    }
});

// ==========================================
// スラッシュコマンドの処理
// ==========================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const commandName = interaction.commandName;

    try {
        // ▼ 全員のロールを一括剥奪
        if (commandName === 'resetvc') {
            await interaction.deferReply({ ephemeral: true });
            
            const role = await interaction.guild.roles.fetch(TARGET_ROLE_ID);
            if (!role) return interaction.editReply('❌ 指定されたロールが見つかりません。');

            let removedCount = 0;
            for (const [memberId, member] of role.members) {
                await member.roles.remove(TARGET_ROLE_ID);
                removedCount++;
            }
            await interaction.editReply(`✅ ${removedCount} 人のユーザーからロールを外しました。`);
        } 
        
        // ▼ 単体ユーザーを強制移動
        else if (commandName === 'move') {
            await interaction.deferReply({ ephemeral: true });

            const targetUser = interaction.options.getUser('target');
            const roomIndex = parseInt(interaction.options.getString('room')); 
            
            const targetMember = await interaction.guild.members.fetch(targetUser.id);
            if (!targetMember.voice.channel) {
                return interaction.editReply(`❌ ${targetUser.username} さんは現在VCに参加していません。`);
            }

            await targetMember.voice.setChannel(TARGET_VC_IDS[roomIndex]);
            await interaction.editReply(`✅ ${targetUser.username} さんを VC ${roomIndex + 1} に移動させました。`);
        }

        // ▼ 複数ユーザー（メンション指定）を強制移動
        else if (commandName === 'move_multi') {
            await interaction.deferReply({ ephemeral: true });

            const targetsString = interaction.options.getString('targets');
            const roomIndex = parseInt(interaction.options.getString('room'));
            const targetVcId = TARGET_VC_IDS[roomIndex];

            // メンションからIDを抽出（最適化済）
            const mentionRegex = /<@!?(\d+)>/g;
            const userIds = Array.from(targetsString.matchAll(mentionRegex), match => match[1]);

            if (userIds.length === 0) {
                return interaction.editReply('❌ メンションが正しく指定されていません。');
            }

            let successCount = 0;
            let errorMessages = [];

            for (const userId of userIds) {
                try {
                    const targetMember = await interaction.guild.members.fetch(userId);
                    if (!targetMember.voice.channel) {
                        errorMessages.push(`⚠️ ${targetMember.user.username} さんはVC未参加のためスキップしました。`);
                        continue;
                    }
                    await targetMember.voice.setChannel(targetVcId);
                    successCount++;
                } catch (error) {
                    errorMessages.push(`❌ ID ${userId} の移動に失敗しました。`);
                }
            }

            let replyText = `✅ **${successCount} 人** を VC ${roomIndex + 1} に移動させました！`;
            if (errorMessages.length > 0) replyText += `\n${errorMessages.join('\n')}`;
            await interaction.editReply(replyText);
        }

        // ▼ 特定ロールのユーザーを強制移動
        else if (commandName === 'move_role') {
            await interaction.deferReply({ ephemeral: true });

            const targetRole = interaction.options.getRole('target_role');
            const roomIndex = parseInt(interaction.options.getString('room'));
            
            await interaction.guild.members.fetch();
            const membersWithRole = targetRole.members;

            if (membersWithRole.size === 0) {
                return interaction.editReply(`❌ 「${targetRole.name}」ロールを持つメンバーがサーバー内にいません。`);
            }

            let successCount = 0;
            let skipCount = 0;

            for (const [memberId, member] of membersWithRole) {
                if (!member.voice.channel) {
                    skipCount++;
                    continue;
                }
                await member.voice.setChannel(TARGET_VC_IDS[roomIndex]);
                successCount++;
            }

            let replyText = `✅ 「${targetRole.name}」ロールを持つ **${successCount} 人** を VC ${roomIndex + 1} に移動させました！`;
            if (skipCount > 0) replyText += `\n*(⚠️ VC未参加のため ${skipCount} 人はスキップしました)*`;
            await interaction.editReply(replyText);
        }

    } catch (error) {
        console.error('コマンド実行エラー:', error);
        await interaction.editReply('❌ 処理中にエラーが発生しました。');
    }
});

client.login(process.env.DISCORD_TOKEN?.trim());