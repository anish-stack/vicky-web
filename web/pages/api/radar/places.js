export default async function handler(req, res) {
    try {
      const { query } = req.query;
  
      if (!query) {
        return res.status(400).json({
          error: "Missing required query parameter: query.",
        });
      }

      const headers = {
        'Authorization': 'prj_test_sk_d6f8d75f4fdcabdcbc2b47dbad86ab8563e4862b',
      };

      const ApiUrl = `https://api.radar.io/v1/search/autocomplete?query=${query}&country=IN&layers=place,address,postalCode,locality`;
  
      const response = await fetch(ApiUrl, {
        method: 'GET',
        headers: headers
      });
  
      if (!response.ok) {
        throw new Error(` API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching Places data:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }