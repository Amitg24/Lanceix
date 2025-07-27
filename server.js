var express = require("express");
var fileuploader = require("express-fileupload");
var cloudinary = require("cloudinary").v2;
const nodemailer = require('nodemailer');
var mysql2 = require("mysql2");
var fs = require("fs");

var app = express();//app() returns an Object:app
app.use(fileuploader());//for receiving files from client and save on server files


app.listen(2005, function () {
    console.log("Server Started at Port no: 2005")
})

app.use(express.static("public"));

// app.get("/", function (req, resp) {
//     console.log(__dirname);
//     console.log(__filename);

//     let path = __dirname + "/public/index.html";
//     resp.sendFile(path);
// })


// app.get("/server-index", function (req, resp) {
//     //resp.send(req.query);
//     //console.log(req.query.txtEmail,req.query.txtPwd);

//     let email = req.query.txtEmail;
//     let pwd = req.query.txtPwd;


//     //req.query.usertype: is an array
//     let usertype = "";
//     if (Array.isArray(req.query.utype)) {
//         for (i = 0; i < req.query.utype.length; i++) {
//             usertype = usertype + req.query.utype[i] + ",";
//         }
//     }
//     else
//         usertype = req.query.utype;

//     resp.send(email + "<br>" + pwd + "<br>" + usertype);


// })

// =====================================

// app.get("/", function (req, resp) {
//     console.log(__dirname);
//     console.log(__filename);

//     let path = __dirname + "/public/org-details.html";
//     resp.sendFile(path);
// })


// app.get("/server-org-details", function (req, resp) {
//     //resp.send(req.query);
//     //console.log(req.query.txtEmail,req.query.txtPwd);

//     let emailid = req.querytxtEmail2;
//     let orgname = req.query.txtorgn;
//     let regnumber = req.query.txtregis;
//     let address = req.query.txtAddress;
//     let city = req.query.txtCity;
//     let sports = req.query.txtsports;
//     let website = req.query.website;
//     let insta = req.query.insta;
//     let head = req.query.txtOrghead;
//     let contact = req.query.txtcontact;
//     let picurl = req.query.profilepic;
//     let otherinfo = req.query.otherinfo;


//     resp.send(emailid + "<br>" + orgname + "<br>" + regnumber + "<br>" + address + "<br>" + city + "<br>" + sports + "<br>" + website + "<br>" + insta + "<br>" + head + "<br>" + contact + "<br>" + picurl + "<br>" + otherinfo);


// })

app.use(express.urlencoded(true)); //convert POST data to JSON object
cloudinary.config({
    cloud_name: 'dkmiducaq',
    api_key: '411247267338173',
    api_secret: 'FIEVYECZ7Zayqw7iXpxdujXgkO4' // Click 'View API Keys' above to copy your API secret
});


//--------------------------------AIven started---------------------------
let dbConfig = "mysql://avnadmin:AVNS_CtVIyN6ZiTWptC6M3hz@mysql-3fbd0973-garg2422005-55f2.c.aivencloud.com:15829/sports_project";

let mySqlVen = mysql2.createConnection(dbConfig);
mySqlVen.connect(function (errKuch) {
    if (errKuch == null)
        console.log("AiVen Connected Successfulllyyy!!!!");
    else
        console.log(errKuch.message)
})

