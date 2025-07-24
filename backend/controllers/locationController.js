const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Get pincodes by city or pincode
export async function getPincodeByQuery(req, res) {
  const query = req.params.query;
  let url;
  if (/^\d+$/.test(query)) {
    url = `https://api.postalpincode.in/pincode/${encodeURIComponent(query)}`;
  } else {
    url = `https://api.postalpincode.in/postoffice/${encodeURIComponent(query)}`;
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (Array.isArray(data) && data[0].Status === "Success") {
      const pincodes = data[0].PostOffice.map(po => ({
        Pincode: po.Pincode,
        Name: po.Name,
        District: po.District,
        State: po.State
      }));
      res.json(pincodes);
    } else {
      res.status(404).json({ error: "No pincodes found for this query" });
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pincodes" });
  }
}

// Detect user location via IP and return pincode
export async function detectUserLocation(req, res) {
  try {
    const ipRes = await fetch('https://ipapi.co/json/');
    const ipData = await ipRes.json();
    const userCity = ipData.city;
    if (!userCity) {
      return res.status(404).json({ message: 'Could not detect city from IP' });
    }

    const response = await fetch(`https://api.postalpincode.in/postoffice/${encodeURIComponent(userCity)}`);
    const data = await response.json();
    if (Array.isArray(data) && data[0].Status === "Success" && data[0].PostOffice.length > 0) {
      res.json({ pincode: data[0].PostOffice[0].Pincode });
    } else {
      res.status(404).json({ message: 'Pincode not found for your location' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to detect location' });
  }
}
