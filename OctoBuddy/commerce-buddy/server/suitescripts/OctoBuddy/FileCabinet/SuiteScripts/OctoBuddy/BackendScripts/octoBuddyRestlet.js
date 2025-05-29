/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define([
  'N/log',
  './handlers/ccts',
  './handlers/extension',
  './handlers/pages',
  './handlers/skins',
  './handlers/extFieldsets',
  './handlers/utils',
], (
  log,
  cctModule,
  extensionModule,
  pageModule,
  skinModule,
  fieldsetsModule,
  utilsModule,
) => {
  // preload websiteList with all websites available
  // return the information to client to populate
  // need to implement Api CLIENT octoapi to make the request
  // when accounts dropdown is marked
  const get = () => {
    const websiteAndId = utilsModule.getAllWebsitesByAccountId();
    return JSON.stringify({
      status: 'success',
      summary: websiteAndId, // Directly return the object, not stringified
    });
  };

  const post = (requestBody) => {
    const recordsSummary = {
      totalManifestProcessed: 0,
      created: 0,
      skipped: 0,
      errors: [],
    };

    const manifestList = requestBody.manifest[0];
    const suiteAppFolderName = requestBody.manifest[1];
    const fieldsets = requestBody.fieldsets;
    const website = requestBody.website;

    //log.debug({ title: 'testing', details: data });

    manifestList.forEach((extension) => {
      //if exist in manifest add this condition....
      var cctList = extension.cct;
      var pageTypes = extension.page ? extension.page.types : [];
      var skinList = extension.skins;

      recordsSummary.totalManifestProcessed++;
      //extension record creation
      try {
        const extRecordExist = extensionModule.checkExtensionRecordExists(
          extension.name,
          extension.version,
        );
        if (extRecordExist) {
          recordsSummary.skipped++;
        } else {
          extensionModule.createExtensionRecord(extension, suiteAppFolderName);
          recordsSummary.created++;
        }
      } catch (error) {
        recordsSummary.errors.push({
          name: extension.name,
          error: error.message,
        });
        log.error('Error Processing Extension', {
          name: extension.name,
          error: error.message,
        });
      }

      //CCT creation
      if (cctList && cctList.length > 0) {
        cctList.forEach(function (cct) {
          try {
            const CCTRecordExist = cctModule.checkCCTRecordExists(cct);
            if (CCTRecordExist) {
              recordsSummary.skipped++;
            } else {
              cctModule.createCCTRecord(cct);
              recordsSummary.created++;
            }
          } catch (error) {
            recordsSummary.errors.push({
              name: extension.name,
              error: error.message,
            });
            log.error('Error Processing Extension', {
              name: extension.name,
              error: error.message,
            });
          }
        });
      }

      //PageType creation (for blog ext for eg.)
      if (pageTypes && pageTypes.length > 0) {
        //for pageTypes
        pageTypes.forEach(function (pageType) {
          try {
            const pageTypeRecordExist =
              pageModule.checkPageTypeExists(pageType);
            if (pageTypeRecordExist) {
              recordsSummary.skipped++;
            } else {
              pageModule.createPageType(pageType);
              recordsSummary.created++;
            }
          } catch (error) {
            recordsSummary.errors.push({
              name: extension.name,
              error: error.message,
            });
            log.error('Error Processing Extension', {
              name: extension.name,
              error: error.message,
            });
          }
        });
      }

      //Skin preset creation (ex. Dark skin for SummitV4)
      if (skinList && skinList.length > 0) {
        skinList.forEach(function (skinPreset) {
          try {
            const skinPresetRecordExist =
              skinModule.checkSkinPresetExists(skinPreset);
            if (skinPresetRecordExist) {
              recordsSummary.skipped++;
            } else {
              skinModule.createSkinPreset(skinPreset, extension);
              recordsSummary.created++;
            }
          } catch (error) {
            recordsSummary.errors.push({
              name: extension.name,
              error: error.message,
            });
            log.error('Error Processing Extension', {
              name: extension.name,
              error: error.message,
            });
          }
        });
      }

      //FIELDSETS creation (TODO)
      if (website && fieldsets) {
        const siteId = website.split('_')[0];
        fieldsetsModule.createFieldsets(siteId, fieldsets);
      }
    });

    return {
      status: 'success',
      summary: recordsSummary,
    };
  };

  return { post, get };
});
