/* UUID */
const uuidv4 = require('uuid/v4');

/* Mysql */
const mysql = require('mysql');
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '123456',
    database: 'laundry'
});
connection.connect(function(err) {
    if (err) { 
        return console.error(err.message); 
    }
    console.log('Connected to the MySQL server.');
});

var service = {};

service.authentication = function(username, password) {
    let sql = 'SELECT * FROM laundry.employee WHERE username = \''+ username +'\' AND password = \'' + password + '\';'

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
};

service.getListDateOrdered = function() {
    let sql = 'SELECT SUBSTRING_INDEX(created_date_time, \' \', 1) as created_date \n';
    sql += 'FROM laundry.order \n';
    sql += 'GROUP BY created_date; \n';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
};

service.getListCustomerByDate = function(date) {
    let sql = 'SELECT name, phone \n';
    sql += 'FROM laundry.order \n';
    sql += 'WHERE created_date_time LIKE \''+ date + '%\' \n';
    sql += 'GROUP BY name, phone;';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
};

service.getListOrderByInfo = function(date, name, phone) {
    let sql = 'SELECT o.id, o.name, o.birthday, o.phone, o.address, o.wash, \n';
    sql += 'o.drying, o.wash_special, o.wash_blanket, o.add_fabric_softener, \n';
    sql += 'o.small_bear, o.big_bear, o.machine, o.total_money, o.sale_of, \n';
    sql += 'o.description_sale_of, o.setting_order_id, o.created_date_time, so.total_machine_washing, \n';
    sql += 'so.price_wash_1_to_3, so.price_wash_3_to_5, so.price_wash_5_to_7, so.price_wash_more_than_7, \n';
    sql += 'so.price_drying_1_to_3, so.price_drying_3_to_5, so.price_drying_5_to_7, so.price_drying_more_than_7, \n';
    sql += 'so.price_wash_special, so.price_wash_blanket, so.price_add_fbric_softener, so.price_small_bear, so.price_big_bear \n';
    sql += 'FROM laundry.order AS o LEFT JOIN laundry.setting_order AS so \n';
    sql += '     ON o.setting_order_id = so.id \n';
    sql += 'WHERE o.name = \''+ name +'\' \n';
    sql += '    AND o.phone = \''+ phone +'\' \n';
    sql += '    AND o.created_date_time LIKE \''+ date + '%\';';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
};

service.createSettingOrder = function() {
    let id = uuidv4();

    let sql = 'INSERT INTO laundry.setting_order \n';
    sql += '(id, total_machine_washing, price_wash_1_to_3, price_wash_3_to_5, price_wash_5_to_7, price_wash_more_than_7, \n';
    sql += 'price_drying_1_to_3, price_drying_3_to_5, price_drying_5_to_7, price_drying_more_than_7, \n';
    sql += 'price_wash_special, price_wash_blanket, price_add_fbric_softener, price_small_bear, price_big_bear) \n';
    sql += 'SELECT \''+ id +'\', total_machine_washing, \n';
    sql += '        price_wash_1_to_3, price_wash_3_to_5, price_wash_5_to_7, price_wash_more_than_7, \n';
    sql += '        price_drying_1_to_3,  price_drying_3_to_5, price_drying_5_to_7, price_drying_more_than_7, \n';
    sql += '        price_wash_special, price_wash_blanket, price_add_fbric_softener, price_small_bear, price_big_bear \n';
    sql += 'FROM laundry.setting \n';
    sql += 'LIMIT 1';    
    
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'idSetting' : id});
        });
    });
};

service.deleteSettingOrder = function(id) {
    let sql = 'DELETE FROM laundry.setting_order WHERE id = \''+ id +'\';';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};

service.createOrder = function(objParam, idSetting) {
    let date = new Date();
    let createdDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' +  date.getFullYear();
    let createdTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' +  ('0' + date.getSeconds()).slice(-2);
    let id = uuidv4();

    let sql = 'INSERT INTO laundry.order (id, name, birthday, phone, address, wash, drying, wash_special, wash_blanket, add_fabric_softener, small_bear, big_bear, machine, total_money, sale_of, description_sale_of, setting_order_id,  created_date_time) \n';
    sql += 'VALUES (\''+ id +'\', \''+ objParam.name +'\', \''+ objParam.birthday +'\', \''+ objParam.phone +'\', \''+objParam.address+'\', '+ objParam.wash +', '+ objParam.drying +', '+ objParam.washSpecial +', '+ objParam.washBlanket +', '+ objParam.addFabricSoftener +', '+ objParam.smallBear +', '+ objParam.bigBear +', '+ (objParam.machine || 0) +', '+ objParam.totalMoney +', '+ objParam.saleOf +', \''+ objParam.descriptionSaleOf +'\', \''+ idSetting +'\', \''+ (createdDate + ' ' + createdTime) + '\');';
    
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'id' : id});
        });
    });
};

