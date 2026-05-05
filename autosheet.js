const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

let accessToken = null;

async function getToken() {
  // Return stored token if still valid
  const stored = JSON.parse(localStorage.getItem("gtoken") || "{}");
  if (stored.token && stored.expiry > Date.now()) {
    return stored.token;
  }

  // Otherwise prompt login and store result
  return new Promise((resolve) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        localStorage.setItem("gtoken", JSON.stringify({
          token: response.access_token,
          expiry: Date.now() + (response.expires_in * 1000)
        }));
        resolve(response.access_token);
      }
    });
    client.requestAccessToken();
  });
}

function processStats(stats) {
  if (stats.NewQuota != 0)
    return [ 
      stats.NewQuota,
      stats.ValueSold
    ];
  else if (stats.ValueSold != 0)
    return [ stats.ValueSold ];
  else
    return [
      stats.MoonInfo.Name.replace(/\d*\s/,""),
      stats.MoonInfo.Weather,
      stats.DungeonInfo.Interior,
      stats.DungeonInfo.ItemCount,
      stats.AppSpawned,
      stats.BeeInfo.Values.length,
      stats.BeeInfo.Values.reduce((a, b) => a + b, 0),
      stats.BirdInfo.EggValues.reduce((a, b) => a + b, 0),
      stats.IndoorSpawns.filter(e => e.Enemy === "Nutcracker").length,
      stats.IndoorSpawns.filter(e => e.Enemy === "Butler").length,
      stats.ShotgunsCollected,
      stats.KnivesCollected,
      stats.CollectedNoExtra,
      stats.BottomLine,
      stats.CollectedTotal,
      stats.BottomLineTrue,
      stats.HazardInfo.TurretCount,
      stats.HazardInfo.LandmineCount,
      stats.HazardInfo.SpiketrapCount,
      stats.IndoorFog,
      stats.SIDType,
      stats.InfestationType,
      stats.MeteorShowerTime,
      stats.Seed
    ];
}

async function getFirstEmptyRowInColomn(token, column) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${ACTIVE_SHEET_NAME}!${column}:${column}`,
    { headers: { "Authorization": `Bearer ${token}` } }
  );
  const data = await response.json();
  return (data.values?.length ?? 0) + 1;
}

async function readCells(token, cellMat) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${ACTIVE_SHEET_NAME}!${cellMat}`,
    { headers: { "Authorization": `Bearer ${token}` } }
  );
  return await response.json();
}

async function writeCells(token, startWritePos, cellMat) {
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${ACTIVE_SHEET_NAME}!${startWritePos}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: JSON.stringify({ values: cellMat })
    }
  );
}

async function fetchAndWrite(jsonData) {
  const row = processStats(jsonData);
  const token = await getToken();
  switch (row.length) {
    case 1:
      const currentSellCount = await getFirstEmptyRowInColomn(token, SELL_COLUMN) - 1;
      if (currentSellCount == 0) {
        await writeCells(token, `${SELL_COLUMN}2`, [[ row[0] ]]);
        break;
      }
      const sellCell = await readCells(token, `${SELL_COLUMN}${3*currentSellCount - 1}`);
      const sellAmount = Number(sellCell.values?.[0]?.[0] ?? 0);
      writeCells(token, `${SELL_COLUMN}${3*currentSellCount - 1}`, [[ row[0] + sellAmount ]]);
      break;
    case 2:
      const currentQuotaCount = await getFirstEmptyRowInColomn(token, QUOTA_COLUMN) - 1;
      const sellThisQuotaCell = await readCells(token, `${SELL_COLUMN}${3*currentQuotaCount-4}`);
      const sellThisQuotaAmount = Number(sellThisQuotaCell.values?.[0]?.[0] ?? 0);
      await writeCells(token, `${SELL_COLUMN}${3*currentQuotaCount-4}`, [[ row[1] + sellThisQuotaAmount ]])
      await writeCells(token, `${SELL_COLUMN}${3*currentQuotaCount-1}`, [[ row[0] ]])
      break;
    default:
      const firstEmptyRow = await getFirstEmptyRowInColomn(token, START_COLUMN);
      await writeCells(token, `${START_COLUMN}${firstEmptyRow}`, [ row ])
      break
  }
}
