const { EmbedBuilder } = require('discord.js');
const songs = require('./songs.json'); // 楽曲データを読み込み

function createChallengeResponse(user) {
    // 1. ランダムに楽曲を1つ選ぶ
    const song = songs[Math.floor(Math.random() * songs.length)];

    // 2. Embedを作成する
    const embed = new EmbedBuilder()
        .setColor(0x32cd32) // ライムグリーン
        .setTitle('🎵 今日のチャレンジライブ楽曲')
        .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
        .setDescription(`今日のあなたにおすすめの1曲はこちら！`)
        .addFields(
            { name: '曲名', value: `**${song.title}**`, inline: true },
            { name: '難易度', value: song.difficulty, inline: true },
            { name: 'Lv', value: song.Lv.toString(), inline: true }
        )
        .setTimestamp();

    // 3. 結果を返す
    return { embeds: [embed] };
}

module.exports = { createChallengeResponse };