import Room from '../models/Room.js';

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { name, rowCount = 8, seatsPerRow = 10 } = req.body;
    
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) return res.status(400).json({ success: false, message: "Phòng đã tồn tại" });

    const sodoghe = [];
    for (let row = 0; row < rowCount; row++) {
      const rowLetter = String.fromCharCode(65 + row);
      for (let col = 1; col <= seatsPerRow; col++) {
        sodoghe.push({
          row: rowLetter,
          number: col,
          status: 'available',
          price: 75000
        });
      }
    }

    const room = new Room({ name, sodoghe });
    await room.save();
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    // Check if room is being used in any schedule
    const Schedule = (await import('../models/Schedule.js')).default;
    const schedulesUsingRoom = await Schedule.countDocuments({ room: req.params.id });
    
    if (schedulesUsingRoom > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa phòng vì đang có ${schedulesUsingRoom} lịch chiếu sử dụng phòng này`,
      });
    }

    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSeatMap = async (req, res) => {
  try {
    const { sodoghe } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    
    room.sodoghe = sodoghe;
    await room.save();
    
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addSeat = async (req, res) => {
  try {
    const { row, number, price = 75000 } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    
    const existingSeat = room.sodoghe.find(seat => seat.row === row && seat.number === number);
    if (existingSeat) return res.status(400).json({ success: false, message: "Ghế đã tồn tại" });
    
    room.sodoghe.push({ row, number, status: 'available', price });
    await room.save();
    
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeSeat = async (req, res) => {
  try {
    const { row, number } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    
    room.sodoghe = room.sodoghe.filter(seat => !(seat.row === row && seat.number === number));
    await room.save();
    
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSeat = async (req, res) => {
  try {
    const { row, number, status, price } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) return res.status(404).json({ success: false, message: "Không tìm thấy phòng" });
    
    const seat = room.sodoghe.find(seat => seat.row === row && seat.number === number);
    if (!seat) return res.status(404).json({ success: false, message: "Không tìm thấy ghế" });
    
    if (status !== undefined) seat.status = status;
    if (price !== undefined) seat.price = price;
    
    await room.save();
    
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
