const sql = require('../config/supabase');
const cloudinary = require('../config/cloudinary');

function safe(val) {
  return typeof val === 'undefined' ? null : val;
}

function extractCloudinaryPublicId(url) {
  if (!url) return null;
  const matches = url.match(/\/upload\/(?:v[0-9]+\/)?(.+)\.[a-zA-Z]+$/);
  return matches ? matches[1] : null;
}

exports.getAllProducts = async (req, res) => {
  try {
    const {
      brandId, brand, brandSlug,
      category, categorySlug,
      mainCategory, mainCategorySlug,
      subCategory, subCategorySlug,
      disease, diseaseSlug,
      seasonal_medicine, frequently_bought, top_products, people_preferred, maximum_discount, search
    } = req.query;

    let query = sql`SELECT p.*, b.name as brand_name, b.slug as brand_slug FROM product p LEFT JOIN brand b ON p.brand_id = b.id WHERE 1=1`;

    const likeSearch = (val) => `%${val.toLowerCase()}%`;

    if (search) {
      const searchTerm = likeSearch(search);
      query = sql`${query} AND (
        LOWER(p.name) LIKE ${searchTerm} OR 
        LOWER(p.key) LIKE ${searchTerm} OR 
        LOWER(p.key_ingredients) LIKE ${searchTerm} OR 
        LOWER(p.description) LIKE ${searchTerm} OR
        LOWER(p.strength) LIKE ${searchTerm}
      )`;
    }

    if (brandId) query = sql`${query} AND p.brand_id = ${brandId}`;
    else if (brand) query = sql`${query} AND LOWER(b.name) = LOWER(${brand})`;
    else if (brandSlug) query = sql`${query} AND b.slug = ${brandSlug}`;

    if (category) query = sql`${query} AND LOWER(p.category) = LOWER(${category})`;
    else if (categorySlug) {
      const [record] = await sql`
        SELECT name FROM main_category WHERE slug = ${categorySlug}
        UNION
        SELECT name FROM sub_category WHERE slug = ${categorySlug}`;
      if (record) query = sql`${query} AND LOWER(p.category) = LOWER(${record.name})`;
    }

    if (mainCategorySlug) {
      const [record] = await sql`SELECT name FROM main_category WHERE slug = ${mainCategorySlug}`;
      if (record) query = sql`${query} AND LOWER(p.category) = LOWER(${record.name})`;
    }

    if (subCategorySlug) {
      const [record] = await sql`SELECT name FROM sub_category WHERE slug = ${subCategorySlug}`;
      if (record) query = sql`${query} AND LOWER(p.category) = LOWER(${record.name})`;
    }

    if (diseaseSlug) {
      const [record] = await sql`SELECT name FROM disease WHERE slug = ${diseaseSlug}`;
      if (record) {
        const term = likeSearch(record.name);
        query = sql`${query} AND (
          LOWER(p.name) LIKE ${term} OR
          LOWER(COALESCE(p.description, '')) LIKE ${term} OR
          LOWER(COALESCE(p.key_ingredients, '')) LIKE ${term} OR
          LOWER(COALESCE(p.category, '')) LIKE ${term}
        )`;
      }
    }

    const filters = {
      seasonal_medicine,
      frequently_bought,
      top_products,
      people_preferred,
      maximum_discount
    };

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined) {
        const bool = value === 'true';
        query = sql`${query} AND p.${sql(key)} = ${bool}`;
      }
    }

    query = sql`${query} ORDER BY p.id DESC`;
    const products = await query;
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductByIdOrSlug = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const isId = /^\d+$/.test(identifier);
    const [product] = isId
      ? await sql`SELECT * FROM product WHERE id = ${identifier}`
      : await sql`SELECT * FROM product WHERE slug = ${identifier}`;

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const fields = req.body;
    const [product] = await sql`
      INSERT INTO product (
        name, slug, category, medicine_type, images, brand_id, reference_books, key, key_ingredients, description, strength,
        prescription_required, actual_price, selling_price, discount_percent, total_quantity,
        seasonal_medicine, frequently_bought, top_products, people_preferred, maximum_discount, dosage, dietary
      )
      VALUES (
        ${safe(fields.name)}, ${safe(fields.slug)}, ${safe(fields.category)}, ${safe(fields.medicine_type)},
        ${safe(fields.images)}, ${safe(fields.brand_id)}, ${safe(fields.reference_books)}, ${safe(fields.key)},
        ${safe(fields.key_ingredients)}, ${safe(fields.description)}, ${safe(fields.strength)},
        ${safe(fields.prescription_required)}, ${safe(fields.actual_price)}, ${safe(fields.selling_price)},
        ${safe(fields.discount_percent)}, ${safe(fields.total_quantity)}, ${safe(fields.seasonal_medicine)},
        ${safe(fields.frequently_bought)}, ${safe(fields.top_products)}, ${safe(fields.people_preferred)},
        ${safe(fields.maximum_discount)}, ${safe(fields.dosage)}, ${safe(fields.dietary)}
      )
      RETURNING *`;
    res.status(201).json(product);
  } catch (err) {
    if (err.message.includes('duplicate') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A product with this slug already exists.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { identifier } = req.params;
    const isId = /^\d+$/.test(identifier);
    const where = isId ? sql`id = ${identifier}` : sql`slug = ${identifier}`;
    const fields = req.body;

    const [updated] = await sql`
      UPDATE product SET
        name=${safe(fields.name)}, slug=${safe(fields.slug)}, category=${safe(fields.category)},
        medicine_type=${safe(fields.medicine_type)}, images=${safe(fields.images)}, brand_id=${safe(fields.brand_id)},
        reference_books=${safe(fields.reference_books)}, key=${safe(fields.key)}, key_ingredients=${safe(fields.key_ingredients)},
        description=${safe(fields.description)}, strength=${safe(fields.strength)}, prescription_required=${safe(fields.prescription_required)},
        actual_price=${safe(fields.actual_price)}, selling_price=${safe(fields.selling_price)}, discount_percent=${safe(fields.discount_percent)},
        total_quantity=${safe(fields.total_quantity)}, seasonal_medicine=${safe(fields.seasonal_medicine)},
        frequently_bought=${safe(fields.frequently_bought)}, top_products=${safe(fields.top_products)},
        people_preferred=${safe(fields.people_preferred)}, maximum_discount=${safe(fields.maximum_discount)},
        dosage=${safe(fields.dosage)}, dietary=${safe(fields.dietary)}, updated_at=NOW()
      WHERE ${where}
      RETURNING *`;

    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    if (err.message.includes('duplicate') && err.message.includes('slug')) {
      res.status(400).json({ error: 'A product with this slug already exists.' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const isId = /^\d+$/.test(identifier);
    const where = isId ? sql`id = ${identifier}` : sql`slug = ${identifier}`;
    const [product] = await sql`SELECT * FROM product WHERE ${where}`;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Delete images from Cloudinary
    let imageUrls = product.images || [];
    if (typeof imageUrls === 'string') {
      try {
        imageUrls = JSON.parse(imageUrls);
      } catch {
        imageUrls = imageUrls.split(',').map(s => s.trim());
      }
    }
    for (const url of imageUrls) {
      const publicId = extractCloudinaryPublicId(url);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudErr) {
          console.error('Cloudinary error:', cloudErr);
        }
      }
    }

    const [deleted] = await sql`DELETE FROM product WHERE ${where} RETURNING *`;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
