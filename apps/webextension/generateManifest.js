import path from 'node:path';
import fs from 'node:fs/promises';
import packageJson from './package.json' with { type: 'json' };
import fastJsonPatch from 'fast-json-patch';

const { applyPatch } = fastJsonPatch;

const args = process.argv.slice(2);

const buildDir = './build';
const manifestSrcDir = './manifest';
const baseManifest = JSON.parse(await fs.readFile(`${manifestSrcDir}/manifest.base.json`, { encoding: 'utf-8' }));
const patchPath = path.join(manifestSrcDir, `manifest.${args[0]}.patch.json`);
const targetManifestFile = path.join(buildDir, 'manifest.json');
let patchData = [{ op: 'replace', path: '/version', value: packageJson.version }];
if (
  await fs.stat(patchPath).then(
    () => true,
    () => false,
  )
) {
  patchData = patchData.concat(JSON.parse(await fs.readFile(patchPath, { encoding: 'utf-8' })));
}

const manifestData = applyPatch(baseManifest, patchData).newDocument;

await fs.writeFile(targetManifestFile, JSON.stringify(manifestData, null, '  '));
