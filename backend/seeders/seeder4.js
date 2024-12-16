const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const User = require("../models/User");
const UserProfile = require("../models/UserProfile");

// Danh sách sở thích
const hobbiesList = [
    "Running", "Cycling", "Swimming", "Hiking", "Yoga", "Photography", "Cooking",
    "Reading books", "Traveling", "Gardening", "Playing guitar", "Dancing",
];

// Hồ sơ mẫu (templateProfile)
const templateProfile = {
    hobbies: ["Cycling", "Swimming", "Hiking"], // Những sở thích chính
    location: {
        coordinates: [106.6297, 10.8231], // TP. HCM
        radius: 50, // Bán kính mong muốn 50km
    },
    dateOfBirth: new Date(1995, 5, 15), // Tuổi lý tưởng
    preferenceAgeRange: { min: 25, max: 30 }, // Độ tuổi mong muốn
    goals: "Long-term relationships", // Mục tiêu
    interestedIn: "Female", // Quan tâm giới tính
    smoking: "Do not smoke",
    drinking: "Socially",
    children: "Don't have children",
    childrenDesire: "I would like to have children",
    education: "Doctoral degree",
    occupation: "Software Engineer",
};

// Hàm tạo sở thích ngẫu nhiên
const getRandomHobbies = (baseHobbies) => [
    ...baseHobbies,
    ...Array.from({ length: Math.floor(Math.random() * 3) }, () =>
        faker.helpers.arrayElement(hobbiesList)
    ),
];

const uniqueUsernames = new Set(); // Lưu danh sách username duy nhất

const generateUniqueUsername = () =>
{
    let username;
    do
    {
        username = faker.internet.username(); // Tạo username ngẫu nhiên
    } while (uniqueUsernames.has(username)); // Lặp lại nếu đã tồn tại

    uniqueUsernames.add(username); // Thêm vào danh sách
    return username;
};

