const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");
const Conversation = require("../models/Conversation");
const Interaction = require("../models/Interaction");
const Matching = require("../models/Matching");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

// Danh sách sở thích
const hobbiesList = [
    "Running", "Cycling", "Swimming", "Hiking", "Yoga", "Photography", "Cooking",
    "Reading books", "Traveling", "Gardening", "Playing guitar", "Dancing",
];

// Hồ sơ mẫu
const templateProfile = {
    hobbies: ["Cycling", "Swimming", "Hiking"],
    location: {
        coordinates: [106.6297, 10.8231], // TP. HCM
        radius: 50,
    },
    dateOfBirth: new Date(1995, 5, 15),
    preferenceAgeRange: { min: 25, max: 30 },
    goals: "Long-term relationships",
    interestedIn: "Female",
    smoking: "Do not smoke",
    drinking: "Socially",
    children: "Don't have children",
    childrenDesire: "I would like to have children",
    education: "Doctoral degree",
    occupation: "Software Engineer",
};

// Utility hàm hỗ trợ
const uniqueUsernames = new Set();

const generateUniqueUsername = () =>
{
    let username;
    do
    {
        username = faker.internet.username();
    } while (uniqueUsernames.has(username));
    uniqueUsernames.add(username);
    return username;
};

const getRandomCoordinates = () =>
{
    const centerLongitude = 106.6297; // Kinh độ trung tâm TP Hồ Chí Minh
    const centerLatitude = 10.8231; // Vĩ độ trung tâm TP Hồ Chí Minh
    const radius = 0.3;

    const randomLongitude = centerLongitude + (Math.random() - 0.5) * radius * 2;
    const randomLatitude = centerLatitude + (Math.random() - 0.5) * radius * 2;

    return [randomLongitude.toFixed(6), randomLatitude.toFixed(6)];
};

// 1. Tạo User
const generateFakeUser = () => ({
    username: generateUniqueUsername(),
    email: faker.internet.email(),
    password: faker.internet.password(12),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
    account_type: faker.helpers.arrayElement(["Basic", "Premium", "VIP"]),
    account_status: faker.helpers.arrayElement(["Active", "Inactive", "Suspended"]),
    is_verified: faker.datatype.boolean(),
    is_phone_verified: faker.datatype.boolean(),
    thirdPartyVerified: faker.datatype.boolean(),
    lastLogin: faker.date.recent(),
});

// 2. Tạo UserProfile
const generateFakeUserProfile = (userId, template) => ({
    userId: userId,
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    dateOfBirth: template.dateOfBirth,
    gender: template.gender || faker.helpers.arrayElement(["Male", "Female", "Other"]), // Đảm bảo luôn có giá trị gender
    bio: faker.lorem.paragraph(),
    goals: template.goals,
    relationshipStatus: faker.helpers.arrayElement([
        "Single", "Divorced", "Single parent", "Separated", "In a relationship",
    ]),
    preferenceAgeRange: template.preferenceAgeRange,
    interestedIn: template.interestedIn,
    children: template.children,
    childrenDesire: template.childrenDesire,
    occupation: template.occupation,
    education: template.education,
    height: parseFloat((Math.random() * 0.5 + 1.5).toFixed(2)),
    hobbies: Array.from({ length: Math.floor(Math.random() * 3 + 1) }, () =>
        faker.helpers.arrayElement(hobbiesList)
    ),
    location: {
        type: "Point",
        coordinates: getRandomCoordinates(),
        city: "Ho Chi Minh City",
        country: "Vietnam",
    },
    photos: Array.from({ length: Math.floor(Math.random() * 3 + 1) }, () => ({
        url: faker.image.url(),
        uploadedAt: faker.date.recent(),
    })),
    lastActiveAt: faker.date.recent(),
});


// 3. Tạo Conversation
const generateFakeConversation = (participants) => ({
    participants,
    last_message: null,
    updated_at: faker.date.recent(),
});

// 4. Tạo Interaction
const generateFakeInteraction = (userFrom, userTo) => ({
    userFrom: userFrom._id,
    userTo: userTo._id,
    type: faker.helpers.arrayElement(['Like', 'Dislike', 'SuperLike', 'Message', 'View']),
    message: faker.lorem.sentence(),
    createdAt: faker.date.recent(),
});

// 5. Tạo Matching
const generateFakeMatching = (user1, user2) => ({
    user1: user1._id,
    user2: user2._id,
    compatibilityScore: faker.number.int({ min: 50, max: 100 }), // Thay đổi từ datatype.number sang number.int
    status: faker.helpers.arrayElement(['Pending', 'Matched', 'Rejected', 'Unmatched']),
    matchedAt: faker.date.recent(),
});


// 6. Tạo Message
const generateFakeMessage = (conversation, sender, receiver) => ({
    sender: sender._id,
    receiver: receiver._id,
    conversation: conversation._id,
    content: faker.lorem.sentence(),
    message_type: faker.helpers.arrayElement(['text', 'image']),
    sent_at: faker.date.recent(),
    status: faker.helpers.arrayElement(['sent', 'delivered', 'read']),
});

// 7. Tạo Notification
const generateFakeNotification = (recipient, sender) => ({
    recipient: recipient._id,
    sender: sender ? sender._id : null,
    type: faker.helpers.arrayElement(['MATCH', 'MESSAGE', 'LIKE', 'SUPER_LIKE']),
    content: faker.lorem.sentence(),
    priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH']),
    expiresAt: faker.date.soon(30),
});

// Tích hợp tạo dữ liệu
const createFakeData = async (count = 100) =>
{
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await UserProfile.deleteMany({});
    await Conversation.deleteMany({});
    await Interaction.deleteMany({});
    await Matching.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    console.log("Existing data cleared.");

    console.log("Generating users and profiles...");
    const users = [];
    for (let i = 0; i < count; i++)
    {
        const user = new User(generateFakeUser());
        const savedUser = await user.save();

        const userProfile = new UserProfile(generateFakeUserProfile(savedUser._id, templateProfile));
        await userProfile.save();
        users.push(savedUser);
    }

    console.log("Generating conversations...");
    for (let i = 0; i < count / 2; i++)
    {
        const participants = faker.helpers.arrayElements(users, 2).map(user => user._id);
        const conversation = new Conversation(generateFakeConversation(participants));
        await conversation.save();
    }

    console.log("Generating interactions...");
    for (let i = 0; i < count * 2; i++)
    {
        const [userFrom, userTo] = faker.helpers.arrayElements(users, 2);
        const interaction = new Interaction(generateFakeInteraction(userFrom, userTo));
        await interaction.save();
    }

    console.log("Generating matchings...");
    for (let i = 0; i < count / 2; i++)
    {
        const [user1, user2] = faker.helpers.arrayElements(users, 2);
        const matching = new Matching(generateFakeMatching(user1, user2));
        await matching.save();
    }

    console.log("Generating notifications...");
    for (let i = 0; i < count; i++)
    {
        const recipient = faker.helpers.arrayElement(users);
        const sender = faker.datatype.boolean() ? faker.helpers.arrayElement(users) : null;
        const notification = new Notification(generateFakeNotification(recipient, sender));
        await notification.save();
    }

    console.log("Data generation completed!");
};

// Kết nối MongoDB và thực thi
mongoose
    .connect("mongodb://localhost:27017/test5", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() =>
    {
        console.log("Connected to MongoDB");
        createFakeData(500); // Tạo 500 hồ sơ giả
    })
    .catch((err) => console.error("MongoDB connection error:", err));
