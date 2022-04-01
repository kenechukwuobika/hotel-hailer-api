const catchAsync = require('../utilities/catchAsync');
const ApiFeatures = require('../utilities/ApiFeatures');
const AppException = require('../utilities/AppException');

exports.getDocuments = (Model, populateOption=null) => catchAsync(async(req, res, next) => {
    let query = Model.find(req.filter);
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
    if(req.body.location){
        req.body.location.coordinates.forEach((element, index) => {
            req.body.location.coordinates[index] = element * 1
        });
    }

    if(req.files) {
        req.body.coverImage = `${req.protocol}://${req.get('host')}/images/products/${req.files.images[0].filename}`;
        const filenames = req.files.images.map(file => `${req.protocol}://${req.get('host')}/images/products/${file.filename}`)
        req.body.images = filenames;
    }

    if(req.file) {
        req.body.image = `${req.protocol}://${req.get('host')}/images/users/${req.file.filename}`;
    }


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