const mongoose = require('mongoose')

async function disableMaintenanceMode() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greentech')
    console.log('Connected to MongoDB')

    // Get the database
    const db = mongoose.connection.db
    
    // Update maintenance mode setting directly in the systemsettings collection
    const result = await db.collection('systemsettings').updateOne(
      { key: 'maintenanceMode' },
      { 
        $set: {
          value: false,
          updatedAt: new Date(),
          updatedBy: new mongoose.Types.ObjectId()
        }
      }
    )

    if (result.matchedCount > 0) {
      console.log('✅ Maintenance mode disabled successfully!')
      console.log('Modified count:', result.modifiedCount)
    } else {
      console.log('❌ Maintenance mode setting not found in database')
      console.log('Creating default maintenance mode setting...')
      
      // Create the setting if it doesn't exist
      await db.collection('systemsettings').insertOne({
        key: 'maintenanceMode',
        value: false,
        description: 'Enable maintenance mode',
        category: 'general',
        type: 'boolean',
        isPublic: true,
        updatedBy: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('✅ Created maintenance mode setting with value: false')
    }

  } catch (error) {
    console.error('Error disabling maintenance mode:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the script
disableMaintenanceMode() 