service.updateOrder = function(objParam) {
    let sql = 'UPDATE laundry.order \n';
    sql += 'SET name = \''+ objParam.name +'\', birthday = \''+ objParam.birthday +'\', phone = \''+ objParam.phone +'\', \n';
    sql += 'address = \''+ objParam.address +'\', wash = '+ objParam.wash +', drying = '+ objParam.drying +', \n'
    sql += 'wash_special = '+ objParam.washSpecial +', wash_blanket = '+ objParam.washBlanket +', \n';
    sql += 'add_fabric_softener = '+ objParam.addFabricSoftener +', small_bear = '+ objParam.smallBear +', \n';
    sql += 'big_bear = '+ objParam.bigBear +', machine = '+ objParam.machine +', total_money = '+ objParam.totalMoney +', \n';
    sql += 'sale_of = '+ objParam.saleOf +', description_sale_of = \''+ objParam.descriptionSaleOf +'\' \n';
    sql += 'WHERE id = \''+ objParam.id +'\';';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};

service.deleteOrder = function(id) {
    let sql = 'DELETE FROM laundry.order WHERE id = \''+ id +'\';';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};


service.getListEmployee = function() {
    let sql = 'SELECT * FROM laundry.employee ORDER BY name asc;';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve(rows);
        });
    });
};

service.createEmployee = function(objParam) {
    let date = new Date();
    let createdDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' +  date.getFullYear();
    let createdTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' +  ('0' + date.getSeconds()).slice(-2);
    let id = uuidv4();

    let sql = 'INSERT INTO laundry.employee (id, username, password, name, birthday, phone, address, role, created_date_time)';
    sql += 'VALUES (\''+ id +'\', \''+ objParam.username +'\', \''+ objParam.password +'\', \''+ objParam.name +'\', \''+ objParam.birthday +'\', \''+ objParam.phone +'\', \''+ objParam.address +'\', \''+ objParam.role +'\', \''+ (createdDate + ' ' + createdTime) +'\');';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'_id' : id});
        });
    });
};

service.updateEmployee = function(objParam) {
    let sql = 'UPDATE laundry.employee \n'
    sql += 'SET username = \''+ objParam.username +'\', password = \''+ objParam.password +'\', name = \''+ objParam.name +'\', birthday = \''+ objParam.birthday +'\', phone = \''+ objParam.phone +'\', address = \''+ objParam.address +'\', role = \''+ objParam.role +'\' \n';
    sql += 'WHERE id = \''+ objParam.id +'\'';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};

service.deleteEmployee = function(id) {
    let sql = 'DELETE FROM laundry.employee WHERE id = \''+ id +'\';';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};

service.getMoneyStatictis = function(list, size) {
    let sql = 'CALL proc_get_list_statictis_money(\''+ list +'\', '+ size +')';
    
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve(rows);
        });
    });
}

service.getHistoryByDate = function(day, month, year) {
    let sql = 'SELECT * FROM laundry_history.history102019 WHERE created_date_time LIKE \''+ day +'-'+ month +'-'+ year +'%\' ORDER BY id asc;';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve(rows);
        });
    });
}

service.checkTableHistoryExist = function() {
    let date = new Date();
    let month = ('0' + (date.getMonth()+1)).slice(-2)
    let year = date.getFullYear()

    let sql = 'SELECT 1 FROM information_schema.tables \n';
    sql += 'WHERE table_schema = \'laundry_history\' \n';
    sql += 'AND table_name = \'history'+ month + '' +year +'\' \n'
    sql += 'LIMIT 1';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve(rows);
        });
    });
};

service.createTableHistory = function() {
    let date = new Date();
    let month = ('0' + (date.getMonth()+1)).slice(-2)
    let year = date.getFullYear()

    let sql = 'CREATE TABLE laundry_history.history'+ month +''+ year +' (\n';
    sql += 'id int(11) unsigned NOT NULL AUTO_INCREMENT, \n';
    sql += 'content text, \n';
    sql += 'created_date_time varchar(45) DEFAULT NULL,';
    sql += 'PRIMARY KEY (id)';
    sql += ') ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};

service.addHistory = function(content) {
    let date = new Date();
    let month = ('0' + (date.getMonth()+1)).slice(-2)
    let year = date.getFullYear()
    let createdDate = ('0' + date.getDate()).slice(-2) + '-' + month + '-' + year;
    let createdTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' +  ('0' + date.getSeconds()).slice(-2);

    let sql = 'INSERT INTO laundry_history.history'+ month + '' + year +' (content, created_date_time)';
    sql += 'VALUES (\''+ content +'\', \''+ (createdDate + ' ' + createdTime) +'\');';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve({'status': true});
        });
    });
};

service.getStatictisCustomer = function() {
    let sql = 'SELECT name, birthday, phone, address, count(name) AS frequenc \n';
    sql += 'FROM laundry.order \n';
    sql += 'GROUP BY name, phone \n';
    sql += 'ORDER BY frequenc desc;';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve(rows);
        });
    });
};

