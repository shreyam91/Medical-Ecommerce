const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const { generateSlug, isNumericId } = require('../utils/slugUtils');

// Helper
function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

// Get all brands
exports.getAll = async (req, res) => {
  try {
    const brands = await sql`SELECT * FROM brand ORDER BY id DESC`;
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top brands
exports.getTopBrands = async (req, res) => {
  try {
    const topBrands = await sql`SELECT * FROM brand WHERE is_top_brand = true ORDER BY id DESC`;
    res.json(topBrands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get brand by ID or slug
exports.getByIdentifier = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const [brand] = isNumericId(identifier)
      ? await sql`SELECT * FROM brand WHERE id = ${identifier}`
      : await sql`SELECT * FROM brand WHERE slug = ${identifier}`;
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create brand
exports.create = async (req, res) => {
  const { name, slug, logo_url, banner_url, is_top_brand = false } = req.body;
  try {
    const finalSlug = slug || generateSlug(name);
    const [brand] = await sql`
      INSERT INTO brand (name, slug, logo_url, banner_url, is_top_brand)
      VALUES (${name}, ${finalSlug}, ${logo_url}, ${banner_url}, ${is_top_brand})
      RETURNING *`;
    res.status(201).json(brand);
  } catch (err) {
    if (err.message.includes('duplicate key value') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A brand with this slug already exists.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// Update brand by ID or slug
exports.update = async (req, res) => {
  const { name, slug, logo_url, banner_url, is_top_brand = false } = req.body;
  try {
    const identifier = req.params.identifier;
    const finalSlug = slug || generateSlug(name);
    const whereClause = isNumericId(identifier)
      ? sql`id = ${identifier}`
      : sql`slug = ${identifier}`;

    const [brand] = await sql`
      UPDATE brand SET name=${name}, slug=${finalSlug}, logo_url=${logo_url},
      banner_url=${banner_url}, is_top_brand=${is_top_brand}, updated_at=NOW()
      WHERE ${whereClause} RETURNING *`;

    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    if (err.message.includes('duplicate key value') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A brand with this slug already exists.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

// Delete brand by ID or slug
exports.remove = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const [brand] = isNumericId(identifier)
      ? await sql`SELECT * FROM brand WHERE id=${identifier}`
      : await sql`SELECT * FROM brand WHERE slug=${identifier}`;

    if (!brand) return res.status(404).json({ error: 'Brand not found' });

    const publicIds = [brand.logo_url, brand.banner_url]
      .map(extractCloudinaryPublicId)
      .filter(Boolean);

    for (const id of publicIds) {
      try {
        await cloudinary.uploader.destroy(id);
      } catch (cloudErr) {
        console.error('Cloudinary delete error:', cloudErr);
      }
    }

    const whereClause = isNumericId(identifier)
      ? sql`id = ${identifier}`
      : sql`slug = ${identifier}`;

    await sql`DELETE FROM brand WHERE ${whereClause}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
