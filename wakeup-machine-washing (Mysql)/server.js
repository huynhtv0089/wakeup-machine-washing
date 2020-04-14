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
app.get('/admin', (request, response) => {
    session = request.session;
    if(!session.authen) {
        response.redirect('/login');
    }

    if(session.role === 'employee') {
        response.redirect('/');
    }

    response.sendFile(__dirname + '/views/admin.html');
});
app.get('/receipt', (request, response) => {
    session = request.session;
    if(!session.authen) {
        response.redirect('/login');
    }

    response.sendFile(__dirname + '/views/receipt.html');
});

/* Authentication (sign-in) and logout */
app.post('/authentication-user', (request, response) => {   
    let username = request.body.username;
    let password = request.body.password;

    service.authentication(username, password).then(function(resp) {
        session = request.session;
        var result = {
            'status' : false
        }
        if (resp.length > 0) {
            result.role = resp[0].role;
            result.status = true;

            session.username = resp[0].username;
            session.role = result.role;
        }
        session.authen = result.status;
        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

/* Config properties */
app.get('/info-config', (request, response) => {
    service.getSetting().then(function (resp) {
        session = request.session;
        /*let result = {
            'employee': session.username,
            'role': session.role
        };

        if (resp.length > 0) {
            result.quantityMachine = resp[0].total_machine_washing;
            result.wash1To3 = resp[0].wash_1_to_3;
            result.wash3To5 = resp[0].wash_3_to_5;
            result.wash5To7 = resp[0].wash_5_to_7;
            result.washMoreThan7 = resp[0].wash_more_than_7;
            result.drying1To3 = resp[0].drying_1_to_3;
            result.drying3To5 = resp[0].drying_3_to_5;
            result.drying5To7 = resp[0].drying_5_to_7;
            result.dryingMoreThan7 = resp[0].drying_more_than_7;
            result.washSpecial = resp[0].wash_special;
            result.washBlanket = resp[0].wash_blanket;
            result.addFbricSoftener = resp[0].add_fbric_softener;
            result.smallBear = resp[0].small_bear;
            result.bigBear = resp[0].big_bear;
            resp[0].employee = session.username;
            resp[0].role = session.role;
        }*/
        resp[0].employee = session.username;
        resp[0].role = session.role;
        response.send(resp[0]);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

// Other APIs
app.get('/get-list-date-ordered', (request, response) => {
    service.getListDateOrdered().then(function (resp) {
        let result = { 
            'status': true,  
            'dateOrdered' : []
        };

        //sort
        result.dateOrdered = resp.sort((date1, date2) => {
            date1 = date1.created_date.split('-').reverse().join('');
            date2 = date2.created_date.split('-').reverse().join('');
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

        //sort
        result.customers = resp.sort((customer1, customer2) => {
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
            'orders' : resp
        };

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
    service.createSettingOrder().then(function (resp) {
        service.createOrder(request.body, resp.idSetting).then(function (resp) {
            response.send({
                'status': true,
                'id': resp.id
            });
        }, function (err) {
            console.log(err.message);
            response.send({'status': false});
        }).catch(function(err) {
            console.log(err.message);
            response.send({'status': false});
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
        response.send(resp);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/delete-order', (request, response) => {
    service.deleteSettingOrder(request.body.orderSettingId).then(function (resp) {
        service.deleteOrder(request.body.orderId).then(function (resp) {
            response.send({'status': true});
        }, function (err) {
            console.log(err.message);
            response.send({'status': false});
        }).catch(function(err) {
            console.log(err.message);
            response.send({'status': false});
        });
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
            'employees' : resp
        };

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
        response.send(resp);
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
            'settings': resp[0]
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
    service.getMoneyStatictis(request.body.list, request.body.size).then(function (resp) {
        let result = {
            'status' : true,
            'data' : resp[0]
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
    let day = request.body.day;
    let month = request.body.month;
    let year = request.body.year;

    service.checkTableHistoryExist().then(function (resp) {
        if (resp.length === 0) {
            response.send({'status': false});
        } else {
            service.getHistoryByDate(day, month, year).then(function (resp) {
                let result = { 
                    'status': true,  
                    'historys' : resp
                };

                response.send(result);
            }, function (err) {
                console.log(err.message);
                response.send({'status': false});
            }).catch(function(err) {
                console.log(err.message);
                response.send({'status': false});
            });
        }
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
});

app.post('/add-history', (request, response) => {
    service.checkTableHistoryExist().then(function (resp) {
        if (resp.length === 0) {
            service.createTableHistory().then(function (resp) {
                if (resp.status) {
                    service.addHistory(request.body.content).then(function (resp) {
                        response.send(resp);
                    }, function (err) {
                        console.log(err.message);
                        response.send({'status': false});
                    }).catch(function(err) {
                        console.log(err.message);
                        response.send({'status': false});
                    });
                }
            }, function (err) {
                console.log(err.message);
                response.send({'status': false});
            }).catch(function(err) {
                console.log(err.message);
                response.send({'status': false});
            });
        } else {
            service.addHistory(request.body.content).then(function (resp) {
                response.send(resp);
            }, function (err) {
                console.log(err.message);
                response.send({'status': false});
            }).catch(function(err) {
                console.log(err.message);
                response.send({'status': false});
            });
        }
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });

    
});

/* Statictis Customer */
app.post('/get-statictis-customer', (request, response) => {
    service.getStatictisCustomer().then(function (resp) {
        let result = { 
            'status': true,  
            'customers' : resp
        };

        response.send(result);
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
    service.checkCRUDDone(request.body.id, request.body.table).then(function (resp) {
        let result = {'status' : false};
        if (resp.length > 0) {
            result.status = true;
        }
        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
})

app.post('/check-update-done', (request, response) => {
    service.checkCRUDDone(request.body.id, request.body.table).then(function (resp) {
        let result = {
            'status' : true,
            'dataObj' : resp[0]
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
    service.checkCRUDDone(request.body.id, request.body.table).then(function (resp) {
        let result = {};
        if (resp.length === 0) {
            result.status = true;
        } else {
            result.status = false;
        }
        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
    });
})

app.post('/get-receipt-by-id', (request, response) => {
    service.getReceiptById(request.body.id).then(function (resp) {
        let result = { 
            'status': true,  
            'receipts' : resp
        };

        response.send(result);
    }, function (err) {
        console.log(err.message);
        response.send({'status': false});
    }).catch(function(err) {
        console.log(err.message);
        response.send({'status': false});
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
app.listen(port, '0.0.0.0',() => {
    console.log(`Server listening on port ${port}`);
});
