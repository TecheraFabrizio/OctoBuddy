/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/log', './utils'], (
  record,
  search,
  log,
  utils,
) => {
  const checkExtensionRecordExists = (name, version) => {
    const recordSearch = search.create({
      type: 'customrecord_ns_sc_extmech_extension',
      filters: [
        ['name', 'is', name],
        'AND',
        ['custrecord_extension_version', 'is', version],
      ],
      columns: ['internalid'],
    });

    const searchResult = recordSearch.run().getRange({ start: 0, end: 1 });

    return searchResult.length > 0;
  };

  const createExtensionRecord = (extension, suiteAppFolderName) => {
    const selectedTargets = '13'; // Example: SCA SCS

    try {
      const fileId = utils.getManifestFileId(extension, suiteAppFolderName);
      if (!fileId)
        throw new Error(`Manifest file not found for ${extension.name}`);

      const extensionRecord = record.create({
        type: 'customrecord_ns_sc_extmech_extension',
        isDynamic: true,
      });

      extensionRecord.setValue({ fieldId: 'name', value: extension.name });
      extensionRecord.setValue({
        fieldId: 'custrecord_extension_type',
        value: extension.type === 'theme' ? 2 : 1, // Adjust type as needed
      });
      extensionRecord.setValue({
        fieldId: 'custrecord_extension_manifest',
        value: fileId,
      });
      extensionRecord.setValue({
        fieldId: 'custrecord_extension_targets',
        value: selectedTargets,
      });

      extensionRecord.setValue({
        fieldId: 'custrecord_extension_target_version',
        value: JSON.stringify(extension.target_version),
      });

      if (extension.sub_type === 'fallback') {
        extensionRecord.setValue({
          fieldId: 'custrecord_extension_sub_type',
          value: '1',
        });
      }

      extensionRecord.setValue({
        fieldId: 'custrecord_extension_vendor',
        value: extension.vendor,
      });
      extensionRecord.setValue({
        fieldId: 'custrecord_extension_version',
        value: extension.version,
      });
      extensionRecord.setValue({
        fieldId: 'custrecord_extension_fantasy_name',
        value: extension.fantasyName,
      });
      extensionRecord.setValue({
        fieldId: 'custrecord_extension_description',
        value: extension.description,
      });

      const recordId = extensionRecord.save();
      log.audit('Extension Created', { name: extension.name, id: recordId });
    } catch (error) {
      log.error('Error Creating Extension', {
        name: extension.name,
        error: error.message,
      });
    }
  };

  return { checkExtensionRecordExists, createExtensionRecord };
});
