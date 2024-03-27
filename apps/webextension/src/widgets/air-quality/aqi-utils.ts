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
      meterColor: 'stroke-[#009966]',
      trackColor: 'stroke-[#009966]/30',
    },
    {
      maxLevel: 40,
      text: m.Widgets_AirQuality_EAQI_Condition_Fair,
      meterColor: 'stroke-[#FFDE33]',
      trackColor: 'stroke-[#FFDE33]/30',
    },
    {
      maxLevel: 60,
      text: m.Widgets_AirQuality_EAQI_Condition_Moderate,
      meterColor: 'stroke-[#FF9933]',
      trackColor: 'stroke-[#FF9933]/30',
    },
    {
      maxLevel: 80,
      text: m.Widgets_AirQuality_EAQI_Condition_Poor,
      meterColor: 'stroke-[#CC0033]',
      trackColor: 'stroke-[#CC0033]/30',
    },
    {
      maxLevel: 100,
      text: m.Widgets_AirQuality_EAQI_Condition_VeryPoor,
      meterColor: 'stroke-[#660099]',
      trackColor: 'stroke-[#660099]/30',
    },
    {
      maxLevel: Number.MAX_SAFE_INTEGER,
      text: m.Widgets_AirQuality_EAQI_Condition_ExtremelyPoor,
      meterColor: 'stroke-[#7E0023]',
      trackColor: 'stroke-[#7E0023]/30',
    },
  ],
  [AirQualityLegislation.USA]: [
    {
      maxLevel: 50,
      text: m.Widgets_AirQuality_USAQI_Condition_Good,
      meterColor: 'stroke-[#009966]',
      trackColor: 'stroke-[#009966]/30',
    },
    {
      maxLevel: 100,
      text: m.Widgets_AirQuality_USAQI_Condition_Moderate,
      meterColor: 'stroke-[#FFDE33]',
      trackColor: 'stroke-[#FFDE33]/30',
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
      meterColor: 'stroke-[#CC0033]',
      trackColor: 'stroke-[#CC0033]/30',
    },
    {
      maxLevel: 300,
      text: m.Widgets_AirQuality_USAQI_Condition_VeryUnhealthy,
      meterColor: 'stroke-[#660099]',
      trackColor: 'stroke-[#660099]/30',
    },
    {
      maxLevel: Number.MAX_SAFE_INTEGER,
      text: m.Widgets_AirQuality_USAQI_Condition_Hazardous,
      meterColor: 'stroke-[#7E0023]',
      trackColor: 'stroke-[#7E0023]/30',
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
