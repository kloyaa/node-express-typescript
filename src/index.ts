require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import cors from 'cors';
import useragent from 'express-useragent';
import { getAwsSecrets } from "./__core/utils";
import authController from "./auth/auth.controller";
import securityController from "./security/security.controller";
import { HandlePromise } from "./__core/service";

const app = express();
  
async function runApp() {
    const secrets = await HandlePromise<any>(getAwsSecrets());
    let port = Number(process.env.PORT);
    let connectionString = process.env.CONNECTION_STRING!

    if(process.env.NODE_ENV === "production") {
        port = secrets?.PORT!;
        connectionString = secrets?.DB_CONNECTION_STRING!;
    }

    mongoose
        .set("strictQuery", false)
        .set("strictPopulate", false)
        .connect(connectionString)
        .then(() => console.log("DATABASE CONNECTED"))
        .catch(() => console.log("DABASE DISCONNECTED"));

    /**  
     * @description Middlewares  
     */
    app.use(cors({ origin: "*" }));
    app.use(useragent.express());
    app.use(express.json());
    app.use(express.urlencoded({ limit: '25mb', extended: true }));
    
    /**  
     * @description Routes 
     */
    app.get('/', (req, res) => res.send('Express Typescript on Vercel'));
    app.use("/api/v1", authController);
    app.use("/api/v1", securityController);

    app.listen(port, () => {
        console.log(`RUNNING ON ${process.env.NODE_ENV}`)
        console.log(`RUNNING ON ${port}`)
    });

}

runApp();