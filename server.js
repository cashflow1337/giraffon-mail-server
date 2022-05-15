const { execSync } = require('child_process');
try{
    var SMTPServer = require('smtp-server').SMTPServer;
    var parser = require('mailparser').simpleParser;
    var express = require('express');
    var gradient = require('gradient-string');
    var clc = require('cli-color');
    var crypto = require('crypto');
    var axios = require('axios');
}catch{
    console.log('Installing the requirements...');
    execSync('npm install smtp-server');
    execSync('npm install mailparser');
    execSync('npm install express');
    execSync('npm install gradient-string');
    execSync('npm install cli-color');
    execSync('npm install crypto');
    execSync('npm install axios');
    console.log('Done, please restart server.');
    process.exit(1)

}


console.log(gradient.fruit(
    `
    ███╗   ███╗ █████╗ ██╗██╗         ███████╗███████╗██████╗ ██╗   ██╗███████╗██████╗ 
    ████╗ ████║██╔══██╗██║██║         ██╔════╝██╔════╝██╔══██╗██║   ██║██╔════╝██╔══██╗
    ██╔████╔██║███████║██║██║         ███████╗█████╗  ██████╔╝██║   ██║█████╗  ██████╔╝
    ██║╚██╔╝██║██╔══██║██║██║         ╚════██║██╔══╝  ██╔══██╗╚██╗ ██╔╝██╔══╝  ██╔══██╗
    ██║ ╚═╝ ██║██║  ██║██║███████╗    ███████║███████╗██║  ██║ ╚████╔╝ ███████╗██║  ██║
    ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝    ╚══════╝╚══════╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝╚═╝  ╚═╝
                                                                                       
        Created by giraffon25#0001                                            
    `                                            
));

try{
    var config = require('./config.json');
}catch{
    console.log(clc.red("Can't read confile.json."));
    process.exit(1);
}

config_arameters = ["domains_list","webServerPort" ,"smtpServerPort","deleteLinkAfterRead" ,"deleteEmailNotRead","deleteEmailNotReadTimeout" ];
for (i =0;i<config_arameters.length;i++){
    if (config[config_arameters[i]] == undefined){
        console.log(clc.red(config_arameters[i]+" is missing on config file"));
        process.exit(1);
    }
}


received_links = {};
received_links_counts = 0;
domains_list=config["domains_list"];
startTime = new Date() 

;(async () => {
    
    if(config["deleteEmailNotRead"]){
        clean_received_links();
    }
    webserver();
    smtpserver();
    updateTitle();

    console.log(clc.green("Server successful started\n"));
})()



function smtpserver() {
    var app = new SMTPServer({
        onData(stream, session, callback) {
            parser(stream, {}, (err, parsed) => {
                try{
                    email = parsed.to.value[0].address;
                }catch{}
                if(domains_list.includes(email.split("@")[1]) ){
               
                    if(received_links[email] == undefined) {
                        try{
                            value = parsed.textAsHtml;
                            value = value.split('<')[6].split('=')[2].split('"')[0];
                            if (value.endsWith("3D") == false){
                                console.log(clc.red("Error on featching email "+email));
                                stream.on("end", callback);;
                                return;
                            }
                        }catch{
                            stream.on("end", callback);
                            return ;
                        }
                        console.log(clc.green('-> ')+email+" revieced verification link");
                        received_links_counts+=1;
                        received_links[email]={"link":value,"date": new Date() }  ;
                        stream.on("end", callback);
                        return;
                    }
                }else{
                    stream.on("end", callback);
                    return;
                }
                
            })
        },
        disabledCommands: ['AUTH'],
    });
    app.listen(25);
}
function webserver() {
    var app = express();
    app.use('/', function (req, res) {
        var message = `${req.path}`;
        var args = message.split('/');
        if(args[1].length > 0) {
            if(args[1].includes('getToken=')) {
                var message = args[1];
                var args = message.split('getToken=');
                var arguments = args[1].split('@');
                if(arguments[1] === undefined) {
                    res.send('You entered an invalid format.');
                } else {
                    if(domains_list.includes(arguments[1])) {
                        if(received_links[args[1]] != undefined ) {
                            link = received_links[args[1]]["link"]
                            if (config["deleteLinkAfterRead"]){
                                delete  received_links[args[1] ];
                            }
                            res.send(link);
                        } else {
                            res.send('There are currently no active Emails on this account.');
                        }
                    } else {
                        res.send('You entered an invalid email domain.');
                    }
                }
            }
        }else{
            res.send('Please send request to url/getToken=email@exemple.com for receive token.');
        }
    });
    app.listen(80);
}

function clean_received_links(){
    ;(async () => {
        while(true){
            await sleep(1000);
            emails = Object.keys(received_links);
            for (i=0;i< emails.length ;i++){
                if( new Date() - received_links[emails[i] ]["date"]  > config["deleteEmailNotReadTimeout"] ){
                    delete  received_links[emails[i]];
                }
            }
        }
    })()
}

function updateTitle(){
  
    ;(async () => {
        while(true){
            await sleep(1000);
            execSync("TITLE Mail server is running for "+ Math.round((new Date() -startTime)/1000) +"s and received "+received_links_counts+" verification links")
        }
    })()
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}