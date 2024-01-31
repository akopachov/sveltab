const path = require('path');
const fs = require('fs');
const { applyPatch } = require('fast-json-patch');

const args = process.argv.slice(2);

const buildDir = path.resolve(__dirname, 'build');
const manifestSrcDir = path.resolve(__dirname, 'manifest');
const baseManifest = require(`${manifestSrcDir}/manifest.base.json`);
const patchPath = path.join(manifestSrcDir, `manifest.${args[0]}.patch.json`);
const targetManifestFile = path.join(buildDir, 'manifest.json');
let manifestData = baseManifest;
if (fs.existsSync(patchPath)) {
  const patchData = require(patchPath);
  manifestData = applyPatch(manifestData, patchData).newDocument;
}

fs.writeFileSync(targetManifestFile, JSON.stringify(manifestData, null, '  '));
