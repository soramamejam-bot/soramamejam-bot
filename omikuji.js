// omikuji.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// おみくじのデータ（ここに追加するだけで結果を増やせます！）
const results = [
    { luck: '大吉', color: 0xff0000, msg: '最高の一日！' },
    { luck: '中吉', color: 0xffa500, msg: 'いい感じ！' },
    { luck: '凶', color: 0x0000ff, msg: '気をつけて！' }
];

// 外部（index.js）から使えるように書き出します（module.exports）
module.exports = {
    createOmikujiResponse(user) {
        const result = results[Math.floor(Math.random() * results.length)];

        const embed = new EmbedBuilder()
            .setTitle('✨ 魔法のおみくじ ✨')
            .setColor(result.color)
            .setDescription(`${user.username}さんの運勢は... **${result.luck}**！\n${result.msg}`)
            .setTimestamp();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('retry_omikuji')
                .setLabel('もう一回引く！')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔮')
        );

        return { embeds: [embed], components: [row] };
    }
};