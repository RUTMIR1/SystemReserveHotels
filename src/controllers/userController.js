import { User } from "../models/userModel.js";
export const ctrlUser = {};

ctrlUser.createUser = async (req, res)=>{
    try{
        const result = await User.createUser({user: req.body});
        res.status(201).json(result);
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}