const Permission = require('../models/Modules'); 

// Only keep this one function
exports.getModules = async (req, res) => {
  try {
    // Check if we want grouped format (for UI) or all modules (for RoleForm)
    const grouped = req.query.grouped === 'true';
    
    if (grouped) {
      // Return grouped modules for UI display
      const groupedModules = await Permission.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $group: {
            _id: "$moduleName",
            actions: { $addToSet: "$actions" }
          }
        },
        {
          $project: {
            _id: 0,
            moduleName: "$_id",
            actions: 1
          }
        },
        { $sort: { moduleName: 1 } }
      ]);

      return res.status(200).json({
        success: true,
        data: groupedModules
      });
    } else {
      // Return all individual modules for RoleForm
      const allModules = await Permission.find({ 
        isActive: true 
      })
      .select('_id moduleName actions isActive')
      .sort({ moduleName: 1, actions: 1 });

      return res.status(200).json(allModules);
    }
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};