const Perk = require('../models/Perk');
const factory = require('./factory');

exports.getAllPerks = factory.getDocuments(Perk);
exports.createPerk = factory.createDocument(Perk);
exports.getPerk = (()  => {
    const populateOptions = {path: 'properties', select: 'name -perks'};
    return factory.getDocument(Perk, populateOptions)
})();
exports.updatePerk = factory.updateDocument(Perk);
exports.deletePerk = factory.deleteDocument(Perk);
