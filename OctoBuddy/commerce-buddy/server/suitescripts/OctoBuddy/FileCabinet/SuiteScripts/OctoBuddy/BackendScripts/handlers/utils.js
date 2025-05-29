/**
 * @NApiVersion 2.1
 */
define(['N/search', 'N/log'], (search, log) => {
  const findFileInSuiteApps = (fileName, filePath) => {
    try {
      // Step 1: Remove the manifest.json part from the given path
      var pathParts = filePath.split('/');
      pathParts.pop(); // Remove the 'manifest.json' part
      var parentFolderPath = pathParts.join('/'); // This will now be the path till 'SummitV4'

      // The 'Skins' folder is inside 'SummitV4', so we directly assign it
      var skinsFolderPath = parentFolderPath + '/Skins';

      // Step 2: Search for the 'Summit-Dark.json' file inside the 'Skins' folder
      var fileSearch = search.create({
        type: 'file',
        filters: [
          ['folder', 'is', skinsFolderPath], // Files inside Skins folder
          'AND',
          ['name', 'is', fileName], // File name is Summit-Dark.json
        ],
        columns: ['internalid', 'name'],
      });

      var fileResults = fileSearch.run().getRange({ start: 0, end: 1 });

      // If the Summit-Dark.json file is not found, return null
      if (fileResults.length === 0) {
        log.debug({
          title: 'File Not Found',
          details:
            'The file ' + fileName + ' was not found inside the Skins folder.',
        });
        return null;
      }

      // Get the internal ID of the Summit-Dark.json file
      var fileInternalId = fileResults[0].getValue('internalid');
      log.debug({
        title: 'File Found',
        details: 'Internal ID of ' + fileName + ': ' + fileInternalId,
      });

      // Return the internal ID of the found file
      return fileInternalId;
    } catch (e) {
      // Catch and log any errors
      log.error({
        title: 'Error Finding File',
        details: e.toString(),
      });
      return null;
    }
  };

  //example 'customrecord_ns_sc_extmech_extension'
  //find inside that record a child (name: SummitV4, version: 4.0.0)
  //return internal id
  const findChildRecordInternalId = (
    parentRecordType,
    nameFilter,
    versionFilter,
  ) => {
    try {
      // Step 1: Search for the child record based on name and version
      var childRecordSearch = search.create({
        type: parentRecordType, // Use the parent record type here if needed
        filters: [
          ['name', 'is', nameFilter], // Filter by name (e.g., SummitV4)
          'AND',
          ['custrecord_extension_version', 'is', versionFilter], // Filter by version (e.g., 4.0.0)
        ],
        columns: [
          'internalid', // Return the internal ID of the child record
        ],
      });

      // Step 2: Run the search and get the results
      var results = childRecordSearch.run().getRange({ start: 0, end: 1 });

      // Step 3: Check if any results were found
      if (results.length > 0) {
        return results[0].getValue('internalid');
      } else {
        log.error({
          title: 'No Matching Child Record Found',
          details:
            'No child record found with name: ' +
            nameFilter +
            ' and version: ' +
            versionFilter,
        });
        return null;
      }
    } catch (e) {
      log.error({
        title: 'Error Searching for Child Record',
        details: e.toString(),
      });
      return null;
    }
  };

  const getInternalIdByRecordType = (recordType, filters) => {
    var recordTypeSearch = search.create({
      type: 'customrecordtype', // Search type for custom record types
      filters: [
        ['scriptid', 'is', recordType], // Filter by the name of the custom record type
      ],
      columns: ['internalid'], // Only retrieve the internal ID
    });

    var results = recordTypeSearch.run().getRange({ start: 0, end: 1 }); // Get the first result

    if (results.length > 0) {
      var recordTypeId = results[0].getValue('internalid'); // Get the internal ID of the custom record type

      return recordTypeId;
    } else {
      log.error({
        title: 'Record Type Not Found',
        details: 'The record type ' + recordType + ' was not found.',
      });
    }
  };

  const getManifestFileId = (extension, suiteAppFolderName) => {
    let manifestLocation = extension.manifestLocation;
    var pathParts = manifestLocation.split('/');
    // Remove 'manifest.json' and FileCabinet.

    //Eg Horizon / HorizonThemeExtension folder name
    let themeFolderName = pathParts[pathParts.length - 2];

    var suiteAppsFolder = search.create({
      type: 'folder',
      filters: [
        ['name', 'is', 'SuiteApps'],
        'AND',
        ['parent', 'anyof', '@NONE@'],
      ],
      columns: ['internalid'],
    });

    var suiteAppsResult = suiteAppsFolder.run().getRange({ start: 0, end: 1 });

    //internal id of com.netsuite.something
    var comDotNetsuiteIntId = suiteAppsResult[0].getValue('internalid');

    //get comnnetsuitefolder
    var comDotNetsuiteFolder = search.create({
      type: 'folder',
      filters: [
        ['name', 'is', suiteAppFolderName],
        'AND',
        ['parent', 'is', comDotNetsuiteIntId],
      ],
      columns: ['internalid'],
    });

    var comDotNetsuiteResults = comDotNetsuiteFolder
      .run()
      .getRange({ start: 0, end: 1 });

    //internal id of com.netsuite.something
    var comDotNetsuiteIntId = comDotNetsuiteResults[0].getValue('internalid');

    if (extension.type === 'extension') {
      try {
        // Search manifest.json located at suiteapp folder com.netsuite.something
        var fileSearch = search.create({
          type: 'file',
          filters: [
            ['folder', 'is', comDotNetsuiteIntId],
            'AND',
            ['name', 'is', 'manifest.json'],
          ],
          columns: ['internalid'],
        });

        var fileResults = fileSearch.run().getRange({ start: 0, end: 1 });
        if (fileResults.length === 0) return null;

        return fileResults[0].getValue('internalid');
      } catch (e) {
        return null;
      }
    } else {
      //if this is theme do something
      try {
        var folderSearch = search.create({
          type: 'folder',
          filters: [
            ['name', 'is', themeFolderName],
            'AND',
            ['parent', 'is', comDotNetsuiteIntId],
          ],
          columns: ['internalid'],
        });

        var fileResults = folderSearch.run().getRange({ start: 0, end: 1 });

        if (fileResults.length === 0) return null; // If no file is found, return null

        var themeNameFolderId = fileResults[0].getValue('internalid'); // Return the internal ID of the manifest.json file

        var fileSearch = search.create({
          type: 'file',
          filters: [
            ['folder', 'is', themeNameFolderId],
            'AND',
            ['filetype', 'anyof', 'JSON'],
            'AND',
            ['name', 'is', 'manifest.json'],
          ],
          columns: ['internalid'],
        });

        var fileResults = fileSearch.run().getRange({ start: 0, end: 1 });
        if (fileResults.length === 0) return null;

        //Return manifest.json of theme folder name.
        return fileResults[0].getValue('internalid');
      } catch (e) {
        return null; // In case of any error, return null
      }
    }
  };

  const getAllWebsitesByAccountId = () => {
    try {
      const websiteList = [];

      // Create a search for website records
      const websiteSearch = search.create({
        type: 'website',
        columns: ['internalid', 'displayname'], // Add displayname to the columns
      });

      // Use search paging to retrieve all results
      const searchPagedData = websiteSearch.runPaged({
        pageSize: 1000, // Max page size
      });

      searchPagedData.pageRanges.forEach((pageRange) => {
        const currentPage = searchPagedData.fetch({ index: pageRange.index });
        currentPage.data.forEach((result) => {
          const websiteId = result.getValue({ name: 'internalid' });
          const displayName = result.getValue({ name: 'displayname' });

          // Log the website details
          log.debug({
            title: 'Website Found',
            details: `ID: ${websiteId}, Display Name: ${displayName}`,
          });

          websiteList.push({ websiteId, displayName });
        });
      });

      log.debug({
        title: 'Search Complete',
        details: `Retrieved ${websiteList.length} websites.`,
      });

      return websiteList;
    } catch (e) {
      log.error({
        title: 'Error Retrieving Websites',
        details: e.message,
      });
      return [];
    }
  };

  return {
    findFileInSuiteApps,
    findChildRecordInternalId,
    getInternalIdByRecordType,
    getManifestFileId,
    getAllWebsitesByAccountId,
  };
});
