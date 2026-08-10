import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../config/index';
import { prisma } from './prisma';

passport.use(
    new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: `${config.BACKEND_URL}/api/auth/google/callback`
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value
                const name = profile.displayName
                const profilePicture = profile.photos?.[0]?.value

                if (!email) {
                    return done(new Error("No email found from Google account"), undefined)
                }

                let user = await prisma.user.findFirst({
                    where: {
                        OR: [{ googleId: profile.id }, { email }]
                    }
                })

                if (user) {
                    if (!user.googleId) {
                        user = await prisma.user.update({
                            where: { id: user.id },
                            data: {
                                name,
                                email,
                                googleId: profile.id,
                                profilePicture
                            }
                        })
                    }
                }
                else {
                    user = await prisma.user.create({
                        data: {
                            name,
                            email,
                            googleId: profile.id,
                            profilePicture
                        }
                    })
                }

                return done(null, user)
            } catch (error) {
                return done(error as Error, undefined)
            }
        }
    ))

export default passport