/* UUID */
const uuidv4 = require('uuid/v4');

/* Elasticsearch */
const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log : [{
        levels: ['error']
    }]
});

const indexOrder = 'laundry-order';
const indexEmployee = 'laundry-employee';
const indexSetting = 'laundry-setting';
const indexHistory = 'laundry-history';

var service = {};

service.authentication = function(username, password) {
    let query = {
        "query": {
            "match_all": {}
        },
        "size": 1000
    }

    return client.search({
        index: indexEmployee,
        body: query
    });
};

service.getListDateOrdered = function() {
    let query = {
        "query": { "match_all": {} },
        "_source": ["created_date_time"],
        "size": 1000
    }; 

    return client.search({
        index: indexOrder,
        body: query
    });
};

service.getListCustomerByDate = function(date) {
    let query = {
        "query": {
            "simple_query_string" : {
                "query": "\"" +  date +  "\"",
                "fields": ["created_date_time"]
            }
        },
        "_source": ["name", "phone"],
        "size": 1000
    }; 

    console.log(query);
    return client.search({
        index: indexOrder,
        body: query
    });
};

service.getListOrderByInfo = function(date, name, phone) {
    let query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "simple_query_string" : {
                            "query": "\"" + date + "\"",
                            "fields": ["created_date_time"]
                        }
                    },
                    {
                        "simple_query_string" : {
                            "query": "\"" + name + "\"",
                            "fields": ["name"]
                        }
                    },
                    {
                        "simple_query_string" : {
                            "query": "\"" + phone + "\"",
                            "fields": ["phone"]
                        }
                    }
                ]
            }
        }
    }

    return client.search({
        index: indexOrder,
        body: query
    });
};

service.createOrder = function(objParam) {
    let date = new Date();
    let createdDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' +  date.getFullYear();
    let createdTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' +  ('0' + date.getSeconds()).slice(-2);

    let query = {
        'name': objParam.name,
        'birthday': objParam.birthday,
        'phone': objParam.phone,
        'address': objParam.address,
        'wash': objParam.wash,
        'drying': objParam.drying,
        'wash_special': objParam.washSpecial,
        'wash_blanket': objParam.washBlanket,
        'add_fabric_softener': objParam.addFabricSoftener,
        'small_bear': objParam.smallBear,
        'big_bear': objParam.bigBear,
        'machine': objParam.machine,
        'total_money' : parseInt(objParam.totalMoney),
        'created_date_time': (createdDate + ' ' + createdTime)
    };

    return client.index({
        index: indexOrder,
        id: uuidv4(),
        body: query
    });
};

service.updateOrder = function(objParam) {
    let query = {
        'name': objParam.name,
        'birthday': objParam.birthday,
        'phone': objParam.phone,
        'address': objParam.address,
        'wash': objParam.wash,
        'drying': objParam.drying,
        'wash_special': objParam.washSpecial,
        'wash_blanket': objParam.washBlanket,
        'add_fabric_softener': objParam.addFabricSoftener,
        'small_bear': objParam.smallBear,
        'big_bear': objParam.bigBear,
        'machine': objParam.machine,
        'total_money': objParam.totalMoney,
        'created_date_time': objParam.createdDateTime
    };

    return client.index({
        index: indexOrder,
        id: objParam._id,
        body: query
    });
};

service.deleteOrder = function(_id) {
    return client.delete({
        index: indexOrder,
        id: _id
    });
};


service.getListEmployee = function() {
    let query = {
        "query": { 
            "match_all": {} 
        },
        "size": 1000
    }; 

    return client.search({
        index: indexEmployee,
        body: query
    });
};

