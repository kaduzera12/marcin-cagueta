require('dotenv').config();
const axios = require('axios');

const REGIONAL = 'https://americas.api.riotgames.com';
const PLATFORM = () => `https://${(process.env.REGION || 'br1').toLowerCase()}.api.riotgames.com`;
const headers = () => ({ 'X-Riot-Token': process.env.RIOT_API_KEY });

async function getAccountByRiotId(gameName, tagLine) {
  const url = `${REGIONAL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const res = await axios.get(url, { headers: headers() });
  return res.data;
}

async function getSummonerByPuuid(puuid) {
  const url = `${PLATFORM()}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const res = await axios.get(url, { headers: headers() });
  return res.data;
}

async function getRankedStats(summonerId) {
  const url = `${PLATFORM()}/lol/league/v4/entries/by-summoner/${summonerId}`;
  const res = await axios.get(url, { headers: headers() });
  const solo = res.data.find(e => e.queueType === 'RANKED_SOLO_5x5');
  return solo ?? null;
}

async function getMatchIds(puuid, startTime, endTime) {
  const url = `${REGIONAL}/lol/match/v5/matches/by-puuid/${puuid}/ids`;
  const params = { startTime, count: 20 };
  if (endTime) params.endTime = endTime;
  const res = await axios.get(url, { headers: headers(), params });
  return res.data;
}

async function getMatch(matchId) {
  const url = `${REGIONAL}/lol/match/v5/matches/${matchId}`;
  const res = await axios.get(url, { headers: headers() });
  return res.data;
}

module.exports = { getAccountByRiotId, getSummonerByPuuid, getRankedStats, getMatchIds, getMatch };
