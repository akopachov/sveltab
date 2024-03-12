import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'tiny-glob';

export default { name: '[Widgets]: [Weather]: Assets pack generator', pattern: ['*.json'] };

const scriptDir = dirname(fileURLToPath(import.meta.url));

function ensureGeneratedFolderInited() {
  if (fs.existsSync(path.join(scriptDir, './generated'))) return;
  fs.mkdirSync(path.join(scriptDir, 'generated'));
  fs.writeFileSync(path.join(scriptDir, 'generated/.gitignore'), '*\n');
  fs.writeFileSync(path.join(scriptDir, 'generated/.prettierignore'), '*\n');
}

function processFile(filePath) {
  const assetPackDef = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));
  const assetNameFile = path.parse(filePath).name;
  const className = `${assetNameFile[0].toUpperCase()}${assetNameFile.slice(1)}AssetsPack`;
  ensureGeneratedFolderInited();
  const assetPackGeneratedCodeFilePath = path.join(scriptDir, `generated/${assetNameFile}.ts`);
  const assetPackGeneratedCodeFile = fs.openSync(assetPackGeneratedCodeFilePath, 'w');

  console.group('Processing asset pack file', filePath);

  const notMappedCodes = new Set(Array.from(new Array(100), (x, i) => i));
  const iconAliasMap = new Map();
  let iconIndex = 1;
  const iconMap = new Array(100);
  for (const def of assetPackDef) {
    const criterias = def[0];
    if (!iconAliasMap.has(def[1])) {
      iconAliasMap.set(def[1], `Icon_${iconIndex++}`);
    }
    if (def.length > 2 && !iconAliasMap.has(def[2])) {
      iconAliasMap.set(def[2], `Icon_${iconIndex++}`);
    }

    const dayImage = iconAliasMap.get(def[1]);
    const nightImage = def.length > 2 ? iconAliasMap.get(def[2]) : undefined;

    for (let criteria of criterias) {
      if (!Array.isArray(criteria)) {
        criteria = [criteria, criteria];
      }

      for (let i = criteria[0]; i <= criteria[1]; i++) {
        if (i < 0 || i > 100) {
          console.info('Invalid WMO code found:', i);
          process.exit(5);
        }

        if (iconMap[i] !== undefined) {
          console.info('Duplicated WMO code found:', i);
          process.exit(10);
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

  fs.writeFileSync(
    assetPackGeneratedCodeFile,
    "import { BaseAssetsPack, type WmoCodeMap } from '../asset-pack-base';\n\n",
  );
  let canBeColored = false;
  for (let [icon, alias] of iconAliasMap) {
    fs.writeFileSync(assetPackGeneratedCodeFile, `const ${alias} = '${icon}';\n`);
    if (icon.includes('{color}')) {
      canBeColored = true;
    }
  }

  fs.writeFileSync(assetPackGeneratedCodeFile, `\nconst ${className}IconsMap: WmoCodeMap = [\n`);
  for (let map of iconMap) {
    fs.writeFileSync(assetPackGeneratedCodeFile, Array.isArray(map) ? `  [${map[0]}, ${map[1]}],\n` : `  ${map},\n`);
  }

  fs.writeFileSync(assetPackGeneratedCodeFile, '];\n\n');
  fs.writeFileSync(assetPackGeneratedCodeFile, `export class ${className} extends BaseAssetsPack {\n`);
  fs.writeFileSync(assetPackGeneratedCodeFile, '  constructor(baseUrl: string) {\n');
  fs.writeFileSync(assetPackGeneratedCodeFile, `    super(baseUrl, ${className}IconsMap, ${canBeColored});\n`);
  fs.writeFileSync(assetPackGeneratedCodeFile, '  }\n');
  fs.writeFileSync(assetPackGeneratedCodeFile, '}\n');

  fs.closeSync(assetPackGeneratedCodeFile);
  if (notMappedCodes.size > 0) {
    console.info('Following WMO codes are unmapped:', Array.from(notMappedCodes));
  }

  console.info('Generated asset pack', className);

  console.groupEnd();
}

export async function main() {
  console.info('Started generating asset packs');
  const jsonFiles = await glob('*.json', { cwd: scriptDir, absolute: true, dot: true, filesOnly: true });
  for (const jsonFile of jsonFiles) {
    processFile(jsonFile);
  }

  console.info('Finished generating asset packs');
}
