import * as React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import {
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // For the expand icon
import ButtonClone from '../buttons/ButtonClone';
import ButtonUpdate from '../buttons/ButtonUpdate';
import { useEffect, useState } from 'react';

const AutoComplete = ({ reloadData }) => {
  const [backendData, setBackendData] = useState({ extensionName: [] });
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [repoExists, setRepoExists] = useState(false);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchBranches = async (repoName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/get-remote-branches?repo=${repoName}`);
      if (!response.ok) throw new Error('Failed to fetch branches');
      const data = await response.json();
      setBranches(data.remoteBranches);
      setSelectedBranch(null);
    } catch (err) {
      setBranches([]);
      setSelectedBranch(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkRepoExistence = async (repoName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/repo-exist?reponame=${repoName}`);
      if (!response.ok) throw new Error('Failed to check repository existence');
      const result = await response.json();
      setRepoExists(result.exists);
      return result.exists;
    } catch (err) {
      setRepoExists(false);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRepo) {
      const handleRepoChange = async () => {
        const exists = await checkRepoExistence(selectedRepo);
        if (exists) {
          await fetchBranches(selectedRepo);
        } else {
          setBranches([]);
          setSelectedBranch(null);
        }
      };
      handleRepoChange();
    } else {
      setBranches([]);
      setSelectedBranch(null);
    }
  }, [selectedRepo]);

  useEffect(() => {
    const checkoutBranch = async (branch, selectedRepo) => {
      try {
        const response = await fetch(
          `/api/checkout-remote-branch?branch=${branch}&repo=${selectedRepo}`,
        );
        if (!response.ok) throw new Error('Failed to checkout branch');
        reloadData();
      } catch (err) {
        console.log(err);
      }
    };

    if (selectedBranch !== null && selectedBranch !== undefined) {
      checkoutBranch(selectedBranch, selectedRepo);
    }
  }, [selectedBranch, selectedRepo]);

  useEffect(() => {
    fetch('/api/get-extensions-list')
      .then((response) => response.json())
      .then((data) => {
        setBackendData(data);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);

  const availableRepos = backendData.extensionName.concat(
    backendData.themeName,
  );
  const availableBranches = branches;

  return (
    <Accordion
      sx={{
        backgroundColor: 'rgba(179, 229, 252, 0.3)', // Light orange background for the accordion
        borderRadius: '8px', // Rounded corners
        marginBottom: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="auto-complete-content"
        id="auto-complete-header"
        sx={{
          backgroundColor: 'rgba(179, 229, 252, 0.9)', // Orange background for the collapsed summary
          padding: '2px',
          borderRadius: '8px 8px 0 0',
          '&:hover': {
            backgroundColor: 'rgba(160, 210, 230, 1)', // Darker orange on hover
          },
        }}
      >
        <Typography>Repository and branch management</Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: 'rgba(179, 229, 252, 0.3)', // Keep the light orange for the expanded details
          padding: '4px',
          borderRadius: '0 0 8px 8px',
        }}
      >
        <div style={{ display: 'flex', gap: '16px' }}>
          <Stack paddingY={3} spacing={2}>
            <Autocomplete
              disablePortal
              disableClearable
              id="combo-box-names"
              options={availableRepos}
              sx={{ width: 300 }}
              onChange={(event, repoName) => {
                setSelectedRepo(repoName);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Extension repository" />
              )}
            />
          </Stack>

          <Stack paddingY={3} spacing={2}>
            <Autocomplete
              disablePortal
              id="combo-box-branches"
              options={availableBranches}
              sx={{ width: 300 }}
              value={selectedBranch}
              onChange={(event, newBranch) => {
                setSelectedBranch(newBranch);
              }}
              renderInput={(params) => (
                <TextField {...params} label="Current branch" />
              )}
              loading={loading}
              disableClearable
            />
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
          </Stack>

          <Stack paddingY={3} spacing={2}>
            <ButtonClone reloadData={reloadData} selectedRepo={selectedRepo} />
          </Stack>

          <Stack paddingY={3} spacing={2}>
            <ButtonUpdate reloadData={reloadData} selectedRepo={selectedRepo} />
          </Stack>
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default AutoComplete;
