class Ingredient {
  constructor({ id, name, label, description, pricePerUnit, priceUnit }) {
    this.id = id;
    this.name = name;
    this.label = label;
    this.description = description;
    this.pricePerUnit = pricePerUnit;
    this.priceUnit = priceUnit;
  }
}

module.exports = Ingredient;
