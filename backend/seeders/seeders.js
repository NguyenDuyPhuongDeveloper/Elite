const mongoose = require('mongoose');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
require('dotenv').config(); // Load biến môi trường từ .env

const seedData = async () =>
{
    try
    {
        // Kết nối MongoDB
        await mongoose.connect('mongodb://localhost:27017/Elite', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Xóa dữ liệu cũ
        await User.deleteMany({});
        await UserProfile.deleteMany({});
        console.log('Cleared old data');

        // Tạo dữ liệu mẫu
        const profiles = [
            {
                firstName: 'Emma',
                lastName: 'Johnson',
                dateOfBirth: new Date(1995, 5, 15),
                gender: 'Female',
                bio: 'Adventure seeker, coffee lover, and aspiring photographer.',
                goals: 'Long-term relationships',
                relationshipStatus: 'Single',
                preferenceAgeRange: { min: 25, max: 35 },
                interestedIn: 'Male',
                hobbies: ['Photography', 'Traveling', 'Coffee'],
                location: {
                    type: 'Point',
                    coordinates: [-122.4194, 37.7749],
                    city: 'San Francisco',
                    country: 'USA',
                },
                education: 'Master in Design, UCLA',
                occupation: 'Graphic Designer',
                height: 1.68,
                religion: 'None',
            },
            {
                firstName: 'Liam',
                lastName: 'Chen',
                dateOfBirth: new Date(1990, 10, 8),
                gender: 'Male',
                bio: 'Tech entrepreneur with a passion for sustainable innovation.',
                goals: 'Serious relationship',
                relationshipStatus: 'Single',
                preferenceAgeRange: { min: 28, max: 35 },
                interestedIn: 'Female',
                hobbies: ['Coding', 'Reading', 'Startups'],
                location: {
                    type: 'Point',
                    coordinates: [-122.3321, 47.6062],
                    city: 'Seattle',
                    country: 'USA',
                },
                education: 'Computer Science, Stanford',
                occupation: 'Software Engineer',
                height: 1.82,
                religion: 'Atheist',
            },
            {
                firstName: 'Sofia',
                lastName: 'Rodriguez',
                dateOfBirth: new Date(1994, 2, 20),
                gender: 'Female',
                bio: 'Yoga instructor, world traveler, and plant-based foodie.',
                goals: 'Casual dating',
                relationshipStatus: 'Single',
                preferenceAgeRange: { min: 25, max: 40 },
                interestedIn: 'Male',
                hobbies: ['Yoga', 'Traveling', 'Vegan food'],
                location: {
                    type: 'Point',
                    coordinates: [-80.1918, 25.7617],
                    city: 'Miami',
                    country: 'USA',
                },
                education: 'Health Sciences, NYU',
                occupation: 'Wellness Coach',
                height: 1.65,
                religion: 'Spiritual',
            },
        ];

        const users = await Promise.all(
            profiles.map(async (profile) =>
            {
                const userProfile = await UserProfile.create(profile);

                return User.create({
                    username: `${ profile.firstName.toLowerCase() }${ Math.floor(Math.random() * 1000) }`,
                    email: `${ profile.firstName.toLowerCase() }@example.com`,
                    password: 'password123', // Mật khẩu mẫu (hashed trong pre-save hook)
                    profile: userProfile._id,
                    account_type: 'Basic',
                    is_verified: true,
                });
            })
        );

        console.log('Seeded Users:', users);

        // Đóng kết nối MongoDB
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error)
    {
        console.error('Error seeding data:', error);
        process.exit(1); // Thoát với mã lỗi
    }
};

// Chạy seeder
seedData();
