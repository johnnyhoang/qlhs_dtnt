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

// Public URL + anon key of Supabase "Data 02" (the project dtnt web signs in with).
const WEB_SUPABASE = {
    URL: 'https://czngbleeeiljsrpbaksg.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6bmdibGVlZWlsanNycGJha3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MDQ5NjAsImV4cCI6MjA4ODI4MDk2MH0.31agxcZHEkcymaL_Ox5wOfB4zwivv961QHrn6E4tErM',
};

export const supabaseLogin = async (req: Request, res: Response) => {
    const { accessToken } = req.body;

    try {
        // Trust only what Supabase says about the token, never a client-supplied email.
        const sbRes = await fetch(`${WEB_SUPABASE.URL}/auth/v1/user`, {
            headers: { apikey: WEB_SUPABASE.ANON_KEY, Authorization: `Bearer ${accessToken}` },
        });
        const sbUser: any = sbRes.ok ? await sbRes.json() : null;
        if (!sbUser?.email) {
            return res.status(401).json({ message: 'Invalid Supabase session' });
        }
        const meta = sbUser.user_metadata || {};
        const email: string = sbUser.email;
        const name: string = meta.full_name || meta.name || '';
        const picture: string | undefined = meta.avatar_url || meta.picture;

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
