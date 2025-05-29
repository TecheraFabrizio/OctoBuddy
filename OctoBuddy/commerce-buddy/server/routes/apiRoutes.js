import express from 'express';
import {
  cloneRepo,
  updateRepo,
  deployRepo,
  getRemoteBranches,
  checkoutRemoteBranch,
  getLocalRepos,
  getExtensionsList,
  repoExist,
} from '../controllers/gitController.js';

import {
  getAccountsList,
  getAuthIds,
  setAccountAuthInfo,
  getWebsitesAvailable,
} from '../controllers/commonController.js';

const router = express.Router();

// Define all API routes
router.get('/get-remote-branches', getRemoteBranches); // Handles branch listing and repo existence
router.get('/local-repos', getLocalRepos); // List local repositories
router.get('/get-extensions-list', getExtensionsList);
router.get('/repo-exist', repoExist);
router.get('/checkout-remote-branch', checkoutRemoteBranch); // Checkout to a remote branch
router.get('/clone-repository', cloneRepo); // Handles cloning of a repository
router.get('/update-repository', updateRepo); // Handles cloning of a repository

router.get('/get-accounts-list', getAccountsList); // Get list of local accounts
router.get('/get-auth-ids-list', getAuthIds);

router.get('/get-websites-list', getWebsitesAvailable);

router.post('/deploy', deployRepo); // Handles deploying repositories
router.post('/setAccountAuthInfo', setAccountAuthInfo); // Handles deploying repositories

export default router;
