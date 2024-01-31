const path = require('path');
const fs = require('fs');
const { version } = require('./package.json');
const { applyPatch } = require('fast-json-patch');

const args = process.argv.slice(2);

const buildDir = path.resolve(__dirname, 'build');
const manifestSrcDir = path.resolve(__dirname, 'manifest');
const baseManifest = require(`${manifestSrcDir}/manifest.base.json`);
const patchPath = path.join(manifestSrcDir, `manifest.${args[0]}.patch.json`);
const targetManifestFile = path.join(buildDir, 'manifest.json');
let patchData = [{ op: 'replace', path: '/version', value: version }];
if (fs.existsSync(patchPath)) {
  patchData = patchData.concat(require(patchPath));
}

const manifestData = applyPatch(baseManifest, patchData).newDocument;

fs.writeFileSync(targetManifestFile, JSON.stringify(manifestData, null, '  '));
