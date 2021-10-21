const catchAsync = require('../utilities/catchAsync');
const ApiFeatures = require('../utilities/ApiFeatures');
const AppException = require('../utilities/AppException');

exports.getDocuments = Model => catchAsync(async(req, res, next) => {
    let filter = {};
    if(req.params.productId) filter = {product: req.params.productId};
    if(req.params.tagId) filter = {tags: req.params.tagId};
    if(req.params.categoryId) filter = {category: req.params.categoryId};
    const query = Model.find(filter);
    const documents = 
    await new ApiFeatures(query, req)
    .filter()
    .paginate()
    .sort()
    .limitFields()
    .query;

    // console.log(req.query)

    res.status(200).json({
        status: 'success',
        result: documents.length,
        data: documents,
    });
})

exports.createDocument = Model => catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
        status: 'success',
        data: document,
    });
})

exports.getDocument = (Model, populateOption) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id).select('-__v');
    if(populateOption){
        query = query.populate(`${populateOption}`);
    }

    const document = await query;
    if(!document){
        return next(new AppException(404, `${Model} not found`))
    }
    res.status(200).json({
        status: 'success',
        data: document,
    });
})

exports.getDocumentBySlug = (Model, populateOption) => catchAsync(async (req, res, next) => {
    console.log(req.params.slug);

    let slug = Model.findOne({slug: req.params.slug}).select('-__v');
    if(populateOption){
        query = query.populate(`${populateOption}`);
    }

    const document = await slug;

    if(!document){
        return next(new AppException(404, `${Model} not found`))
    }
    res.status(200).json({
        status: 'success',
        data: document,
    });
})

exports.updateDocument = Model => catchAsync(async (req, res, next) => {
    req.body.updatedAt = Date.now();
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!document) {
        return next(new AppException(404, `No ${Model} found with that ID`));
      }
    res.status(200).json({
        status: 'success',
        data: document,
    });
})

exports.deleteDocument = Model => catchAsync(async (req, res, next) => {
    req.body.updatedAt = Date.now();
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
        return next(new AppException(404, `No ${Model} found with that ID`));
      }
    res.status(204).json({
        status: 'success',
        data: null,
    });
})