const { EmbedBuilder } = require('discord.js');

// 楽曲リスト（ここを自由に増やしてください！）
const songs = require('./songs.json'); // ここで外部ファイルからデータを読み込む

function createChallengeResponse(user) {
const songs = require('./songs.json');

function createChallengeResponse(user) {
    const song = songs[Math.floor(Math.random() * songs.length)];
    return {
        content: `【今日のチャレンジ楽曲】\n楽曲名: **${song.title}**\n難易度: **${song.difficulty}**\nLv: **${song.Lv}**\n頑張ってください！`
    };
}
module.exports = { createChallengeResponse };    // 以下は今まで通り
}

    const embed = new EmbedBuilder()
        .setColor(0x32cd32) // ライムグリーン
        .setTitle('🎵 今日のチャレンジライブ楽曲')
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setDescription(`今日のあなたにおすすめの1曲はこちら！`)
        .addFields(
            { name: '曲名', value: `**${song.title}**`, inline: true },
            { name: 'アーティスト', value: song.artist, inline: true },
            { name: '難易度', value: `Lv.${song.difficulty}`, inline: false }
        )
        .setTimestamp();

    return { embeds: [embed] };
    
module.exports = { createChallengeResponse };