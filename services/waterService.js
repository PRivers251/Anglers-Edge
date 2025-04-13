import axios from 'axios';
import { logger } from '../utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

const forecastWaterData = (waterTempF, gageHeightFt, daysAhead, dailyForecasts) => {
  const forecast = [];
  const baseTemp = waterTempF || 60;
  const baseHeight = gageHeightFt || 1;

  for (let i = 0; i < daysAhead; i++) {
    const dayForecast = dailyForecasts[i] || dailyForecasts[dailyForecasts.length - 1] || {};
    const tempAdjustment = dayForecast.temp ? (dayForecast.temp.max - 32) * 0.05 : 0.5;
    const heightAdjustment = dayForecast.rain ? dayForecast.rain * 0.1 : 0.05;
    // Estimate clarity: More rain = murkier water
    const clarity = dayForecast.rain > 0.5 ? 'Murky' : dayForecast.rain > 0.1 ? 'Slightly Murky' : 'Clear';
    // Estimate flow rate increase based on gage height and precipitation
    const flowRateAdjustment = dayForecast.rain ? dayForecast.rain * 50 : 10;

    forecast.push({
      waterTempF: baseTemp + tempAdjustment * (i + 1),
      gageHeightFt: baseHeight + heightAdjustment * (i + 1),
      clarity: clarity,
      flowRateCfs: (baseHeight * 100 + flowRateAdjustment * (i + 1)).toFixed(1), // Rough estimate
    });
  }

  return forecast;
};

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

  let waterMetrics = { waterTempF: null, gageHeightFt: null, clarity: 'Clear', flowRateCfs: null };
  const lastAvailableDate = todayLocal.toISOString().split('T')[0];
  const usgsParams = {
    format: 'json',
    bBox: bBox,
    parameterCd: '00010,00065,00060', // Add 00060 for flow rate (discharge in CFS)
    startDT: lastAvailableDate,
    endDT: lastAvailableDate
  };
  if (isDebug) {
    logger.log('Fetching USGS baseline:', `${usgsUrl}?${new URLSearchParams(usgsParams).toString()}`);
  }
  const usgsResponse = await axios.get(usgsUrl, { params: usgsParams });
  const timeSeries = usgsResponse.data.value.timeSeries;
  if (timeSeries.length > 0) {
    const tempSeries = timeSeries.find(ts => ts.variable.variableCode[0].value === '00010');
    const levelSeries = timeSeries.find(ts => ts.variable.variableCode[0].value === '00065');
    const flowSeries = timeSeries.find(ts => ts.variable.variableCode[0].value === '00060');
    if (tempSeries?.values[0]?.value[0]?.value) {
      waterMetrics.waterTempF = (parseFloat(tempSeries.values[0].value[0].value) * 9 / 5) + 32;
    }
    if (levelSeries?.values[0]?.value[0]?.value) {
      waterMetrics.gageHeightFt = parseFloat(levelSeries.values[0].value[0].value);
    }
    if (flowSeries?.values[0]?.value[0]?.value) {
      waterMetrics.flowRateCfs = parseFloat(flowSeries.values[0].value[0].value).toFixed(1);
    }
  }

  const daysAhead = Math.ceil((selectedLocal - todayLocal) / (1000 * 60 * 60 * 24));
  if (daysAhead > 0) {
    const forecastWater = forecastWaterData(waterMetrics.waterTempF, waterMetrics.gageHeightFt, daysAhead, dailyForecasts);
    waterMetrics = forecastWater[daysAhead - 1];
    if (isDebug) {
      logger.log('Forecasted water data for', date, ':', waterMetrics);
    }
  }

  return waterMetrics;
};