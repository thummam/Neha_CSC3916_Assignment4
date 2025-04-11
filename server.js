require('dotenv').config(); // Load environment variables
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authJwtController = require('./auth_jwt'); // You're not using authController, consider removing it
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./Users');
const Movie = require('./Movies'); // You're not using Movie, consider removing it
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

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

const router = express.Router();
  
// Removed getJSONObjectForMovieRequirement as it's not used

router.post('/signup', async (req, res) => {
  if (!req.body.username || !req.body.password) {
      return res.status(400).json({ success: false, msg: 'Please include both username and password.' });
  }

  try {
      // Check if the user already exists
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
          return res.status(409).json({ success: false, message: 'User already exists.' });
      }

      // Create a new user
      const user = new User({
          name: req.body.name,
          username: req.body.username,
          password: req.body.password, // Password will be hashed before saving
      });

      await user.save();
      res.status(201).json({ success: true, msg: 'User created successfully!' });

  } catch (err) {
      res.status(500).json({ success: false, message: 'Error creating user.', error: err.message });
  }
});



router.post('/signin', async (req, res) => { // Use async/await
  try {
    const user = await User.findOne({ username: req.body.username }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, msg: 'Authentication failed. User not found.' }); // 401 Unauthorized
    }

    const isMatch = await user.comparePassword(req.body.password); // Use await

    if (isMatch) {
      const userToken = { id: user._id, username: user.username }; // Use user._id (standard Mongoose)
      const token = jwt.sign(userToken, process.env.SECRET_KEY, { expiresIn: '1h' }); // Add expiry to the token (e.g., 1 hour)
      res.json({ success: true, token: 'JWT ' + token });
    } else {
      res.status(401).json({ success: false, msg: 'Authentication failed. Incorrect password.' }); // 401 Unauthorized
    }
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again later.' }); // 500 Internal Server Error
  }
});

// Movies CRUD Routes
router.route('/movies')
    // Get all movies
    .get(authJwtController.isAuthenticated, async (req, res) => {
        try {
            const movies = await Movie.find();
            res.status(200).json({ success: true, data: movies });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error fetching movies', error: err });
        }
    })

    // Add a new movie
    .post(authJwtController.isAuthenticated, async (req, res) => {
        const { title, releaseDate, genre, actors } = req.body;

        // Validate that required fields exist
        if (!title || !releaseDate || !genre || !actors || actors.length < 1) {
            return res.status(400).json({ success: false, message: 'All fields including at least one actor are required' });
        }

        try {
            const newMovie = new Movie({ title, releaseDate, genre, actors });
            await newMovie.save();
            res.status(201).json({ success: true, message: 'Movie added successfully', movie: newMovie });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error saving movie', error: err });
        }
    })

    // Update a movie
    .put(authJwtController.isAuthenticated, async (req, res) => {
        const { id, title, releaseDate, genre, actors } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Movie ID is required for updating' });
        }

        try {
            const updatedMovie = await Movie.findByIdAndUpdate(id, { title, releaseDate, genre, actors }, { new: true });
            if (!updatedMovie) {
                return res.status(404).json({ success: false, message: 'Movie not found' });
            }
            res.status(200).json({ success: true, message: 'Movie updated successfully', movie: updatedMovie });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error updating movie', error: err });
        }
    })

    // Delete a movie
    .delete(authJwtController.isAuthenticated, async (req, res) => {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: 'Movie ID is required for deletion' });
        }

        try {
            const deletedMovie = await Movie.findByIdAndDelete(id);
            if (!deletedMovie) {
                return res.status(404).json({ success: false, message: 'Movie not found' });
            }
            res.status(200).json({ success: true, message: 'Movie deleted successfully' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Error deleting movie', error: err });
        }
    });

router.get('/movies/:movieId', authJwtController.isAuthenticated, async (req, res) => {
    try {
        const movieId = req.params.movieId;
        const movie = await Movie.findOne({ _id: movieId });

        if (!movie) {
            return res.status(404).json({ success: false, message: "Movie not found." });
        }

        res.status(200).json({ success: true, data: movie });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching movie", error: err });
    }
});

app.use('/', router);

const PORT = process.env.PORT || 8080; // Define PORT before using it
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // for testing only
