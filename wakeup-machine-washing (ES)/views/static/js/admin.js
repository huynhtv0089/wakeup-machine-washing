var arrEmployees = [];
let date = new Date();
let currentDate;

$(document).ready(function () {
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
                $('#module-history').addClass('d-none');
                break;
            case 'money':
                getListStatictisMoney();
                $('#module-employee').addClass('d-none');
                $('#module-money').removeClass('d-none');
                $('#module-setting').addClass('d-none');
                $('#module-history').addClass('d-none');
                break;
            case 'setting':
                getSettings();
                $('#module-employee').addClass('d-none');
                $('#module-money').addClass('d-none');
                $('#module-setting').removeClass('d-none');
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
                $('#module-setting').addClass('d-none');
                $('#module-history').removeClass('d-none');
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
            }
        }, error: function (error) {
            console.log(error);
        }
    });
};
var handleAppendEmployee = function(employees) {
    let html = '';
    
    for (let i in employees) {
        let arrBirthday = employees[i]._source.birthday.split('-');
        let birthday = ('0' + arrBirthday[2]).slice(-2)+ '-' +('0' + arrBirthday[1]).slice(-2)+ '-' +arrBirthday[0];

        html += '<div class="toast fade show mw-100">';
        html += '  <div class="toast-header">';
        html += '    <div class="w-20px h-20px mr-2 text-success">';
        html += '      <i class="fa fa-user-circle-o" aria-hidden="true"></i>';
        html += '    </div>';
        html += '    <strong class="mr-auto text-capitalize">'+ employees[i]._source.name + '</strong>';
        html += '    <button class="btn btn-sm btn-outline-warning mr-5" onclick="injectInfoEmployee('+ i +')"; data-toggle="modal" data-target="#modalModifyEmployee">';
        html += '      Chỉnh sửa <i class="fa fa-pencil-square-o" aria-hidden="true"></i>';
        html += '    </button>';
        html += '    <button class="btn btn-sm btn-outline-danger" onclick="injectIdDeleteEmployee(\''+ employees[i]._id +'\')" data-toggle="modal" data-target="#modalWarningEmployee">';
        html += '      Xóa <i class="fa fa-trash-o" aria-hidden="true"></i>';
        html += '    </button>';
        html += '  </div>';
        html += '  <div class="toast-body">';
        html += '    <div class="row">';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-user-secret" aria-hidden="true"></i>Tên đăng nhập: </p>';
        html += '          <p class="col-sm-6">'+ employees[i]._source.username +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-key" aria-hidden="true"></i>Mật khẩu: </p>';
        html += '          <p class="col-sm-6">'+ employees[i]._source.password +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-mobile pr-2" aria-hidden="true"></i>Số điện thoại: </p>';
        html += '          <p class="col-sm-6">'+ employees[i]._source.phone +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-birthday-cake" aria-hidden="true"></i>Sinh nhật: </p>';
        html += '          <p class="col-sm-6">'+ birthday +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="col-sm-6">';
        html += '        <div class="row">';
        html += '          <p class="col-sm-4 text-right"><i class="fa fa-map-marker pr-2" aria-hidden="true"></i>Địa chỉ: </p>';
        html += '          <p class="col-sm-6">'+ employees[i]._source.address +'</p>';
        html += '        </div>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '</div>';
    }
    $('#areaListEmployee').html(html);
}
var handleSearchEmployee = function(keyword) {
    let tmpObjEmployees = [];
    arrEmployees.filter(function(employee,index){
        if(employee._source.name.match(new RegExp(keyword, 'g'))) {
            tmpObjEmployees[index] = employee;
        }
    });
    handleAppendEmployee(tmpObjEmployees);
};
/* Modify employee */
var injectInfoEmployee = function(index) {
    var employee = {
        'id': (typeof index === 'undefined') ? '' : arrEmployees[index]._id,
        'createdDateTime' : (typeof index === 'undefined') ? '' : arrEmployees[index]._source.created_date_time,
        'username' : (typeof index === 'undefined') ? '' : arrEmployees[index]._source.username,
        'password' : (typeof index === 'undefined') ? '' : arrEmployees[index]._source.password,
        'name' : (typeof index === 'undefined') ? '' : arrEmployees[index]._source.name,
        'birthday' : (typeof index === 'undefined') ? currentDate : arrEmployees[index]._source.birthday,
        'phone' : (typeof index === 'undefined') ? '' : arrEmployees[index]._source.phone,
        'address' : (typeof index === 'undefined') ? '' : arrEmployees[index]._source.address
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
        if (arrEmployees[index]._source.role === 'admin') {
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
    let type = $(this).attr('type-action');
    let url;
    if (type === 'create') {
        url = '/create-employee';
        
        let exist = arrEmployees.some(employee => employee._source.username === $('#modifyUsername').val().trim());
        if (exist) {
            return;
        }
    } else {
        url = '/update-employee';
    }

    var params = {
        '_id': $('#idEmployee').val().trim(),
        'createdDateTime': $('#createdDateTimeEmployee').val().trim(),
        'username' : $('#modifyUsername').val().trim(),
        'password' : $('#modifyPassword').val().trim(),
        'name' : $('#modifyName').val().trim(),
        'birthday' : $('#modifyBirthday').val().trim(),
        'phone' : $('#modifyPhone').val().trim(),
        'address' : $('#modifyAddress').val().trim(),
        'role' : $('input[name=modifyRole]:checked').val().trim()
    }

    $.ajax({
        url: url,
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                let interval = setInterval(function() {
                    if (type === 'create') {
                        checkCreateEmployeeDone(response.id);
                    } else {
                        checkUpdateEmployeeDone(params);
                    }
                }, 500);
                setTimeout(function() {clearInterval(interval);}, 60000);
            }
        }, error: function (error) {
            console.log(error);
        }
    });
});
/* Delete employee */
var injectIdDeleteEmployee = function(id) {
    $('#modalWarningEmployee button[type=button]').attr('data-id', id);
};
$('#modalWarningEmployee button[type=button]').on('click', function() {
    let id = $(this).attr('data-id');
    $.ajax({
        url: "/delete-employee",
        type: "POST",
        data: { 'id': id },
        success: function (response) {
            if (response.status) {
                let interval = setInterval(function() {
                    checkDeleteEmployeeDone(id);
                }, 500);
                setTimeout(function() {clearInterval(interval);}, 60000);
            }
        }, error: function (error) {
            console.log(error);
        }
    });
});
/* Check CRUD employee */
var checkCreateEmployeeDone = function(id) {
    $.ajax({
        url: "/check-create-done",
        type: "POST",
        data: { 'id': id, 'type': 'employee' },
        success: function (response) {
            if (response.status) {
                $(location).attr('href', '/admin');
            }
        }, error: function (error) {
            console.log(error);
        }
    });
}
var checkUpdateEmployeeDone = function(obj) {
    $.ajax({
        url: "/check-update-done",
        type: "POST",
        data: { 'id': obj._id, 'type': 'employee' },
        success: function (response) {
            if (response.status) {
                let employee = response.dataObj._source

                if ((obj.username === employee.username) && (obj.password === employee.password) &&
                    (obj.name === employee.name) && (obj.birthday === employee.birthday)&&
                    (obj.phone === employee.phone) && (obj.address === employee.address) &&
                    (obj.role === employee.role)) {
                    $(location).attr('href', '/admin');
                }
            }
        }, error: function (error) {
            console.log(error);
        }
    });
}
var checkDeleteEmployeeDone = function(id) {
    $.ajax({
        url: "/check-delete-done",
        type: "POST",
        data: { 'id': id, 'type': 'employee' },
        success: function (response) {
            if (response.status) {
                $(location).attr('href', '/admin');
            }
        }, error: function (error) {
            console.log(error);
        }
    });
}

