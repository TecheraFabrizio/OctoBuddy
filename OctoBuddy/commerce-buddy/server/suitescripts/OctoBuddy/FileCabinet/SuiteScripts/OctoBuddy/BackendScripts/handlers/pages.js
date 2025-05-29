/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {
  const checkPageTypeExists = (pageType) => {
    // Create the search to find the CMS Page Type record by name
    var contentTypeSearch = search.create({
      type: 'cmspagetype', // Record type for CMS Page Type
      filters: [['name', 'is', pageType.name]],
      columns: ['internalid'],
    });

    // Run the search and check if any records are returned
    var resultSet = contentTypeSearch.run();
    var results = resultSet.getRange({ start: 0, end: 1 }); // Only need to check the first result

    return results.length > 0;
  };

  //used for blog extension
  const createPageType = (pageType) => {
    try {
      const pageTypeRecord = record.create({
        type: 'cmspagetype',
        isDynamic: true,
      });
      let settings_record_id = '';

      if (pageType.settingsRecord) {
        settings_record_id = getInternalIdByRecordType(pageType.settingsRecord);

        pageTypeRecord.setValue({
          fieldId: 'customrecordtype',
          value: settings_record_id,
        });
      }

      pageTypeRecord.setValue({ fieldId: 'name', value: pageType.name });
      pageTypeRecord.setValue({
        fieldId: 'displayname',
        value: pageType.displayName,
      });
      pageTypeRecord.setValue({
        fieldId: 'description',
        value: pageType.description,
      });

      if (pageType.baseUrlPath) {
        pageTypeRecord.setValue({
          fieldId: 'baseurlpath',
          value: pageType.baseUrlPath,
        });
      }

      if (pageType.cmsCreatable) {
        pageTypeRecord.setValue({
          fieldId: 'cmscreatable',
          value: pageType.cmsCreatable,
        });
      }

      const recordId = pageTypeRecord.save();
    } catch (error) {
      log.error('Error Creating pageTypeRecord', {
        name: pageType.name,
        error: error.message,
      });
    }
  };

  return { checkPageTypeExists, createPageType };
});
