const database = require('../database');

class DB
{
    constructor(table){

        this.table = table;
    }

    Where(where){
        this.where = where;
    }

    Limit(limit){
        this._limit = limit;
    }
    
    
    async Get(){
        const where = (this.where != "" && this.where != undefined) ? `(${this.where}) AND deleted = 0` : "deleted = 0";
        const order_by = (this.order_by) ? this.order_by : "id desc";
        let limit = (this._limit) ? this._limit : 1000000;
        let offset = (this._offset) ? this._offset : 0;

        
        if(limit){
            if(limit.toString().indexOf(',') >= 0){
                offset = limit.split(',')[0].replace(/\D+/g, '')
                limit = limit.split(',')[1].replace(/\D+/g, '')
            }
        }

        const data = await database(this.table)
            .whereRaw(where)
            .orderByRaw(order_by)
            .limit(limit)
            .offset(offset);

        return data;
    }
    
    async Insert(){
        const obj = {};

        for (const param in this) {
            if (this.hasOwnProperty(param)) {
                const ignore = [ "table", "where", "db" ];

                const field = this[param];
                if(typeof(field) == "function" || ignore.includes(param))
                    continue;
                
                obj[param] = field;
            }
        }

        return await database(this.table).insert(obj);
    }
    
    async Update(callback){
        const where = (this.where != "" && this.where != undefined) ? `(${this.where}) AND deleted = 0` : "deleted = 0";

        const obj = {};

        for (const param in this) {
            if (this.hasOwnProperty(param)) {
                const ignore = [ "table", "where", "db" ];

                const field = this[param];
                if(typeof(field) == "function" || ignore.includes(param))
                    continue;
                
                obj[param] = field;
            }
        }

        return await database(this.table)
            .whereRaw(where)
            .update(obj);
    }
    
    async Delete(){
        const where = (this.where != "" && this.where != undefined) ? `(${this.where}) AND deleted = 0` : "deleted = 0";

        return await database(this.table)
            .whereRaw(where)
            .del();
    }

    OrderBy(order_by){
        this.order_by = order_by;
    }

    async Query(query){
        return await database.raw(query);
    }

}


module.exports = DB;