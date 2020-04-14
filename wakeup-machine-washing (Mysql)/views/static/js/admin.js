var arrEmployees = [];
var arrStatictisCustomer = [];
let interval;
let date = new Date();
let currentDate;

$(document).ready(function () {
    $('.waiting-loader').removeClass('d-none');

    // Calculator and then reset height for area center
    let heightAfter = $(window).height() - $('#header').outerHeight(true);
    $('#center').css('height', heightAfter + 'px');

    //Current date
    currentDate = date.getFullYear()+ '-' +('0' + (date.getMonth()+1)).slice(-2)+ '-' +('0' + date.getDate()).slice(-2);

    /* Switch module */
    $('#menuModule').find('li').on('click', function() {
        let module = $(this).attr('module');

        switch (module) {
            case 'employee':
                $('#module-employee').removeClass('d-none');
                $('#module-money').addClass('d-none');
                $('#module-setting').addClass('d-none');
                $('#module-statistic-customer').addClass('d-none');
                $('#module-history').addClass('d-none');
                break;
            case 'money':
                getListStatictisMoney();
                $('#module-employee').addClass('d-none');
                $('#module-money').removeClass('d-none');
                $('#module-setting').addClass('d-none');
                $('#module-statistic-customer').addClass('d-none');
                $('#module-history').addClass('d-none');
                break;
            case 'history':
                //Change data input[type=date] use moment.js for get history employee
                $('#dateHistory').val(currentDate);
                $("#dateHistory").on("change", function() {
                    this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format( this.getAttribute("data-date-format")))
                    //Load list history by date
                    getHistory(this.value);
                }).trigger("change");

                $('#module-employee').addClass('d-none');
                $('#module-money').addClass('d-none');
                $('#module-statistic-customer').addClass('d-none');
                $('#module-history').removeClass('d-none');
                $('#module-setting').addClass('d-none');
                break;
            case 'statisticCustomer':
                getStatictisCustomer();
                $('#module-employee').addClass('d-none');
                $('#module-money').addClass('d-none');
                $('#module-history').addClass('d-none');
                $('#module-statistic-customer').removeClass('d-none');
                $('#module-setting').addClass('d-none');
                break;
            case 'setting':
                getSettings();
                $('#module-employee').addClass('d-none');
                $('#module-money').addClass('d-none');
                $('#module-history').addClass('d-none');
                $('#module-statistic-customer').addClass('d-none');
                $('#module-setting').removeClass('d-none');
                break;
            
        }
    });
    //Trigger click first module when start page "/admin"
    $('#menuModule').children(':first').click();
});

