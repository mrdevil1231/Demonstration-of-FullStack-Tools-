import express from "express"
import BodyParser from "body-parser"
import pg from "pg"

const app = express();
const port = 4000;

app.use(express.static("public"));
app.use(BodyParser.urlencoded({ extended:true }));

//Define and connect to Database
const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"DB_DemonStration",
    password:"Shubham@16",
    port:"5432"
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

    res.send("Welcome to dashboard dear user");
});

//include the .post link below
app.post("/CheckPwd",async (req,res)=> {


    try {

        if (req.body.rPwd !== req.body.Pwd) {

            throw "Error";

        }

        await db.query("insert into credentials values($1, $2)", [req.body.UName, req.body.Pwd]);

        res.redirect("/login-demo?stats=hide");


    } catch (err) {

        if (err === "Error") {
            res.redirect("/register?msg=Password not matching");
        } else {
            res.redirect("/register?msg=Username Taken Already");
        }


    }
});

app.post("/submit", async (req,res)=>{

    try{
        const result = await db.query("select * from credentials where username=$1",[req.body.UName]);

        console.log(result.rows);
        if(result.rows[0].pwd === req.body.pwd){

            res.redirect("/dashboard");

        }
        else{

            //res.render("loginPage.ejs",{stats:"show"});
            res.redirect("/login-demo?stats=show")

        }

    }catch (err){
        res.redirect("/login-demo?stats=show")
    }

});



//port
app.listen(port);