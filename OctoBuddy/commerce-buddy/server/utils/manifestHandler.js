import fs from 'fs';
import path from 'path';

import { processThemeManifest } from '../utils/manifestExtractor.js';

// Read manifest from workingDirectory clone of current extension
const readManifest = async (extensionPath) => {
  try {
    const suiteAppsPath = path.join(extensionPath, '/FileCabinet/SuiteApps/');
    const suiteAppFolder = fs.readdirSync(suiteAppsPath, {
      withFileTypes: true,
    });

    // get folder of type com.netsuite.photogallery100
    const comNSFolder = suiteAppFolder.find((folder) => folder.isDirectory());
    const comNSFolderPath = path.join(suiteAppsPath, comNSFolder.name);
 
    //check if we deal with theme or extension.
    const manifestJsonPath = path.join(comNSFolderPath, 'manifest.json');
    const type = fs.existsSync(manifestJsonPath) ? 'extension' : 'theme';
    const manifest = processThemeManifest(comNSFolderPath, type);

  
    return manifest;
  } catch (error) {
    console.error('Error processing manifest:', error.message);
    return null;
  }
};

// Export the function so it can be used in other files
export default readManifest;