/* Statictis money by month */
var getListStatictisMoney = function() {
    if ($('#dataStatictisMoney').children().length !== 0) {
        return;
    }

    let monthData = 08;
    let yearData = 2019;
    let date = new Date();
    let currentMonth = (date.getMonth() + 1);
    let currentYear = date.getFullYear();

    while (monthData <= currentMonth || yearData !== currentYear) {
        let monthYear = ('0' + monthData).slice(-2) + '-' + currentYear;
        injectMonthStatictisMoney(monthYear);
        $.ajax({
            url: "/get-money-statistic",
            type: "POST",
            data: { 'data': monthYear },
            success: function (response) {
                if (response.status) {
                    $('#moneyValue-' + monthYear).text(response.totalMoney);
                }
            }, error: function (error) {
                console.log(error);
            }
        });      
        if (monthData < 12) {
            monthData += 1;
        } else {
            monthData = 1;
            yearData += 1;
        }
    }
};
var injectMonthStatictisMoney = function(monthYear) {
    let html = '';
    html += '<div id="statictis-block-'+ monthYear +'">'
    html += '<div class="toast-header" data-toggle="collapse" href="#manageMonney-'+ monthYear +'" onclick="getDateStatictis(\''+ monthYear +'\')">';
    html += '<div class="w-20px h-20px mr-2">';
    html += '<i class="fa fa-calendar" aria-hidden="true"></i>';
    html += '</div>';
    html += '<strong class="mr-auto text-capitalize">'+ monthYear +'</strong>';
    html += '<small class="text-muted mr-5">';
    html += '<span class="text-success" id="moneyValue-'+ monthYear +'"></span>';
    html += '<i class="fa fa-money ml-3 text-dark" aria-hidden="true"></i>';
    html += '</small>';
    html += '</div>';
    html += '<div class="toast-body collapse multi-collapse pt-0 pb-0" id="manageMonney-'+ monthYear +'">';
    html += '<div class="row">';
    html += '<div class="col-sm-3 border" id="col-1-date-'+ monthYear +'"></div>';
    html += '<div class="col-sm-3 border" id="col-2-date-'+ monthYear +'"></div>';
    html += '<div class="col-sm-3 border" id="col-3-date-'+ monthYear +'"></div>';
    html += '<div class="col-sm-3 border" id="col-4-date-'+ monthYear +'"></div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    
    $('#dataStatictisMoney').append(html);
};

