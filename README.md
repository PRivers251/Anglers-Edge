# Fisherman’s Assistant

Fisherman’s Assistant is a mobile application built with React Native and Expo, designed to provide anglers with tailored fishing advice based on location, weather conditions, water data, and target fish species. Leveraging APIs like OpenWeatherMap, USGS Water Services, and OpenAI’s GPT model, the app delivers real-time environmental data and expert fishing strategies to enhance your fishing experience.

## Features

- **User Authentication**: Secure sign-up and login using Supabase Auth.
- **Location-Based Insights**: Use your current location or manually enter a city/state to get relevant fishing data.
- **Species Selection**: Choose from a list of popular fish species or enter a custom one, generated dynamically via GPT.
- **Weather & Water Data**: Displays temperature, precipitation, wind speed, water temperature, and water level for your selected date.
- **Fishing Advice**: GPT-powered tips on bait, strategy, and additional notes tailored to current conditions.
- **Date Selection**: Plan your trip with forecasts up to 7 days ahead.
- **Responsive UI**: Clean, intuitive design with a consistent background and dark overlay.

## Tech Stack

- **Framework**: React Native with Expo
- **Backend**: Supabase (Authentication & Profile Storage)
- **APIs**:
  - OpenWeatherMap (Weather Data)
  - USGS Water Services (Water Temperature & Levels)
  - OpenAI GPT-4o-mini (Species Lists & Fishing Advice)
  - Google Maps Geocoding (Location Resolution)
- **Storage**: AsyncStorage for caching weather data
- **Styling**: Custom styles in `styles.js`

## Prerequisites

- Node.js (v16 or higher)
- npm or Yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project with Auth and a `profiles` table (`id: uuid`, `username: text`)
- API keys for:
  - OpenWeatherMap (`OPEN_WEATHER_MAP_API_KEY`)
  - Google Maps (`GOOGLE_MAPS_API_KEY`)
  - OpenAI (`OPENAI_API_KEY`)

## File Structure

FishermansAssistant/
├── api.js              # GPT API integration for species and advice
├── app/                # Main app screens
│   ├── index.js        # Home screen with location, species, and date inputs
│   ├── login.js        # Login screen with Supabase auth
│   ├── signup.js       # Sign-up screen with Supabase auth
│   └── results.js      # Results screen with weather, water, and fishing tips
├── Archive/            # Deprecated files (e.g., old App.js)
├── components/         # Reusable UI components
│   ├── DateSelector.js
│   ├── LocationToggle.js
│   ├── SpeciesPicker.js
│   └── [others]
├── services/           # API and data fetching logic
│   ├── adviceService.js # Wrapper for GPT API calls
│   ├── locationService.js
│   ├── supabaseClient.js
│   ├── waterService.js
│   └── weatherService.js
├── styles/             # Centralized styles
│   └── styles.js
├── utils/              # Utility functions
│   └── dateUtils.js
└── README.md           # This file

## Usage Steps

1. **Sign Up/Login:** Create an account or log in with your credentials.
2. **Home Screen:**
    - Toggle “Use Current Location” or enter a city/state.
    - Press “Get Species” to load a list of fish for your area.
    - Select a species and a date (today or up to 7 days ahead).
    - Click “Get Fishing Tips” to see results.
    - Results Screen: View weather conditions, water data, and GPT-generated fishing advice.

## License

**This project is unlicensed for now. Contact the author for permissions.**