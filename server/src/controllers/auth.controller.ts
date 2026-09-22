import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { signToken } from '../utils/jwt';
import { NguoiDungService } from '../services/nguoi-dung.service';
import { CONFIG } from '../config';

const getGoogleClient = () => {
    if (!CONFIG.GOOGLE_CLIENT_ID) {
        throw new Error('GOOGLE_CLIENT_ID is not configured');
    }
    return new OAuth2Client(CONFIG.GOOGLE_CLIENT_ID);
};

export const googleLogin = async (req: Request, res: Response) => {
    const { idToken } = req.body;

    try {
        const client = getGoogleClient();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: CONFIG.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid token payload' });
        }

        const email = payload.email;
        const name = payload.name || '';
        const picture = payload.picture;

        const user = await NguoiDungService.findOrCreateByEmail(
            email,
            name,
            picture
        );

        if (!user.kich_hoat) {
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
        console.error('Google Login Error:', error);
        res.status(401).json({ 
            message: 'Google authentication failed',
            details: CONFIG.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const supabaseLogin = async (req: Request, res: Response) => {
    const { accessToken, profile } = req.body;

    try {
        let email: string | undefined = profile?.email;
        let name: string = profile?.name || '';
        let picture: string | undefined = profile?.avatar;

        if (accessToken) {
            try {
                const parts = accessToken.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                    if (payload.email) {
                        email = payload.email;
                        name = payload.user_metadata?.full_name || payload.user_metadata?.name || name;
                        picture = payload.user_metadata?.avatar_url || picture;
                    }
                }
            } catch (e) {
                console.warn('Could not decode Supabase accessToken:', e);
            }
        }

        if (!email) {
            return res.status(400).json({ message: 'Email is required for authentication' });
        }

        const user = await NguoiDungService.findOrCreateByEmail(
            email,
            name,
            picture
        );

        if (!user.kich_hoat) {
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
        console.error('Supabase Login Error:', error);
        res.status(500).json({ 
            message: 'Supabase authentication failed',
            details: CONFIG.NODE_ENV === 'development' ? error.message : undefined
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
