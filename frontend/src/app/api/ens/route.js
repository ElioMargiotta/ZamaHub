import clientPromise from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { ensName, nodeHash, owner } = req.body;

      const client = await clientPromise;
      const db = client.db('zamahub');

      // Insert ENS registration data
      const result = await db.collection('ens_registrations').insertOne({
        ensName,
        nodeHash,
        owner,
        registeredAt: new Date(),
      });

      res.status(201).json({ success: true, id: result.insertedId });
    } catch (error) {
      console.error('Error saving ENS registration:', error);
      res.status(500).json({ error: 'Failed to save ENS registration' });
    }
  } else if (req.method === 'GET') {
    try {
      const { owner } = req.query;

      if (!owner) {
        return res.status(400).json({ error: 'Owner address is required' });
      }

      const client = await clientPromise;
      const db = client.db('zamahub');

      // Get all ENS names owned by this address
      const registrations = await db.collection('ens_registrations')
        .find({ owner: owner.toLowerCase() })
        .sort({ registeredAt: -1 })
        .toArray();

      const ensNames = registrations.map(reg => reg.ensName);

      res.status(200).json({ ensNames });
    } catch (error) {
      console.error('Error fetching ENS names:', error);
      res.status(500).json({ error: 'Failed to fetch ENS names' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}