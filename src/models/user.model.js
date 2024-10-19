import mongoose, { Mongoose } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, // use to make it seachable
        },
        email : {
            type : String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname : {
            type : String,
            required: true,
            trim: true,
            index: true,
        },
        avatar : {
            type : String, // cloudinary url we will use
            required: true,
        },
        coverImage : {
            type : String, // cloudinary url we will use
        },
        watchHistory : [
            {
                type : mongoose.Schema.Types.ObjectID,
                ref: "Video"
            }
        ],
        password : {
            type: String,
            required: [true, "Password is required"]
        },
        refreshToken: {
            type: String,
        } 
    }, 
    {timestamps : true}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
    // cryptograpy take time 
    // it will retrun a boolean value
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);  