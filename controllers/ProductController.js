const {Product} = require('./../Model/ProductModel');
class APIFeatures
{
    constructor(query,queryString)
    {
        this.query = query;
        this.queryString = queryString;
    }
    search()
    {
        const keyword = this.queryString.keyword ? {
            name : {
                $regex: this.queryString.keyword,
                $options: 'i'
            }
        } : {}

        this.query = this.query.find({...keyword})
        return this    
    }
    filter()
    {
        const queryObject = {...this.queryString};

        //Remove fields from the query
        const RemoveFields = ['page', 'sort', 'limit', 'keyword'];
        RemoveFields.forEach(el => delete queryObject[el]);
        
        //Advance Filter
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace('/\b(gte|gt|lte|lt|\b/g)', match => `$${match}`);


        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort()
    {
        if(this.queryString.sort)
        {
          const sortBy = this.queryString.sort.split(',').join(" ");
          this.query = this.query.sort(sortBy);
        }else
        {
           this.query = this.query.sort("-rating");
        }
        return this;
    }
    paginate()
    {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page-1)*limit;
        this.query  = this.query.skip(skip).limit(limit);
        return this;
    }
}

exports.getAllProduct= async (req, res) => 
{ 
    try
    { 
        const features = new APIFeatures(Product.find(),req.query)
        .search()
        .filter()
        .sort()
        .paginate()

        const product = await features.query;

       //SEND RESPONSE
        res
        .status(202)
        .json({
            status: 'Success',
            result: product.length,
            data: { product }
        });
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send('Server error');
        return;
    }   
}
exports.getProductById = async (req, res) => 
{
    try
    {
        const id = req.params.id;
        const product = await Product.findById(id);
        res
       .status(202)
       .json({
            status: 'Success',
            result: product,
            data: { product }
       })    
    }
    catch(err)
    {
        console.log(err);
        return res.status(404).json({
                         status: 'Error',
                         message: 'Invalid Product'

    })
}
}   
exports.createProduct = async (req, res)=> 
{   
    try {
    const NewProduct = await Product.create(req.body)
    console.log(NewProduct)
            res.status(202).json({
            status: 'Success',
            data: {
                Product : NewProduct
            }
        });
    } 
    catch (error) 
    {
        res.status(404).json({
                    status: 'Error',
                    message: 'Invalid Product'
                })
    }

}
exports.updateProduct = async (req, res) => {

    try
    {
        const id = req.params.id;
        const product = await Product.findByIdAndUpdate(id,req.body,{
            new : true
        })
        res
       .status(202)
       .json({
            status: 'Success',
            data: { product }
       })    
    }
    catch(err)
    {
        console.log(err);
        return res.status(404).json({
                         status: 'Error',
                         message: 'Invalid Product'

    })
} 
}
exports.deleteProduct = async (req, res) => {

    try
    {
        const id = req.params.id;
        const product = await Product.findByIdAndRemove(id,req.body)
        res
       .status(202)
       .json({
            status: 'Success',
            data: null
       })    
    }
    catch(err)
    {
        console.log(err);
        return res.status(404).json({
                         status: 'Error',
                         message: 'Invalid Product'

    })
} 
}