$('#menuModule').find('li[module=employee]').on('click', function() {
    //Trigger get list employee
    getListEmployee();
});
var getListEmployee = function() {
    $.ajax({
        url: "/get-list-employee",
        type: "GET",
        success: function (response) {
            if (response.status) {
                arrEmployees = response.employees;
                //Append list HTML employee
                handleAppendEmployee(arrEmployees);

                 //Handle search date
                 $('#searchEmployee').keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        handleSearchEmployee($('#searchEmployee').val());
                    }
                });
                $('#btnSearchEmployee').on('click', function() {
                    handleSearchEmployee($('#searchEmployee').val());
                })

                $('.waiting-loader').addClass('d-none');
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
var handleAppendEmployee = function(employees) {
    let html = '';
    
    for (let i in employees) {
        let birthday = '';
        if (employees[i].birthday !== null) {
            let arrBirthday = employees[i].birthday.split('-');
            birthday = ('0' + arrBirthday[2]).slice(-2)+ '-' +('0' + arrBirthday[1]).slice(-2)+ '-' +arrBirthday[0];
        }

        html += '<div class="toast fade show mw-100">';
        html += '  <div class="toast-header">';
        html += '    <div class="w-20px h-20px mr-2 text-success">';
        html += '      <i class="fa fa-user-circle-o" aria-hidden="true"></i>';
        html += '    </div>';
        html += '    <strong class="mr-auto text-capitalize">'+ employees[i].name + '</strong>';
        html += '    <button class="btn btn-sm btn-outline-warning mr-5" onclick="injectInfoEmployee('+ i +')"; data-toggle="modal" data-target="#modalModifyEmployee">';
        html += '      Chỉnh sửa <i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
        html += '    </button>';
        html += '    <button class="btn btn-sm btn-outline-danger" onclick="injectIdDeleteEmployee(\''+ employees[i].id +'\')" data-toggle="modal" data-target="#modalWarningEmployee">';
        html += '      Xóa <i class="fa fa-trash-o" aria-hidden="true"></i>';
        html += '    </button>';
        html += '  </div>';
        html += '  <div class="toast-body">';
        html += '    <div class="row">';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-user-secret pr-1" aria-hidden="true"></i>Tên đăng nhập: </p>';
        html += '          <p class="col-sm-6">'+ employees[i].username +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-key pr-1" aria-hidden="true"></i>Mật khẩu: </p>';
        html += '          <p class="col-sm-6">'+ starPassword(employees[i].password.length) +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-mobile pr-1" aria-hidden="true"></i>Số điện thoại: </p>';
        html += '          <p class="col-sm-6">'+ employees[i].phone +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-birthday-cake pr-1" aria-hidden="true"></i>Sinh nhật: </p>';
        html += '          <p class="col-sm-6">'+ birthday +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-map-marker pr-1" aria-hidden="true"></i>Địa chỉ: </p>';
        html += '          <p class="col-sm-6">'+ employees[i].address +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    }
    $('#areaListEmployee').html(html);
}
var starPassword = function(length) {
    let strStar = '';
    for (let i = 0; i<length; i++) {
        strStar += '*';
    }
    return strStar;
}
var handleSearchEmployee = function(keyword) {
    let tmpObjEmployees = [];
    arrEmployees.filter(function(employee,index){
        if(employee.name.match(new RegExp(keyword, 'g'))) {
            tmpObjEmployees[index] = employee;
        }
    });
    handleAppendEmployee(tmpObjEmployees);
};
/* Modify employee */
var injectInfoEmployee = function(index) {
    var employee = {
        'id': (typeof index === 'undefined') ? '' : arrEmployees[index].id,
        'createdDateTime' : (typeof index === 'undefined') ? '' : arrEmployees[index].created_date_time,
        'username' : (typeof index === 'undefined') ? '' : arrEmployees[index].username,
        'password' : (typeof index === 'undefined') ? '' : arrEmployees[index].password,
        'name' : (typeof index === 'undefined') ? '' : arrEmployees[index].name,
        'birthday' : (typeof index === 'undefined') ? currentDate : arrEmployees[index].birthday,
        'phone' : (typeof index === 'undefined') ? '' : arrEmployees[index].phone,
        'address' : (typeof index === 'undefined') ? '' : arrEmployees[index].address
    }

    $('#idEmployee').val(employee.id);
    $('#createdDateTimeEmployee').val(employee.createdDateTime);
    $('#modifyUsername').val(employee.username);
    $('#modifyPassword').val(employee.password);
    $('#modifyName').val(employee.name);
    $('#modifyBirthday').val(employee.birthday);
    $('#modifyPhone').val(employee.phone);
    $('#modifyAddress').val(employee.address);

    if (typeof index !== 'undefined') {
        if (arrEmployees[index].role === 'admin') {
            $('#modifyRoleAdmin').prop('checked', true);
            $('#modifyRoleEmployee').prop('checked', false);
        } else {
            $('#modifyRoleEmployee').prop('checked', true);
            $('#modifyRoleAdmin').prop('checked', false);
        }
        $('#btnModifyEmployee').attr('type-action', 'update');
    } else {
        $('#modifyRoleEmployee').prop('checked', true);
        $('#modifyRoleAdmin').prop('checked', false);
        $('#btnModifyEmployee').attr('type-action', 'create');
    }

    $("#modifyBirthday").on("change", function() {
        this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format(this.getAttribute("data-date-format")))
    }).trigger("change");
}
$('#btnModifyEmployee').on('click', function() {
    $('.waiting-loader').removeClass('d-none');

    var params = {
        'id': $('#idEmployee').val().trim(),
        'createdDateTime': $('#createdDateTimeEmployee').val().trim(),
        'username' : $('#modifyUsername').val().trim(),
        'password' : $('#modifyPassword').val().trim(),
        'name' : $('#modifyName').val().trim(),
        'birthday' : $('#modifyBirthday').val().trim(),
        'phone' : $('#modifyPhone').val().trim(),
        'address' : $('#modifyAddress').val().trim(),
        'role' : $('input[name=modifyRole]:checked').val().trim()
    }

    let type = $(this).attr('type-action');
    let url;
    if (type === 'create') {
        let exist = arrEmployees.some(employee => employee.username === $('#modifyUsername').val().trim());
        if (exist || !checkValidateCRUDEmployee(params)) {
            $('.waiting-loader').addClass('d-none');
            $('#notifyText').removeClass('text-success').addClass('text-danger');
            $('#modalNotify .modal-body').text('Tạo nhân viên không thành công.');
            $('#btnModalNotify').click();
            setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            return;
        }

        url = '/create-employee';
    } else {
        if (!checkValidateCRUDEmployee(params)) {
            $('.waiting-loader').addClass('d-none');
            $('#notifyText').removeClass('text-success').addClass('text-danger');
            $('#modalNotify .modal-body').text('Cập nhật thông tin nhân viên không thành công.');
            $('#btnModalNotify').click();
            setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            return;
        }

        url = '/update-employee';
    }

    $.ajax({
        url: url,
        type: "POST",
        data: params,
        success: function (response) {
            if (type === 'create') {
                if (response.status) {
                    interval = setInterval(function() {
                        checkCreateEmployeeDone(response.id);
                    }, 500);
                    setTimeout(function() { clearInterval(interval); }, 60000);
                } else {
                    clearInterval(interval);
                    $('.waiting-loader').addClass('d-none');

                    $('#notifyText').removeClass('text-success').addClass('text-danger');
                    $('#modalNotify .modal-body').text('Tạo nhân viên không thành công.');
                    $('#btnModalNotify').click();
                    setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
                }
            } else {
                if (response.status) {
                    interval = setInterval(function() {
                        checkUpdateEmployeeDone(params);
                    }, 500);
                    setTimeout(function() { clearInterval(interval); }, 60000);
                } else {
                    clearInterval(interval);
                    $('.waiting-loader').addClass('d-none');

                    $('#notifyText').removeClass('text-success').addClass('text-danger');
                    $('#modalNotify .modal-body').text('Cập nhật thông tin nhân viên không thành công.');
                    $('#btnModalNotify').click();
                    setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
                }
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
});
/* Delete employee */
var injectIdDeleteEmployee = function(id) {
    $('#modalWarningEmployee button[type=button]').attr('data-id', id);
};
$('#modalWarningEmployee button[type=button]').on('click', function() {
    $('.waiting-loader').removeClass('d-none');
    let id = $(this).attr('data-id');
    $.ajax({
        url: "/delete-employee",
        type: "POST",
        data: { 'id': id },
        success: function (response) {
            if (response.status) {
                interval = setInterval(function() {
                    checkDeleteEmployeeDone(id);
                }, 500);
                
                setTimeout(function() { clearInterval(interval); }, 60000);
            } else {
                $('.waiting-loader').addClass('d-none');
                clearInterval(interval);

                $('#notifyText').removeClass('text-success').addClass('text-danger');
                $('#modalNotify .modal-body').text('Xóa nhân viên không thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
});
/* Check CRUD employee */
var checkCreateEmployeeDone = function(id) {
    $.ajax({
        url: "/check-create-done",
        type: "POST",
        data: { 'id': id, 'table': 'employee' },
        success: function (response) {
            if (response.status) {
                clearInterval(interval);

                getListEmployee();

                $('.waiting-loader').addClass('d-none');

                $('#notifyText').removeClass('text-danger').addClass('text-success');
                $('#modalNotify .modal-body').text('Tạo nhân viên thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}
var checkUpdateEmployeeDone = function(obj) {
    $.ajax({
        url: "/check-update-done",
        type: "POST",
        data: { 'id': obj.id, 'table': 'employee' },
        success: function (response) {
            if (response.status) {
                let employee = response.dataObj
                /*console.log((obj.username === String(employee.username)));
                console.log((obj.password === String(employee.password)));
                console.log((obj.name === String(employee.name)));
                console.log((obj.birthday === String(employee.birthday)));
                console.log((obj.phone === String(employee.phone)));
                console.log((obj.address === String(employee.address)));
                console.log((obj.role === String(employee.role)));*/

                if ((obj.username === String(employee.username)) && (obj.password === String(employee.password)) &&
                    (obj.name === String(employee.name)) && (obj.birthday === String(employee.birthday)) &&
                    (obj.phone === String(employee.phone)) && (obj.address === String(employee.address)) &&
                    (obj.role === String(employee.role))) {
                   
                    clearInterval(interval);

                    getListEmployee();

                    $('.waiting-loader').addClass('d-none');

                    $('#notifyText').removeClass('text-danger').addClass('text-success');
                    $('#modalNotify .modal-body').text('Cập nhật thông tin nhân viên thành công.');
                    $('#btnModalNotify').click();
                    setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
                }
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}
var checkDeleteEmployeeDone = function(id) {
    $.ajax({
        url: "/check-delete-done",
        type: "POST",
        data: { 'id': id, 'table': 'employee' },
        success: function (response) {
            if (response.status) {
                clearInterval(interval);

                getListEmployee();

                $('.waiting-loader').addClass('d-none');

                $('#notifyText').removeClass('text-danger').addClass('text-success');
                $('#modalNotify .modal-body').text('Xóa nhân viên thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}

/* Statictis money by month */
var getListStatictisMoney = function() {
    $('.waiting-loader').removeClass('d-none');
    if ($('#dataStatictisMoney').children().length !== 0) {
        $('.waiting-loader').addClass('d-none');
        return;
    }

    let params = listStrMonthYear();
    $.ajax({
        url: "/get-money-statistic",
        type: "POST",
        data: { 'list': params.list, 'size' : params.size },
        success: function (response) {
            if (response.status) {
                injectMonthStatictisMoney(response.data);
            } else {
                $('.waiting-loader').addClass('d-none');
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });     
};
var listStrMonthYear = function() {
    let listMonthYear = '';
    let size = 0;

    let monthData = 09;
    let yearData = 2019;
    let date = new Date();
    let currentMonth = (date.getMonth() + 1);
    let currentYear = date.getFullYear();
    while (monthData <= currentMonth || yearData !== currentYear) {
        listMonthYear += ('0' + monthData).slice(-2) + '-' + currentYear + ',';
        size += 1;
        if (monthData < 12) {
            monthData += 1;
        } else {
            monthData = 1;
            yearData += 1;
        }
    }

    return {
        'list': listMonthYear.substring(0, listMonthYear.length - 1),
        'size': size
    };
};
var injectMonthStatictisMoney = function(monthsStatictis) {
    let html = '';
    for (let item of monthsStatictis) {
        html += '<div id="statictis-block-'+ item.month_year +'">'
        html += '<div class="toast-header" data-toggle="collapse" href="#manageMonney-'+ item.month_year +'" onclick="getDateStatictis(\''+ item.month_year +'\')">';
        html += '<div class="w-20px h-20px mr-2">';
        html += '<i class="fa fa-calendar" aria-hidden="true"></i>';
        html += '</div>';
        html += '<strong class="mr-auto text-capitalize">'+ item.month_year +'</strong>';
        html += '<small class="text-muted mr-5">';
        html += '<span class="text-success">'+ item.total_money +'</span>';
        html += '<i class="fa fa-money ml-3 text-dark" aria-hidden="true"></i>';
        html += '</small>';
        html += '</div>';
        html += '<div class="toast-body border collapse multi-collapse pt-0 pb-0" id="manageMonney-'+ item.month_year +'">';
        html += '<div class="row">';
        html += '<div class="col-sm-3 border-right d-flex flex-column-reverse" id="col-1-date-'+ item.month_year +'"></div>';
        html += '<div class="col-sm-3 border-right d-flex flex-column-reverse" id="col-2-date-'+ item.month_year +'"></div>';
        html += '<div class="col-sm-3 border-right d-flex flex-column-reverse" id="col-3-date-'+ item.month_year +'"></div>';
        html += '<div class="col-sm-3 d-flex flex-column-reverse align-self-start" id="col-4-date-'+ item.month_year +'"></div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
    }
    
    $('#dataStatictisMoney').append(html);
    $('.waiting-loader').addClass('d-none');
};

var getDateStatictis = function(monthYear) {
    $('.waiting-loader').removeClass('d-none');
    if ($('#col-1-date-' + monthYear).children().length !== 0 &&
        $('#col-2-date-' + monthYear).children().length !== 0 &&
        $('#col-3-date-' + monthYear).children().length !== 0 &&
        $('#col-4-date-' + monthYear).children().length !== 0) {
        $('.waiting-loader').addClass('d-none');
        return;
    }

    let listDay = getListStrDateInMonth(monthYear);
    $.ajax({
        url: "/get-money-statistic",
        type: "POST",
        data: { 'list': listDay.days, 'size': listDay.size },
        success: function (response) {
            if (response.status) {
                let daysStatictis = response.data;
                for (let i = 0; i < daysStatictis.length; i++) {
                    let dayMonthYear = daysStatictis[i].month_year.split('-');
                    let day = dayMonthYear[0];
                    let monthYear = dayMonthYear[1] + '-' + dayMonthYear[2];
                    
                    if (day <= 8) {
                        injectDataStatictisMoney(1, day, monthYear, daysStatictis[i].total_money);
                    } else if (day <= 16) {
                        injectDataStatictisMoney(2, day, monthYear, daysStatictis[i].total_money);
                    } else if(day <= 24) {
                        injectDataStatictisMoney(3, day, monthYear, daysStatictis[i].total_money);
                    } else {
                        injectDataStatictisMoney(4, day, monthYear, daysStatictis[i].total_money);
                    } 
                } 
            } else {
                $('.waiting-loader').addClass('d-none');
            }
            
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    }); 
}
var getListStrDateInMonth = function(monthYear) {
    let arrMonthYear = monthYear.split('-');
    let lengthDate = new Date(arrMonthYear[1], arrMonthYear[0], 0).getDate();

    let days = '';
    for (let date = 1; date <= lengthDate; date++) {
        days += ('0' + date).slice(-2)+ '-' + monthYear + ',';
    }

    return {
        'days': days.substring(0, days.length - 1),
        'size': lengthDate
    };
}
var injectDataStatictisMoney = function(col, day, monthYear, money, lengthDays) {
    let html = '<p>'+ day +'-'+ monthYear +': <span class="text-success">'+ money +'</span></p>';
    $('#col-'+ col +'-date-'+ monthYear).append(html);

    if (day === '01') {
        $('.waiting-loader').addClass('d-none');
    }
}

/* Get history by date */
var getHistory = function(date) {
    $('.waiting-loader').removeClass('d-none');
    let arrDate = date.split('-')
    $.ajax({
        url: "/get-history",
        type: "POST",
        data: { 'day': arrDate[2], 'month': arrDate[1], 'year': arrDate[0] },
        success: function (response) {
            if (response.status) {
                appendDataHistory(response.historys);

                if (response.historys.length === 0) {
                    $('#dataHistory').addClass('bg-image-no-result');
                } else {
                    $('#dataHistory').removeClass('bg-image-no-result');
                }
            } else {
                $('#dataHistory').addClass('bg-image-no-result');
                $('.waiting-loader').addClass('d-none');
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
var appendDataHistory = function(historys) {
    let html = '';
    for(let item of historys) {
        html += '<li class="media border rounded mb-2 d-flex justify-content-between">';
        html += '<div class="media-body col-sm-8">';
        html += item.content
        html += '</div>';
        html += '<div class="media-body col-sm-3 pt-2">';
        html += item.created_date_time;
        html += '</div>';
        html += '</li>';
    }
    $('#dataHistory').html(html);
    $('.waiting-loader').addClass('d-none');
};

/* Get Statictis Customer */
var getStatictisCustomer = function() {
    $('.waiting-loader').removeClass('d-none');
    $.ajax({
        url: "/get-statictis-customer",
        type: "POST",
        success: function (response) {
            if (response.status) {
                arrStatictisCustomer = response.customers;
                appendStatictisCustomer(arrStatictisCustomer);

                //Handle search date
                $('#searchCustomer').keypress(function(e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        handleSearchCustomer($('#searchCustomer').val());
                    }
                });
                $('#btnSearchCustomer').on('click', function() {
                    handleSearchCustomer($('#searchCustomer').val());
                })
            } else {
                $('.waiting-loader').addClass('d-none');
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
var appendStatictisCustomer = function(customers) {
    let html = '';
    for (let customer of customers) {
        html += '<tr>';
        html += '<td>'+ customer.name +'</td>';
        html += '<td>'+ customer.birthday +'</td>';
        html += '<td>'+ customer.address +'</td>';
        html += '<td>'+ customer.frequenc +'</td>';
        html += '</tr>';
    }
    
    $('#module-statistic-customer tbody').html(html);
    $('.waiting-loader').addClass('d-none');
};
var handleSearchCustomer = function(keyword) {
    let tmpArrStatictisCustomer = [];
    arrStatictisCustomer.filter(function(item,index){
        if(item.name.match(new RegExp(keyword, 'g'))) {
            tmpArrStatictisCustomer.push(item);
        }
    });
    appendStatictisCustomer(tmpArrStatictisCustomer);
};
 
/* Saundry Setting  */
var getSettings = function() {
    $.ajax({
        url: "/get-setting",
        type: "GET",
        success: function (response) {
            if (response.status) {
                let setting = response.settings;
                $('#settingTotalMachineWashing').val(setting.total_machine_washing),
                $('#settingWash1To3').val(setting.price_wash_1_to_3),
                $('#settingWash3To5').val(setting.price_wash_3_to_5),
                $('#settingWash5To7').val(setting.price_wash_5_to_7),
                $('#settingWashMoreThan7').val(setting.price_wash_more_than_7),
                $('#settingDrying1To3').val(setting.price_drying_1_to_3),
                $('#settingDrying3To5').val(setting.price_drying_3_to_5),
                $('#settingDrying5To7').val(setting.price_drying_5_to_7),
                $('#settingDryingMoreThan7').val(setting.price_drying_more_than_7),
                $('#settingWashSpecial').val(setting.price_wash_special),
                $('#settingWashBlanket').val(setting.price_wash_blanket),
                $('#settingAddFabricSoftener').val(setting.price_add_fbric_softener),
                $('#settingSmallBear').val(setting.price_small_bear),
                $('#settingBigBear').val(setting.price_big_bear)
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
$('#btnSetting').on('click', function() {
    $('.waiting-loader').removeClass('d-none');
    var params = {
        'settingTotalMachineWashing': $('#settingTotalMachineWashing').val(),
        'priceWash1To3': $('#settingWash1To3').val(),
        'priceWash3To5': $('#settingWash3To5').val(),
        'priceWash5To7': $('#settingWash5To7').val(),
        'priceWashMoreThan7': $('#settingWashMoreThan7').val(),
        'priceDrying1To3': $('#settingDrying1To3').val(),
        'priceDrying3To5': $('#settingDrying3To5').val(),
        'priceDrying5To7': $('#settingDrying5To7').val(),
        'priceDryingMoreThan7': $('#settingDryingMoreThan7').val(),
        'priceWashSpecial': $('#settingWashSpecial').val(),
        'priceWashBlanket': $('#settingWashBlanket').val(),
        'priceAddFabricSoftener': $('#settingAddFabricSoftener').val(),
        'priceSmallBear': $('#settingSmallBear').val(),
        'priceBigBear': $('#settingBigBear').val()
    }

    if (!checkValidateUpdateSetting(params)) {
        $('.waiting-loader').addClass('d-none');
        $('#notifyText').removeClass('text-success').addClass('text-danger');
        $('#modalNotify .modal-body').text('Cập nhật thông số không thành công.');
        $('#btnModalNotify').click();
        setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
        return;
    }

    $.ajax({
        url: "/save-setting",
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                interval = setInterval(function() {
                    checkUpdateSettingDone(params);
                }, 500);
                setTimeout(function() { clearInterval(interval); }, 60000);
            } else {
                clearInterval(interval);
                
                $('.waiting-loader').addClass('d-none');

                $('#notifyText').removeClass('text-success').addClass('text-danger');
                $('#modalNotify .modal-body').text('Cập nhật thông số không thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
});
var checkUpdateSettingDone = function(obj) {
    $.ajax({
        url: "/check-update-done",
        type: "POST",
        data: { 'id': 'setting-01', 'table': 'setting' },
        success: function (response) {
            if (response.status) {
                let setting = response.dataObj;
                /*console.log(obj.settingTotalMachineWashing === String(setting.total_machine_washing));
                console.log(obj.priceWash1To3 === String(setting.price_wash_1_to_3));
                console.log(obj.priceWash3To5 === String(setting.price_wash_3_to_5));
                console.log(obj.priceWash5To7 === String(setting.price_wash_5_to_7));
                console.log(obj.priceWashMoreThan7 === String(setting.price_wash_more_than_7));
                console.log(obj.priceDrying1To3 === String(setting.price_drying_1_to_3));
                console.log(obj.priceDrying3To5 === String(setting.price_drying_3_to_5));
                console.log(obj.priceDrying5To7 === String(setting.price_drying_5_to_7));
                console.log(obj.priceDryingMoreThan7 === String(setting.price_drying_more_than_7));
                console.log(obj.priceWashSpecial === String(setting.price_wash_special));
                console.log(obj.priceWashBlanket === String(setting.price_wash_blanket));
                console.log(obj.priceAddFabricSoftener === String(setting.price_add_fbric_softener));
                console.log(obj.priceSmallBear === String(setting.price_small_bear));
                console.log(obj.priceBigBear === String(setting.price_big_bear));*/

                if ((obj.settingTotalMachineWashing === String(setting.total_machine_washing))&&
                    (obj.priceWash1To3 === String(setting.price_wash_1_to_3)) &&
                    (obj.priceWash3To5 === String(setting.price_wash_3_to_5)) &&
                    (obj.priceWash5To7 === String(setting.price_wash_5_to_7)) &&
                    (obj.priceWashMoreThan7 === String(setting.price_wash_more_than_7)) &&
                    (obj.priceDrying1To3 === String(setting.price_drying_1_to_3)) &&
                    (obj.priceDrying3To5 === String(setting.price_drying_3_to_5)) &&
                    (obj.priceDrying5To7 === String(setting.price_drying_5_to_7)) &&
                    (obj.priceDryingMoreThan7 === String(setting.price_drying_more_than_7)) &&
                    (obj.priceWashSpecial === String(setting.price_wash_special)) &&
                    (obj.priceWashBlanket === String(setting.price_wash_blanket)) &&
                    (obj.priceAddFabricSoftener === String(setting.price_add_fbric_softener)) &&
                    (obj.priceSmallBear === String(setting.price_small_bear)) &&
                    (obj.priceBigBear === String(setting.price_big_bear))) {
                        clearInterval(interval);

                        $('#menuModule li[module=setting]').click();

                        $('.waiting-loader').addClass('d-none');

                        $('#notifyText').removeClass('text-danger').addClass('text-success');
                        $('#modalNotify .modal-body').text('Cập nhật thông tin nhân viên thành công.');
                        $('#btnModalNotify').click();
                        setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
                }
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}

/* Validate */
var checkValidateCRUDEmployee = function(params) {
    /*console.log(validString(params.username) + ' - ' + params.username);
    console.log(validNumber(params.phone) + ' - ' + params.phone);*/

    if (validString(params.username) && validNumber(params.phone)) {
            return true;
    }
    return false;
};
var checkValidateUpdateSetting = function(params) {
    /*console.log(validNumber(params.settingTotalMachineWashing) + ' - ' + params.settingTotalMachineWashing);
    console.log(validNumber(params.priceWash1To3) + ' - ' + params.priceWash1To3);
    console.log(validNumber(params.priceWash3To5) + ' - ' + params.priceWash3To5);
    console.log(validNumber(params.priceWash5To7) + ' - ' + params.priceWash5To7);
    console.log(validNumber(params.priceWashMoreThan7) + ' - ' + params.priceWashMoreThan7);
    console.log(validNumber(params.priceDrying1To3) + ' - ' + params.priceDrying1To3);
    console.log(validNumber(params.priceDrying3To5) + ' - ' + params.priceDrying3To5);
    console.log(validNumber(params.priceDrying5To7) + ' - ' + params.priceDrying5To7);
    console.log(validNumber(params.priceDryingMoreThan7) + ' - ' + params.priceDryingMoreThan7);
    console.log(validNumber(params.priceWashSpecial) + ' - ' + params.priceWashSpecial);
    console.log(validNumber(params.priceWashBlanket) + ' - ' + params.priceWashBlanket);
    console.log(validNumber(params.priceAddFabricSoftener) + ' - ' + params.priceAddFabricSoftener);
    console.log(validNumber(params.priceSmallBear) + ' - ' + params.priceSmallBear);
    console.log(validNumber(params.priceBigBear) + ' - ' + params.priceBigBear);*/
    
    if (validNumber(params.settingTotalMachineWashing) && 
        validNumber(params.priceWash1To3) &&
        validNumber(params.priceWash3To5) &&
        validNumber(params.priceWash5To7) &&
        validNumber(params.priceWashMoreThan7) &&
        validNumber(params.priceDrying1To3) &&
        validNumber(params.priceDrying3To5) &&
        validNumber(params.priceDrying5To7) &&
        validNumber(params.priceDryingMoreThan7) &&
        validNumber(params.priceWashSpecial) &&
        validNumber(params.priceWashBlanket) &&
        validNumber(params.priceAddFabricSoftener) &&
        validNumber(params.priceSmallBear) &&
        validNumber(params.priceBigBear)) {
            return true;
    }
    return false;

}
var validString = function(value) {
    return /^([a-zA-Z0-9]+)$/.test(value);
};
var validNumber = function(value) {
    return /^([0-9]+)$/.test(value);
}

/* Notifi error API */
var notifyErrorServer = function() {
    $('.waiting-loader').addClass('d-none');
    $('#notifyText').removeClass('text-success').addClass('text-danger');
    $('#modalNotify .modal-body').text('Chương trình bị lỗi. Vui lòng thông báo tới quản lý về vấn đề này');
    $('#btnModalNotify').click();
    setTimeout(function() {$('#closeModalNotify').click();}, 10000);
};