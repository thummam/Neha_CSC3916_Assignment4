const mongoose = require('mongoose');
const Movie = require('./Movies'); // Import the Movie model
require('dotenv').config(); // Load environment variables

// Connect to MongoDB
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.DB); // No need for useNewUrlParser & useUnifiedTopology
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  };
  
connectDB();

// Sample movie data
const movies = [
    {
        title: "The Matrix",
        releaseDate: 1999,
        genre: "Science Fiction",
        actors: [
            { actorName: "Keanu Reeves", characterName: "Neo" },
            { actorName: "Laurence Fishburne", characterName: "Morpheus" }
        ]
    },
    {
        title: "Gladiator",
        releaseDate: 2000,
        genre: "Action",
        actors: [
            { actorName: "Russell Crowe", characterName: "Maximus Decimus Meridius" },
            { actorName: "Joaquin Phoenix", characterName: "Commodus" }
        ]
    },
    {
        title: "The Grand Budapest Hotel",
        releaseDate: 2014,
        genre: "Comedy",
        actors: [
            { actorName: "Ralph Fiennes", characterName: "M. Gustave" },
            { actorName: "Tony Revolori", characterName: "Zero" }
        ]
    },
    {
        title: "Parasite",
        releaseDate: 2019,
        genre: "Thriller",
        actors: [
            { actorName: "Song Kang-ho", characterName: "Kim Ki-taek" },
            { actorName: "Choi Woo-shik", characterName: "Kim Ki-woo" }
        ]
    },
    {
        title: "Forrest Gump",
        releaseDate: 1994,
        genre: "Drama",
        actors: [
            { actorName: "Tom Hanks", characterName: "Forrest Gump" },
            { actorName: "Robin Wright", characterName: "Jenny Curran" }
        ]
    },
    {
        title: "The Godfather",
        releaseDate: 1972,
        genre: "Drama",
        actors: [
            { actorName: "Marlon Brando", characterName: "Vito Corleone" },
            { actorName: "Al Pacino", characterName: "Michael Corleone" }
        ]
    },
    {
        title: "Titanic",
        releaseDate: 1997,
        genre: "Drama",
        actors: [
            { actorName: "Leonardo DiCaprio", characterName: "Jack Dawson" },
            { actorName: "Kate Winslet", characterName: "Rose DeWitt Bukater" }
        ]
    }
    
];

// Insert movies into the database
const seedMovies = async () => {
    try {
        await Movie.insertMany(movies);
        console.log("Movies added successfully!");
        mongoose.connection.close(); // Close connection after insertion
    } catch (err) {
        console.error("Error inserting movies:", err);
    }
};

seedMovies();
