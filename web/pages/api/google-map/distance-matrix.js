export default async function handler(req, res) {
    try {
      const { origins, destinations } = req.query;
    //   const { origins, destinations } = req.query;
  
      if (!origins || !destinations) {
        return res.status(400).json({
          error: "Missing required origins and destinations.",
        });
      }

      const googleMapApiKey = "AIzaSyB8xTecgxcO_bQk3yyxm4-l8Wf1tglbiLM";

      const googleMapsApiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&mode=driving&key=${googleMapApiKey}`;

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