app.get("/get-Signup", function (req, resp) {

    let emailid = req.query.txtEmail;
    let regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let regexpwd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}/;

    let pwd = req.query.txtPwd;
    let utype = req.query.utype;

    if (emailid != "" && pwd != "" && (utype == "Player" || utype == "Organizer")) {
        if (regex.test(emailid) == true && regexpwd.test(pwd) == true && (utype == "Player" || utype == "Organizer")) {
            mySqlVen.query("insert into users values(?,?,?,current_date(),1)", [emailid, pwd, utype], function (errKuch, allRecords) {
                if (errKuch == null) {
                resp.send(allRecords[0].utype);
                }
                else
                    resp.send(err);
            })
        }
        else {
            resp.send("Fill Valid Details");

        }
    }
    else
        resp.send("Invalid");

})
app.get("/do-Login", function (req, resp) {

    let emailid = req.query.txtEmail1;
    let pwd = req.query.txtPwd1;



    mySqlVen.query("select * from users where emailid=? and password=?", [emailid, pwd], function (err, allRecords) {
        console.log(allRecords);
        if (allRecords.length == 0) {
            resp.send("Invalid");
        }
        else {

            if (allRecords[0].status == 0) {
                resp.send("Blocked");
            }
            else
                resp.send(allRecords[0].utype);

        }

    })
})
// ================================================
// check email for signup
app.get("/chk-email", function (req, resp) {
    let regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    let email = req.query.txtEmail;

    mySqlVen.query("select * from users where emailid=?", [email], function (err, allRecords) {
        if (allRecords.length == 0 && regex.test(email) == true)
            resp.send("Valid");
        else
            resp.send("Invalid Email ID");
    })
})
// -------------------------------------------
// chk email for login
app.get("/chk-email-login", function (req, resp) {
    let email = req.query.txtEmail1;

    mySqlVen.query("select * from users where emailid=?", [email], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("Invalid");
        else {
            resp.send(allRecords[0].utype);
        }
    })
})

// // // chk pwd for login
app.get("/chk-pwd-login", function (req, resp) {
    let email = req.query.txtEmail1;
    let pwd = req.query.txtPwd1;
    mySqlVen.query("select * from users where emailid=?", [email], function (err, allRecords) {
        console.log(pwd)
        if (pwd == allRecords[0].password)
            resp.send("valid");
        else
            resp.send("Invalid pwd");
    })
})
// =======================================----------------------------------
// organization page
// submit
app.post("/server-org-details", async function (req, resp) {
    let picurl = "";
    if (req.files != null) {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server
            ;
        });
    }
    else
        picurl = "nopic.jpg";


    let emailid = req.body.txtEmail2;
    let orgname = req.body.txtorgn;
    let regnumber = req.body.txtregis;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;
    let sports = req.body.txtsports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.txtOrghead;
    let contact = req.body.txtcontact;
    let otherinfo = req.body.otherinfo;



    mySqlVen.query("insert into organizers values(?,?,?,?,?,?,?,?,?,?,?,?)", [emailid, orgname, regnumber, address, city, sports, website, insta, head, contact, picurl, otherinfo], function (errKuch, allRecords) {
        if (errKuch == null) {

            resp.send("Send Successfully");
        }

        else
            resp.send(errKuch)
    })


    // search. througgh ajax

})
app.get("/get-search", function (req, resp) {
    mySqlVen.query("select * from organizers where emailid=?", [req.query.txtEmail2], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("No Record Found");
        else
            resp.json(allRecords);
    })
})
// -----------------------------------
// chk email organizer DETAILS
app.get("/chk-email-org", function (req, resp) {
    let email = req.query.txtEmail2;

    mySqlVen.query("select * from users where emailid=? ", [email], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("Invalid");
        else {
            if (allRecords[0].utype == "Player")
                resp.send("Invalid");
            else
                resp.send("Valid")

        }
    })
})
// =============================
// modification FOR ORG DETAILS
app.post("/modify-details", async function (req, resp) {
    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = "nopic.jpg";


    let emailid = req.body.txtEmail2;
    let orgname = req.body.txtorgn;
    let regnumber = req.body.txtregis;
    let address = req.body.txtAddress;
    let city = req.body.txtCity;
    let sports = req.body.txtsports;
    let website = req.body.website;
    let insta = req.body.insta;
    let head = req.body.txtOrghead;
    let contact = req.body.txtcontact;
    let otherinfo = req.body.otherinfo;



    if (picurl == "nopic.jpg" || picurl == null) {
        mySqlVen.query("update organizers set orgname=?, regnumber=?, address=?, city=?, sports=?, website=?, insta=?, head=?, contact=?,  otherinfo=?  where emailid=?", [orgname, regnumber, address, city, sports, website, insta, head, contact, otherinfo, emailid], function (errKuch, result) {
            if (errKuch == null) {

                if (result.affectedRows == 0) {
                    resp.send(emailid + " updated Successfulllyyyy...");
                }

                else
                    resp.send("Invalid Email id");
            }
            else
                resp.send(errKuch);



        })
    }
    else {
        mySqlVen.query("update organizers set orgname=?, regnumber=?, address=?, city=?, sports=?, website=?, insta=?, head=?, contact=?, picurl=?, otherinfo=?  where emailid=?", [orgname, regnumber, address, city, sports, website, insta, head, contact, picurl, otherinfo, emailid], function (errKuch, result) {
            if (errKuch == null) {

                if (result.affectedRows == 0) {
                    resp.send(emailid + " updated Successfulllyyyy...");
                }

                else
                    resp.send("Invalid Email id");
            }
            else
                resp.send(errKuch);



        })
    }
})

