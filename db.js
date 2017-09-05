var mysql = require('mysql');
var con = mysql.createConnection({
    host:"192.168.0.36",
    port: 3306,
    user:"sb",
    password:"sb",
    database: "web"
});

con.connect(function(err){
    if(err) throw  err;
    console.log("db connected");
})

module.exports.con = con;