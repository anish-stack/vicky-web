export default async function handler(req, res) {
    try {
      const { query } = req.query;
  
      if (!query) {
        return res.status(400).json({
          error: "Missing required query parameter: query.",
        });
      }

      const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=AIzaSyDcp4L3kpVue3TMWpELG3_TLsO6h52ykQo&fields=formatted_address,name,geometry/location`;
  
      const response = await fetch(googleMapsApiUrl);
  
      if (!response.ok) {
        throw new Error(`Google Maps API error: ${response.statusText}`);
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error("Error fetching Google Maps Places data:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  }