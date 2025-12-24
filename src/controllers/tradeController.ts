import { Request, Response } from 'express';
import { Trade } from '../models';

// Get all trades
export const getAllTrades = async (req: Request, res: Response) => {
  try {
    const { status, symbol, startDate, endDate, sort = '-entryDate' } = req.query;
    
    const query: any = {};
    
    if (status) query.status = status;
    if (symbol) query.symbol = symbol;
    if (startDate || endDate) {
      query.entryDate = {};
      if (startDate) query.entryDate.$gte = new Date(startDate as string);
      if (endDate) query.entryDate.$lte = new Date(endDate as string);
    }
    
    const trades = await Trade.find(query).sort(sort as string);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trades', error });
  }
};

// Get single trade by ID
export const getTradeById = async (req: Request, res: Response) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trade', error });
  }
};

// Create new trade
export const createTrade = async (req: Request, res: Response) => {
  try {
    const trade = new Trade(req.body);
    await trade.save();
    res.status(201).json(trade);
  } catch (error) {
    res.status(400).json({ message: 'Error creating trade', error });
  }
};

// Update trade
export const updateTrade = async (req: Request, res: Response) => {
  try {
    const trade = await Trade.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json(trade);
  } catch (error) {
    res.status(400).json({ message: 'Error updating trade', error });
  }
};

// Delete trade
export const deleteTrade = async (req: Request, res: Response) => {
  try {
    const trade = await Trade.findByIdAndDelete(req.params.id);
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting trade', error });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const allTrades = await Trade.find({ status: 'closed' });
    
    const totalTrades = allTrades.length;
    const winningTrades = allTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = allTrades.filter(t => (t.pnl || 0) < 0);
    
    const totalPnl = allTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    
    const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : (totalWins > 0 ? 'N/A' : 0);
    
    const avgWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    
    // Get open trades
    const openTrades = await Trade.find({ status: 'open' });
    
    // Recent trades (last 5)
    const recentTrades = await Trade.find().sort('-entryDate').limit(5);
    
    // Helper: Get the effective close date (exitDate, updatedAt, or entryDate as fallback)
    const getTradeCloseDate = (t: any): Date => {
      return t.exitDate || t.updatedAt || t.entryDate;
    };
    
    // Monthly P&L
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyTrades = allTrades.filter(t => getTradeCloseDate(t) >= startOfMonth);
    const monthlyPnl = monthlyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    // Weekly P&L
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const weeklyTrades = allTrades.filter(t => getTradeCloseDate(t) >= startOfWeek);
    const weeklyPnl = weeklyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    // Today's P&L
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const dailyTrades = allTrades.filter(t => getTradeCloseDate(t) >= startOfDay);
    const dailyPnl = dailyTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    res.json({
      totalTrades,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnl,
      winRate: Math.round(winRate * 100) / 100,
      profitFactor: typeof profitFactor === 'string' ? profitFactor : Math.round(profitFactor * 100) / 100,
      avgWin: Math.round(avgWin * 100) / 100,
      avgLoss: Math.round(avgLoss * 100) / 100,
      openTradesCount: openTrades.length,
      recentTrades,
      dailyPnl: Math.round(dailyPnl * 100) / 100,
      weeklyPnl: Math.round(weeklyPnl * 100) / 100,
      monthlyPnl: Math.round(monthlyPnl * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
};

// Add screenshots to trade
export const addScreenshots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    const screenshotPaths = files.map(file => `/uploads/${file.filename}`);
    
    const trade = await Trade.findByIdAndUpdate(
      id,
      { $push: { screenshots: { $each: screenshotPaths } } },
      { new: true }
    );
    
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading screenshots', error });
  }
};

// Delete screenshot from trade
export const deleteScreenshot = async (req: Request, res: Response) => {
  try {
    const { id, screenshotPath } = req.params;
    
    const trade = await Trade.findByIdAndUpdate(
      id,
      { $pull: { screenshots: decodeURIComponent(screenshotPath) } },
      { new: true }
    );
    
    if (!trade) {
      return res.status(404).json({ message: 'Trade not found' });
    }
    
    res.json(trade);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting screenshot', error });
  }
};
