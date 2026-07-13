const UserSqliteRepository = require('../../out/persistence/UserSqliteRepository');
const IngredientSqliteRepository = require('../../out/persistence/IngredientSqliteRepository');
const FlavorSqliteRepository = require('../../out/persistence/FlavorSqliteRepository');
const CommentSqliteRepository = require('../../out/persistence/CommentSqliteRepository');

const AuthService = require('../../../application/AuthService');
const IngredientService = require('../../../application/IngredientService');
const FlavorService = require('../../../application/FlavorService');
const ReviewService = require('../../../application/ReviewService');

const userRepository = new UserSqliteRepository();
const ingredientRepository = new IngredientSqliteRepository();
const flavorRepository = new FlavorSqliteRepository();
const commentRepository = new CommentSqliteRepository();

const authService = new AuthService(userRepository);
const ingredientService = new IngredientService(ingredientRepository);
const flavorService = new FlavorService(flavorRepository);
const reviewService = new ReviewService(flavorRepository, commentRepository);

module.exports = {
  authService,
  ingredientService,
  flavorService,
  reviewService,
};
