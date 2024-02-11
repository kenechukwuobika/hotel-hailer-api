const Category = require('../models/Category');
const factory = require('./factory');

exports.getAllCategories = factory.getDocuments(Category);
exports.createCategory = factory.createDocument(Category);
exports.getCategory = factory.getDocument(Category, {
    path: 'properties',
    select: 'name',
});
exports.updateCategory = factory.updateDocument(Category);
exports.deleteCategory = factory.deleteDocument(Category);
