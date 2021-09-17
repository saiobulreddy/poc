const roomMateModel = require('../db_models/roomMateModel');
const splitAmountModel = require('../db_models/splitAmountModel');
const ObjectID = require('mongodb').ObjectID;

class splitExpensesService {

    async dumpDB(roomId, roomMatesCount) {
        try {
            let roomMates = [];
            for (let i = 1; i <= roomMatesCount; i++)
                roomMates.push({ name: `roomMate${i}`, roomId: roomId });

            roomMates = await roomMateModel.insertMany(roomMates);

            let splitAmountObj = [];
            for (const iterator1 of roomMates)
                for (const iterator2 of roomMates)
                    if (iterator1.id !== iterator2.id) splitAmountObj.push({ ownedBy: iterator1.id, ownedTo: iterator2.id });

            await splitAmountModel.insertMany(splitAmountObj);

            return { message: "Data dumped successfully" };
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async addRoomMates(name, roomId) {
        try {
            let exist = await roomMateModel.findOne({ name, roomId });
            if (exist) throw new Error("RoomMate is alredy added in to this room.")
            await roomMateModel.create({ name, roomId });
            return { message: "user added successfully" };
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async getRoomMates(roomId) {
        try {
            let roomMates = await roomMateModel.find({ roomId });
            return { data: roomMates, message: "RoomMates data." };
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async splitAmount(name, amount) {
        try {
            let { id, roomId } = await roomMateModel.findOne({ name }, { roomId: 1 });
            let roomMates = await roomMateModel.find({ roomId });
            let totalRoomMates = roomMates.length;
            amount = amount / totalRoomMates;
            let ownedTo = await splitAmountModel.find({ ownedBy: id }, { ownedBy: 0 });
            let ownedBy = await splitAmountModel.find({ ownedTo: id }, { ownedTo: 0 });
            for (const outgo of ownedTo) {
                for (const income of ownedBy) {
                    if (JSON.stringify(income.ownedBy) == JSON.stringify(outgo.ownedTo)) {
                        if ((amount - outgo.amount) >= 0) income.amount += amount - outgo.amount;
                        else income.amount = 0;
                        if ((outgo.amount - amount) >= 0) outgo.amount -= amount;
                        else outgo.amount = 0;
                        await splitAmountModel.updateOne({ ownedBy: id, ownedTo: outgo.ownedTo }, { amount: outgo.amount });
                        await splitAmountModel.updateOne({ ownedTo: id, ownedBy: income.ownedBy }, { amount: income.amount });
                    }
                }
            }
            return { message: "user added successfully" };
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    async getSplittedAmount(name) {
        try {
            let { id } = await roomMateModel.findOne({ name }, { _id: 1 });

            let ownedAmount = await splitAmountModel.aggregate([
                {
                    $match: {
                        ownedTo: ObjectID(id),

                        amount: { $gt: 0 },
                    }
                },
                {
                    $lookup: {
                        from: "roommates",
                        localField: "ownedBy",
                        foreignField: "_id",
                        as: "ownAmount"
                    },
                },
                {
                    $unwind: { path: "$ownAmount", preserveNullAndEmptyArrays: true },
                },
                {
                    $project: { amount: 1, roomMate: "$ownAmount.name" }
                }
            ])

            let payableAmount = await splitAmountModel.aggregate([
                {
                    $match: {
                        ownedBy: ObjectID(id),
                        amount: { $gt: 0 },
                    }
                },
                {
                    $lookup: {
                        from: "roommates",
                        localField: "ownedTo",
                        foreignField: "_id",
                        as: "payAmount"
                    },
                },
                {
                    $unwind: { path: "$payAmount", preserveNullAndEmptyArrays: true },
                },
                {
                    $project: { amount: 1, roomMate: "$payAmount.name" }
                }
            ])

            // await splitAmountModel.aggregate([
            //     {
            //         $match: {
            //             $or: [
            //                 { ownedTo: ObjectID(id) },
            //                 { ownedBy: ObjectID(id) }
            //             ],
            //             amount: { $gt: 0 },
            //         }
            //     },
            //     {
            //         $lookup: {
            //             from: "roommates",
            //             localField: "ownedBy",
            //             // localField: "ownedTo",
            //             foreignField: "_id",
            //             as: "ownAmount"
            //         },
            //     },
            //     // {
            //     //     $lookup: {
            //     //         from: "roommates",
            //     //         let: { order_item: "$item", order_qty: "$ordered" },
            //     //         pipeline: [
            //     //             {
            //     //                 $match:
            //     //                 {
            //     //                     $expr:
            //     //                     {
            //     //                         $and:
            //     //                             [
            //     //                                 { $eq: ["$stock_item", "$$order_item"] },
            //     //                                 { $gte: ["$instock", "$$order_qty"] }
            //     //                             ]
            //     //                     }
            //     //                 }
            //     //             },
            //     //             { $project: { stock_item: 0, _id: 0 } }
            //     //         ],
            //     //         as: "stockdata"
            //     //     }
            //     // },
            //     {
            //         $unwind: { path: "$ownAmount", preserveNullAndEmptyArrays: true },
            //     },
            //     // {
            //     //     $group: {
            //     //         "_id": {
            //     //             ownedTo: "$ownedTo", ownedBy: "$ownedBy"
            //     //         }
            //     //     }
            //     // },
            //     {
            //         $project: { amount: 1, roomMate: "$ownAmount.name", _id: 0 }
            //     }
            // ])

            return { data: { ownedAmount, payableAmount }, message: "Got the splitted amount of your room." };
        } catch (error) {
            console.log(error.message);
            throw error;
        }
    }
}

module.exports = splitExpensesService;