import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
        enum:['customer','seller','admin'],
        default:'customer',
    },
    address:{
        type:String,
    },
    contact:{
        type:String,
    }
},{
    timestamp:true
});

// Pre-save hook: Hash the password before saving to the database
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next();
    }
    // Hashing sensitive data (password) is a Safety requirement
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User',userSchema);

export default User;