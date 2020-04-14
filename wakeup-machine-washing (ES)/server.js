/* Nodejs + Express */
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const expressSession = require('express-session');
var session;

/* Sevice */
const service = require('./service');

/* For session */
app.use(expressSession({secret: 'ssshhhhh', saveUninitialized: true, resave: true}));

/* For parser json to endpoint */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));


/* For library css and javacript to display view */
app.use('/static', express.static(path.join(__dirname,'views/static')));

/* Route */
app.get('/login', (request, response) => {
    session = request.session;
    if(session.authen) {
        response.redirect('/');
    }

    response.sendFile(__dirname + '/views/login.html');
});
app.get('/logout', (request, response) => {
    request.session.destroy((err) => {
        if(err) {
            console.log(err.message);
        }
        response.redirect('/login');
    });
})
app.get('/', (request, response) => {
    session = request.session;
    if(!session.authen) {
        response.redirect('/login');
    }

    response.sendFile(__dirname + '/views/home.html');
});
app.get('/create-order', (request, response) => {
    session = request.session;
    if(!session.authen) {
        response.redirect('/login');
    }

    response.sendFile(__dirname + '/views/create-order.html');
});
app.get('/admin', (request, response) => {
    session = request.session;
    if(!session.authen) {
        response.redirect('/login');
    }

    if(session.role === 'employee') {
        response.redirect('/');
    }

    response.sendFile(__dirname + '/views/administrator.html');
});

/* Authentication (sign-in) and logout */
app.post('/authentication-user', (request, response) => {   
    let username = request.body.username;
    let password = request.body.password;

    service.authentication(username, password).then(function (resp) {
        session = request.session;
        var result = {
            status : false
        }
        var hits = resp.hits.hits;

        for (let hit of hits) {
            let resultUsername = hit._source.username;
            let resultPassword = hit._source.password;
            let role = hit._source.role;
            if (username === resultUsername && password === resultPassword) {
                session.username = username;
                session.role = role;

                result.status = true;
                result.role = role;
                break;
            }
        }
        session.authen = result.status;
        
        response.send(result);
    }, function (err) {
        console.log(err.message);
    }).catch(function(err) {
        console.log(err.message);
    });
});

/* Config properties */
app.get('/info-config', (request, response) => {
    service.getSettingMachineWashing().then(function (resp) {
        session = request.session;
        let result = {
            'employee': session.username
        };

        result.quantityMachine = resp.hits.hits[0]._source.total_machine_washing;
        result.wash1To3 = resp.hits.hits[0]._source.wash_1_to_3;
        result.wash3To5 = resp.hits.hits[0]._source.wash_3_to_5;
        result.wash5To7 = resp.hits.hits[0]._source.wash_5_to_7;
        result.washMoreThan7 = resp.hits.hits[0]._source.wash_more_than_7;
        result.drying1To3 = resp.hits.hits[0]._source.drying_1_to_3;
        result.drying3To5 = resp.hits.hits[0]._source.drying_3_to_5;
        result.drying5To7 = resp.hits.hits[0]._source.drying_5_to_7;
        result.dryingMoreThan7 = resp.hits.hits[0]._source.drying_more_than_7;
        result.washSpecial = resp.hits.hits[0]._source.wash_special;
        result.washBlanket = resp.hits.hits[0]._source.wash_blanket;
        result.addFbricSoftener = resp.hits.hits[0]._source.add_fbric_softener;
        result.smallBear = resp.hits.hits[0]._source.small_bear;
        result.bigBear = resp.hits.hits[0]._source.big_bear;
        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });

    //response.send(result);
});

