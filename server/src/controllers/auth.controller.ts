import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { signToken } from '../utils/jwt';
import { NguoiDungService } from '../services/nguoi-dung.service';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    try {
        // console.log('Verifying Google token with Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Exists (starts with ' + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...)' : 'MISSING');
        console.log('Verifying Google token with Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Exists (starts with ' + process.env.GOOGLE_CLIENT_ID.substring(0, 10) + '...)' : 'MISSING');

        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            console.error('Invalid Google token payload:', payload);
            return res.status(400).json({ message: 'Invalid token payload' });
        }

        const user = await NguoiDungService.findOrCreateByEmail(
            payload.email,
            payload.name || '',
            payload.picture
        );

        if (!user.kich_hoat) {
            console.warn('Login attempt for disabled user:', payload.email);
            return res.status(403).json({ message: 'Account is disabled' });
        }

        const token = signToken({ 
            id: user.id,
            email: user.email, 
            vai_tro: user.vai_tro 
        });

        res.json({ 
            token, 
            user: {
                id: user.id,
                email: user.email,
                ho_ten: user.ho_ten,
                vai_tro: user.vai_tro,
                anh_dai_dien: user.anh_dai_dien,
                danh_sach_quyen: user.danh_sach_quyen
            } 
        });
    } catch (error: any) {
        console.error('Detailed Google Login Error:', {
            message: error.message,
            stack: error.stack,
            clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...'
        });
        res.status(401).json({ 
            message: 'Google authentication failed',
            details: error.message // Sending back error message for easier debugging
        });
    }
};

export const getMe = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await NguoiDungService.getUserWithPermissions(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
};
