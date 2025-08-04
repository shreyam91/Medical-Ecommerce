const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');
const extractCloudinaryPublicId = require('../utils/extractCloudinaryPublicId');

// Get all banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await sql`SELECT * FROM banner ORDER BY id DESC`;
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const [banner] = await sql`SELECT * FROM banner WHERE id = ${req.params.id}`;
    if (!banner) return res.status(404).json({ error: 'Not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create banner
exports.createBanner = async (req, res) => {
  const { image_url, type, title, link, product_id } = req.body;
  const status = req.body.status || 'active';
  try {
    const [banner] = await sql`
      INSERT INTO banner (image_url, type, title, link, status, product_id)
      VALUES (${image_url}, ${type}, ${title}, ${link}, ${status}, ${product_id})
      RETURNING *`;
    res.status(201).json(banner);
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  const { image_url, type, title, link, product_id } = req.body;
  const status = req.body.status || 'active';
  try {
    const [banner] = await sql`
      UPDATE banner SET image_url=${image_url}, type=${type}, title=${title}, link=${link}, status=${status}, product_id=${product_id}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;
    if (!banner) return res.status(404).json({ error: 'Not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete banner (and remove Cloudinary image if exists)
exports.deleteBanner = async (req, res) => {
  try {
    const [banner] = await sql`SELECT * FROM banner WHERE id=${req.params.id}`;
    if (!banner) return res.status(404).json({ error: 'Not found' });

    if (banner.image_url) {
      const publicId = extractCloudinaryPublicId(banner.image_url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error('Cloudinary delete error:', cloudErr);
        }
      }
    }

    await sql`DELETE FROM banner WHERE id=${req.params.id}`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
