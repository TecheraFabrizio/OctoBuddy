import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ButtonDeploy from '../buttons/ButtonDeploy';
import PropTypes from 'prop-types';

// Utility function to fetch data
const fetchData = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching data: ${error.message}`);
    throw error;
  }
};

const AutoComplete = ({ reloadData, selectedRows }) => {
  const [accountsList, setAccountsList] = useState([]);
  const [authIdsList, setAuthIdsList] = useState([]);
  const [websitesList, setWebsitesList] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedAuthId, setSelectedAuthId] = useState(null);
  const [selectedWebsite, setSelectedWebsite] = useState(null); // Added state for selected website
  const [websitesClicked, setWebsitesClicked] = useState(false);

  // Fetch accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await fetchData('/api/get-accounts-list');
        setAccountsList(data?.accounts || []);
      } catch (error) {
        console.error('Error fetching accounts list:', error.message);
      }
    };
    fetchAccounts();
  }, []);

  // Fetch auth IDs when selectedAccount changes
  useEffect(() => {
    const fetchAuthIds = async () => {
      if (!selectedAccount) return;
      try {
        const data = await fetchData(
          `/api/get-auth-ids-list?account=${selectedAccount}`,
        );
        setAuthIdsList(data || []);
      } catch (error) {
        console.error('Error fetching auth IDs:', error.message);
      }
    };
    fetchAuthIds();
  }, [selectedAccount]);

  // Fetch websites only when websites input is clicked
  useEffect(() => {
    if (!websitesClicked || websitesList.length > 0) return; // Do nothing if websites already fetched
    const fetchWebsites = async () => {
      try {
        const websites = await fetchData('/api/get-websites-list');
        setWebsitesList(websites || []);
      } catch (error) {
        console.error('Error fetching websites:', error.message);
      }
    };
    fetchWebsites();
  }, [websitesClicked, websitesList]);

  // Save account & auth ID when both are selected
  useEffect(() => {
    const saveAccountAuthInfo = async () => {
      if (!selectedAccount || !selectedAuthId) return;
      try {
        await fetchData('/api/setAccountAuthInfo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account: selectedAccount,
            authId: selectedAuthId,
          }),
        });
        console.log(
          `Saved account: ${selectedAccount}, auth ID: ${selectedAuthId}`,
        );
      } catch (error) {
        console.error('Error saving account/auth ID:', error.message);
      }
    };
    saveAccountAuthInfo();
  }, [selectedAccount, selectedAuthId]);

  // Render Autocomplete inputs
  const renderAutocomplete = (label, options, value, onChange, id, onFocus) => (
    <Autocomplete
      disablePortal
      disableClearable
      id={id}
      options={options}
      getOptionLabel={(option) => option || ''}
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      onFocus={onFocus}
      renderInput={(params) => <TextField {...params} label={label} />}
      sx={{ width: 300 }}
    />
  );

  return (
    <Accordion
      sx={{
        backgroundColor: '#e0f7fa',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: 'rgba(179, 229, 252, 1)',
          padding: '8px',
          borderRadius: '8px 8px 0 0',
          '&:hover': { backgroundColor: 'rgba(160, 210, 230, 1)' },
        }}
      >
        <Typography>Account Selection and Deployment</Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: 'rgba(179, 229, 252, 0)',
          padding: '16px',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <Stack direction="row" spacing={2}>
          {renderAutocomplete(
            'Accounts',
            accountsList,
            selectedAccount || '',
            setSelectedAccount,
            'combo-box-accounts',
            () => {},
          )}
          {renderAutocomplete(
            'Auth IDs',
            authIdsList,
            selectedAuthId || '',
            setSelectedAuthId,
            'combo-box-authIds',
            () => {},
          )}
          {renderAutocomplete(
            'Websites',
            websitesList,
            selectedWebsite, // Use selectedWebsite as the value
            (newValue) => setSelectedWebsite(newValue), // Update selectedWebsite on change
            'combo-box-websites',
            () => setWebsitesClicked(true), // Trigger fetching websites when focused
          )}
          <ButtonDeploy reloadData={reloadData} selectedRows={selectedRows} selectedWebsite={selectedWebsite} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

// PropTypes validation
AutoComplete.propTypes = {
  reloadData: PropTypes.func.isRequired,
  selectedRows: PropTypes.array.isRequired,
};

export default AutoComplete;
