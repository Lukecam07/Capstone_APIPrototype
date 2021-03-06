// Inital server setup
// ----------------------------------------------------------------------------
import * as express from "express";
import * as http from "http";
const app = express();
export const App = app;
const server = http.createServer(app);
const io = require("socket.io")(server);
export const Server = server;

// Dependencies
// ----------------------------------------------------------------------------
import * as mongoose from "mongoose";
// import * as passport from "passport";
// export const Passport = passport;

// Utilities
// ----------------------------------------------------------------------------
import * as compression from "compression";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as errorHandler from "errorhandler";
import * as logger from "morgan";
import * as fs from "fs";
import * as lusca from "lusca";
// import * as mongo from "connect-mongo";
import * as path from "path";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';

// MongooseDB
// ----------------------------------------------------------------------------
import { MongoDBConfig } from "./config/autentication.config"
// 
const mongoURL = "mongodb://" + MongoDBConfig.username + ":" + MongoDBConfig.password + "@" + MongoDBConfig.host + ":27017/synlern?authSource=admin";
console.log("MongoDB connecting too: " + mongoURL);
mongoose.connect(mongoURL, { useNewUrlParser: true });
// mongoose.set('debug', true); // turn on debug
mongoose.connection.on("error", (error) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running.");
    if (error) console.log("Mongo Error: " + error);
    process.exit();
});
mongoose.set('useFindAndModify', false);

// Server Configuration
// ----------------------------------------------------------------------------
app.set("port", process.env.PORT || 3000);

// Static content delivery compression
app.use(compression());

// URL/URI and HTTP content decoding and parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb'}));

// Cookie content decoding and parsing
import { AuthenticationConfig } from "./config/autentication.config";
app.use(cookieParser(AuthenticationConfig.cookieSecret));

// Allows CORS
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

// Pretty prints in console
app.use(errorHandler());
app.use(logger("dev"));

// Static content
app.use(express.static(path.join(__dirname, "./../../client/dist")));
app.use(express.static(path.join(__dirname, "./../public/")));

// Prod vs Dev code and display
if (app.get("env") === "production") {
    app.set("trust proxy", 1); // trust first proxy
} else {
    app.locals.pretty = true;
}

// Setting up the routes for the rest of the application
import routes from "./controllers/routes";
app.use("/", routes);

// Setting up GraphQL
import graphRoutes from "./controllers/graphql";
app.use("/", graphRoutes);

app.get("/public/bgImage.jpeg", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "./../public/serveimageA2.jpeg"));
});
app.get("/public/favicon.png", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "./../public/favicon.png"));
});

// The last route run
import { Request, Response } from "express";
app.get("/**/", (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, "./../../client/dist/index.html"));
});


