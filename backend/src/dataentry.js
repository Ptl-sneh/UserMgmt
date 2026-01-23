const mongoose = require('mongoose');
const Permission = require('./models/Modules');

const permissionsData = [
    {
        moduleName: "Dashboard",
        actions: "view"
    },
    {
        moduleName: "Dashboard",
        actions: "refresh status"
    },
    {
        moduleName: "RoleManagement",
        actions: "create"
    },
    {
        moduleName: "RoleManagement",
        actions: "read"
    },
    {
        moduleName: "RoleManagement",
        actions: "update"
    },
    {
        moduleName: "RoleManagement",
        actions: "delete"
    },
    {
        moduleName: "UserManagement",
        actions: "create"
    },
    {
        moduleName: "UserManagement",
        actions: "read"
    },
    {
        moduleName: "UserManagement",
        actions: "update"
    },
    {
        moduleName: "UserManagement",
        actions: "delete"
    },
    {
        moduleName: "UserManagement",
        actions: "Export CSV"
    },
];

async function seedPermissions() {
    try {
        // REMOVE the options for newer Mongoose versions
        await mongoose.connect('mongodb://localhost:27017/user_role_management');

        console.log('Connected to MongoDB successfully');

        // Clear existing permissions
        await Permission.deleteMany({});
        console.log('Cleared existing permissions');

        // Insert new permissions
        await Permission.insertMany(permissionsData);

        console.log('Permissions seeded successfully');
        console.log(`Total permissions inserted: ${permissionsData.length}`);
        
        // Verify the data
        const allPermissions = await Permission.find({});
        console.log('\nCurrent permissions in database:');
        console.log('===============================');
        
        // Group and display
        const grouped = {};
        allPermissions.forEach(perm => {
            if (!grouped[perm.moduleName]) {
                grouped[perm.moduleName] = [];
            }
            grouped[perm.moduleName].push(perm.actions);
        });
        
        Object.keys(grouped).forEach(module => {
            console.log(`${module}: ${grouped[module].join(', ')}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding permissions:', error);
        process.exit(1);
    }
}

// Add graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

seedPermissions();