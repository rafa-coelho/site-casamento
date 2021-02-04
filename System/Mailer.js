class Mailer{
    constructor(host = process.env.MAIL_HOST, 
                port = process.env.MAIL_PORT, 
                user = process.env.MAIL_USER,
                pass = process.env.MAIL_PASS,
                from = process.env.MAIL_FROM){
        
        const nodemailer = require('nodemailer');
        this.transporter = nodemailer.createTransport({
            name: "outlook",
            host: host,
            port: port,
            secure: false,
            auth: {
                user: user,
                pass: pass
            },
            tls: { rejectUnauthorized: false }
        });

        this.from = from;
    }
    
    async Send(){
        return new Promise((resolve, reject) => {
            var obrigatorios = [ "to", "subject", "message" ];
            var errors = [];
    
            obrigatorios.forEach(campo => {
                if(!(this[campo])){
                    errors.push({
                        status: 0,
                        msg: "O campo '" + campo + "' precisa ser definido!"
                    });
                }
            });
            
            if(errors.length > 0){
                reject({
                    errors: errors,
                    status: 0
                });
                return;
            }
    
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject: this.subject,
                html: this.message
            };
            this.transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    resolve(error);
                } else {
                    resolve(info);
                }
            });
        })

    }


    static Boleto(convidado, link){
        let mail = '';
        mail += `<html>`;
        mail += `   <body style="width:600px; height: 100%; margin:0; padding:10;font-family:Circular, Helvetica, Arial, sans-serif; position: absolute; top: 0; bottom: 0; left: 0; right: 0; margin: auto;">`;
        mail += `       <div style="width:100%; height:80px; background-color:#3C8DBC; line-height: 80px; text-align: center;">`;
        mail += `           <span style="color:white;font-size:1.5em"> <b>R&A</b></span>`;
        mail += `       </div>`;
        mail += `       <div style="width:100%; height: 300px;margin-top:1em">`;
        mail += `           <div style="width: 80%; height: 200px; background-color:white; text-align: center; padding: 25px 10%">`;
        mail += `               <h2 style="border:none;margin:0px;padding:0px;text-decoration:none;color:rgb(0, 0, 0);font-size:1.5em;font-weight:bold;line-height:45px;letter-spacing:-0.04em;text-align:center;">Olá, ${convidado.nome}!</h2>`;
        mail += `               <p style="font-size: 1.5em;"> Muito obrigado pelo seu presente! ♥ </p>`;
        mail += `               <p style="font-size: 1.5em;"> Para acessar o seu boleto, basta clicar neste link: <a href="${link}">Clique aqui</a> </p>`;
        mail += `           </div>`;
        mail += `           <div style="max-width:100%; min-height: 30px; background-color: #F7F7F7; padding: 5px 0 5px 20px">`;
        mail += `               <p style="color: #88898C; font-size: 1em;">R&A</p>`;
        mail += `               <p><small style="color: #ddd;">by LeadThis - 2021${(new Date().getFullYear() !== "2021" ? "-" + new Date().getFullYear() : "")}</small></p>`;
        mail += `           </div>`;
        mail += `       </div>`;
        mail += `   </body>`;
        mail += `</html>`;
        return mail;
    }

}

module.exports = Mailer;