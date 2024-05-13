import fs from 'node:fs/promises';
import path from 'node:path';
import glob from 'tiny-glob';

async function processFile(filePath) {
  const assetPackDef = JSON.parse(await fs.readFile(filePath, { encoding: 'utf-8' }));
  const assetNameFile = path.parse(filePath).name;
  const className = `${assetNameFile[0].toUpperCase()}${assetNameFile.slice(1)}AssetsPack`;

  console.group('Processing asset pack file', filePath);

  const notMappedCodes = new Set(Array.from(new Array(100), (x, i) => i));
  const iconAliasMap = new Map();
  let iconIndex = 1;
  const iconMap = new Array(100);
  let canBeColored = false;
  for (const def of assetPackDef) {
    const criterias = def[0];
    if (!iconAliasMap.has(def[1])) {
      iconAliasMap.set(def[1], `${className}_Icon_${iconIndex++}`);
    }
    if (def.length > 2 && !iconAliasMap.has(def[2])) {
      iconAliasMap.set(def[2], `${className}_Icon_${iconIndex++}`);
    }

    const dayImage = iconAliasMap.get(def[1]);
    const nightImage = def.length > 2 ? iconAliasMap.get(def[2]) : undefined;
    if (def[1].includes('{color}') || (def.length > 2 && def[2].includes('{color}'))) {
      canBeColored = true;
    }

    for (let criteria of criterias) {
      if (!Array.isArray(criteria)) {
        criteria = [criteria, criteria];
      }

      for (let i = criteria[0]; i <= criteria[1]; i++) {
        if (i < 0 || i > 100) {
          throw new Error('Invalid WMO code found:', i);
        }

        if (iconMap[i] !== undefined) {
          throw new Error('Duplicated WMO code found:', i);
        }

        if (nightImage) {
          iconMap[i] = [dayImage, nightImage];
        } else {
          iconMap[i] = dayImage;
        }

        notMappedCodes.delete(i);
      }
    }
  }

  if (notMappedCodes.size > 0) {
    console.info('Following WMO codes are unmapped:', Array.from(notMappedCodes));
  }

  console.info('Generated asset pack', className);

  console.groupEnd();

  return { className, assetNameFile, iconAliasMap, iconMap, canBeColored };
}

export async function templateData() {
  const assetPacks = [];
  const jsonFiles = await glob('*.json', { absolute: true, dot: true, filesOnly: true });
  for (const jsonFile of jsonFiles) {
    assetPacks.push(await processFile(jsonFile));
  }

  return { assetPacks };
}

export const template = `<%# -%>
import { BaseAssetsPack } from './asset-pack-base';

<%_ for (const { className, assetNameFile, iconAliasMap, iconMap, canBeColored } of assetPacks) { _%>
//#region <%= assetNameFile %> asset pack

<%_ for (const [icon, alias] of iconAliasMap) { _%>
const <%= alias %> = '<%= icon %>';
<%_ } _%>

export class <%= className %> extends BaseAssetsPack {
  constructor(baseUrl: string) {
    super(
      baseUrl,
      [
<%_ for (const map of iconMap) { _%>
  <%_ if (Array.isArray(map)) { _%>
        [<%= map[0] %>, <%= map[1] %>],
  <%_ } else { _%>
        <%= map %>,
  <%_ } _%>
<%_ } _%>
      ],
      <%= canBeColored %>);
  }
}

//#endregion <%= assetNameFile %> asset pack

<%_ } _%>
`;

export default {
  name: '[Widgets]: [Weather]: Assets pack generator',
  watch: ['*.json'],
  outExt: '.gen.ts',
};
