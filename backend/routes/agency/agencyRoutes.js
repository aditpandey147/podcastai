// backend/routes/agencyRoutes.js
const express = require('express');
const router = express.Router();
const agencyController = require('../../controllers/agency/agencyController');
const auth = require('../../middleware/auth');

router.get('/members', auth, agencyController.getMembers);
router.post('/members', auth, agencyController.addMember);
router.delete('/members/:id', auth, agencyController.removeMember);
router.patch('/members/:id/toggle', auth, agencyController.toggleMember);
router.get('/my-agency', auth, agencyController.getMyAgency);

module.exports = router;
