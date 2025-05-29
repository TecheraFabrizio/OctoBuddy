/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {
  const checkSkinPresetExists = (skinPreset) => {
    // Create the search to find the CMS Page Type record by name
    var contentTypeSearch = search.create({
      type: 'customrecord_ns_sc_extmech_skin_preset', // Record type for CMS Page Type
      filters: [['name', 'is', skinPreset.name]],
      columns: ['internalid'],
    });

    // Run the search and check if any records are returned
    var resultSet = contentTypeSearch.run();
    var results = resultSet.getRange({ start: 0, end: 1 }); // Only need to check the first result

    return results.length > 0;
  };

  //used for predefined skins from manifest
  const createSkinPreset = (skinPreset, extManifest) => {
    try {
      const skinPresetRecord = record.create({
        type: 'customrecord_ns_sc_extmech_skin_preset',
        isDynamic: true,
      });
      let settings_record_id = '';
      var internalIdThemeExtMech = findChildRecordInternalId(
        'customrecord_ns_sc_extmech_extension',
        extManifest.name,
        extManifest.version,
      );

      var parts = skinPreset.file.split('/');
      var fileName = parts[parts.length - 1];

      let internalIdFileSkin = findFileInSuiteApps(
        fileName,
        extManifest.manifestLocation,
      );

      skinPresetRecord.setValue({ fieldId: 'name', value: skinPreset.name });

      //internal id of file in file cabinet
      skinPresetRecord.setValue({
        fieldId: 'custrecord_skin_preset_file',
        value: internalIdFileSkin,
      });

      //internal id of record (eg. SummitV4) from ext mech custom record type
      skinPresetRecord.setValue({
        fieldId: 'custrecord_skin_preset_theme',
        value: internalIdThemeExtMech,
      });

      //remove after data is ok
      const recordId = skinPresetRecord.save();
    } catch (error) {
      log.error('Error Creating skinPresetRecord', {
        name: skinPreset.name,
        error: error.message,
      });
    }
  };

  return { checkSkinPresetExists, createSkinPreset };
});
