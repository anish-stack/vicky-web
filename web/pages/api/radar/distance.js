
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { origins, destinations } = req.query;

    if (!origins || !destinations) {
        return res.status(400).json({ error: 'Both origins and destinations are required' });
    }


    const headers = {
        'Authorization': 'prj_test_sk_d6f8d75f4fdcabdcbc2b47dbad86ab8563e4862b',
      };

    try {
        const url = `https://api.radar.io/v1/route/distance?origin=${encodeURIComponent(
          origins
      )}&destination=${encodeURIComponent(destinations)}&modes=car&units=metric`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error('Error fetching distance matrix:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
