const mongoose = require('mongoose');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () =>
{
    try
    {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (error)
    {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

// Clear existing data
const clearData = async () =>
{
    try
    {
        await User.deleteMany({});
        await UserProfile.deleteMany({});
        console.log('Existing data cleared.');
    } catch (error)
    {
        console.error('Error clearing data:', error.message);
    }
};

// Hash password
const hashPassword = async (password) =>
{
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Seed sample data
const seedData = async () =>
{
    try
    {
        const hashedPassword = await hashPassword('12345678');

        const profiles = [
            {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('1990-01-01'),
                gender: 'Male',
                bio: 'I am a software developer.',
                location: {
                    coordinates: [100.75, 13.75],
                    city: 'Bangkok',
                    country: 'Thailand',
                },
                hobbies: ['Coding', 'Hiking'],
                relationshipStatus: 'Single',
            },
            {
                firstName: 'Jane',
                lastName: 'Smith',
                dateOfBirth: new Date('1992-05-12'),
                gender: 'Female',
                bio: 'A digital artist and traveler.',
                location: {
                    coordinates: [139.6917, 35.6895],
                    city: 'Tokyo',
                    country: 'Japan',
                },
                hobbies: ['Drawing', 'Traveling'],
                relationshipStatus: 'Single',
            },
            {
                firstName: 'Alice',
                lastName: 'Brown',
                dateOfBirth: new Date('1995-03-20'),
                gender: 'Female',
                bio: 'A fitness coach who loves healthy living.',
                location: {
                    coordinates: [-0.1276, 51.5074],
                    city: 'London',
                    country: 'United Kingdom',
                },
                hobbies: ['Fitness', 'Cooking'],
                relationshipStatus: 'Single',
            },
            {
                firstName: 'Michael',
                lastName: 'Johnson',
                dateOfBirth: new Date('1987-11-08'),
                gender: 'Male',
                bio: 'An entrepreneur building the next big thing.',
                location: {
                    coordinates: [-74.006, 40.7128],
                    city: 'New York',
                    country: 'USA',
                },
                hobbies: ['Reading', 'Traveling'],
                relationshipStatus: 'Single',
            },
            {
                firstName: 'Emily',
                lastName: 'Davis',
                dateOfBirth: new Date('1993-07-15'),
                gender: 'Female',
                bio: 'A passionate chef exploring new cuisines.',
                location: {
                    coordinates: [2.3522, 48.8566],
                    city: 'Paris',
                    country: 'France',
                },
                hobbies: ['Cooking', 'Photography'],
                relationshipStatus: 'Single',
            },
        ];

        const createdProfiles = await UserProfile.insertMany(profiles);

        const users = [
            {
                username: 'johndoe',
                email: 'john@example.com',
                password: hashedPassword,
                account_type: 'Basic',
                is_verified: true,
                profile: createdProfiles[0]._id,
            },
            {
                username: 'janesmith',
                email: 'jane@example.com',
                password: hashedPassword,
                account_type: 'Premium',
                is_verified: true,
                profile: createdProfiles[1]._id,
            },
            {
                username: 'alicebrown',
                email: 'alice@example.com',
                password: hashedPassword,
                account_type: 'Basic',
                is_verified: true,
                profile: createdProfiles[2]._id,
            },
            {
                username: 'michaeljohnson',
                email: 'michael@example.com',
                password: hashedPassword,
                account_type: 'VIP',
                is_verified: true,
                profile: createdProfiles[3]._id,
            },
            {
                username: 'emilydavis',
                email: 'emily@example.com',
                password: hashedPassword,
                account_type: 'Premium',
                is_verified: true,
                profile: createdProfiles[4]._id,
            },
        ];

        await User.insertMany(users);

        console.log('5 sample users and profiles created.');
    } catch (error)
    {
        console.error('Error seeding data:', error.message);
    }
};

// Run Seeder
const runSeeder = async () =>
{
    await connectDB();
    await clearData();
    await seedData();
    mongoose.disconnect();
};

runSeeder();
