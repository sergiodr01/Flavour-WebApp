const FlavorPort = require('../domain/port/in/FlavorPort');
const Flavor = require('../domain/model/Flavor');
const FlavorIngredient = require('../domain/model/FlavorIngredient');
const FlavorState = require('../domain/model/FlavorState');
const formatTimestamp = require('../shared/formatTimestamp');

class FlavorService extends FlavorPort {
  constructor(flavorRepository) {
    super();
    this.flavorRepository = flavorRepository;
  }

  create(data) {
    const flavor = new Flavor({
      name: data.name,
      label: data.label,
      description: data.description,
      createdById: data.createdById,
      approvedById: null,
      state: FlavorState.NEW,
      version: 0,
      createdAt: formatTimestamp(),
      ingredients: (data.ingredients ?? []).map(
        (i) => new FlavorIngredient({ ingredientId: i.ingredientId, percent: i.percent })
      ),
    });

    this.#validateOrThrow(flavor);

    return this.flavorRepository.save(flavor);
  }

  getById(id) {
    const flavor = this.flavorRepository.findById(id);
    if (!flavor) {
      this.#throwNotFound();
    }
    return flavor;
  }

  getByUser(userId) {
    return this.flavorRepository.findByCreatedBy(userId);
  }

  edit(id, data) {
    const existing = this.flavorRepository.findById(id);
    if (!existing) {
      this.#throwNotFound();
    }

    if (!existing.isEditable()) {
      this.#throwConflict('Flavor cannot be edited in its current state');
    }

    const revisions = this.flavorRepository.findByName(existing.name);
    const latest = revisions[0];

    if (latest.id !== existing.id) {
      this.#throwConflict('A newer version of this flavor already exists; edit the latest version instead');
    }

    const newFlavor = new Flavor({
      name: existing.name,
      label: data.label ?? existing.label,
      description: data.description ?? existing.description,
      createdById: existing.createdById,
      approvedById: null,
      state: FlavorState.NEW,
      version: latest.version + 1,
      createdAt: formatTimestamp(),
      ingredients: (data.ingredients ?? []).map(
        (i) => new FlavorIngredient({ ingredientId: i.ingredientId, percent: i.percent })
      ),
    });

    this.#validateOrThrow(newFlavor);

    return this.flavorRepository.save(newFlavor);
  }

  submit(id, userId) {
    const flavor = this.flavorRepository.findById(id);
    if (!flavor) {
      this.#throwNotFound();
    }

    if (flavor.createdById !== userId) {
      const error = new Error('You can only submit your own flavors');
      error.statusCode = 403;
      throw error;
    }

    if (flavor.state !== FlavorState.NEW) {
      this.#throwConflict('Flavor cannot be submitted from its current state');
    }

    const revisions = this.flavorRepository.findByName(flavor.name);
    if (revisions[0].id !== flavor.id) {
      this.#throwConflict('A newer version of this flavor exists; only the latest version can be submitted');
    }

    this.#validateOrThrow(flavor);

    return this.flavorRepository.updateState(id, {
      state: FlavorState.SUBMITTED,
      approvedById: null,
    });
  }

  listAll() {
    return this.flavorRepository.findAll();
  }

  #validateOrThrow(flavor) {
    const errors = flavor.validateIngredients();
    if (errors.length > 0) {
      const error = new Error('Flavor validation failed');
      error.statusCode = 400;
      error.details = errors;
      throw error;
    }
  }

  #throwNotFound() {
    const error = new Error('Flavor not found');
    error.statusCode = 404;
    throw error;
  }

  #throwConflict(message) {
    const error = new Error(message);
    error.statusCode = 409;
    throw error;
  }
}

module.exports = FlavorService;
