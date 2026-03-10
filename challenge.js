const { EmbedBuilder } = require('discord.js');

// 楽曲リスト（ここを自由に増やしてください！）
const songs = [
    { title: "群青讃歌", artist: "Eve", difficulty: "26" },
    { title: "アイディスマイル", artist: "とあ", difficulty: "25" },
    { title: "トンデモワンダーズ", artist: "sasakure.UK", difficulty: "27" },
    { title: "初音ミクの消失", artist: "cosMo@暴走P", difficulty: "30" },
    { title: "ロウワー", artist: "ぬゆり", difficulty: "26" }
];

function createChallengeResponse(user) {
    const song = songs[Math.floor(Math.random() * songs.length)];

    const embed = new EmbedBuilder()
        .setColor(0x32cd32) // ライムグリーン
        .setTitle('🎵 今日のチャレンジライブ楽曲')
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setDescription(`今日のあなたにおすすめの1曲はこちら！`)
        .addFields(
            { name: '曲名', value: `**${song.title}**`, inline: true },
            { name: 'アーティスト', value: song.artist, inline: true },
            { name: '推奨難易度', value: `Lv.${song.difficulty}`, inline: false }
        )
        .setTimestamp();

    return { embeds: [embed] };
}

module.exports = { createChallengeResponse };