var getDateStatictis = function(monthYear) {
    if ($('#col-1-date-' + monthYear).children().length !== 0 &&
        $('#col-2-date-' + monthYear).children().length !== 0 &&
        $('#col-3-date-' + monthYear).children().length !== 0 &&
        $('#col-4-date-' + monthYear).children().length !== 0) {
        return;
    }

    let arrMonthYear = monthYear.split('-');
    let lengthDate = new Date(arrMonthYear[1], arrMonthYear[0], 0).getDate();

    for (let date = 1; date <= lengthDate; date++) {
        let day = ('0' + date).slice(-2);
        let dayMonthYear = day + '-' + monthYear;
        if (date <= 8) {
            injectDataStatictisMoney(1, day, monthYear)
        } else if (date <= 16) {
            injectDataStatictisMoney(2, day, monthYear)
        } else if(date <= 24) {
            injectDataStatictisMoney(3, day, monthYear)
        } else {
            injectDataStatictisMoney(4, day, monthYear)
        }

        $.ajax({
            url: "/get-money-statistic",
            type: "POST",
            data: { 'data': dayMonthYear },
            success: function (response) {
                if (response.status) {
                    $('#moneyValue-' + dayMonthYear).text(response.totalMoney);
                }
            }, error: function (error) {
                console.log(error);
            }
        }); 
    }
}
var injectDataStatictisMoney = function(col, day, monthYear) {
    let html = '<p>'+ day +'-'+ monthYear +': <span class="text-success" id="moneyValue-'+ day +'-'+ monthYear +'"></span></p>';
    $('#col-'+ col +'-date-'+ monthYear).append(html);
}