// Other APIs
app.get('/get-list-date-ordered', (request, response) => {
    service.getListDateOrdered().then(function (resp) {
        let result = { 
            'status': true,  
            'dateOrdered' : []
        };
        
        //Push data to array
        let createdDate = [];
        var hits = resp.hits.hits;
        for (let hit of hits) {
            let date = hit._source.created_date_time.split(' ')[0];

            //Push to array if date not exists
            if (!createdDate.includes(date)) {
                createdDate.push(date);
            }
        }

        //sort
        result.dateOrdered = createdDate.sort((date1, date2) => {
            date1 = date1.split('-').reverse().join('');
            date2 = date2.split('-').reverse().join('');
            return date2.localeCompare(date1);
        });
        
        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/get-list-customer-by-date', (request, response) => {
    service.getListCustomerByDate(request.body.date).then(function (resp) {
        let result = { 
            'status': true,  
            'customers' : []
        };
        var hits = resp.hits.hits;
        //Push data to array
        let customers = [];
        let arrPhone = [];
        var hits = resp.hits.hits;
        for (let hit of hits) {
            //Push to array if phone not exists in day
            if (!arrPhone.includes(hit._source.phone)) {
                arrPhone.push(hit._source.phone);
                customers.push({
                    'name' : hit._source.name,
                    'phone' : hit._source.phone
                });
            }
        }
        console.log(customers.length);

        //sort
        result.customers = customers.sort((customer1, customer2) => {
            name1 = customer1.name.split('-').reverse().join('');
            name2 = customer2.name.split('-').reverse().join('');
            return name1.localeCompare(name2);
        });

        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
})

app.post('/get-list-order-by-info', (request, response) => {
    let date = request.body.date;
    let name = request.body.name;
    let phone = request.body.phone;
    service.getListOrderByInfo(date, name, phone).then(function (resp) {
        let result = { 
            'status': true,  
            'orders' : []
        };

        //Push info's order to array
        result.orders = resp.hits.hits;
        
        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
})

app.post('/create-order', (request, response) => {
   service.createOrder(request.body).then(function (resp) {
        response.send({
            'status': true,
            'id': resp._id
        });
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/update-order', (request, response) => {
    service.updateOrder(request.body).then(function (resp) {
        response.send({'status': true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/delete-order', (request, response) => {
    service.deleteOrder(request.body.id).then(function (resp) {
        response.send({'status': true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});


app.get('/get-list-employee', (request, response) => {
    service.getListEmployee(request.body).then(function (resp) {
        let result = { 
            'status': true,  
            'employees' : []
        };

        //sort
        result.employees = resp.hits.hits.sort((employee1, employee2) => {
            name1 = employee1._source.name.split('-').reverse().join('');
            name2 = employee2._source.name.split('-').reverse().join('');
            return name1.localeCompare(name2);
        });

        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/create-employee', (request, response) => {
    service.createEmployee(request.body).then(function (resp) {
        response.send({
            'status': true,
            'id': resp._id
        });
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/update-employee', (request, response) => {
    service.updateEmployee(request.body).then(function (resp) {
        response.send({'status': true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/delete-employee', (request, response) => {
    service.deleteEmployee(request.body.id).then(function (resp) {
        response.send({'status': true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.get('/get-setting', (request, response) => {
    service.getSetting(request.body).then(function (resp) {
        response.send({
            'status': true,
            'settings': resp.hits.hits[0]
        });
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/save-setting', (request, response) => {
    service.saveSetting(request.body).then(function (resp) {
        response.send({'status': true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

/* Statistic money */
app.post('/get-money-statistic', (request, response) => {
    service.getMoneyStatictis(request.body.data).then(function (resp) {
        let result = {
            'status' : true,
            'totalMoney' : resp.aggregations.money.value
        }

        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    }); 
});

/* History */
app.post('/get-history', (request, response) => {
    service.getHistoryByDate(request.body.date).then(function (resp) {
        let result = { 
            'status': true,  
            'historys' : []
        };

        var hits = resp.hits.hits;
        
        //sort
        result.historys = hits.sort((history1, history2) => {
            date1 = history1._source.created_date_time.split(' ')[0].split('-').reverse().join('');
            date2 = history2._source.created_date_time.split(' ')[0].split('-').reverse().join('');
            return date2.localeCompare(date1);
        });

        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/add-history', (request, response) => {
    service.addHistory(request.body.content).then(function (resp) {
        response.send({'status' : true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

/* Check CRUD */
app.post('/check-create-done', (request, response) => {
    service.checkCRUDDone(request.body.id, request.body.type).then(function (resp) {
        response.send({'status' : true});
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
})

app.post('/check-update-done', (request, response) => {
    service.checkCRUDDone(request.body.id, request.body.type).then(function (resp) {
        let result = {
            'status' : true,
            'dataObj' : resp
        }
        setTimeout(function() {
            response.send(result);
        }, 400);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
})

app.post('/check-delete-done', (request, response) => {
    service.checkCRUDDone(request.body.id, request.body.type).then(function (resp) {
        response.send({'status': false});
    }, function (err) {
        console.log(err.message);
        response.send({'status': true});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': true});
    });
})

/* Main */
app.get('/info-project', (request, response) => {
    let infomation = {
        'Name': 'Wakeup Machine Washing',
        'Version': '1.0.0',
        'Description': '...',
        'Author': 'huynhtv0089@gmail.com',
        'Language': 'Nodejs, Ajax, Javascript......'
    };

    response.send(infomation);
});

const port = process.argv[2] || 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
