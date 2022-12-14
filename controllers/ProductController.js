const { Product } = require('./../Model/ProductModel');
class APIFeatures
{
    constructor(query,queryString)
    {
        this.query = query;
        this.queryString = queryString;
    }
    filter()
    {
        const queryObject = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObject[el]);
        let queryStr = JSON.stringify(queryObject);
        queryStr = queryStr.replace('/\b(gte|gt|lte|lt|\b/g)', match => `$${match}`);
        this.query.find(JSON.parse(queryStr));
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
         
        const features = new APIFeatures(Product.find(),req.query).filter().sort().paginate()
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
        return res
        .status(500)
        .send('Server error');
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
    const newProduct = await Product.create(req.body)
    console.log(newProduct)
            res.status(202).json({
            status: 'Success',
            data: {
                Product : newProduct
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