service.createEmployee = function(objParam) {
    if (objParam.birthday === '') {
        objParam.birthday = '1970-01-01';
    }

    let date = new Date();
    let createdDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' +  date.getFullYear();
    let createdTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' +  ('0' + date.getSeconds()).slice(-2);

    let query = {
        'username' : objParam.username,
        'password' : objParam.password,
        'name' : objParam.name,
        'birthday' : objParam.birthday,
        'phone' : objParam.phone,
        'address' : objParam.address,
        'role' : objParam.role,
        'created_date_time': (createdDate + ' ' + createdTime)
    };

    return client.index({
        index: indexEmployee,
        id: uuidv4(),
        body: query
    });
};

service.updateEmployee = function(objParam) {
    let query = {
        'username' : objParam.username,
        'password' : objParam.password,
        'name' : objParam.name,
        'birthday' : objParam.birthday,
        'phone' : objParam.phone,
        'address' : objParam.address,
        'role' : objParam.role,
        'created_date_time': objParam.createDateTime
    };

    return client.index({
        index: indexEmployee,
        id: objParam._id,
        body: query
    });
};

service.deleteEmployee = function(_id) {
    return client.delete({
        index: indexEmployee,
        id: _id
    });
};

service.getMoneyStatictis = function(value) {
    var query = {
        "query": {
            "simple_query_string" : {
                "query": "\"" + value + "\"",
                "fields": ["created_date_time"]
            }
        },
        "aggs" : {
            "money" : { "sum" : { "field" : "total_money" } }
        },
        "size": 0
    };

    return client.search({
        index: indexOrder,
        body: query
    });
}

service.getHistoryByDate = function(date) {
    let arrDate = date.split('-');
    date =  ('0' + arrDate[2]).slice(-2)+ '-' +('0' + arrDate[1]).slice(-2)+ '-' +arrDate[0];
    let query = {
        "query": {
            "simple_query_string" : {
                "query": "\"" + date + "\"",
                "fields": ["created_date_time"]
            }
        },
        "size": 10000
    }; 

    return client.search({
        index: indexHistory,
        body: query
    });
}

service.addHistory = function(content) {
    let date = new Date();
    let createdDate = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth()+1)).slice(-2) + '-' +  date.getFullYear();
    let createdTime = ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' +  ('0' + date.getSeconds()).slice(-2);

    let query = {
        'content': content,
        'created_date_time': (createdDate + ' ' + createdTime)
    };
    return client.index({
        index: indexHistory,
        id: uuidv4(),
        body: query
    });
}

service.getSetting = function() {
    let query = {
        "query": {
            "match_all": {}
        },
        "size": 1
    };

    return client.search({
        index: indexSetting,
        body: query
    });
};

service.getSettingMachineWashing = function() {
    let query = {
        "query": {
            "match_all": {}
        },
        "size": 1
    };

    return client.search({
        index: indexSetting,
        body: query
    });
}

service.saveSetting = function(objParam) {
    let query = {
        'total_machine_washing': objParam.settingTotalMachineWashing,
        'wash_1_to_3': objParam.settingWash1To3,
        'wash_3_to_5': objParam.settingWash3To5,
        'wash_5_to_7': objParam.settingWash5To7,
        'wash_more_than_7': objParam.settingWashMoreThan7,
        'drying_1_to_3': objParam.settingDrying1To3,
        'drying_3_to_5': objParam.settingDrying3To5,
        'drying_5_to_7': objParam.settingDrying5To7,
        'drying_more_than_7': objParam.settingDryingMoreThan7,
        'wash_special': objParam.settingWashSpecial,
        'wash_blanket': objParam.settingWashBlanket,
        'add_fbric_softener':objParam.settingAddFabricSoftener,
        'small_bear': objParam.settingSmallBear,
        'big_bear': objParam.settingBigBear
    };

    return client.index({
        index: indexSetting,
        id: 'setting-01',
        body: query
    });
};

service.checkCRUDDone = function(_id, type) {
    let _index;
    switch(type) {
        case 'order':
            _index = indexOrder
            break;
        case 'employee':
            _index = indexEmployee
            break;
        case 'setting':
            _index = indexSetting
            break;
    }

    return client.get({
        index: _index,
        id: _id
    });
}


module.exports = service;