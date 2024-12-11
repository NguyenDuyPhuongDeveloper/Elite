const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Thay bằng model User của bạn
const UserProfile = require('../models/UserProfile')

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID, // Từ Google Developers Console
            clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Từ Google Developers Console
            callbackURL: '/api/v1/auth/google/callback', // URL callback của ứng dụng
        },
        async (accessToken, refreshToken, profile, done) =>
        {
            try
            {
                // Tìm người dùng dựa trên Google ID
                let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] });

                if (!user)
                {
                    // Nếu người dùng chưa tồn tại, tạo người dùng mới
                    user = await User.create({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.emails[0].value,
                        avatar: profile.photos[0].value,
                        is_verified: true,
                    });
                    // Create a new user profile
                    const newUserProfile = new UserProfile({
                        userId: user._id,
                        firstName: profile.name?.givenName || 'Unknown',
                        lastName: profile.name?.displayName || 'Unknown',
                        gender: profile.gender || 'Other',
                        dateOfBirth: new Date('2000-01-01'),
                        location: {
                            type: 'Point',
                            coordinates: [0, 0],
                            city: '',
                            country: '',
                        },
                    });

                    await newUserProfile.save();  // Save the profile
                    user.profile = newUserProfile._id,
                        await user.save();



                } else if (!user.googleId)
                {
                    // Nếu tài khoản đã tồn tại (đăng ký bằng email) nhưng chưa liên kết Google
                    user.googleId = profile.id;
                    await user.save();
                }

                return done(null, user);
            } catch (error)
            {
                return done(error, false);
            }
        }
    )
);

// Serialize user vào session
passport.serializeUser((user, done) =>
{
    done(null, user.id);
});

// Deserialize user từ session
passport.deserializeUser(async (id, done) =>
{
    try
    {
        const user = await User.findById(id);
        done(null, user);
    } catch (error)
    {
        done(error, false);
    }
});

module.exports = passport;
