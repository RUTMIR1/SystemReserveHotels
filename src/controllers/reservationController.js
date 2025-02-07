import { Reservation } from "../models/reservationModel.js";

export const ctrlReservation = {};


ctrlReservation.getReservations = async (req, res)=>{
    try{
        let reservations = await Reservation.getReservations();
        res.status(200).json(reservations);
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}
ctrlReservation.createReservation = async (req, res)=>{
    try{
        let reservationId = await Reservation.createReservation({reservation:req.body});
        res.status(201).json({status: 201, message: 'Reservation created successfully!',
            reservation: reservationId});
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}

ctrlReservation.updateReservation = async (req, res)=>{
    try{
        let reservationUpdate = await Reservation.updateReservation({id:req.params.id, reservation:req.body});
        res.status(200).json({status: 200, message: `Reservation updated successfully`,
            reservation: reservationUpdate});
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}

ctrlReservation.deleteReservation = async (req, res)=>{
    try{
        let reservationDeleted = await Reservation.deleteReservation({id: req.params.id});
        res.status(200).json({status: 200, message: 'Reservation deleted successfully',
            reservation: reservationDeleted});
    }catch(err){
        res.status(403).json({status:403, message: err.message});
    }
}

ctrlReservation.getReservationById = async (req, res)=>{
    try{
        let reservation = await Reservation.getReservationById({id: req.params.id});
        res.status(200).json(reservation);
    }catch(err){
        res.status(403).json({status: 403, message: err.message});
    }
}