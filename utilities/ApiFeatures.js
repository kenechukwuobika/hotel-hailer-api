class ApiFeatures{
    constructor(query, req){
        this.query = query;
        this.req = req;
        this.queryObj = {...this.req.query};
        this.queryString = Object.keys(this.req.query);
        this.keywords = ['sort', 'page', 'fields', 'limit'];
        this.fields = this.req.query.fields;
    }

    filterFields(){
        this.queryString.forEach(query => {
            if(this.keywords.includes(query)){
                delete this.req.query[query]
            }
        });

        let queryStr = JSON.stringify(this.req.query);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query.find(JSON.parse(queryStr));

        return this;
    }

    paginate(){
        const { page } = this.queryObj
        const limit = 100;
        const skip = (page - 1) * limit
        this.query.skip(skip).limit(limit);
        return this;
    }

    sort(){
        if (this.queryObj.sort) {
            const sortBy = this.queryObj.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
      
        return this;
    }

    limitFields(){
        if(this.fields){
            const fields = this.fields.split(',').join('');
            this.query.select(fields);
        }
 
        else{
            this.query.select('-__v');
        }
        
        return this;
    }
}

module.exports = ApiFeatures;