// ---------------------------------------------
// ===========================================================
// chk email POST tournament 
app.get("/chk-email-tour", function (req, resp) {
    let email = req.query.txtEmail3;

    mySqlVen.query("select * from organizers where emailid=?", [email], function (err, allRecords) {
        if (allRecords.length == 0)
            resp.send("Invalid");
        else
            resp.send("Valid");
    })
})

// --------------------------------------------
// POST tournament 
app.get("/get-to-server", function (req, resp) {

    let email = req.query.txtEmail3;
    let event = req.query.Event;
    let doe = req.query.date;
    let toe = req.query.Time;
    let address = req.query.txtAddress;
    let city = req.query.city;
    let sports = req.query.sports;
    let minage = req.query.min;
    let maxage = req.query.max;
    let lastdate = req.query.lastdate;
    let fee = req.query.Fee;
    let prize = req.query.pmoney;
    let contact = req.query.txtcontact;




    mySqlVen.query("insert into tournament values(null,?,?,?,?,?,?,?,?,?,?,?,?,?)", [email, event, doe, toe, address, city, sports, minage, maxage, lastdate, fee, prize, contact], function (errKuch, allRecords) {
        if (errKuch == null) {
            resp.send("Publish successfully");
        }
        else
            resp.send(errKuch.message)
    })
})
// ==============================================================================
// ======================================================
// angular js for tournament mangement
// 

app.get("/do-fetch-all-tournament", function (req, resp) {

    let emailid = req.query.emai;
    mySqlVen.query("select * from tournament where emailid=?", [emailid], function (err, allRecords) {
        console.log(allRecords)
        resp.send(allRecords);
    })
})


