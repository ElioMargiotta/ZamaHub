import clientPromise from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const formData = await req.formData();
      const {
        spaceId,
        ensName,
        displayName,
        owner,
        shortDescription,
        twitterHandle,
        website,
        longDescription
      } = Object.fromEntries(formData);

      let profilePicturePath = '';

      // Handle file upload
      const profilePictureFile = formData.get('profilePicture');
      if (profilePictureFile && profilePictureFile.size > 0) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const fileExtension = profilePictureFile.name.split('.').pop();
        const fileName = `${randomUUID()}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);

        // Convert file to buffer and save
        const bytes = await profilePictureFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        profilePicturePath = `/uploads/profiles/${fileName}`;
      }

      const client = await clientPromise;
      const db = client.db('zamahub');

      // Insert space profile data
      const result = await db.collection('spaces').insertOne({
        spaceId,
        ensName,
        displayName,
        owner,
        profilePicture: profilePicturePath,
        shortDescription: shortDescription || '',
        twitterHandle: twitterHandle || '',
        website: website || '',
        longDescription: longDescription || '',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(201).json({ success: true, spaceId: result.insertedId });
    } catch (error) {
      console.error('Error creating space:', error);
      res.status(500).json({ error: 'Failed to create space' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}