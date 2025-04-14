import axios from 'axios';
import { OPENAI_API_KEY } from '@env';
import { logger } from './utils/logger';

const isDebug = process.env.NODE_ENV === 'development';

const getSpeciesPrompt = (cityState) => `
You are a fishing expert.
List 5–10 of the most commonly targeted recreational fish species within 20 miles of ${cityState} (e.g., "Mobile, AL").
Use your knowledge of regional U.S. and Canadian fishing trends.

Respond ONLY in this strict JSON format:
{
  "species": ["Fish 1", "Fish 2", ...]
}
Only return common names. Do not include Markdown or extra text.
`;

const getAdvicePrompt = (location, species, cityState, currentDate, forecastData, waterData, speciesTempRange, timeOfDay) => `
You are an elite fishing advisor. Create a detailed, data-driven fishing tip for ${cityState} on ${currentDate} during the ${timeOfDay}.

${
  location && location.coords ? `User location: latitude ${location.coords.latitude}, longitude ${location.coords.longitude}.` : ''
}

Current Conditions:
- Air Temp: ${forecastData.lowTempF}°F to ${forecastData.highTempF}°F
- Trend: ${forecastData.tempTrend}
- Rain: ${forecastData.totalPrecipIn} in
- Wind: ${forecastData.avgWindMph} mph from ${forecastData.windDeg}°
- Pressure: ${forecastData.pressureHpa} hPa
- Clouds: ${forecastData.cloudCover}%
- Humidity: ${forecastData.humidity}%
- Moon: ${forecastData.moonPhase}
- Water Temp: ${waterData.waterTempF ?? 'Not available'}
- Water Level: ${waterData.gageHeightFt ?? 'Not available'} ft
- Clarity: ${waterData.clarity ?? 'Not available'}
- Flow Rate: ${waterData.flowRateCfs ?? 'Not available'} CFS
- Species Opt Temp: ${speciesTempRange ? `${speciesTempRange.min}–${speciesTempRange.max}°F` : 'Not available'}

${
  species && species !== 'None'
    ? `Give your BEST advice for catching ${species}. Use all environmental data above. Include:
- Ideal bait/lure
- Location types to fish (e.g., structure, depth)
- Time of day influence
- Strategy based on clarity, current, and temperature
- Tackle: rod type/length/action and line weight/material
Respond as if guiding a serious angler familiar with basic techniques.`
    : `Suggest one species to target based on conditions. Then offer:
- Best bait/lure
- Strategy based on all data
- Tackle: rod and line details
- Reasoning for why this species is a good choice now.`
}

Respond in this exact JSON format:
{
  "bait": "Recommended bait",
  "strategy": "Tips based on conditions",
  "tackle": {
    "rod": "e.g., Medium 7' fast action",
    "line": "e.g., 10 lb fluorocarbon"
  },
  ${species && species !== 'None' ? '' : '"recommended_species": "Common name",'}
  "additional_notes": "Optional bonus advice"
}
No extra text. No markdown. JSON only.
`;

export const getSpeciesListFromAI = async (cityState) => {
  const prompt = getSpeciesPrompt(cityState);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content.match(/{[\s\S]*}/)[0]);
    return [...parsed.species, 'None'];
  } catch (error) {
    if (isDebug) logger.error('Species API Error:', error.message);
    const fallback = cityState.includes('AL')
      ? ['Largemouth Bass', 'Catfish', 'Crappie', 'Redfish', 'Bluegill']
      : ['Largemouth Bass', 'Catfish', 'Rainbow Trout', 'Bluegill', 'Carp'];
    return [...fallback, 'None'];
  }
};

export const getFishingAdvice = async (location, species, cityState, forecastData, waterData, speciesTempRange, timeOfDay) => {
  const currentDate = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const prompt = getAdvicePrompt(location, species, cityState, currentDate, forecastData, waterData, speciesTempRange, timeOfDay);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content.match(/{[\s\S]*}/)[0]);
    return parsed;
  } catch (error) {
    if (isDebug) logger.error('Advice API Error:', error.message);
    return {
      bait: species && species !== 'None' ? 'Spinners or worms' : 'Worms',
      strategy: 'Fish near cover or deep pools, adjusted for recent weather.',
      tackle: {
        rod: "Medium 7' rod, moderate action",
        line: '10 lb monofilament'
      },
      ...(species && species !== 'None' ? {} : { recommended_species: 'Trout' }),
      additional_notes: 'Fallback due to API error.'
    };
  }
};

export const getSpeciesTempRange = async (species) => {
  if (!species || species === 'None') return { min: 60, max: 80 };
  const prompt = `
What is the optimal water temperature range in Fahrenheit for catching ${species} in U.S. or Canadian waters?

Respond in this JSON format:
{
  "species": "${species}",
  "optimal_temp_range_f": {
    "min": <min temp>,
    "max": <max temp>
  }
}
If unknown, use 60–80°F. JSON only. No other text.
`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      },
      { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    const parsed = JSON.parse(content.match(/{[\s\S]*}/)[0]);
    return parsed.optimal_temp_range_f;
  } catch (error) {
    if (isDebug) logger.error('Temp Range API Error:', error.message);
    return { min: 60, max: 80 };
  }
};
