require('dotenv').config();
const axios = require('axios');
const path = require('path');
const { readJson, writeJson } = require('./src/utils/storage');

const REGIONAL = 'https://americas.api.riotgames.com';
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
      const url = `${REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(p.gameName)}/${encodeURIComponent(p.tagLine)}`;
      const res = await axios.get(url, { headers });
      const { gameName, tagLine, puuid } = res.data;
      const riotId = `${gameName}#${tagLine}`;

      playersData.players.push({ riotId, puuid });
      rankingData.ranking.push({ riotId, tier: null, rank: null, lp: null });

      console.log(`✅ ${riotId}`);
    } catch (err) {
      console.error(`❌ ${p.gameName}#${p.tagLine} — ${err.response?.status ?? err.message}`);
    }
  }

  writeJson(playersPath, playersData);
  writeJson(rankingPath, rankingData);
  console.log(`\nFeito. ${playersData.players.length} jogadores cadastrados.`);
}

setup();
