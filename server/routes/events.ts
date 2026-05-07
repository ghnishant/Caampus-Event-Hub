import express from 'express';
import { Event } from '../models/Event';
import { Registration } from '../models/Registration';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/public-stats', async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const checkedIn = await Registration.countDocuments({ attended: true });
    
    res.json({ totalEvents, totalRegistrations, checkedIn });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching public stats' });
  }
});

router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.get('/stats', verifyToken, async (req: any, res) => {
  try {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const checkedIn = await Registration.countDocuments({ attended: true });
    
    const recentRegistrations = await Registration.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 864e5) }
    }).select('createdAt');

    res.json({ totalEvents, totalRegistrations, checkedIn, recentRegistrations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

router.get('/student-stats', verifyToken, async (req: any, res) => {
  try {
    const registered = await Registration.countDocuments({ userId: req.userId });
    const attended = await Registration.countDocuments({ userId: req.userId, attended: true });
    
    const regs = await Registration.find({ userId: req.userId }).populate('eventId');
    const upcoming = regs.filter((r: any) => r.eventId && new Date(r.eventId.startsAt) > new Date()).length;

    res.json({ registered, attended, upcoming });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching student stats' });
  }
});

router.post('/', verifyToken, async (req: any, res) => {
  try {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { title, description, startsAt, location, maxParticipants, maxTeamSize, organizerName, organizerPhone } = req.body;
    const event = new Event({ 
      title, description, startsAt, location, 
      maxParticipants, maxTeamSize, organizerName, organizerPhone, 
      createdBy: req.userId 
    });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error creating event' });
  }
});

router.post('/:id/register', verifyToken, async (req: any, res) => {
  try {
    const { year, department, phoneNumber, teamName, teamMembers } = req.body;
    const eventId = req.params.id;
    
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    
    if (event.maxParticipants > 0) {
      const currentCount = await Registration.countDocuments({ eventId });
      if (currentCount >= event.maxParticipants) {
        return res.status(400).json({ message: 'Event is already full' });
      }
    }

    const existing = await Registration.findOne({ userId: req.userId, eventId });
    if (existing) return res.status(400).json({ message: 'Already registered for this event' });

    const reg = new Registration({ 
      userId: req.userId, 
      eventId, 
      year, 
      department, 
      phoneNumber, 
      teamName, 
      teamMembers 
    });
    await reg.save();
    res.status(201).json(reg);
  } catch (err: any) {
    res.status(500).json({ message: `Error registering: ${err.message}` });
  }
});

router.post('/check-in', verifyToken, async (req: any, res) => {
  try {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const { registrationId } = req.body;
    
    if (!registrationId) return res.status(400).json({ message: 'No registration ID provided' });

    console.log('Attempting check-in for ID:', registrationId);

    let reg;
    // 1. Try exact MongoDB ID
    if (registrationId.length === 24 && /^[0-9a-fA-F]{24}$/.test(registrationId)) {
      reg = await Registration.findById(registrationId);
    } 
    
    // 2. Try short ID match (suffix)
    if (!reg) {
      const allRegs = await Registration.find({});
      reg = allRegs.find(r => {
        const idStr = r._id.toString().toUpperCase();
        const inputStr = registrationId.toString().toUpperCase();
        return idStr.endsWith(inputStr) || idStr === inputStr;
      });
    }

    if (!reg) {
      console.log('Ticket not found for ID:', registrationId);
      return res.status(404).json({ message: `Ticket ${registrationId} not found.` });
    }

    if (reg.attended) {
      console.log('Duplicate check-in attempt for ID:', registrationId);
      return res.status(400).json({ message: 'This ticket has already been used for check-in.' });
    }
    
    reg.attended = true;
    await reg.save({ validateBeforeSave: false });
    
    const populated = await Registration.findById(reg._id).populate([
      { path: 'userId', select: 'displayName email' },
      { path: 'eventId', select: 'title' }
    ]);
    
    console.log('Successfully checked in:', populated?.userId?.email);
    res.json({ message: 'Checked in successfully', registration: populated });
  } catch (err: any) {
    console.error('Check-in error detailed:', err);
    res.status(500).json({ message: `Check-in error: ${err.message || 'Unknown error'}` });
  }
});

router.get('/registrations', verifyToken, async (req: any, res) => {
  try {
    if (req.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const regs = await Registration.find().populate('userId', 'email displayName').populate('eventId', 'title');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching registrations' });
  }
});

router.get('/my-tickets', verifyToken, async (req: any, res) => {
  try {
    const regs = await Registration.find({ userId: req.userId }).populate('eventId');
    res.json(regs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tickets' });
  }
});

export default router;
