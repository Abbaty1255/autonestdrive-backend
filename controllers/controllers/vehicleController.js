const db = require('../config/db');

exports.getVehicles = async (req, res, next) => {
  const {
    make,
    model,
    fuel,
    transmission,
    body_style,
    minPrice,
    maxPrice,
    year,
    search
  } = req.query;

  let query = `
    SELECT v.*,
    COALESCE(
      json_agg(
        json_build_object(
          'id', vi.id,
          'image_url', vi.image_url,
          'is_primary', vi.is_primary
        )
      ) FILTER (WHERE vi.id IS NOT NULL),
      '[]'
    ) AS images
    FROM vehicles v
    LEFT JOIN vehicle_images vi
    ON v.id = vi.vehicle_id
    WHERE 1=1
  `;

  const params = [];

  if (make) {
    params.push(make);
    query += ` AND LOWER(v.make)=LOWER($${params.length})`;
  }

  if (model) {
    params.push(model);
    query += ` AND LOWER(v.model)=LOWER($${params.length})`;
  }

  if (fuel) {
    params.push(fuel);
    query += ` AND LOWER(v.fuel)=LOWER($${params.length})`;
  }

  if (transmission) {
    params.push(transmission);
    query += ` AND LOWER(v.transmission)=LOWER($${params.length})`;
  }

  if (body_style) {
    params.push(body_style);
    query += ` AND LOWER(v.body_style)=LOWER($${params.length})`;
  }

  if (minPrice) {
    params.push(minPrice);
    query += ` AND v.price >= $${params.length}`;
  }

  if (maxPrice) {
    params.push(maxPrice);
    query += ` AND v.price <= $${params.length}`;
  }

  if (year) {
    params.push(year);
    query += ` AND v.year = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (
      v.make ILIKE $${params.length}
      OR v.model ILIKE $${params.length}
      OR v.description ILIKE $${params.length}
    )`;
  }

  query += `
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `;

  try {
    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    next(error);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', vi.id,
            'image_url', vi.image_url,
            'is_primary', vi.is_primary
          )
        ) FILTER (WHERE vi.id IS NOT NULL),
        '[]'
      ) AS images
      FROM vehicles v
      LEFT JOIN vehicle_images vi
      ON v.id = vi.vehicle_id
      WHERE v.id = $1
      GROUP BY v.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};