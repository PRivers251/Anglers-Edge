// components/AdviceCard.js
import React from 'react';
import { View, Text } from 'react-native';
import { GlobalStyles } from '../styles/GlobalStyles';
import { ResultsStyles } from '../styles/ResultsStyles';

const AdviceCard = ({ title, content }) => {
  // Content can be a string (Bait, Strategy) or array of strings (Tackle: Rod, Line)
  const fields = Array.isArray(content) ? content : [content];

  return (
    <View style={ResultsStyles.card}>
      <Text style={GlobalStyles.label}>{title}</Text>
      <View style={[ResultsStyles.cardContent, { alignSelf: 'stretch' }]}>
        {fields.map((field, index) => (
          <View key={index} style={{ width: '100%' }}>
            <Text style={[ResultsStyles.field, { width: '100%' }]}>{field}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default AdviceCard;