app.get("/delete-one", function (req, resp) {
    console.log(req.query)

    const rid = req.query.rid;

    mySqlVen.query("delete from tournament where rid=?", [rid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(rid + " Deleted Successfulllyyyy...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})
// ----------------------------------------
// BLOCK OR RESUME BUTTONS
app.get("/resume-one", function (req, resp) {
    console.log(req.query)

    let emailid = req.query.emailid;

    mySqlVen.query("UPDATE users SET status = 1 WHERE emailid =?", [emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + " Resumed Successfulllyyyy...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})
app.get("/block-one", function (req, resp) {
    console.log(req.query)

    let emailid = req.query.emailid;

    mySqlVen.query("UPDATE users SET status = 0 WHERE emailid =?", [emailid], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(emailid + "  Blocked Successfulllyyyy...");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);

    })
})

// =====================================================================================================================
// =================================================================================================================
// GEMINI AI IN PROFILE PLAYER FOR AADHAR CARD
// ALSO CODE FOR PROFILE PLAYER HTML
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyDfrrNJapZZOrGPQR-I6tSwqQutOUjNEQ0");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
// app.get("/aadharuseai", function (req, resp) {

//     // resp.sendFile();
//     let dirName = __dirname;//Global Variable for path of current directory
//     //let filename=__filename;
//     //resp.send(dirName+"  <br>     "+filename);
//     let fullpath = dirName + "/public/profilr-player.html";
//     resp.sendFile(fullpath);
// })

// app.post("/abc", async function (req, resp) {
//     console.log(req.body);
//     let txt = req.body.txtttt;

//     let prompt=txt + " Give response in JSON object with key message"

//     const result = await model.generateContent(prompt);

//     resp.send(result.response.text());

// })

//--------------------------------------------------------

async function RajeshBansalKaChirag(imgurl) {
    const myprompt = "Read the text on picture and tell all the information in adhaar card and give output STRICTLY in JSON format {adhaar_number:'', name:'', gender:'', dob: ''}. Dont give output as string.and also fix dob according to date datatype in mysql"
    const imageResp = await fetch(imgurl)
        .then((response) => response.arrayBuffer());

    const result = await model.generateContent([
        {
            inlineData: {
                data: Buffer.from(imageResp).toString("base64"),
                mimeType: "image/jpeg",
            },
        },
        myprompt,
    ]);
    console.log(result.response.text())

    const cleaned = result.response.text().replace(/```json|```/g, '').trim();
    const jsonData = JSON.parse(cleaned);
    console.log(jsonData);

    return jsonData

}

app.post("/server-profile", async function (req, resp) {
    // for profile pic first
    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = "nopic.jpg";

    // for aadhar card pic 
    let fileName;
    let aadhar = "";
    if (req.files != null) {
        //const myprompt = "Read the text on picture and tell all the information";
        //  const myprompt = "Read the text on picture in JSON format";
        fileName = req.files.aadhar.name;
        let locationToSave = __dirname + "/public/uploads/" + fileName;//full ile path

        req.files.aadhar.mv(locationToSave);//saving file in uploads folder

        //saving ur file/pic on cloudinary server
        try {
            await cloudinary.uploader.upload(locationToSave).then(async function (aadharResult) {
                aadhar = aadharResult.url;

                let jsonData = await RajeshBansalKaChirag(aadharResult.url);

                let emailid = req.body.txtEmail5;
                let acardpicurl = aadhar;
                let profilepicurl = picurl;
                let name = jsonData.name;
                let dob = jsonData.dob;
                let gender = jsonData.gender;
                let address = req.body.address;
                let contact = req.body.contact;
                let game = req.body.game;
                let otherinfo = req.body.info;
                mySqlVen.query("insert into players values(?,?,?,?,?,?,?,?,?,?)", [emailid, acardpicurl, profilepicurl, name, dob, gender, address, contact, game, otherinfo], function (errKuch, allRecords) {
                    if (errKuch == null)
                        resp.send("Send Successfully");
                    else
                        resp.send(errKuch.message);
                })

            });

            //var respp=await run("https://res.cloudinary.com/dfyxjh3ff/image/upload/v1747073555/ed7qdfnr6hez2dxoqxzf.jpg", myprompt);
            // resp.send(respp);
            // console.log(typeof(respp));
        }
        catch (err) {
            resp.send(err.message)
        }

    }
})
// ---------------------------------------------------------------------------------------________--------------------------------------
app.get("/get-data", function (req, resp) {

    mySqlVen.query("select * from players where emailid=?", [req.query.txtEmail5], function (err, allRecords) {
        if (err) {
            resp.send(err.message);
        }
        else {
            if (allRecords.length == 0)
                resp.send("No Record Found");
            else
                resp.json(allRecords);
        }
    })
})
// -----------------------------------
// // chk email PLAYER PROFILE
// app.get("/chk-email-pro", function (req, resp) {
//     let email = req.query.txtEmail5;

//     mySqlVen.query("select * from users where emailid=? ", [email], function (err, allRecords) {
//         if (allRecords.length == 0)
//             resp.send("Invalid");
//         else {
//             if (allRecords[0].utype == "Organizer")
//                 resp.send("Invalid");
//             else
//                 resp.send("Valid")

//         }
//     })
// })
// __________________________________________________________________________________________________________________________________________________________
app.post("/Modify-profile", async function (req, resp) {
    let picurl = "";
    if (req.files != null) //user wants to Update Profile Pic
    {
        let fName = req.files.profilePic.name;
        let fullPath = __dirname + "/public/uploads/" + fName;
        req.files.profilePic.mv(fullPath);

        await cloudinary.uploader.upload(fullPath).then(function (picUrlResult) {
            picurl = picUrlResult.url;   //will give u the url of ur pic on cloudinary server

            console.log(picurl);
        });
    }
    else
        picurl = "nopic.jpg";

 

    let emailid = req.body.txtEmail5;
    let profilepicurl = picurl;

    let address = req.body.address;
    let contact = req.body.contact;
    let game = req.body.game;
    let otherinfo = req.body.info;




    if ((picurl == "nopic.jpg" || picurl == null)) {
        mySqlVen.query("update players set address=? , contact=?, game=?, otherinfo=?  where emailid=?", [address, contact, game, otherinfo, emailid], function (errKuch, result) {
            if (errKuch == null) {

                if (result.affectedRows > 0) {
                    resp.send(emailid + " updated Successfulllyyyy...");
                }

                else
                    resp.send("Invalid Email id");
            }
            else
                resp.send(errKuch);

        })
    }
    else {
        mySqlVen.query("update players set profilepicurl=?, address=? , contact=?, game=?, otherinfo=?  where emailid=?", [profilepicurl, address, contact, game, otherinfo, emailid], function (errKuch, result) {
            if (errKuch == null) {

                if (result.affectedRows > 0) {
                    resp.send(emailid + " updated Successfulllyyyy...");
                }

                else
                    resp.send("Invalid Email id");
            }
            else
                resp.send(errKuch);



        })
    }
})

// =================================================================================================================
// ============================================================================================================
//   ////////////////////////////=====================  ADMINS USERS CONSOLE HTML

app.get("/do-fetch-all-users", function (req, resp) {


    mySqlVen.query("select * from users", function (err, allRecords) {
        console.log(allRecords)
        resp.send(allRecords);
    })
})
// ================================================================================================================================
// ===========ORGANIZERS SHOW ALL RECORDS
app.get("/do-fetch-all-organizers", function (req, resp) {


    mySqlVen.query("select * from organizers", function (err, allRecords) {
        console.log(allRecords)
        resp.send(allRecords);
    })
})
// ================================================================================================================================
// ===========PLAYERS SHOW ALL RECORDS
app.get("/do-fetch-all-players", function (req, resp) {
    mySqlVen.query("select * from players", function (err, allRecords) {
        console.log(allRecords)
        resp.send(allRecords);
    })
})
// =====================================================================================================================================
// -----------------------
// =====================================================================================================================================
app.get("/do-fetch-tournament", function (req, resp) {
    mySqlVen.query("select * from tournament where city=? and sports=?", [req.query.kuchCity, req.query.kuchGame], function (err, allRecords) {
        console.log(allRecords)
        if (err == null)
            resp.send(allRecords);
        else
            resp.send(err.message);
    })

})
app.get("/do-fetch-all-cities", function (req, resp) {
    mySqlVen.query("select distinct city from tournament", function (err, allRecords) {
        resp.send(allRecords);
    })
})
app.get("/do-fetch-all-sports", function (req, resp) {
    mySqlVen.query("select distinct sports from tournament", function (err, allRecords) {
        if (err == null)
            resp.send(allRecords);
        else
            resp.send(err.message);
    })
})





// =======================
// ============================================================
app.get("/do-settings", function (req, resp) {
    let npwd = req.query.newpwd;;
    let opwd = req.query.oldpwd;
    let email = req.query.emailid;
    console.log(email);
    console.log(npwd);
    console.log(opwd);
    mySqlVen.query("update users set password=? where emailid=? and password=?", [npwd, email, opwd], function (errKuch, result) {
        if (errKuch == null) {
            if (result.affectedRows == 1)
                resp.send(" Passsword updated successfully");
            else
                resp.send("Invalid Email id");
        }
        else
            resp.send(errKuch);
    })
})
// ================================================================================================


