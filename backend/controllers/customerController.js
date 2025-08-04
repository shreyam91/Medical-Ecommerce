const sql = require('../config/supabase');
const {
  appendCustomer,
  findCustomerRowIndex,
  updateCustomer,
  deleteCustomerRow,
} = require('../utils/googleSheets');

function generateCustomerId(customer) {
  const date = (customer.created_at || new Date()).toISOString().slice(0, 10).replace(/-/g, '');
  const namePart = (customer.name || '').toUpperCase().replace(/[^A-Z]/g, '').padEnd(3, 'X').slice(0, 3);
  const idPart = String(customer.id).padStart(2, '0');
  return `CUST-${date}-${namePart}${idPart}`;
}

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await sql`SELECT * FROM customer ORDER BY id DESC`;
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const [customer] = await sql`SELECT * FROM customer WHERE id = ${req.params.id}`;
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomerByEmail = async (req, res) => {
  try {
    const [customer] = await sql`SELECT * FROM customer WHERE email = ${req.params.email}`;
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomerPublic = async (req, res) => {
  const { name, email, mobile, address, active = true } = req.body;
  try {
    const [customer] = await sql`
      INSERT INTO customer (name, email, mobile, address, active)
      VALUES (${name}, ${email}, ${mobile}, ${address}, ${active})
      RETURNING *`;

    const customId = generateCustomerId(customer);
    await sql`UPDATE customer SET customer_id = ${customId} WHERE id = ${customer.id}`;
    customer.customer_id = customId;

    // await appendCustomer(customer); // Enable if needed
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCustomer = async (req, res) => {
  const { name, email, mobile, address, active } = req.body;
  try {
    const [customer] = await sql`
      INSERT INTO customer (name, email, mobile, address, active)
      VALUES (${name}, ${email}, ${mobile}, ${address}, ${active})
      RETURNING *`;

    const customId = generateCustomerId(customer);
    await sql`UPDATE customer SET customer_id = ${customId} WHERE id = ${customer.id}`;
    customer.customer_id = customId;

    await appendCustomer(customer);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { name, email, mobile, address, active } = req.body;
  try {
    const [customer] = await sql`
      UPDATE customer 
      SET name=${name}, email=${email}, mobile=${mobile}, address=${address}, active=${active}, updated_at=NOW()
      WHERE id=${req.params.id} RETURNING *`;

    if (!customer) return res.status(404).json({ error: 'Not found' });

    const rowIndex = await findCustomerRowIndex(customer.customer_id);
    if (rowIndex > 0) {
      await updateCustomer(customer, rowIndex);
    } else {
      await appendCustomer(customer);
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const [deleted] = await sql`DELETE FROM customer WHERE id = ${req.params.id} RETURNING *`;
    if (!deleted) return res.status(404).json({ error: 'Not found' });

    const rowIndex = await findCustomerRowIndex(deleted.customer_id);
    if (rowIndex > 0) {
      await deleteCustomerRow(rowIndex);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
