class Classes 
{

    static async Count(where){
        const db = new DB(this.table);
        return (await db.Query(`SELECT count(*) FROM ${this.table} WHERE ${where}`))[0]["count(*)"];
    }

    static async Get(where, order_by = "", limit = ""){
        const db = new DB(this.table);
        db.Where(where);
        db.OrderBy(order_by);
        db.Limit(limit);

        const data = (await db.Get()).map(x => {
            const obj = {};
            for (const field of this.fields) {
                obj[field] = x[field];
            }
            return obj;
        });

        return data;
    }

    static async GetFirst(where, order_by = "", limit = ""){
        const db = new DB(this.table);
        db.Where(where);
        db.OrderBy(order_by);
        db.Limit(limit);

        const data = (await db.Get()).map(x => {
            const obj = {};
            for (const field of this.fields) {
                obj[field] = x[field];
            }
            return obj;
        });

        return data[0];
    }

    static async Create(data){
        const db = new DB(this.table);

        for(var dado in data){
            if(this.fields.includes(dado))
                db[dado] = data[dado];
        }

        const result = await db.Insert();

        return {
            status: (result) ? 1 : 0,
            data: (result) ? result[0] : null,
            msg: (result) ? "Criado com sucesso!" : "Erro ao criar!"
        };
    }

    static async Update(data, where){
        const db = new DB(this.table);

        for(var dado in data){
            if(this.fields.includes(dado))
                db[dado] = data[dado];
        }

        db.Where(where);

        const result = await db.Update();
        return {
            status: (result) ? 1 : 0,
            data,
            msg: (result) ? "Atualizado com sucesso!" : "Erro ao atualizar!"
        };
    }
    
    static async Delete(where){
        const db = new DB(this.table);
        db.Where(where);

        db.deleted = 1;

        const result = await db.Update();
        return {
            status: (result) ? 1 : 0,
            msg: (result) ? "Excluido com sucesso!" : "Erro ao excluir!"
        };
        
        if(this.fields.includes("deleted")){
            db.deleted = 1;
    
            const result = await db.Update();
            return {
                status: (result) ? 1 : 0,
                msg: (result) ? "Excluido com sucesso!" : "Erro ao excluir!"
            };

        }else{
            const result = await db.Delete();
            return {
                status: (result) ? 1 : 0,
                msg: (result) ? "Excluido com sucesso!" : "Erro ao excluir!"
            };
        }
    }

}

module.exports = Classes;