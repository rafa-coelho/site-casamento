const Twilio = async function (body, to = process.env.TW_TO_DEFAULT){
    const accountSid = process.env.TW_SID;
    const authToken = process.env.TW_TKN;
    const from = process.env.TW_FROM;

    const client = require('twilio')(accountSid, authToken);
    
    try{
        const req = await client.messages.create({
            body: body,
            from: 'whatsapp:' + from,
            to: 'whatsapp:+55' + to
        });

        return req.sid;
    }catch(e){
        console.log(e);
        return null;
    }
};

module.exports = Twilio;