const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

/*
   // ---- This is the code used for the MySQL queries ----------

    // Get all bookmakers 
    router.get('/bookmakers', authenticateToken,  authorizeRoles ("admin"), async (req, res) => {
        
        
        try {
            const [results] = await db.query(
            `SELECT permitNo,
            name
            FROM USERS
            WHERE role_id = 1
            ORDER BY permitNo ASC`
            );

        res.json(results);
        } catch (err) {
            console.error("Error fetching bookmakers:", err);
            res.status(500).json({ error: err.message });
        }
    });
    

   
   // Add new user (This should tie in with the register page - need to include password, phone, email etc)
    router.post('/bookmakers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { permitNo, name } = req.body;
         try {
            await db.query(
             `INSERT INTO USERS (permitNo, name) VALUES (?, ?)`,
             [permitNo, name]
             );
             res.json({ message: 'Bookmaker added successfully' });
         } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    });

    // Delete a user
     router.delete('/bookmakers/:permitNo', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { permitNo } = req.params;
            try {
                await db.query(`DELETE FROM Users WHERE permitNo = ?`, [permitNo]);
                res.json({ message: 'User deleted successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });

    */

  // ---- This is the code used for the MySQL queries ----------

    // Get all bookmakers 
    router.get('/bookmakers', authenticateToken,  authorizeRoles ("admin"), async (req, res) => {
        
        
        try {
            const result = await db.query(
            `SELECT permitNo,
            name
            FROM USERS
            WHERE role_id = 1
            ORDER BY permitNo ASC`
            );

        const results = result.rows;
        res.json(results);
        } catch (err) {
            console.error("Error fetching bookmakers:", err);
            res.status(500).json({ error: err.message });
        }
    });
    

   
   // Add new user (This should tie in with the register page - need to include password, phone, email etc)
    router.post('/bookmakers', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { permitNo, name } = req.body;
         try {
            await db.query(
             `INSERT INTO USERS (permitNo, name) VALUES ($1, $2)`,
             [permitNo, name]
             );
             res.json({ message: 'Bookmaker added successfully' });
         } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
        }
    });

    // Delete a user
     router.delete('/bookmakers/:permitNo', authenticateToken, authorizeRoles('admin'), async (req, res) => {
        const { permitNo } = req.params;
            try {
                await db.query(`DELETE FROM Users WHERE permitNo = $1`, [permitNo]);
                res.json({ message: 'User deleted successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: err.message });
            }
        });       


   

module.exports = router;
