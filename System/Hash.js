class Hash {
    static generateId() {
        const { v1: uuid } = require('uuid');
        return uuid();
    }

    static async xml2json(xml) {
        var parseString = require('xml2js').parseString;
        return new Promise((resolve, reject) => {
            parseString(xml, function(err, json) {
                if (err)
                    reject(err);
                else
                    resolve(json);
            });

        });
    }
}

module.exports = Hash;