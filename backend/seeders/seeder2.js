const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require('../models/User'); // Import User model
const UserProfile = require('../models/UserProfile'); // Import UserProfile model

// Hobbies list
const hobbiesList = [
    // Sports and Outdoor Activities
    "Running", "Cycling", "Swimming", "Hiking", "Yoga", "Pilates", "Weightlifting",
    "Rock climbing", "Kayaking", "Surfing", "Scuba diving", "Snorkeling",
    "Tennis", "Badminton", "Golf", "Skiing", "Snowboarding",
    "Skateboarding", "Rollerblading", "Horseback riding",
    "Fishing", "Camping", "Archery", "Martial arts",

    // Creative Arts
    "Painting", "Sketching", "Watercolor painting", "Oil painting",
    "Calligraphy", "Photography", "Videography", "Filmmaking",
    "Animation", "Graphic design", "Digital art", "Pottery",
    "Sculpting", "Origami", "Crafting", "Jewelry making",
    "Woodworking", "Interior design",

    // Music and Performance
    "Singing", "Dancing", "Playing guitar", "Playing piano",
    "Playing drums", "Playing violin", "Songwriting", "DJing",
    "Beatboxing", "Theater acting", "Stand-up comedy",
    "Magic tricks",

    // Gaming and Entertainment
    "Board games", "Card games", "Video games", "VR gaming",
    "Escape rooms", "Puzzle solving", "Watching movies",
    "Binge-watching series", "Watching anime", "Exploring memes",

    // Food and Cooking
    "Cooking", "Baking", "Grilling", "Trying new recipes",
    "Wine tasting", "Mixology (making cocktails)",
    "Exploring street food", "Food photography",

    // Learning and Intellectual Pursuits
    "Reading books", "Writing stories", "Blogging",
    "Journaling", "Learning languages", "Listening to podcasts",
    "Public speaking", "Debating", "Chess", "Sudoku",
    "Programming", "Robotics", "Studying astronomy",
    "Exploring history",

    // Travel and Exploration
    "Traveling", "Backpacking", "Road trips", "City exploration",
    "Photography while traveling", "Beachcombing",
    "Wildlife safaris",

    // Social and Community Activities
    "Volunteering", "Charity work", "Joining clubs",
    "Networking events", "Cultural exchange programs",
    "Event planning", "Hosting parties",

    // Relaxation and Self-Care
    "Meditation", "Journaling for mindfulness",
    "Spa days", "Gardening", "Houseplant care",
    "Collecting rare plants", "DIY home projects",

    // Collecting
    "Stamp collecting", "Coin collecting",
    "Action figure collecting", "Antique collecting",
    "Sneaker collecting", "Vinyl record collecting",
    "Comic book collecting",

    // Miscellaneous
    "Bird watching", "Astrology", "Pet training",
    "Aquarium keeping", "Model building",
    "Flying drones", "Cosplaying", "Learning survival skills"
];


// Randomly pick up to 8 hobbies
const getRandomHobbies = () =>
    Array.from({ length: Math.floor(Math.random() * 8 + 1) }, () =>
        faker.helpers.arrayElement(hobbiesList)
    );

// Generate fake User
const generateFakeUser = () => ({
    username: faker.internet.username(),
    email: faker.internet.email(),
    password: faker.internet.password(12),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
    account_type: faker.helpers.arrayElement(['Basic', 'Premium', 'VIP']),
    account_status: faker.helpers.arrayElement(['Active', 'Inactive', 'Suspended']),
    is_verified: faker.datatype.boolean(),
    is_phone_verified: faker.datatype.boolean(),
    thirdPartyVerified: faker.datatype.boolean(),
    lastLogin: faker.date.recent(),
});

// Generate fake UserProfile
const generateFakeUserProfile = (userId) => ({
    user: userId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: faker.date.birthdate({ min: 18, max: 60, mode: 'age' }),
    gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
    bio: faker.lorem.sentence(),
    goals: faker.helpers.arrayElement([
        "Conversation and friendship",
        "Long-term relationships",
        "Creating a family",
        "Casual dating",
        "Serious relationship",
        "Other"
    ]),
    relationshipStatus: faker.helpers.arrayElement([
        "Single",
        "Divorced",
        "Single parent",
        "Separated",
        "In a relationship",
        "Complicated"
    ]),
    preferenceAgeRange: {
        min: Math.floor(Math.random() * 5 + 18),
        max: Math.floor(Math.random() * 50 + 30),
    },
    interestedIn: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
    children: faker.helpers.arrayElement(["Don't have children", "Have children"]),
    childrenDesire: faker.helpers.arrayElement([
        "I don’t want children right now, maybe later",
        "No, I don't want children",
        "I would like to have children"
    ]),
    occupation: faker.person.jobTitle(),
    professionalStatus: faker.helpers.arrayElement([
        'Unemployed', 'Specialist', 'Entrepreneur', 'Workman',
        'Junior manager', 'Freelancer/Self-employed', 'Student'
    ]),
    workLocation: faker.location.city(),
    religion: faker.lorem.word(),
    education: faker.helpers.arrayElement([
        "Some college",
        "Associate, bachelor's, or master's degree",
        "Doctoral degree",
        "Vocational high school degree",
        "More than one academic degree",
        "High school degree"
    ]),
    educationAt: Array.from({ length: Math.floor(Math.random() * 3 + 1) }, () => faker.company.name()),
    height: parseFloat((Math.random() * 1.2 + 1.5).toFixed(2)), // Random height between 1.5m and 2.7m
    hobbies: getRandomHobbies(),
    smoking: faker.helpers.arrayElement(['Do not smoke', 'Regularly', 'Occasionally']),
    drinking: faker.helpers.arrayElement(['Do not drink', 'Frequently', 'Socially']),
    nationality: faker.location.country(),
    location: {
        type: 'Point',
        coordinates: [parseFloat(faker.location.longitude()), parseFloat(faker.location.latitude())],
        city: faker.location.city(),
        country: faker.location.country(),
    },
    locationRadius: Math.floor(Math.random() * 50 + 1),
    photos: Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () => ({
        url: faker.image.url(),
        uploadedAt: faker.date.recent(),
    })),
    lastActiveAt: faker.date.recent(),
});

// Function to clear and generate new data
const createFakeData = async (count = 10) =>
{
    try
    {
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await UserProfile.deleteMany({});
        console.log("Existing data cleared.");

        console.log(`Generating ${ count } fake users and profiles...`);
        for (let i = 0; i < count; i++)
        {
            // Tạo User
            const user = new User(generateFakeUser());
            const savedUser = await user.save();

            // Tạo UserProfile liên kết với User
            const userProfile = new UserProfile(generateFakeUserProfile(savedUser._id));
            const savedProfile = await userProfile.save();

            // Cập nhật lại profile trong User
            savedUser.profile = savedProfile._id; // Gắn UserProfile vào User
            await savedUser.save(); // Lưu lại User với trường profile đã được cập nhật
        }

        console.log(`${ count } users and profiles created successfully!`);
    } catch (error)
    {
        console.error("Error creating fake data:", error);
    }
};



// Connect to MongoDB and execute
mongoose
    .connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() =>
    {
        console.log("Connected to MongoDB");
        createFakeData(1000); // Change the number to generate a specific count
    })
    .catch((err) => console.error("MongoDB connection error:", err));
