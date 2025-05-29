/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {
  const checkCCTRecordExists = (cct) => {
    // Create the search to find the CMS Content Type record by name
    var contentTypeSearch = search.create({
      type: 'cmscontenttype', // Record type for CMS Content Type
      filters: [['label', 'is', cct.label]],
      columns: ['internalid'],
    });

    // Run the search and check if any records are returned
    var resultSet = contentTypeSearch.run();
    var results = resultSet.getRange({ start: 0, end: 1 }); // Only need to check the first result

    return results.length > 0;
  };

  const createCCTRecord = (cct) => {
    try {
      const CCTRecord = record.create({
        type: 'cmscontenttype',
        isDynamic: true,
      });

      const settings_record_id = getInternalIdByRecordType(cct.settings_record);

      CCTRecord.setValue({ fieldId: 'name', value: cct.registercct_id });
      CCTRecord.setValue({ fieldId: 'label', value: cct.label });
      CCTRecord.setValue({ fieldId: 'description', value: cct.description });
      CCTRecord.setValue({
        fieldId: 'customrecordid',
        value: settings_record_id,
      });

      const recordId = CCTRecord.save();
    } catch (error) {
      log.error('Error Creating CCT', {
        name: cct.label,
        error: error.message,
      });
    }
  };

  return { checkCCTRecordExists, createCCTRecord };
});
