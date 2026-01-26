const mongoose = require('mongoose');
const Permission = require('./models/Modules');
const Role = require('./models/Role');

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

// Role data based on modules
const rolesData = [
    {
        name: "Super Admin",
        permissions: [
            {
                moduleName: "Dashboard",
                actions: ["view", "refresh status"],
                nestedPermissions: []
            },
            {
                moduleName: "RoleManagement",
                actions: ["create", "read", "update", "delete"],
                nestedPermissions: []
            },
            {
                moduleName: "UserManagement",
                actions: ["create", "read", "update", "delete", "Export CSV"],
                nestedPermissions: []
            }
        ],
        status: "Active"
    },
    {
        name: "Admin",
        permissions: [
            {
                moduleName: "Dashboard",
                actions: ["view", "refresh status"],
                nestedPermissions: []
            },
            {
                moduleName: "RoleManagement",
                actions: ["read", "update"],
                nestedPermissions: []
            },
            {
                moduleName: "UserManagement",
                actions: ["create", "read", "update", "delete", "Export CSV"],
                nestedPermissions: []
            }
        ],
        status: "Active"
    },
    {
        name: "Manager",
        permissions: [
            {
                moduleName: "Dashboard",
                actions: ["view"],
                nestedPermissions: []
            },
            {
                moduleName: "RoleManagement",
                actions: ["read"],
                nestedPermissions: []
            },
            {
                moduleName: "UserManagement",
                actions: ["read", "update", "Export CSV"],
                nestedPermissions: []
            }
        ],
        status: "Active"
    },
    {
        name: "User",
        permissions: [
            {
                moduleName: "Dashboard",
                actions: ["view"],
                nestedPermissions: []
            },
            {
                moduleName: "UserManagement",
                actions: ["read"],
                nestedPermissions: []
            }
        ],
        status: "Active"
    }
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

async function seedRoles() {
    try {
        await mongoose.connect('mongodb://localhost:27017/user_role_management');

        console.log('Connected to MongoDB successfully');

        // Clear existing roles
        await Role.deleteMany({});
        console.log('Cleared existing roles');

        // Insert new roles
        await Role.insertMany(rolesData);

        console.log('Roles seeded successfully');
        console.log(`Total roles inserted: ${rolesData.length}`);
        
        // Verify the data
        const allRoles = await Role.find({});
        console.log('\nCurrent roles in database:');
        console.log('===============================');
        
        allRoles.forEach(role => {
            console.log(`\nRole: ${role.name} (${role.status})`);
            role.permissions.forEach(perm => {
                console.log(`  - ${perm.moduleName}: [${perm.actions.join(', ')}]`);
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding roles:', error);
        process.exit(1);
    }
}

async function seedAll() {
    try {
        await mongoose.connect('mongodb://localhost:27017/user_role_management');

        console.log('Connected to MongoDB successfully');

        // Seed Permissions
        console.log('\n=== Seeding Permissions ===');
        await Permission.deleteMany({});
        console.log('Cleared existing permissions');
        await Permission.insertMany(permissionsData);
        console.log('Permissions seeded successfully');
        console.log(`Total permissions inserted: ${permissionsData.length}`);
        
        // Verify permissions
        const allPermissions = await Permission.find({});
        console.log('\nCurrent permissions in database:');
        console.log('===============================');
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

        // Seed Roles
        console.log('\n=== Seeding Roles ===');
        await Role.deleteMany({});
        console.log('Cleared existing roles');
        await Role.insertMany(rolesData);
        console.log('Roles seeded successfully');
        console.log(`Total roles inserted: ${rolesData.length}`);
        
        // Verify roles
        const allRoles = await Role.find({});
        console.log('\nCurrent roles in database:');
        console.log('===============================');
        allRoles.forEach(role => {
            console.log(`\nRole: ${role.name} (${role.status})`);
            role.permissions.forEach(perm => {
                console.log(`  - ${perm.moduleName}: [${perm.actions.join(', ')}]`);
            });
        });

        console.log('\n=== Seeding Complete ===');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

// Add graceful shutdown
process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
});

// Check command line argument to determine what to seed
const arg = process.argv[2];

if (arg === 'permissions') {
    seedPermissions();
} else if (arg === 'roles') {
    seedRoles();
} else {
    // Default: seed both
    seedAll();
}