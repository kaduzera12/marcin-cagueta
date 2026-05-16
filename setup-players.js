require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const REGIONAL = 'https://americas.api.riotgames.com';
const PLATFORM = `https://${(process.env.REGION || 'br1').toLowerCase()}.api.riotgames.com`;
const headers = { 'X-Riot-Token': process.env.RIOT_API_KEY };

const playersPath = path.join(__dirname, 'src/data/players.json');
const rankingPath = path.join(__dirname, 'src/data/ranking.json');

const PLAYERS = [
  { gameName: 'El kaduzera', tagLine: 'BR1' },
  { gameName: 'SatHell', tagLine: 'br1' },
  { gameName: 'TEREZÃO A LENDAシ', tagLine: 'TRZ' },
  { gameName: 'TTVMediivih', tagLine: 'MDV' },
  { gameName: 'SINGED OLDSCHOOL', tagLine: 'GO064' },
  { gameName: '72off', tagLine: '111' },
];

async function setup() {
  const playersData = { players: [] };
  const rankingData = { ranking: [] };

  for (const p of PLAYERS) {
    try {
      const accountRes = await axios.get(
        `${REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(p.gameName)}/${encodeURIComponent(p.tagLine)}`,
        { headers }
      );
      const { gameName, tagLine, puuid } = accountRes.data;

      const summonerRes = await axios.get(
        `${PLATFORM}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        { headers }
      );
      const summonerId = summonerRes.data.id;

      const riotId = `${gameName}#${tagLine}`;
      playersData.players.push({ riotId, puuid, summonerId });
      rankingData.ranking.push({ riotId, tier: null, rank: null, lp: null });

      console.log(`✅ ${riotId} — summonerId ok`);
    } catch (err) {
      const riotId = `${p.gameName}#${p.tagLine}`;
      console.error(`❌ ${riotId} — ${err.response?.status ?? err.message}`);
    }
  }

  fs.writeFileSync(playersPath, JSON.stringify(playersData, null, 2));
  fs.writeFileSync(rankingPath, JSON.stringify(rankingData, null, 2));
  console.log(`\nFeito. ${playersData.players.length} jogadores cadastrados.`);
}

setup();
