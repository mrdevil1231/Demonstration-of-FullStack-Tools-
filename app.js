import express from "express"
import BodyParser from "body-parser"
import bcrypt from "bcrypt"
import pg from "pg"
import sessions from "express-session"
import passport from "passport"
import { Strategy } from "passport-local"
import env from "dotenv"


const app = express();
const port = 4000;
const saltRounds = 10;
env.config();

app.use(express.static("public"));
app.use(BodyParser.urlencoded({ extended:true }));

app.use(sessions({

    secret: process.env.session_secret,
    resave: false,
    saveUninitialized: true,

    cookie: {
        maxAge: 1000 * 60
    }

}));

app.use(passport.initialize());
app.use(passport.session());



//Define and connect to Database
const db = new pg.Client({
    user:process.env.DB_user,
    host:process.env.DB_localhost,
    database:process.env.DB_database,
    password:process.env.DB_password,
    port:process.env.DB_port
});

db.connect();

/*include the .get reference link for pages below*/
app.get("/", (req,res)=>{

    res.render("main.ejs");

});
app.get("/login-demo",(req,res)=>{

    res.render("loginPage.ejs",{stat: req.query.stats});
});
app.get("/api-demo",(req,res)=>{

    res.render("blog.ejs", { pagetype: "API DemonStration" });
});

app.get("/register", (req,res)=>{

    res.render("SignIn.ejs",{message:req.query.msg});
});

app.get("/dashboard",(req,res)=>{

    if(req.isAuthenticated()) {
        res.send("Welcome to dashboard dear user");
    }
    else{

        res.redirect("/login-demo?stats=hide")
    }

});


//include the .post link below
app.post("/CheckPwd",(req,res)=> {


    bcrypt.hash(req.body.Pwd, saltRounds, async (err, hash) => {

        try {
            if (err) {
                console.log("Error Occured while Hashing During Registration");
            }
            else{
                const rt = await db.query("insert into credentials values($1, $2) returning *", [req.body.UName, hash]);

                req.login(rt.rows[0],(err)=>{
                    res.redirect("/dashboard");
                });

            }

        } catch (err) {

            res.redirect("/register?msg=Username Taken Already");

        }
    });
});

app.post("/submit", passport.authenticate("local",{
    successRedirect: "/dashboard",
    failureRedirect: "/login-demo?stats=show",
}));

//Registering Passport Strategy
passport.use( new Strategy({
    usernameField: "UName",
    passwordField: "pwd",
},async function verify(UName,pwd,cb) {

    try{
        const cred = await db.query("select * from credentials where username=$1",[UName]);

        console.log(cred.rows);

        bcrypt.compare(pwd,cred.rows[0].pwd,(err,result)=>{
            if(err){
                console.log("Error during comparing password in login");
            }
            else if(result){
                return cb(null,cred.rows[0]);
            }
            else{
                return cb(null,false);
            }

        });

    }catch (err){
        return cb(null,false);
    }

}));


passport.serializeUser((user,cb) =>{ cb(null,user) } );

passport.deserializeUser((user,cb)=>{ cb(null,user) } );

//port
app.listen(port);