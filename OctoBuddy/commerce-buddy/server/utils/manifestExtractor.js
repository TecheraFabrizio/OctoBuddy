import fs from 'fs/promises';
import path from 'path';

function fillManifest(manifestData, manifestPath) {
  // Full fill the manifest structure
  const manifest_structure = {
    name: manifestData.name || '',
    fantasyName: manifestData.fantasyName || '',
    vendor: manifestData.vendor || '',
    version: manifestData.version || '',
    type: manifestData.type || '',
    target: manifestData?.target || 'SCA,SCS',
    description: manifestData?.description || '',
    manifestLocation: manifestPath || '',
    ...(manifestData?.target_version && {
      target_version: manifestData.target_version,
    }),
    ...(manifestData?.sub_type && { sub_type: manifestData.sub_type }), // Only add exists
    ...(manifestData?.skins && { skins: manifestData.skins }), // Only add if skins exists
    ...(manifestData?.cct && { cct: manifestData.cct }), // Only add if cct exists
    ...(manifestData?.page && { page: manifestData.page }), // Only add if page exists
  };
  return manifest_structure;
}

const preparePathForRestlet = (fullPath) => {
  const start = fullPath.indexOf('FileCabinet');
  if (start === -1) throw new Error('"FileCabinet" not found in the path.');
  return fullPath.substring(start).split(path.sep).join('/');
};

//baseFolderPath -> route where I start processing
//type -> theme or extension
export const processThemeManifest = async (baseFolderPath, type) => {
  // Read the contents of the base folder
  const folderContents = await fs.readdir(baseFolderPath, {
    withFileTypes: true,
  });
  let result = [[]];

  //com.netsuite.summittheme for example...
  let suiteAppName = path.basename(baseFolderPath);
  result.push(suiteAppName);

  try {
    if (type === 'theme') {
      for (const item of folderContents) {
        if (item.isDirectory()) {
          //eg. folderpath = Summit | SummitV4 | SummitThemeExtension
          const folderPath = path.join(baseFolderPath, item.name);
          const manifestPath = path.join(folderPath, 'manifest.json');

          try {
            // Check if manifest.json exists in the folder
            await fs.access(manifestPath);
            let manifestPathParsed = '';

            try {
              manifestPathParsed = preparePathForRestlet(manifestPath);
            } catch (error) {
              console.error(error.message);
            }

            // Read and parse manifest.json
            const manifestContent = await fs.readFile(manifestPath, 'utf-8');
            const manifestData = JSON.parse(manifestContent);

            let manifestRes = fillManifest(manifestData, manifestPathParsed);
            result[0].push(manifestRes);

            console.log(`Processed manifest for folder: ${item.name}`);
          } catch (err) {
            console.error(
              `No manifest.json found in folder: ${item.name} or error reading it.`,
            );
          }
        }
      }
    } else {
      //this is direct because manifest inside extension folder
      const manifestPath = path.join(baseFolderPath, 'manifest.json');
      // Check if manifest.json exists in the folder
      await fs.access(manifestPath);

      let manifestPathParsed = '';

      try {
        manifestPathParsed = preparePathForRestlet(manifestPath);
      } catch (error) {
        console.error(error.message);
      }

      // Read and parse manifest.json
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      const manifestData = JSON.parse(manifestContent);

      let manifestRes = await fillManifest(manifestData, manifestPathParsed);
      result[0].push(manifestRes);
    }

    return result;
  } catch (err) {
    console.error(`Error reading folder: ${err.message}`);
  }
};