service.getSetting = function() {
    let sql = 'SELECT * FROM laundry.setting WHERE id = \'setting-01\';';
    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }

            resolve(rows);
        });
    });
};

/*service.getSettingMachineWashing = function() {
    let sql = 'SELECT * FROM laundry.setting WHERE id = \'setting-01\';'

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
}*/

service.saveSetting = function(objParam) {
    let sql = 'UPDATE laundry.setting \n';
    sql += 'SET total_machine_washing = '+ objParam.settingTotalMachineWashing +', price_wash_1_to_3 = '+ objParam.priceWash1To3 +', \n'; 
    sql += 'price_wash_3_to_5 = '+ objParam.priceWash3To5 +', price_wash_5_to_7 = '+ objParam.priceWash5To7 +', price_wash_more_than_7 = '+ objParam.priceWashMoreThan7 +', \n';
    sql += 'price_drying_1_to_3 = '+ objParam.priceDrying1To3 +', price_drying_3_to_5 = '+ objParam.priceDrying3To5 +', \n';
    sql += 'price_drying_5_to_7 = '+ objParam.priceDrying5To7 +', price_drying_more_than_7 = '+ objParam.priceDryingMoreThan7 +', \n';
    sql += 'price_wash_special = '+ objParam.priceWashSpecial +' , price_wash_blanket = '+ objParam.priceWashBlanket +',';
    sql += 'price_add_fbric_softener = '+ objParam.priceAddFabricSoftener +', price_small_bear = '+ objParam.priceSmallBear +', price_big_bear = '+ objParam.priceBigBear +' \n';    
    sql += 'WHERE id = \'setting-01\'';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve({'status': true});
        });
    });
};

service.checkCRUDDone = function(id, table) {
    let sql;
    switch(table) {
        case 'order':
            sql = 'SELECT * FROM laundry.order WHERE id = \''+ id +'\';';
            break;
        case 'employee':
            sql = 'SELECT * FROM laundry.employee WHERE id = \''+ id +'\';';
            break;
        case 'setting':
            sql = 'SELECT * FROM laundry.setting WHERE id = \''+ id +'\';';
            break;
    }

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
}

service.getReceiptById = function(id) {
    /*let sql = 'SELECT t1.*, t2.*  \n';
    sql += 'FROM ( \n';
    sql += 'SELECT wash, drying, wash_special, wash_blanket, add_fabric_softener, small_bear, big_bear, total_money, sale_of \n';
    sql += 'FROM laundry.order \n';
    sql += 'WHERE id =\''+ id +'\' \n';
    sql += ') AS t1,'
    sql += '(SELECT  \n';
    sql += '       price_wash_1_to_3 AS price_wash_1_to_3, \n';
    sql += '       price_wash_3_to_5 AS price_wash_3_to_5,\n';
    sql += '       price_wash_5_to_7 AS price_wash_5_to_7,\n';
    sql += '       price_wash_more_than_7 AS price_wash_more_than_7,\n';
    sql += '       price_drying_1_to_3 AS price_drying_1_to_3,\n';
    sql += '       price_drying_3_to_5 AS price_drying_3_to_5,\n';
    sql += '       price_drying_5_to_7 AS price_drying_5_to_7,\n';
    sql += '       price_drying_more_than_7 AS price_drying_more_than_7,\n';
    sql += '       price_wash_special AS price_wash_special,\n';
    sql += '       price_wash_blanket AS price_wash_blanket,\n';
    sql += '       price_add_fbric_softener AS price_add_fbric_softener,\n';
    sql += '       price_big_bear AS price_big_bear\n';
    sql += 'FROM laundry.setting) AS T2;';*/

    let sql = 'SELECT o.name, o.birthday, o.phone, o.address, o.wash, \n';
    sql += 'o.drying, o.wash_special, o.wash_blanket, o.add_fabric_softener, \n';
    sql += 'o.small_bear, o.big_bear, o.machine, o.total_money, o.sale_of, \n';
    sql += 'o.description_sale_of, o.created_date_time, so.total_machine_washing, \n';
    sql += 'so.price_wash_1_to_3, so.price_wash_3_to_5, so.price_wash_5_to_7, so.price_wash_more_than_7, \n';
    sql += 'so.price_drying_1_to_3, so.price_drying_3_to_5, so.price_drying_5_to_7, so.price_drying_more_than_7, \n';
    sql += 'so.price_wash_special, so.price_wash_blanket, so.price_add_fbric_softener, so.price_small_bear, so.price_big_bear \n';
    sql += 'FROM laundry.order AS o LEFT JOIN laundry.setting_order AS so \n';
    sql += '     ON o.setting_order_id = so.id \n';
    sql += 'WHERE o.id = \''+ id +'\';';

    return new Promise(function(resolve, reject) {
        connection.query(sql, function(err, rows, fields)  {
            if (err) { 
                return console.error(err.message); 
            }
            
            resolve(rows);
        });
    });
};


module.exports = service;