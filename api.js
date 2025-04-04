import axios from 'axios';
import { OPENAI_API_KEY } from '@env';

const getSpeciesPrompt = (cityState) => `
Given a location in ${cityState} (e.g., "Mobile, AL"), provide a list of 5-10 popular fish species that anglers commonly target in this region. Return the list in the following JSON format:
{
  "species": [
    "Fish Species 1",
    "Fish Species 2",
    "Fish Species 3",
    ...
  ]
}
Use current knowledge of recreational fishing in the United States or Canada for accuracy. Return only common names of species (e.g., "Largemouth Bass," not "Micropterus salmoides"). Strictly return the response as JSON only, with no additional text or Markdown formatting outside the JSON structure.
`;

const getAdvicePrompt = (location, species, cityState, currentDate, forecastData, waterData, speciesTempRange) => `
You are an expert fishing advisor providing tailored advice for anglers near ${cityState} on ${currentDate}. ${
  location && location.coords ? `The coordinates are latitude ${location.coords.latitude}, longitude ${location.coords.longitude}, influencing local weather and water conditions.` : ''
}

**Current Conditions:**
- **Air Temperature**: Low ${forecastData.lowTempF}°F, High ${forecastData.highTempF}°F
- **Precipitation**: ${forecastData.totalPrecipIn} inches
- **Wind Speed**: ${forecastData.avgWindMph} mph, direction ${forecastData.windDeg}°
- **Barometric Pressure**: ${forecastData.pressureHpa} hPa
- **Moon Phase**: ${forecastData.moonPhase} (0 = new, 0.5 = full, etc.)
- **Water Temperature**: ${waterData.waterTempF ? `${waterData.waterTempF}°F` : 'Not available'}
- **Water Level**: ${waterData.gageHeightFt ? `${waterData.gageHeightFt} ft` : 'Not available'}
- **Optimal Water Temp for ${species || 'the species'}:**: ${speciesTempRange ? `${speciesTempRange.min}°F - ${speciesTempRange.max}°F` : 'Not available'}

${
  species && species !== 'None'
    ? `Provide the best strategies to target ${species} under these conditions near ${cityState}. You MUST:
      - Use all provided weather, water data, and optimal temperature range to tailor bait and strategy.
      - Do not specify a particular fishing spot, but base tips on conditions typical within 30 miles of ${cityState}.`
    : `Suggest ONE fish species to target (common name only) and the best strategies to catch it under these conditions near ${cityState}. You MUST:
      - Use all provided weather, water data, and optimal temperature range to tailor bait and strategy.
      - Do not specify a particular fishing spot, but base tips on conditions typical within 30 miles of ${cityState}.`
}

**Instructions:**
- Use U.S. units (°F, inches, mph, feet, hPa).
- Base tips on air temp, precipitation, wind, pressure, moon phase, water temp, water level, and the species' optimal water temperature range.
- Avoid naming a specific location (e.g., "Mobile Bay"); focus on general strategies for the area.

Return the response in this JSON format:
{
  "bait": "Recommended bait or lures based on conditions",
  "strategy": "Fishing tips tailored to conditions",
  ${species && species !== 'None' ? '' : '"recommended_species": "Suggested fish (common name only)",'}
  "additional_notes": "Extra tips based on data (optional)"
}
Strictly return JSON only, with no additional text or Markdown outside the JSON structure.
`;

export const getSpeciesListFromAI = async (cityState) => {
  const prompt = getSpeciesPrompt(cityState);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      },
      { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/{[\s\S]*}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error('No valid JSON found');
    }
    return [...parsed.species, 'None'];
  } catch (error) {
    console.error('Species API Error:', error.message);
    const fallback = cityState.includes('AL')
      ? ['Largemouth Bass', 'Catfish', 'Crappie', 'Redfish', 'Bluegill']
      : ['Largemouth Bass', 'Catfish', 'Rainbow Trout', 'Bluegill', 'Carp'];
    return [...fallback, 'None'];
  }
};

export const getFishingAdvice = async (location, species, cityState, forecastData, waterData, speciesTempRange) => {
  const currentDate = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const prompt = getAdvicePrompt(location, species, cityState, currentDate, forecastData, waterData, speciesTempRange);
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      },
      { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/{[\s\S]*}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error('No valid JSON found');
    }
    return parsed;
  } catch (error) {
    console.error('Advice API Error:', error.message);
    return {
      bait: species && species !== 'None' ? 'Spinners or worms' : 'Worms',
      strategy: 'Fish near cover or deep pools, adjusted for recent weather.',
      ...(species && species !== 'None' ? {} : { recommended_species: 'Trout' }),
      additional_notes: 'Fallback due to API error.'
    };
  }
};

export const getSpeciesTempRange = async (species) => {
  if (!species || species === 'None') return { min: 60, max: 80 };
  const prompt = `
Provide the optimal water temperature range in Fahrenheit for fishing the species "${species}" in the United States or Canada. Return the response in the following JSON format:
{
  "species": "${species}",
  "optimal_temp_range_f": {
    "min": <minimum temperature in Fahrenheit>,
    "max": <maximum temperature in Fahrenheit>
  }
}
Use current knowledge of recreational fishing. If the species is not valid or data is unavailable, return a default range of 60-80°F. Strictly return the response as JSON only, with no additional text or Markdown formatting outside the JSON structure.
`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      },
      { headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` } }
    );
    const content = response.data.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/{[\s\S]*}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      else throw new Error('No valid JSON found');
    }
    return parsed.optimal_temp_range_f;
  } catch (error) {
    console.error('Temp Range API Error:', error.message);
    return { min: 60, max: 80 };
  }
};