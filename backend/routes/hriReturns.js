const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/* MySQL code only ---
// POST /api/hriReturns
router.post("/", authenticateToken, authorizeRoles ('bookmaker'), async (req, res) => {
  try {
    const { fixtureId,  ...values } = req.body;
    const permitNo = req.user.permitNo;
   
    console.log("Incoming body:", req.body);
   
    // insert return row
    await db.query(
      `INSERT INTO BookmakerReturn
      (fixtureId,permitNo,euroTotalStakeAway,euroTrackLaidOffAway,euroTotalVoidAway,euroTotalStakeHome,euroTrackLaidOffHome,euroTotalVoidHome,stgTotalStakeAway,stgTrackLaidOffAway,stgTotalVoidAway,stgTotalStakeHome,stgTrackLaidOffHome,stgTotalVoidHome,exchangeLaid,exchangeBacked, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, Now(), Now())`,
      [
        fixtureId, 
        permitNo,
        values.euroTotalStakeAway,
        values.euroTrackLaidOffAway,
        values.euroTotalVoidAway,
        values.euroTotalStakeHome,
        values.euroTrackLaidOffHome,
        values.euroTotalVoidHome,
        values.stgTotalStakeAway,
        values.stgTrackLaidOffAway,
        values.stgTotalVoidAway,
        values.stgTotalStakeHome,
        values.stgTrackLaidOffHome,
        values.stgTotalVoidHome,
        values.exchangeLaid,
        values.exchangeBacked 
    ]
    );


    res.json({ message: "Return submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting return" });
  }
});
*/

// PostgreSQL code only ---
// POST /api/hriReturns
router.post("/", authenticateToken, authorizeRoles ('bookmaker'), async (req, res) => {
  try {
    const { fixtureId,  ...values } = req.body;
    const permitNo = req.user.permitNo;
   
    console.log("Incoming body:", req.body);
   
    // insert return row
    await db.query(
      `INSERT INTO bookmakerreturn
      (fixtureid,permitno,eurototalstakeaway,eurotracklaidoffaway,eurototalvoidaway,eurototalstakehome,eurotracklaidoffhome,eurototalvoidhome,stgtotalstakeaway,stgtracklaidoffaway,stgtotalvoidaway,stgtotalstakehome,stgtracklaidoffhome,stgtotalvoidhome,exchangelaid,exchangebacked, createdat, updatedat)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, Now(), Now())`,
      [
        fixtureId, 
        permitNo,
        values.euroTotalStakeAway,
        values.euroTrackLaidOffAway,
        values.euroTotalVoidAway,
        values.euroTotalStakeHome,
        values.euroTrackLaidOffHome,
        values.euroTotalVoidHome,
        values.stgTotalStakeAway,
        values.stgTrackLaidOffAway,
        values.stgTotalVoidAway,
        values.stgTotalStakeHome,
        values.stgTrackLaidOffHome,
        values.stgTotalVoidHome,
        values.exchangeLaid,
        values.exchangeBacked 
    ]
    );


    res.json({ message: "Return submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting return" });
  }
});


module.exports = router;



