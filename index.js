require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const express = require('express');

const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers      
    ] 
});

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
    '1548448589724778607', 
    '1548448655906705439', 
    '1548448681064276129',
    '999296512846733385' 
];
const TARGET_ROLE_ID = '1548447608433803416';

const ROOM_NAMES = ['部屋A', '部屋B', '部屋C', '一般'];

// ==========================================
// VC入室時のロール自動付与（部屋A・B・Cのみ対象）
// ==========================================
client.on('voiceStateUpdate', async (oldState, newState) => {
    const roleTargetVcIds = TARGET_VC_IDS.slice(0, 3);

    if (newState.channelId && roleTargetVcIds.includes(newState.channelId)) {
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
        if (commandName === 'reset_role') {
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
            await interaction.editReply(`✅ ${targetUser.username} さんを **${ROOM_NAMES[roomIndex]}** に移動させました。`);
        }

        // ▼ 複数ユーザー（メンション指定）を強制移動
        else if (commandName === 'move_multi') {
            await interaction.deferReply({ ephemeral: true });

            const targetsString = interaction.options.getString('targets');
            const roomIndex = parseInt(interaction.options.getString('room'));
            const targetVcId = TARGET_VC_IDS[roomIndex];

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

            let replyText = `✅ **${successCount} 人** を **${ROOM_NAMES[roomIndex]}** に移動させました！`;
            if (errorMessages.length > 0) replyText += `\n${errorMessages.join('\n')}`;
            await interaction.editReply(replyText);
        }

        // ▼ 固定ロールのユーザーを強制移動（確認ボタン付き）
        else if (commandName === 'move_role') {
            await interaction.deferReply({ ephemeral: true });

            const roomIndex = parseInt(interaction.options.getString('room'));
            const targetVcId = TARGET_VC_IDS[roomIndex];

            const targetRole = await interaction.guild.roles.fetch(TARGET_ROLE_ID);
            if (!targetRole) {
                return interaction.editReply('❌ 対象のロールが見つかりません。設定エリアのIDを確認してください。');
            }

            // --- 確認用ボタンの作成 ---
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_move')
                .setLabel('はい（移動させる）')
                .setStyle(ButtonStyle.Danger); // 赤色のボタン

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_move')
                .setLabel('キャンセル')
                .setStyle(ButtonStyle.Secondary); // 灰色のボタン

            const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            // 確認メッセージの送信（自分だけに表示）
            const response = await interaction.editReply({
                content: `⚠️ **確認**: 「${targetRole.name}」ロールを持っているメンバーを **${ROOM_NAMES[roomIndex]}** へ一斉移動させますか？`,
                components: [row]
            });

            // ボタンが押されるのを待つ（制限時間: 15秒）
            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: i => i.user.id === interaction.user.id, // コマンドを打った本人だけが押せる
                    time: 15000 
                });

                if (confirmation.customId === 'confirm_move') {
                    // 「はい」が押された場合：ボタンを無効化して実行中表示に
                    await confirmation.update({ content: '🔄 移動処理を実行中...', components: [] });

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
                        await member.voice.setChannel(targetVcId);
                        successCount++;
                    }

                    let replyText = `✅ 「${targetRole.name}」ロールを持つ **${successCount} 人** を **${ROOM_NAMES[roomIndex]}** に移動させました！`;
                    if (skipCount > 0) replyText += `\n*(⚠️ VC未参加のため ${skipCount} 人はスキップしました)*`;

                    await interaction.editReply({ content: replyText, components: [] });

                } else if (confirmation.customId === 'cancel_move') {
                    // 「キャンセル」が押された場合
                    await confirmation.update({ content: '🚫 移動処理をキャンセルしました。', components: [] });
                }

            } catch (error) {
                // 15秒間どちらも押されなかった場合
                await interaction.editReply({ content: '⏱️ 時間切れのため、移動処理をキャンセルしました。', components: [] });
            }
        }

    } catch (error) {
        console.error('コマンド実行エラー:', error);
        await interaction.editReply({ content: '❌ 処理中にエラーが発生しました。', components: [] });
    }
});

client.login(process.env.DISCORD_TOKEN?.trim());