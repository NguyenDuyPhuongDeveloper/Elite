const mongoose = require('mongoose');
const User = require('../models/User'); // Đường dẫn tới model User
const UserProfile = require('../models/UserProfile'); // Đường dẫn tới model UserProfile

// Kết nối MongoDB
const connectDB = async () =>
{
    try
    {
        await mongoose.connect('mongodb://localhost:27017/Elite', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (error)
    {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

// Seeder function
const seedUsers = async () =>
{
    try
    {
        // Xóa dữ liệu cũ
        await User.deleteMany();
        await UserProfile.deleteMany();

        console.log('Existing data cleared.');

        // Dữ liệu mẫu cho UserProfile
        const profiles = [
            {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'Male',
                bio: 'A successful entrepreneur looking for meaningful connections.',
                goals: 'Serious relationship',
                relationshipStatus: 'Single',
                preferenceAgeRange: { min: 25, max: 35 },
                interestedIn: 'Female',
                children: "Don't have children",
                childrenDesire: "I would like to have children",
                occupation: 'Entrepreneur',
                professionalStatus: 'Entrepreneur',
                workLocation: 'Singapore',
                religion: 'None',
                education: "Bachelor's degree",
                educationAt: ['Harvard University'],
                height: mongoose.Types.Decimal128.fromString('1.8'),
                hobbies: ['Golf', 'Traveling'],
                smoking: 'Do not smoke',
                drinking: 'Socially',
                nationality: 'Singaporean',
                location: {
                    type: 'Point',
                    coordinates: [103.851959, 1.29027],
                    city: 'Singapore',
                    country: 'Singapore',
                },
                photos: [
                    { url: 'https://picsum.photos/500/302', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/303', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/302', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/303', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/302', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/303', uploadedAt: new Date() },
                ],
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                dateOfBirth: new Date('1992-02-15'),
                gender: 'Female',
                bio: 'A creative artist who loves exploring new cultures.',
                goals: 'Conversation and friendship',
                relationshipStatus: 'Single',
                preferenceAgeRange: { min: 28, max: 40 },
                interestedIn: 'Male',
                children: "Don't have children",
                childrenDesire: "I don’t want children right now, maybe later",
                occupation: 'Artist',
                professionalStatus: 'Freelancer/Self-employed',
                workLocation: 'New York',
                religion: 'Christianity',
                education: 'Master\'s degree',
                educationAt: ['University of Arts London'],
                height: mongoose.Types.Decimal128.fromString('1.65'),
                hobbies: ['Painting', 'Traveling'],
                smoking: 'Occasionally',
                drinking: 'Frequently',
                nationality: 'American',
                location: {
                    type: 'Point',
                    coordinates: [-74.006, 40.7128],
                    city: 'New York',
                    country: 'USA',
                },
                photos: [
                    { url: 'https://picsum.photos/500/302', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/303', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/302', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/303', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/302', uploadedAt: new Date() },
                    { url: 'https://picsum.photos/500/303', uploadedAt: new Date() },
                ],
            },
        ];

        // Tạo UserProfile và gắn với User
        const userProfiles = await UserProfile.insertMany(profiles);
        console.log('Profiles seeded:', userProfiles);

        const users = [
            {
                username: 'john_doe',
                email: 'yamikami2002@gmail.com',
                password: 'password123', // Mật khẩu sẽ được mã hóa trong middleware
                phone: '+6591234567',
                avatar: 'https://picsum.photos/150',
                account_type: 'Premium',
                is_verified: true,
                profile: userProfiles[0]._id,
            },
            {
                username: 'jane_smith',
                email: 'yukiyudai22@gmail.com',
                password: 'password123', // Mật khẩu sẽ được mã hóa trong middleware
                phone: '+12123456789',
                avatar: 'https://picsum.photos/150',
                account_type: 'Basic',
                is_verified: true,
                profile: userProfiles[1]._id,
            },
        ];

        await User.insertMany(users);
        console.log('Users seeded:', users);

        console.log('Seeding completed.');
        process.exit(0);
    } catch (error)
    {
        console.error('Error seeding data:', error.message);
        process.exit(1);
    }
};

// Kết nối và chạy seeder
connectDB().then(() => seedUsers());
