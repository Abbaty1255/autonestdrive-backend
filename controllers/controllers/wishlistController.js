const db = require('../config/db');

exports.getWishlist = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vi.id,
            'image_url', vi.image_url
          )
        ) FILTER (WHERE vi.id IS NOT NULL),
        '[]'
      ) AS images
      FROM saved_cars sc
      JOIN vehicles v ON sc.vehicle_id = v.id
      LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
      WHERE sc.customer_id = $1
      GROUP BY v.id, sc.created_at
      ORDER BY sc.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  const { vehicleId } = req.body;

  try {
    const existing = await db.query(
      'SELECT * FROM saved_cars WHERE customer_id = $1 AND vehicle_id = $2',
      [req.user.id, vehicleId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        'DELETE FROM saved_cars WHERE customer_id = $1 AND vehicle_id = $2',
        [req.user.id, vehicleId]
      );

      return res.json({
        success: true,
        saved: false,
        message: 'Removed from wishlist'
      });
    }

    await db.query(
      'INSERT INTO saved_cars (customer_id, vehicle_id) VALUES ($1, $2)',
      [req.user.id, vehicleId]
    );

    return res.json({
      success: true,
      saved: true,
      message: 'Added to wishlist'
    });

  } catch (error) {
    next(error);
  }
};