/* Get history by date */
var getHistory = function(date) {
    $.ajax({
        url: "/get-history",
        type: "POST",
        data: { 'date': date },
        success: function (response) {
            if (response.status) {
                console.log(response.historys);
                appendDataHistory(response.historys);
            }
        }, error: function (error) {
            console.log(error);
        }
    });
};
var appendDataHistory = function(historys) {
    let html = '';
    for(let history of historys) {
        let item = history._source;
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
};
 
/* Saundry Setting  */
var getSettings = function() {
    $.ajax({
        url: "/get-setting",
        type: "GET",
        success: function (response) {
            if (response.status) {
                let setting = response.settings._source;
                $('#settingTotalMachineWashing').val(setting.total_machine_washing),
                $('#settingWash1To3').val(setting.wash_1_to_3),
                $('#settingWash3To5').val(setting.wash_3_to_5),
                $('#settingWash5To7').val(setting.wash_5_to_7),
                $('#settingWashMoreThan7').val(setting.wash_more_than_7),
                $('#settingDrying1To3').val(setting.drying_1_to_3),
                $('#settingDrying3To5').val(setting.drying_3_to_5),
                $('#settingDrying5To7').val(setting.drying_5_to_7),
                $('#settingDryingMoreThan7').val(setting.drying_more_than_7),
                $('#settingWashSpecial').val(setting.wash_special),
                $('#settingWashBlanket').val(setting.wash_blanket),
                $('#settingAddFabricSoftener').val(setting.add_fbric_softener),
                $('#settingSmallBear').val(setting.small_bear),
                $('#settingBigBear').val(setting.big_bear)
            }
        }, error: function (error) {
            console.log(error);
        }
    });
};
$('#btnSetting').on('click', function() {
    var params = {
        'settingTotalMachineWashing': $('#settingTotalMachineWashing').val(),
        'settingWash1To3': $('#settingWash1To3').val(),
        'settingWash3To5': $('#settingWash3To5').val(),
        'settingWash5To7': $('#settingWash5To7').val(),
        'settingWashMoreThan7': $('#settingWashMoreThan7').val(),
        'settingDrying1To3': $('#settingDrying1To3').val(),
        'settingDrying3To5': $('#settingDrying3To5').val(),
        'settingDrying5To7': $('#settingDrying5To7').val(),
        'settingDryingMoreThan7': $('#settingDryingMoreThan7').val(),
        'settingWashSpecial': $('#settingWashSpecial').val(),
        'settingWashBlanket': $('#settingWashBlanket').val(),
        'settingAddFabricSoftener': $('#settingAddFabricSoftener').val(),
        'settingSmallBear': $('#settingSmallBear').val(),
        'settingBigBear': $('#settingBigBear').val()
    }

    $.ajax({
        url: "/save-setting",
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                params._id = 'setting-01';
                let interval = setInterval(function() {
                    checkUpdateSettingDone(params);
                }, 500);
                setTimeout(function() {clearInterval(interval);}, 60000);
            }
        }, error: function (error) {
            console.log(error);
        }
    });
});
var checkUpdateSettingDone = function(obj) {
    $.ajax({
        url: "/check-update-done",
        type: "POST",
        data: { 'id': obj._id, 'type': 'setting' },
        success: function (response) {
            if (response.status) {
                let setting = response.dataObj._source

                if ((obj.settingTotalMachineWashing === setting.total_machine_washing)&&
                    (obj.settingWash1To3 === setting.wash_1_to_3)&&
                    (obj.settingWash3To5 === setting.wash_3_to_5)&&
                    (obj.settingWash5To7 === setting.wash_5_to_7)&&
                    (obj.settingWashMoreThan7 === setting.wash_more_than_7)&&
                    (obj.settingDrying1To3 === setting.drying_1_to_3)&&
                    (obj.settingDrying3To5 === setting.drying_3_to_5)&&
                    (obj.settingDrying5To7 === setting.drying_5_to_7)&&
                    (obj.settingDryingMoreThan7 === setting.drying_more_than_7)&&
                    (obj.settingWashSpecial === setting.wash_special)&&
                    (obj.settingWashBlanket === setting.wash_blanket)&&
                    (obj.settingAddFabricSoftener === setting.add_fbric_softener)&&
                    (obj.settingSmallBear === setting.small_bear)&&
                    (obj.settingBigBear === setting.big_bear)) {
                    $(location).attr('href', '/admin');
                }
            }
        }, error: function (error) {
            console.log(error);
        }
    });
}
