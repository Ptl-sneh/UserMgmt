const Permission = require('../models/Modules'); 

exports.getGroupedModules = async (req, res) => {
    try {
        const groupedModules = await Permission.aggregate([
            // Stage 1: Match active permissions (optional filter)
            {
                $match: {
                    isActive: true
                }
            },
            // Stage 2: Group by moduleName
            {
                $group: {
                    _id: "$moduleName",
                    actions: {
                        $push: "$actions"
                    },
                    // Optional: Count total actions per module
                    totalActions: { $sum: 1 }
                }
            },
            // Stage 3: Project to format the output
            {
                $project: {
                    _id: 0,
                    moduleName: "$_id",
                    actions: 1,
                    totalActions: 1
                }
            },
            // Stage 4: Sort by moduleName (optional)
            {
                $sort: {
                    moduleName: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            count: groupedModules.length,
            data: groupedModules
        });
    } catch (error) {
        console.error('Error fetching grouped modules:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// Alternative method with $addToSet to avoid duplicate actions
exports.getGroupedModulesUnique = async (req, res) => {
    try {
        const groupedModules = await Permission.aggregate([
            {
                $match: {
                    isActive: true
                }
            },
            {
                $group: {
                    _id: "$moduleName",
                    actions: {
                        $addToSet: "$actions" // Use $addToSet to avoid duplicates
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    moduleName: "$_id",
                    actions: {
                        $map: {
                            input: "$actions",
                            as: "action",
                            in: {
                                name: "$$action",
                                // Optional: Add action-specific properties
                                slug: { 
                                    $toLower: { 
                                        $replaceAll: { 
                                            input: "$$action", 
                                            find: " ", 
                                            replacement: "_" 
                                        } 
                                    } 
                                }
                            }
                        }
                    }
                }
            },
            {
                $sort: { moduleName: 1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: groupedModules
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};