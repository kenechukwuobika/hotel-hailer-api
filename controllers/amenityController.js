const Amenity = require('../models/Amenity');
const factory = require('./factory');

exports.getAllAmenities = factory.getDocuments(Amenity);
exports.createAmenity = factory.createDocument(Amenity);
exports.getAmenity = factory.getDocument(Amenity);
exports.updateAmenity = factory.updateDocument(Amenity);
exports.deleteAmenity = factory.deleteDocument(Amenity);

// exports.getAmenity = (()  => {
//     const populateOptions = {path: 'properties', select: 'name -amenities'};
//     return factory.getDocument(Amenity, populateOptions)
// })();