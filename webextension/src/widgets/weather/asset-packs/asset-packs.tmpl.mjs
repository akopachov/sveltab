import fs from 'node:fs/promises';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import glob from 'tiny-glob';

export default { name: '[Widgets]: [Weather]: Assets pack generator', watch: ['*.json'], outExt: '.gen.ts' };

async function processFile(filePath, assetPackGeneratedCodeFile) {
  const assetPackDef = JSON.parse(await fs.readFile(filePath, { encoding: 'utf-8' }));
  const assetNameFile = path.parse(filePath).name;
  const className = `${assetNameFile[0].toUpperCase()}${assetNameFile.slice(1)}AssetsPack`;

  console.group('Processing asset pack file', filePath);

  await fs.writeFile(assetPackGeneratedCodeFile, `//#region "${assetNameFile} asset pack"\n`);

  const notMappedCodes = new Set(Array.from(new Array(100), (x, i) => i));
  const iconAliasMap = new Map();
  let iconIndex = 1;
  const iconMap = new Array(100);
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

  let canBeColored = false;
  for (let [icon, alias] of iconAliasMap) {
    await fs.writeFile(assetPackGeneratedCodeFile, `const ${alias} = '${icon}';\n`);
    if (icon.includes('{color}')) {
      canBeColored = true;
    }
  }

  await fs.writeFile(assetPackGeneratedCodeFile, `\nexport class ${className} extends BaseAssetsPack {\n`);
  await fs.writeFile(assetPackGeneratedCodeFile, '  constructor(baseUrl: string) {\n');
  await fs.writeFile(assetPackGeneratedCodeFile, `    super(\n`);
  await fs.writeFile(assetPackGeneratedCodeFile, `      baseUrl,\n`);
  await fs.writeFile(assetPackGeneratedCodeFile, `      [\n`);
  for (let map of iconMap) {
    await fs.writeFile(
      assetPackGeneratedCodeFile,
      Array.isArray(map) ? `        [${map[0]}, ${map[1]}],\n` : `        ${map},\n`,
    );
  }
  await fs.writeFile(assetPackGeneratedCodeFile, `      ],\n`);
  await fs.writeFile(assetPackGeneratedCodeFile, `      ${canBeColored});\n`);
  await fs.writeFile(assetPackGeneratedCodeFile, '  }\n');
  await fs.writeFile(assetPackGeneratedCodeFile, '}\n');

  if (notMappedCodes.size > 0) {
    console.info('Following WMO codes are unmapped:', Array.from(notMappedCodes));
  }

  await fs.writeFile(assetPackGeneratedCodeFile, `//#endregion "${assetNameFile} asset pack"\n`);
  console.info('Generated asset pack', className);

  console.groupEnd();
}

export async function generate(outputFileHandle) {
  console.info('Started generating asset packs');
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  await fs.writeFile(outputFileHandle, "import { BaseAssetsPack } from './asset-pack-base';\n\n");
  const jsonFiles = await glob('*.json', { cwd: scriptDir, absolute: true, dot: true, filesOnly: true });
  for (const [i, jsonFile] of jsonFiles.entries()) {
    await processFile(jsonFile, outputFileHandle);
    if (i < jsonFiles.length - 1) {
      await fs.writeFile(outputFileHandle, '\n');
    }
  }

  console.info('Finished generating asset packs');
}
