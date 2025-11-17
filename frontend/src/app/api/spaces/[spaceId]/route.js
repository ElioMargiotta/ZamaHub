import clientPromise from '@/lib/db';
import { ethers } from 'ethers';
import spaceRegistryAbi from '@/abis/SpaceRegistry.json';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

const SPACE_REGISTRY_ADDRESS = '0x7579FDF957567e2Eb881A0B00a7cF5772A59759b';

export async function GET(request, { params }) {
  const { spaceId } = params;

  try {
    const client = await clientPromise;
    const db = client.db('zamahub');

    const space = await db.collection('spaces').findOne({ spaceId });
    if (!space) {
      return Response.json({ error: 'Space not found' }, { status: 404 });
    }

    return Response.json(space);
  } catch (error) {
    console.error('Error fetching space:', error);
    return Response.json({ error: 'Failed to fetch space' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { spaceId } = params;

  try {
    const formData = await request.formData();
    const {
      userAddress,
      shortDescription,
      twitterHandle,
      website,
      longDescription
    } = Object.fromEntries(formData);

    // Verify ownership via contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc.sepolia.org');
    const contract = new ethers.Contract(SPACE_REGISTRY_ADDRESS, spaceRegistryAbi.abi, provider);
    const isOwner = await contract.isSpaceOwner(spaceId, userAddress);

    if (!isOwner) {
      return Response.json({ error: 'Unauthorized: Only space owner can edit' }, { status: 403 });
    }

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

    // Update space profile
    const updateData = {
      shortDescription: shortDescription || '',
      twitterHandle: twitterHandle || '',
      website: website || '',
      longDescription: longDescription || '',
      updatedAt: new Date()
    };

    if (profilePicturePath) {
      updateData.profilePicture = profilePicturePath;
    }

    await db.collection('spaces').updateOne(
      { spaceId },
      { $set: updateData }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating space:', error);
    return Response.json({ error: 'Failed to update space' }, { status: 500 });
  }
}