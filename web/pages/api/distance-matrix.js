// import fetch from 'node-fetch';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { origins, destinations } = req.query;

    if (!origins || !destinations) {
        return res.status(400).json({ error: 'Both origins and destinations are required' });
    }

    const apiKey = 'AIzaSyDcp4L3kpVue3TMWpELG3_TLsO6h52ykQo';

    try {
        // const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        //     origins
        // )}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`;

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
          origins
      )}&destinations=${encodeURIComponent(destinations)}&key=${apiKey}`;
        
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch data from Google Maps API');
        }

        const data = await response.json();

        if (data.status !== 'OK') {
            return res.status(500).json({ error: 'Error from Google Maps API', details: data });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching distance matrix:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
