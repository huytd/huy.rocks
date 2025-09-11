import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { path } = req.query;
    
    if (!path || !Array.isArray(path)) {
        return res.status(400).json({ message: 'Invalid path' });
    }

    // Join the path segments to get the full file path
    const imagePath = join(process.cwd(), 'notes', '_meta', ...path);
    
    // Security check: ensure the path is within the _meta directory
    const metaDir = join(process.cwd(), 'notes', '_meta');
    if (!imagePath.startsWith(metaDir)) {
        return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file exists
    if (!existsSync(imagePath)) {
        return res.status(404).json({ message: 'Image not found' });
    }

    try {
        // Read the image file
        const imageBuffer = await readFile(imagePath);
        
        // Determine content type based on file extension
        const ext = path[path.length - 1].split('.').pop()?.toLowerCase();
        let contentType = 'image/png'; // default
        
        switch (ext) {
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg';
                break;
            case 'png':
                contentType = 'image/png';
                break;
            case 'gif':
                contentType = 'image/gif';
                break;
            case 'webp':
                contentType = 'image/webp';
                break;
            case 'svg':
                contentType = 'image/svg+xml';
                break;
        }

        // Set appropriate headers
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
        res.setHeader('Content-Length', imageBuffer.length);
        
        // Send the image
        res.send(imageBuffer);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}