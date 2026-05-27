import dotenv from "dotenv";
dotenv.config({ path: '/Users/harsh/projects/aileadGenerator/.env', override: false });

export const env = {
    MONGO_URI_PRIMARY:process.env.MONGO_URI_PRIMARY,
}


