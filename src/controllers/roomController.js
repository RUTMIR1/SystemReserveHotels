import { Room } from "../models/roomModel.js";
export const ctrlRoom = {};

ctrlRoom.getRooms = async (req, res)=>{
    try{
        let rooms = await Room.getRooms();
        res.status(200).json(rooms);
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}

ctrlRoom.createRoom = async (req, res)=>{
    try{
        let roomId = await Room.createRoom({room: req.body});
        res.status(201).json({status:201, message: 'Room created successfully',
            room: roomId});
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}

ctrlRoom.updateRoom = async (req, res)=>{
    try{
        let roomUpdate = await Room.updateRoom({id:req.params.id, room:req.body});
        res.status(200).json({status:200, message: `Room updated successfully`,
            room: roomUpdate});
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}

ctrlRoom.deleteRoom = async (req, res)=>{
    try{
        let roomDeleted = await Room.deleteRoom({id:req.params.id});
        res.status(200).json({status: 200, message: `Room deleted successfully`,
            room: roomDeleted});
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}

ctrlRoom.getRoomById = async (req, res)=>{
    try{
        let room = await Room.getRoomById({id:req.params.id});
        res.status(200).json(room);
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}