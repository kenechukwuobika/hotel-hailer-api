const Tag = require('../models/Tag');
const factory = require('./factory');

exports.getAllTags = factory.getDocuments(Tag);
exports.createTag = factory.createDocument(Tag);
exports.getTag = factory.getDocument(Tag);
exports.updateTag = factory.updateDocument(Tag);
exports.deleteTag = factory.deleteDocument(Tag);
