import { Address } from "../models/addressModel.js";
export const ctrlAddress = {};

ctrlAddress.getAllAddress = async (req, res)=>{
    try{
        let Addresses = await Address.getAllAddress();
        res.status(200).json(Addresses);
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}

ctrlAddress.getAddressById = async (req, res)=>{
    try{
        let address = await Address.getAddressById({id: req.params.id});
        res.status(200).json(address);
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}

ctrlAddress.updateAddress = async (req, res)=>{
    try{
        let result = await Address.updateAddress({id: req.params.id, address: req.body});
        res.status(200).json({status: 200, message: 'Address updated successfully',
            address: result});
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}