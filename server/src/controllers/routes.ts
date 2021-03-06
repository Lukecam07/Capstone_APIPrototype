import { Router, Request, Response, NextFunction } from "express";
import * as fs from "fs";
import * as path from "path";
import { AuthenticationController } from "./authentication";
import { UserModel, CourseModel } from "./../database"
const routes = Router();

routes.post("/", (req: Request, res: Response) => {
    res.json({ message: "API is active"});
});

import {scrape} from './../controllers/scraper';
routes.get("/api/", authenticateConnection, function(req: Request, res: Response) {
    const data = req.body;
    if(data.auth.accessLevel === "ADMIN") {
        //scrape.scrapeWholeAPI();
        res.json({
            message: "Scraping Database."
        });
    } else {
        res.status(401).json({ status: 'Access Denied, Invalid Access'});
    }
});


import {ContentController} from './ContentBuilder';
routes.post("/coursebuilder/", authenticateConnection, async function(req: Request, res: Response) {
    const data = req.body;
    if(data.auth.accessLevel === "ADMIN") {
        console.log(data);
        const response = await ContentController.BuildCourse(data.coursename, data.nodes, data.data, data.quizzes, data.images, data.ids);
        if (typeof(response) == "object") {
            res.end(res.json(response._id));
        } else {
            res.end("" + response);
        }
    } else {
        res.status(401).json({ status: 'Access Denied, Invalid Access'});
    }
});


routes.post("/pagebuilder/", authenticateConnection, async function(req: Request, res: Response) {
    const data = req.body;
    if(data.auth.accessLevel === "ADMIN") {
        const response = await ContentController.BuildPage(data.text, data.images, data.ids, data.id);
        if(response == -1) {
            res.end("-1");
        } else {
            res.end();
        }
    } else {
        res.status(401).json({ status: 'Access Denied, Invalid Access'});
    }
})

routes.get("/logout/", function(req: Request, res: Response) {
    res.cookie("jwt", "", { signed: true })
    res.cookie("username", "", { maxAge: Date.now()})
    res.cookie("accessLevel", "", { maxAge: Date.now() })
    res.cookie("id", "", { maxAge: Date.now() });
    res.redirect('/');
});

routes.post("/auth/verifyUser/", function(req: Request, res: Response){
    const username = req.body["username"] || "";
    const password = req.body["password"] || "";
    console.log("[Routes:Auth] Req: " + JSON.stringify(req.body));
    console.log("[Routes:Auth] VerifyUser | Username: " + username + ", Password: " + password);
    AuthenticationController.authenticateUsernamePassword(username, password, (isValid: boolean, user: UserModel) => {
        console.log("[Routes:Auth] isValid: " + isValid + ", user: " + user || "");
        if(isValid) {
            // Return with a JWT token, set cookies too
            const token = AuthenticationController.generateJWT(user.username, user.accessLevel, user.id);
            const auth = AuthenticationController.authenticateJWT(token);
            // Set all JWT cookies
            res.cookie("jwt", token, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30), signed: true });
            res.cookie("username", user.username, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) });
            res.cookie("accessLevel", user.accessLevel, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) });
            res.cookie("id", user.id, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) });
            // Return success
            res.json({
                isValid: true,
                status: "Success",
                token,
                tokenInformation: auth,
                time: Date.now()
            })
        } else {
            // Wipe jwt cookie for user, just incase its malicious attempts
            res.cookie("jwt", "", { signed: true })
            res.cookie("username", "", { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
            res.cookie("accessLevel", "", { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
            res.cookie("id", "", { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) });
            // Return failure
            res.json({
                isValid: false,
                status: "Failure",
                time: Date.now()
            })
        }
    })
});

routes.post("/auth/verifyToken/", function(req: Request, res: Response){
    const token = req.signedCookies["jwt"];
    if(!token && token != undefined && token != null) {
        res.json({
            isValid: false,
            status: "Failure, no JWT cookie present!",
            time: Date.now()
        })
        return;
    }
    const auth = AuthenticationController.authenticateJWT(token);
    if(auth.valid) {
        // Generate a new cookie for the user
        const token = AuthenticationController.generateJWT(auth.username, auth.accessLevel, auth.userID);
        res.cookie("jwt", token, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30), signed: true })
        res.cookie("username", auth.username, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.cookie("accessLevel", auth.accessLevel, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.cookie("id", auth.userID, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) });
        res.json({
            isValid: true,
            status: "Success",
            token,
            tokenInformation: auth,
            time: Date.now()
        })
    } else {
        // Wipe jwt cookie for user, just incase its malicious attempts
        res.cookie("jwt", "", { httpOnly: true, signed: true })
        res.cookie("username", "", { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.cookie("accessLevel", "", { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.cookie("id", "", { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.json({
            isValid: false,
            status: "Failure",
            time: Date.now()
        })
    }
});

routes.post("/auth/users/create", function(req: Request, res: Response){
    const username = req.body.username || "";
    const password = req.body.password || "";
    const accessLevel = req.body.accessLevel || "";

    const id = AuthenticationController.createUser(username, password, accessLevel);
    setTimeout(() => {
        const token = AuthenticationController.generateJWT(username, accessLevel, id);
        const auth = AuthenticationController.authenticateJWT(token);
        res.cookie("jwt", token, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30), signed: true })
        res.cookie("username", auth.username, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.cookie("accessLevel", auth.accessLevel, { maxAge: AuthenticationController.DaysFromNowInMilliseconds(30) })
        res.json({
            isValid: true,
            status: "Success",
            token,
            tokenInformation: auth,
            time: Date.now()
        })
    }, 1000);
});


routes.post("/graph/", authenticateConnection, function(req: Request, res: Response) {
    console.log("[Routes] API Triggered: MassiveGraphDefFile");
    fs.readFile(path.join(__dirname, "./../../../graph.json"), (err, buff: Buffer) => {
        res.json(JSON.parse(buff.toString())); // Rehydrate the JSON and send to client
    })
})

export default routes;


function authenticateConnection (req: Request, res: Response, next: NextFunction) {
    const token = req.signedCookies["jwt"];
    const auth = AuthenticationController.authenticateJWT(token);
    if(auth.valid) {
        req.body = {...req.body, auth: auth};
        next();
    } else {
        res.status(401).json({ status: 'Access Denied, Invalid JWT Token'});
    }
}