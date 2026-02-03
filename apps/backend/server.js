import app from "./app.js";
import { sequelize } from "./models/index.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connection established successfully.");

        // In development, you might want to sync models
        await sequelize.sync({ alter: true });
        console.log("✅ Database models synchronized.");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Unable to connect to the database:", error);
        process.exit(1);
    }
};

startServer();
