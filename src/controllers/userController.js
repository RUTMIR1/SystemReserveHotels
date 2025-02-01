import { User } from "../models/userModel.js";
export const ctrlUser = {};

ctrlUser.createUser = async (req, res)=>{
    try{
        let newUserId = await User.createUser({user: req.body});
        res.status(201).json({status: 201, message: 'User created sucessfully!', 
            user: newUserId});
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
};

ctrlUser.getUsers = async (req, res)=>{
    try{
        let users = await User.getUsers();
        res.status(200).json(users);
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
};

ctrlUser.deleteUserById = async (req, res)=>{
    try{
        let userDeleted = await User.deleteUserById({id: req.params.id});
        res.status(200).json({status: 200, message: 'User deleted successfully',
            user: userDeleted});
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}

ctrlUser.updateUser = async (req, res)=>{
    try{
        let result = await User.updateUser({user: req.body, id: req.params.id});
        res.status(200).json({status: 200, message: 'User updated successfully',
            user: result});
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}

ctrlUser.getUserById = async (req, res)=>{
    try{
        let user = await User.getUserById({id:req.params.id});
        res.status(200).json(user);
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}