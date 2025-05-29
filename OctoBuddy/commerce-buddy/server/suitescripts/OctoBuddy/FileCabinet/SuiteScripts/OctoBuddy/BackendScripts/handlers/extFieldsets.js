/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/log', 'N/file'], (
  record,
  search,
  log,
  file,
) => {
  const transformFieldsetIDforName = {
    correlateditems: 'Correlated Items',
    correlateditems_details: 'Correlated Items Details',
    details: 'details',
    itemssearcher: 'Items Searcher',
    matrixchilditems: 'matrixchilditems',
    matrixchilditems_search: 'matrixchilditems_search',
    order: 'Order',
    relateditems: 'Related Items',
    relateditems_details: 'Related Items Details',
    search: 'Search',
    typeahead: 'Type Ahead',
  };

  const createFieldsets = (siteID, customFields) => {
    try {
      // Load the website record
      const siteRecord = record.load({
        type: 'website',
        id: siteID,
      });

      // Helper function to add or update a fieldset
      const addOrUpdateFieldset = (
        fieldsetName,
        fieldsetId,
        additionalFields,
        fieldsetRecordType = 'ITEM',
      ) => {
        const fieldsetsSublistId = 'fieldset';
        let fieldsetExists = false;

        // Check if the fieldset already exists
        const lineCount = siteRecord.getLineCount({
          sublistId: fieldsetsSublistId,
        });
        for (let i = 0; i < lineCount; i++) {
          const existingFieldsetId = siteRecord.getSublistValue({
            sublistId: fieldsetsSublistId,
            fieldId: 'fieldsetid',
            line: i,
          });

          if (existingFieldsetId === fieldsetId) {
            fieldsetExists = true;

            // Update the existing fieldset
            const existingFields =
              siteRecord.getSublistValue({
                sublistId: fieldsetsSublistId,
                fieldId: 'fieldsetfields',
                line: i,
              }) || '';

            const updatedFields = new Set(
              existingFields.split(',').filter(Boolean),
            );

            additionalFields.forEach((field) => {
              field
                .split(',')
                .map((f) => f.trim())
                .forEach((f) => updatedFields.add(f));
            });

            siteRecord.setSublistValue({
              sublistId: fieldsetsSublistId,
              fieldId: 'fieldsetfields',
              line: i,
              value: Array.from(updatedFields).join(','),
            });
            break;
          }
        }

        // If the fieldset does not exist, create a new line
        if (!fieldsetExists) {
          const newLineIndex = siteRecord.insertLine({
            sublistId: fieldsetsSublistId,
            line: lineCount,
          });

          siteRecord.setSublistValue({
            sublistId: fieldsetsSublistId,
            fieldId: 'fieldsetname',
            line: newLineIndex,
            value: fieldsetName,
          });
          siteRecord.setSublistValue({
            sublistId: fieldsetsSublistId,
            fieldId: 'fieldsetid',
            line: newLineIndex,
            value: fieldsetId,
          });
          siteRecord.setSublistValue({
            sublistId: fieldsetsSublistId,
            fieldId: 'fieldsetrecordtype',
            line: newLineIndex,
            value: fieldsetRecordType,
          });
          siteRecord.setSublistValue({
            sublistId: fieldsetsSublistId,
            fieldId: 'fieldsetfields',
            line: newLineIndex,
            value: additionalFields
              .flatMap((field) => field.split(',').map((f) => f.trim()))
              .join(','),
          });
        }
      };

      // Iterate through customFields to create or update fieldsets
      for (const fieldId in customFields) {
        if (customFields.hasOwnProperty(fieldId)) {
          addOrUpdateFieldset(
            transformFieldsetIDforName[fieldId],
            fieldId,
            customFields[fieldId],
          );
        }
      }

      // Save the record
      const recordId = siteRecord.save();
      log.debug({
        title: 'Record Saved',
        details: `Website record updated successfully with ID: ${recordId}`,
      });
    } catch (error) {
      log.error({
        title: 'Error Updating Website Record',
        details: error.message,
      });
    }
  };

  return { createFieldsets };
});
