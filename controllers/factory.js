const catchAsync = require('../utilities/catchAsync');
const ApiFeatures = require('../utilities/ApiFeatures');
const AppException = require('../utilities/AppException');

exports.getDocuments = (Model, populateOption) => catchAsync(async(req, res, next) => {
    let query = Model.find(req.filter);
    console.log(populateOption)
    if(populateOption){
        query = query.populate(populateOption);
    }
    const documents = 
    await new ApiFeatures(query, req)
    .filter()
    .paginate()
    .sort()
    .limitFields()
    .query;

    res.status(200).json({
        status: 'success',
        result: documents.length,
        data: documents,
    });
})

exports.createDocument = Model => catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    const key = Model.modelName.toLowerCase();
    res.status(201).json({
        status: 'success',
        data: document,
    });
})

exports.getDocument = (Model, populateOption) => catchAsync(async (req, res, next) => {
    const filter = {...req.filter, _id: req.params.id}
    let query = Model.findOne(filter).select('-__v');
    const key = Model.modelName.toLowerCase();
    console.log(populateOption)
    if(populateOption){
        query = query.populate(populateOption);
    }

    const document = await query;
    if(!document){
        return next(new AppException(404, `${key} not found`))
    }
    res.status(200).json({
        status: 'success',
        data: document,
    });
})

exports.updateDocument = Model => catchAsync(async (req, res, next) => {
    const key = Model.modelName;
    const filter = {...req.filter, _id: req.params.id}
    req.body.updatedAt = Date.now();
    
    const document = await Model.findOneAndUpdate(filter, req.body, {
        new: true,
        runValidators: true
    });

    if(!document){
        return next(new AppException(404, `${key} not found`))
    }

    res.status(200).json({
        status: 'success',
        data: document,
    });
})

exports.deleteDocument = Model => catchAsync(async (req, res, next) => {
    const key = Model.modelName.toLowerCase();
    req.body.updatedAt = Date.now();
    const document = await Model.findByIdAndDelete(req.params.id);

    res.status(200).json({
        status: 'success',
        data: document,
    });
})