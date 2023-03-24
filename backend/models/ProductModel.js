const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Entrer le nom du produit"],
        trim: true, 
        maxlength:20
    },
    description: {
        type: String, 
        required: [true, "Veuillez ajouter une description pour votre produit"],
        maxlength:4000
    },
    price:{
        type: Number, 
        required: [true, "Veuillez entrer le prix de vente de votre produit"],
        maxlength: 8,
    },
    discountPrice:{
        type: String,
        maxlength : 4
    },
    color:{
        type: String
    },
    size:{
        type: String
    },
    ratings:{
        type: Number,
        default: 0
    },
    images:[
        {
            public_id:{
                type:String,
                required:true,
            },
            url:{
                type:String,
                required:true,
            },
        }
    ],
    category:{
        type: String,
        required:[true,"Veuillez entrer la catégorie de votre produit"],
    },
    Stock:{
        type: Number,
        required:[true,"Veuillez entrer le nombre de produit que vous avez"],
        maxLength: 3
    },
  numOfReviews:{
      type: Number,
      default: 0
  },
  reviews:[
      {
          user: {
              type:mongoose.Schema.ObjectId,
              ref:"User",
              required: true,
          },
          name:{
              type: String,
              required: true,
          },
          rating:{
              type: Number,
              required: true,
          },
          comment:{
              type:String,
          },
          time:{
              type: Date,
              default: Date.now()
          },
      },
  ],
  user:{
      type: mongoose.Schema.ObjectId,
      ref:"User",
      //required: true
  },
  createAt:{
      type:Date,
      default: Date.now()
  }
})

module.exports = mongoose.model("Product",productSchema);