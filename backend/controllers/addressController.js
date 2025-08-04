const sql = require('../config/supabase');

exports.getAddressesForCustomer = async (req, res) => {
  try {
    const addresses = await sql`
      SELECT * FROM address 
      WHERE customer_id = ${req.params.customerId} 
      ORDER BY is_default DESC, id DESC`;
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const [address] = await sql`
      SELECT * FROM address 
      WHERE id = ${req.params.addressId} AND customer_id = ${req.params.customerId}`;
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addAddress = async (req, res) => {
  const { address_line1, address_line2, city, state, pincode, country, is_default } = req.body;
  try {
    if (is_default) {
      await sql`UPDATE address SET is_default = FALSE WHERE customer_id = ${req.params.customerId}`;
    }

    const [address] = await sql`
      INSERT INTO address (customer_id, address_line1, address_line2, city, state, pincode, country, is_default)
      VALUES (
        ${req.params.customerId}, ${address_line1}, ${address_line2},
        ${city}, ${state}, ${pincode}, ${country || 'India'}, ${!!is_default}
      )
      RETURNING *`;
    res.status(201).json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  const { address_line1, address_line2, city, state, pincode, country, is_default } = req.body;
  try {
    if (is_default) {
      await sql`UPDATE address SET is_default = FALSE WHERE customer_id = ${req.params.customerId}`;
    }

    const [address] = await sql`
      UPDATE address SET
        address_line1=${address_line1},
        address_line2=${address_line2},
        city=${city}, state=${state}, pincode=${pincode},
        country=${country || 'India'},
        is_default=${!!is_default}, updated_at=NOW()
      WHERE id=${req.params.addressId} AND customer_id=${req.params.customerId}
      RETURNING *`;
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const [deleted] = await sql`
      DELETE FROM address 
      WHERE id=${req.params.addressId} AND customer_id=${req.params.customerId}
      RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    await sql`UPDATE address SET is_default = FALSE WHERE customer_id = ${req.params.customerId}`;
    const [address] = await sql`
      UPDATE address SET is_default = TRUE 
      WHERE id = ${req.params.addressId} AND customer_id = ${req.params.customerId}
      RETURNING *`;
    if (!address) return res.status(404).json({ error: 'Not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
