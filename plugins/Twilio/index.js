const Twilio = async function (body, to){
    const accountSid = process.env.TW_SID;
    const authToken = process.env.TW_TKN;
    const from = process.env.TW_FROM;

    const client = require('twilio')(accountSid, authToken);
    const toNumber = process.env.NODE_ENV === 'prod' ? to : process.env.TW_TO_DEFAULT;

    try{
        const req = await client.messages.create({
            body: body,
            from: 'whatsapp:' + from,
            to: 'whatsapp:+55' + toNumber
        });
        return req.sid;
    }catch(e){
        console.log(e);
        return null;
    }
};

module.exports = Twilio;