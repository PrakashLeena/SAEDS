require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Activity = require('./models/Activity');
const connectDB = require('./config/db');

// Sample books data
const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Fiction",
    description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
    pages: 180,
    rating: 4.5,
    downloads: 1250,
    publishedYear: 1925,
    tags: ["classic", "american literature", "romance"],
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    category: "Fiction",
    description: "A gripping tale of racial injustice and childhood innocence in the American South.",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop",
    pages: 324,
    rating: 4.8,
    downloads: 2100,
    publishedYear: 1960,
    tags: ["classic", "social justice", "coming of age"],
  },
  {
    title: "1984",
    author: "George Orwell",
    category: "Science Fiction",
    description: "A dystopian social science fiction novel and cautionary tale about totalitarianism.",
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop",
    pages: 328,
    rating: 4.7,
    downloads: 1890,
    publishedYear: 1949,
    tags: ["dystopian", "political", "classic"],
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    category: "Fiction",
    description: "A story about teenage rebellion and alienation narrated by Holden Caulfield.",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
    pages: 277,
    rating: 4.3,
    downloads: 1450,
    publishedYear: 1951,
    tags: ["coming of age", "classic", "young adult"],
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Romance",
    description: "A romantic novel of manners that critiques the British landed gentry at the end of the 18th century.",
    coverImage: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=600&fit=crop",
    pages: 432,
    rating: 4.6,
    downloads: 1680,
    publishedYear: 1813,
    tags: ["romance", "classic", "british literature"],
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    category: "Fantasy",
    description: "A fantasy novel about the quest of home-loving Bilbo Baggins to win a share of treasure.",
    coverImage: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400&h=600&fit=crop",
    pages: 310,
    rating: 4.7,
    downloads: 2300,
    publishedYear: 1937,
    tags: ["fantasy", "adventure", "classic"],
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    category: "Non-Fiction",
    description: "A brief history of humankind, exploring how Homo sapiens came to dominate the world.",
    coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    pages: 443,
    rating: 4.5,
    downloads: 1950,
    publishedYear: 2011,
    tags: ["history", "science", "anthropology"],
  },
  {
    title: "Educated",
    author: "Tara Westover",
    category: "Biography",
    description: "A memoir about a young woman who grows up in a strict and abusive household but eventually escapes to learn about the wider world through education.",
    coverImage: "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop",
    pages: 334,
    rating: 4.6,
    downloads: 1560,
    publishedYear: 2018,
    tags: ["memoir", "education", "inspiring"],
  },
];

// Sample activities data
const sampleActivities = [
  {
    title: "Web Development Workshop",
    description: "Learn modern web development with React and Node.js. Hands-on coding session for beginners and intermediate developers.",
    category: "Workshop",
    date: new Date("2025-11-15"),
    time: "2:00 PM - 5:00 PM",
    location: "SAEDS Community Center, Room 101",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop",
    organizer: "Tech Team SAEDS",
    capacity: 30,
    registered: 0,
    status: "upcoming",
  },
  {
    title: "Leadership & Management Seminar",
    description: "Develop essential leadership skills and learn effective team management strategies from industry experts.",
    category: "Seminar",
    date: new Date("2025-11-20"),
    time: "10:00 AM - 1:00 PM",
    location: "Main Auditorium",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
    organizer: "SAEDS Leadership Committee",
    capacity: 50,
    registered: 0,
    status: "upcoming",
  },
  {
    title: "Networking Mixer",
    description: "Connect with fellow community members, share ideas, and build meaningful professional relationships.",
    category: "Networking",
    date: new Date("2025-11-25"),
    time: "6:00 PM - 9:00 PM",
    location: "SAEDS Lounge",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&h=600&fit=crop",
    organizer: "Community Relations",
    capacity: 40,
    registered: 0,
    status: "upcoming",
  },
  {
    title: "Data Science Conference",
    description: "Explore the latest trends in data science, machine learning, and AI with presentations from leading researchers.",
    category: "Conference",
    date: new Date("2025-12-05"),
    time: "9:00 AM - 5:00 PM",
    location: "Conference Hall A",
    image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&h=600&fit=crop",
    organizer: "SAEDS Research Division",
    capacity: 100,
    registered: 0,
    status: "upcoming",
  },
  {
    title: "Creative Writing Workshop",
    description: "Unleash your creativity and improve your writing skills with guided exercises and peer feedback.",
    category: "Workshop",
    date: new Date("2025-12-10"),
    time: "3:00 PM - 6:00 PM",
    location: "Library Meeting Room",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop",
    organizer: "SAEDS Literary Club",
    capacity: 25,
    registered: 0,
    status: "upcoming",
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await Book.deleteMany({});
    await Activity.deleteMany({});

    console.log('📚 Seeding books...');
    const books = await Book.insertMany(sampleBooks);
    console.log(`✅ ${books.length} books added`);

    console.log('🎯 Seeding activities...');
    const activities = await Activity.insertMany(sampleActivities);
    console.log(`✅ ${activities.length} activities added`);

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
