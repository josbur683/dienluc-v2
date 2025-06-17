// Route for interactive map of Vietnam
const express = require('express');
const router = express.Router();
const Outage = require('../models/outage');

// Route to render the interactive map page
router.get('/', async (req, res) => {
  try {
    // Get current date and date 24 hours from now (Vietnam time)
    const now = new Date();
    const todayVN = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowVN = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Fetch provinces with outages within the next 24 hours
    const provinceStats = await Outage.aggregate([
      {
        $match: {
          startTime: { $gte: todayVN, $lt: tomorrowVN }
        }
      },
      {
        $group: {
          _id: "$province",
          count: { $sum: 1 }
        }
      }
    ]).catch(err => {
      console.error('Aggregation error:', err);
      throw err;
    });

    // Create an array of provinces with outages in the next 24 hours
    const highlightedProvinces = provinceStats.map(stat => stat._id);

    // Attempt to render the map view
    res.render('map', {
      highlightedProvinces,
      layout: 'main'
    }, (err, html) => {
      if (err) {
        console.error('Rendering error:', err);
        res.status(500).send('Error rendering map page: ' + err.message);
      } else {
        res.send(html);
      }
    });
  } catch (error) {
    console.error('Error fetching data for map:', error.stack);
    res.status(500).send('Error loading map data: ' + error.message);
  }
});

module.exports = router;
