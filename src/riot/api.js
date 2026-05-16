require('dotenv').config();
const axios = require('axios');

const REGIONAL = 'https://americas.api.riotgames.com';
const headers = () => ({ 'X-Riot-Token': process.env.RIOT_API_KEY });

async function getAccountByRiotId(gameName, tagLine) {
  const url = `${REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const res = await axios.get(url, { headers: headers() });
  return res.data;
}

async function getMatchIds(puuid, startTime) {
  const url = `${REGIONAL}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
  const res = await axios.get(url, {
    headers: headers(),
    params: { startTime, count: 20 }
  });
  return res.data;
}

async function getMatch(matchId) {
  const url = `${REGIONAL}/lol/match/v5/matches/${matchId}`;
  const res = await axios.get(url, { headers: headers() });
  return res.data;
}

module.exports = { getAccountByRiotId, getMatchIds, getMatch };
