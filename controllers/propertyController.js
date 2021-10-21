const Property = require('../models/Property');
const factory = require('./factory');

exports.getAllProperties = factory.getDocuments(Property);
exports.createProperty = factory.createDocument(Property);
exports.getProperty = factory.getDocument(Property);
exports.updateProperty = factory.updateDocument(Property);
exports.deleteProperty = factory.deleteDocument(Property);