const generateFakeUser = () => ({
    username: generateUniqueUsername(), // Sử dụng hàm đảm bảo username duy nhất
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

// Hàm tạo UserProfile giả dựa trên templateProfile
const generateFakeUserProfile = (userId, template) =>
{
    const isDifferent = () => Math.random() < 0.3; // Xác suất 30% để khác template

    return {
        userId: userId, // Liên kết với User
        firstName: isDifferent() ? faker.person.firstName() : template.firstName || "John",
        lastName: isDifferent() ? faker.person.lastName() : template.lastName || "Doe",
        dateOfBirth: isDifferent()
            ? faker.date.birthdate({ min: 18, max: 60, mode: "age" })
            : template.dateOfBirth,
        gender: isDifferent()
            ? faker.helpers.arrayElement(["Male", "Female", "Other"])
            : template.gender || "Male",
        bio: isDifferent() ? faker.lorem.paragraph() : template.bio,
        goals: isDifferent()
            ? faker.helpers.arrayElement([
                "Conversation and friendship",
                "Long-term relationships",
                "Creating a family",
                "Casual dating",
                "Serious relationship",
                "Other",
            ])
            : template.goals,
        relationshipStatus: isDifferent()
            ? faker.helpers.arrayElement([
                "Single",
                "Divorced",
                "Single parent",
                "Separated",
                "In a relationship",
                "Complicated",
            ])
            : template.relationshipStatus,
        preferenceAgeRange: isDifferent()
            ? {
                min: Math.floor(Math.random() * 5 + 18),
                max: Math.floor(Math.random() * 50 + 30),
            }
            : template.preferenceAgeRange,
        interestedIn: isDifferent()
            ? faker.helpers.arrayElement(["Male", "Female", "Other"])
            : template.interestedIn,
        children: isDifferent()
            ? faker.helpers.arrayElement(["Don't have children", "Have children"])
            : template.children,
        childrenDesire: isDifferent()
            ? faker.helpers.arrayElement([
                "I don’t want children right now, maybe later",
                "No, I don't want children",
                "I would like to have children",
            ])
            : template.childrenDesire,
        occupation: isDifferent() ? faker.person.jobTitle() : template.occupation,
        professionalStatus: isDifferent()
            ? faker.helpers.arrayElement([
                "Unemployed",
                "Specialist",
                "Entrepreneur",
                "Workman",
                "Junior manager",
                "Freelancer/Self-employed",
                "Student",
            ])
            : template.professionalStatus || "Specialist",
        workLocation: isDifferent() ? faker.location.city() : template.workLocation || "New York",
        religion: isDifferent() ? faker.lorem.word() : template.religion || "None",
        education: isDifferent()
            ? faker.helpers.arrayElement([
                "Some college",
                "Associate, bachelor's, or master's degree",
                "Doctoral degree",
                "Vocational high school degree",
                "High school degree",
                "More than one academic degree",
            ])
            : template.education,
        educationAt: isDifferent()
            ? Array.from({ length: Math.floor(Math.random() * 3 + 1) }, () =>
                faker.company.name()
            )
            : template.educationAt || ["Default University"],
        height: isDifferent()
            ? parseFloat((Math.random() * 0.5 + 1.5).toFixed(2))
            : template.height || 1.75, // Ngẫu nhiên từ 1.5m - 2.0m
        hobbies: isDifferent()
            ? Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () =>
                faker.helpers.arrayElement(hobbiesList)
            )
            : template.hobbies,
        smoking: isDifferent()
            ? faker.helpers.arrayElement(["Do not smoke", "Regularly", "Occasionally"])
            : template.smoking,
        drinking: isDifferent()
            ? faker.helpers.arrayElement(["Do not drink", "Frequently", "Socially"])
            : template.drinking,
        nationality: isDifferent() ? faker.location.country() : template.nationality || "USA",
        location: {
            type: "Point",
            coordinates: getRandomCoordinates(), // Lấy tọa độ gần TP Hồ Chí Minh
            city: "Ho Chi Minh City", // Đặt tên thành phố cố định
            country: "Vietnam",
        },
        locationRadius: isDifferent()
            ? Math.floor(Math.random() * 50 + 1)
            : template.location.radius,
        photos: Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () => ({
            url: faker.image.url(),
            uploadedAt: faker.date.recent(),
        })),
        lastActiveAt: faker.date.recent(),
    };
};

// Tạo tọa độ ngẫu nhiên xung quanh TP Hồ Chí Minh
const getRandomCoordinates = () =>
{
    const centerLongitude = 106.6297; // Kinh độ trung tâm TP Hồ Chí Minh
    const centerLatitude = 10.8231; // Vĩ độ trung tâm TP Hồ Chí Minh
    const radius = 0.5; // Bán kính (đơn vị độ, khoảng 30km)

    const randomLongitude = centerLongitude + (Math.random() - 0.5) * radius * 2;
    const randomLatitude = centerLatitude + (Math.random() - 0.5) * radius * 2;

    return [randomLongitude.toFixed(6), randomLatitude.toFixed(6)];
};

// Hàm tạo dữ liệu giả
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
            try
            {
                // Tạo User
                const user = new User(generateFakeUser());
                const savedUser = await user.save();

                // Tạo UserProfile liên kết với User
                const userProfile = new UserProfile(
                    generateFakeUserProfile(savedUser._id, templateProfile)
                );
                const savedProfile = await userProfile.save();

                // Cập nhật lại profile trong User
                savedUser.profile = savedProfile._id;
                await savedUser.save();
            } catch (innerError)
            {
                console.error(`Error saving user ${ i + 1 }:`, innerError.message);
            }
        }

        console.log(`${ count } users and profiles created successfully!`);
    } catch (error)
    {
        console.error("Error creating fake data:", error);
    }
};

// Kết nối MongoDB và thực thi
mongoose
    .connect("mongodb://localhost:27017/test6", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() =>
    {
        console.log("Connected to MongoDB");
        createFakeData(500); // Tạo 5000 hồ sơ giả
    })
    .catch((err) => console.error("MongoDB connection error:", err));
