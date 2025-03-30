import axios from 'axios';

export const fetchWaterData = async (lat, lon, date, dailyForecasts) => {
  const westLon = (lon - 0.5).toFixed(6);
  const southLat = (lat - 0.5).toFixed(6);
  const eastLon = (lon + 0.5).toFixed(6);
  const northLat = (lat + 0.5).toFixed(6);
  const bBox = `${westLon},${southLat},${eastLon},${northLat}`;
  const usgsUrl = `https://waterservices.usgs.gov/nwis/dv/`;

  const todayLocal = new Date();
  todayLocal.setHours(0, 0, 0, 0);
  const selectedLocal = new Date(`${date}T00:00:00`);
  selectedLocal.setHours(0, 0, 0, 0);

  let waterMetrics = { waterTempF: null, gageHeightFt: null };
  const lastAvailableDate = todayLocal.toISOString().split('T')[0];
  const usgsParams = {
    format: 'json',
    bBox: bBox,
    parameterCd: '00010,00065',
    startDT: lastAvailableDate,
    endDT: lastAvailableDate
  };
  console.log('Fetching USGS baseline:', `${usgsUrl}?${new URLSearchParams(usgsParams).toString()}`);
  const usgsResponse = await axios.get(usgsUrl, { params: usgsParams });
  const timeSeries = usgsResponse.data.value.timeSeries;
  if (timeSeries.length > 0) {
    const tempSeries = timeSeries.find(ts => ts.variable.variableCode[0].value === '00010');
    const levelSeries = timeSeries.find(ts => ts.variable.variableCode[0].value === '00065');
    if (tempSeries?.values[0]?.value[0]?.value) {
      waterMetrics.waterTempF = (parseFloat(tempSeries.values[0].value[0].value) * 9 / 5) + 32;
    }
    if (levelSeries?.values[0]?.value[0]?.value) {
      waterMetrics.gageHeightFt = parseFloat(levelSeries.values[0].value[0].value);
    }
  }

  const daysAhead = Math.ceil((selectedLocal - todayLocal) / (1000 * 60 * 60 * 24));
  if (daysAhead > 0) {
    const forecastWater = forecastWaterData(waterMetrics.waterTempF, waterMetrics.gageHeightFt, daysAhead, dailyForecasts);
    waterMetrics = forecastWater[daysAhead - 1];
    console.log('Forecasted water data for', date, ':', waterMetrics);
  }

  return waterMetrics;
};

// No changes needed in forecastWaterData as it uses dailyForecasts from weatherService