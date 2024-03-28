import * as m from '$i18n/messages';
import { AirQualityLegislation } from './settings';

export type AirQualityIndexDescription = {
  maxLevel: number;
  text: () => string;
  meterColor: string;
  trackColor: string;
};

const AirQualityIndexDescriptions: Record<AirQualityLegislation, AirQualityIndexDescription[]> = {
  [AirQualityLegislation.European]: [
    {
      maxLevel: 20,
      text: m.Widgets_AirQuality_EAQI_Condition_Good,
      meterColor: 'stroke-[#50f0e6]',
      trackColor: 'stroke-[#50f0e6]/30',
    },
    {
      maxLevel: 40,
      text: m.Widgets_AirQuality_EAQI_Condition_Fair,
      meterColor: 'stroke-[#50ccaa]',
      trackColor: 'stroke-[#50ccaa]/30',
    },
    {
      maxLevel: 60,
      text: m.Widgets_AirQuality_EAQI_Condition_Moderate,
      meterColor: 'stroke-[#f0e641]',
      trackColor: 'stroke-[#f0e641]/30',
    },
    {
      maxLevel: 80,
      text: m.Widgets_AirQuality_EAQI_Condition_Poor,
      meterColor: 'stroke-[#ff5050]',
      trackColor: 'stroke-[#ff5050]/30',
    },
    {
      maxLevel: 100,
      text: m.Widgets_AirQuality_EAQI_Condition_VeryPoor,
      meterColor: 'stroke-[#960032]',
      trackColor: 'stroke-[#960032]/30',
    },
    {
      maxLevel: Number.MAX_SAFE_INTEGER,
      text: m.Widgets_AirQuality_EAQI_Condition_ExtremelyPoor,
      meterColor: 'stroke-[#7d2181]',
      trackColor: 'stroke-[#7d2181]/30',
    },
  ],
  [AirQualityLegislation.USA]: [
    {
      maxLevel: 50,
      text: m.Widgets_AirQuality_USAQI_Condition_Good,
      meterColor: 'stroke-[#50ccaa]',
      trackColor: 'stroke-[#50ccaa]/30',
    },
    {
      maxLevel: 100,
      text: m.Widgets_AirQuality_USAQI_Condition_Moderate,
      meterColor: 'stroke-[#f0e641]',
      trackColor: 'stroke-[#f0e641]/30',
    },
    {
      maxLevel: 150,
      text: m.Widgets_AirQuality_USAQI_Condition_UnhealthyForSensitiveGroups,
      meterColor: 'stroke-[#FF9933]',
      trackColor: 'stroke-[#FF9933]/30',
    },
    {
      maxLevel: 200,
      text: m.Widgets_AirQuality_USAQI_Condition_Unhealthy,
      meterColor: 'stroke-[#ff5050]',
      trackColor: 'stroke-[#ff5050]/30',
    },
    {
      maxLevel: 300,
      text: m.Widgets_AirQuality_USAQI_Condition_VeryUnhealthy,
      meterColor: 'stroke-[#7d2181]',
      trackColor: 'stroke-[#7d2181]/30',
    },
    {
      maxLevel: Number.MAX_SAFE_INTEGER,
      text: m.Widgets_AirQuality_USAQI_Condition_Hazardous,
      meterColor: 'stroke-[#960032]',
      trackColor: 'stroke-[#960032]/30',
    },
  ],
};

export function getAirQualityIndexDescription(
  aqi: number,
  legislation: AirQualityLegislation,
): AirQualityIndexDescription {
  const descriptors = AirQualityIndexDescriptions[legislation];
  if (!descriptors) {
    throw new Error(`Unknown legislation: ${legislation}`);
  }
  let descriptor;
  for (descriptor of descriptors) {
    if (aqi <= descriptor.maxLevel) {
      break;
    }
  }
  return descriptor!;
}

export function getAirQualityIndexMaxValue(legislation: AirQualityLegislation) {
  return legislation === AirQualityLegislation.USA ? 500 : 100;
}
