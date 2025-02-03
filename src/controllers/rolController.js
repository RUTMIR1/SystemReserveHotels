import { Rol } from "../models/rolModel.js";
export const ctrlRol = {};

ctrlRol.getRols = async (req, res)=>{
    try{
        let rols = await Rol.getRols();
        res.status(200).json(rols);
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
};

ctrlRol.createRol = async (req, res)=>{
    try{
        let rolId = await Rol.createRol({rol: req.body});
        res.status(201).json({status:201, message: `User created successfully`,
            rol: rolId});
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
};

ctrlRol.updateRol = async (req, res)=>{
    try{
        let rolUpdate = await Rol.updateRol({id:req.params.id, rol:req.body});
        res.status(200).json({status:200, message: `User updated successfully`,
            rol: rolUpdate});
    }catch(err){
        res.status(403).json({status:403, message:err.message});
    }
};
ctrlRol.deleteRol = async (req, res)=>{
    try{
        let rolDelete = await Rol.deleteRol({id: req.params.id});
        res.status(200).json({status:200, message: 'Rol deleted successfully',
            rol: rolDelete});
    }catch(err){
        res.status(403).json({status:403, message:err.message});
    }
};
ctrlRol.getRolById = async (req, res)=>{
    try{
        let rol = await Rol.getRolById({id: req.params.id});
        res.status(200).json(rol);
    }catch(err){
        res.status(403).json({status:403, message:err.message});
    }
};
