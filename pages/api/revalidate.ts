import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const path = req.query['path'];
    try {
        let pathToRevalidate = '/everyday';
        if (typeof path === "string") {
            pathToRevalidate = path;
        }
        await res.unstable_revalidate(pathToRevalidate);
        return res.json({ revalidated: true });
    } catch(err) {
        res.status(500).json({ error: 'Revalidation failed' });
    }
}
