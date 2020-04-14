var infoSetting = {};
var htmlMachineWashing = '';
var arrDateOrdered = [];
var arrCustomer = [];
var currentDate = '01-01-1970';
var interval

$(document).ready(function () {
    $('.waiting-loader').removeClass('d-none');

    // Calculator and then reset height for area center
    let heightAfter = $(window).height() - $('#header').outerHeight(true);
    $('#center').css('height', heightAfter + 'px');

    updateCurrentDate()
    //Interval update currentDate after 1 minutes once
    setInterval(function() { updateCurrentDate(); console.log(currentDate) }, 30000);

    //Get config from server and then handle other task releated to config
    getInfoConfig();
    
    // Get list date ordered
    getListDateOrdered();

    
});

var getInfoConfig = function() {
    $.ajax({
        url: "/info-config",
        type: "GET",
        success: function (response) {
            infoSetting = response;
            //Show employee current
            $('#employee').text(infoSetting.employee);

            //Get Quantity Machine washing and create code html machine washing in "create order"
            createMachineWashing();
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
        }
    });
};
var createMachineWashing = function () {
    for (let i = 1; i <= infoSetting.quantityMachine; i++) {
        htmlMachineWashing += '<button class="btn btn-link p-0" data-machine="' + i + '">';
        htmlMachineWashing += '<img src="static/images/machine-washing.svg" width="50px" height="50px" />';
        htmlMachineWashing += '<p class="mb-0">' + i + '</p>';
        htmlMachineWashing += '</button>';
    }
};
var settingMachineWashing = function(id) {
    $(id).html(htmlMachineWashing);

    $(id).find('button').on('click', function() {
        $(id + ' button').removeClass('border border-success');
        $(this).addClass('border border-success');
    });
};
var updateCurrentDate = function() {
    let date = new Date();
    currentDate = date.getFullYear()+ '-' +('0' + (date.getMonth()+1)).slice(-2)+ '-' +('0' + date.getDate()).slice(-2);
};

/* List date ordered */
var getListDateOrdered = function() {
    $('.waiting-loader').removeClass('d-none');
    $.ajax({
        url: "/get-list-date-ordered",
        type: "GET",
        success: function (response) {
            if (response.status) {
                arrDateOrdered = response.dateOrdered;
                
                //Get list customer by first date
                if (arrDateOrdered.length > 0) {
                    //Append html and a few feature releative to it
                    handleAppendDateOrdered(arrDateOrdered);
                
                    //Handle search date
                    $('#searchDate').keypress(function(e) {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            handleSearchDate($('#searchDate').val());

                            //Reset value input search customer
                            $('#searchCustomer').val('');
                        }
                    });
                    $('#btnSearchDate').on('click', function() {
                        handleSearchDate($('#searchDate').val());
                        //Reset value input search customer
                        $('#searchCustomer').val('');
                    })
                } else {
                    $('.waiting-loader').addClass('d-none');
                }
            }
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
        }
    });
};
var handleAppendDateOrdered = function(createdDates) {
    let html = '';
    for (let createdDate of createdDates) {
        html += '<li class="list-group-item d-flex justify-content-between align-items-center pt-2 pb-2" created-date="'+ createdDate +'">';
        html += createdDate;
        html += '<span class="badge badge-primary badge-pill d-none">';
        html += '<i class="fa fa-hand-o-right" aria-hidden="true"></i>';
        html += '</span>';
        html += '</li>';
    }
    $('#dateOrdered').html(html);

    //Handle display list customer when user choose differrent date
    $('#dateOrdered').find('li').on('click', function() {
        $('#dateOrdered li').removeClass('bg-list');
        $('#dateOrdered li .badge').addClass('d-none');

        getListCustomerByDate($(this).attr('created-date'));
        $(this).addClass('bg-list');
        $(this).find('.badge').removeClass('d-none');
    });

    // And then auto click first date to show all customer
    $('#dateOrdered').children(':first').click();
};
var handleSearchDate = function(keyword) {
    let tmpArrDateOrdered = [];
    arrDateOrdered.filter(function(date,index){
        if(date.match(new RegExp(keyword, 'g'))) {
            tmpArrDateOrdered.push(date);
        }
    });
    handleAppendDateOrdered(tmpArrDateOrdered);
};

/* List customer */
var getListCustomerByDate = function(date) {
    $('.waiting-loader').removeClass('d-none');
    $.ajax({
        url: "/get-list-customer-by-date",
        type: "POST",
        data: {'date' : date},
        success: function (response) {
            if (response.status) {
                arrCustomer = response.customers;
                
                //Get info order by customer
                if (arrCustomer.length > 0) {
                    //Append html and a few feature releative to it
                    handleAppendCustomer(date, arrCustomer);
                    
                    //Handle search date
                    $('#searchCustomer').keypress(function(e) {
                        if (e.keyCode == 13) {
                            e.preventDefault();
                            handleSearchCustomer(date, $('#searchCustomer').val());
                        }
                    });
                    $('#btnsearchCustomer').on('click', function() {
                        handleSearchCustomer(date, $('#searchCustomer').val());
                    })
                } else {
                    $('.waiting-loader').addClass('d-none');
                }
            }
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
        }
    });
};
var handleAppendCustomer = function(date, customers) {
    let html = '';
    for (let customer of customers) {
        html += '<li class="list-group-item d-flex justify-content-between align-items-center pt-2 pb-2" data-name="'+ customer.name +'", data-phone="' + customer.phone + '">';
        html += customer.name;
        html += '<span class="badge badge-success badge-pill d-none">';
        html += '<i class="fa fa-hand-o-right" aria-hidden="true"></i>';
        html += '</span>';
        html += '</li>';
    }
    $('#customerByDate').html(html);

    //Handle display list order by customer when user choose differrent customer
    $('#customerByDate').find('li').on('click', function() {
        $('#customerByDate li').removeClass('bg-list');
        $('#customerByDate li .badge').addClass('d-none');

        getListOrderByCustomer(date, $(this).attr('data-name'), $(this).attr('data-phone'));
        $(this).addClass('bg-list');
        $(this).find('.badge').removeClass('d-none');
    });

    //And then auto click first customer to show all order of customer that
    $('#customerByDate').children(':first').click();
};
var handleSearchCustomer= function(date, keyword) {
    let tmpArrCustomer = [];
    arrCustomer.filter(function(customer,index){
        if(customer.name.match(new RegExp(keyword, 'g'))) {
            tmpArrCustomer.push(customer);
        }
    });
    handleAppendCustomer(date, tmpArrCustomer);
}

/* List orderd */
var getListOrderByCustomer = function(date, name, phone) {
    $('.waiting-loader').removeClass('d-none');
    $('#moreOrder').addClass('d-none');
    let params = {
        'date': date,
        'name': name.trim(),
        'phone': phone
    }
    console.log(params);

    $.ajax({
        url: "/get-list-order-by-info",
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                let indexOrder = 0;
                let orders = [];
                orders = response.orders;
                let lengthOrder = orders.length 
                // Display data
                if (lengthOrder > 0) {
                    settingMachineWashing('#washingOrder');
                    injectInfoOrder(orders[indexOrder]);
                }

                // Set quantity for switch order
                if (lengthOrder > 1) {
                    let html = '<button class="btn btn-sm btn-link" name="decrease">';
                        html += '<i class="fa fa-arrow-left" aria-hidden="true"></i>';
                        html += '</button>';
                        html += '<span>';
                        html += '<span name="number">1</span>/<span>'+ lengthOrder +'</span>';
                        html += '</span>';
                        html += '<button class="btn btn-sm btn-link" name="increase">';
                        html += '<i class="fa fa-arrow-right" aria-hidden="true"></i>';
                        html += '</button>';
                        
                    $('#moreOrder').html(html);
                    $('#moreOrder').removeClass('d-none');

                    $('#moreOrder').find('button').on('click', function() {
                        let pagingOrder = parseInt($('#moreOrder').find('span[name=number]').text());
                        if ($(this).attr('name') === 'increase') {
                            if(pagingOrder < lengthOrder) {
                                indexOrder += 1;
                                $('#moreOrder').find('span[name=number]').text(pagingOrder + 1);
                            }
                        } else {
                            if(pagingOrder > 1) {
                                indexOrder -= 1;
                                $('#moreOrder').find('span[name=number]').text(pagingOrder - 1);
                            }
                        }
                        injectInfoOrder(orders[indexOrder]);
                    });
                }
            }
            $('.waiting-loader').addClass('d-none');
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
        }
    });
};
var injectInfoOrder = function(info) {
    // Set infomation personal
    $('#nameCustomer').val(info._source.name);
    $('#birthdayCustomer').val(info._source.birthday);
    $("#birthdayCustomer").on("change", function() {
        this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format( this.getAttribute("data-date-format")))
    }).trigger("change");
	$('#phoneCustomer').val(info._source.phone);
    $('#addressCustomer').val(info._source.address);
    
    // Set infomation service
	$('#serviceWash').val(info._source.wash);
    $('#serviceDrying').val(info._source.drying);   
	$('#serviceWashSpecial').val(info._source.wash_special);
	$('#serviceWashBlanket').val(info._source.wash_blanket);
	$('#addFabricSoftener').val(info._source.add_fabric_softener);
	$('#smallBear').val(info._source.small_bear);
    $('#bigBear').val(info._source.big_bear);
    $('#totalMoney').val(info._source.total_money);

    // Set using machine washing
    $('#washingOrder button').removeClass('border border-success');
    $('#washingOrder').find('button[data-machine=' + info._source.machine + ']').addClass('border border-success');

    // Set created_date_time
    $('#createDateTime').val(info._source.created_date_time);

    // Set attribute id for feature update or delete
    $('#modalWarning').find('button[type=button]').attr('order-id', info._id);
};

/* Create Order */
$('#createOrder').click(function() {
    $('#createBirthdayCustomer').val(currentDate);
    $("#createBirthdayCustomer").on("change", function() {
        this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format( this.getAttribute("data-date-format")))
    }).trigger("change");

    settingMachineWashing('#washingCreateOrder');
});
$('#saveCreateOrder').click(function() {
    $('.waiting-loader').removeClass('d-none');
    let machine;
    $('#washingCreateOrder button').filter(function(index) {
        if ($(this).hasClass('border')) {
            machine = $(this).attr('data-machine');
        }
    });
    
    var params = {
        "name": $('#createNameCustomer').val().trim(),
        "birthday": $('#createBirthdayCustomer').val().trim(),
        "phone": $('#createPhoneCustomer').val().trim(),
        "address": $('#createAddressCustomer').val().trim(),
        "wash": $('#createServiceWash').val().trim(),
        "drying": $('#createServiceDrying').val().trim(),
        "washSpecial": $('#createServiceWashSpecial').val().trim(),
        "washBlanket": $('#createServiceWashBlanket').val().trim(),
        "addFabricSoftener": $('#createAddFabricSoftener').val().trim(),
        "smallBear": $('#createSmallBear').val().trim(),
        "bigBear": $('#createBigBear').val().trim(),
        "totalMoney": calculatorTotalMoney('create'),
        "machine": machine
    };

    $.ajax({
        url: "/create-order",
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                addHistory('add');

                interval = setInterval(function() {
                    checkCreateDone(response.id);
                }, 500);
                setTimeout(function() {
                    clearInterval(interval);
                    $('.waiting-loader').addClass('d-none');
                }, 60000);
            }
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
        }
    });
});
var calculatorTotalMoney = function(type) {
    var total = 0;
    let serviceWash = parseInt($((type === undefined) ? '#serviceWash': '#createServiceWash').val().trim() || 0);
    if (serviceWash < 3) {
        total += serviceWash * parseInt(infoSetting.wash1To3);
    } else if (serviceWash < 5) {
        total += serviceWash * parseInt(infoSetting.wash3To5);
    } else if (serviceWash < 7) {
        total += serviceWash * parseInt(infoSetting.wash5To7);
    } else {
        total += serviceWash * parseInt(infoSetting.washMoreThan7);
    }

    let serviceDrying = parseInt($((type === undefined) ? '#serviceDrying': '#createServiceDrying').val().trim() || 0);
    if (serviceDrying < 3) {
        total += serviceDrying * parseInt(infoSetting.drying1To3);
    } else if (serviceDrying < 5) {
        total += serviceDrying * parseInt(infoSetting.drying3To5);
    } else if (serviceDrying < 5) {
        total += serviceDrying * parseInt(infoSetting.drying5To7);
    } else {
        total += serviceDrying * parseInt(infoSetting.dryingMoreThan7);
    }

    total += parseInt($((type === undefined) ? '#serviceWashSpecial' : '#createServiceWashSpecial').val().trim() || 0) * parseInt(infoSetting.washSpecial);
    total += parseInt($((type === undefined) ? '#serviceWashBlanket' : '#createServiceWashBlanket').val().trim() || 0) * parseInt(infoSetting.washBlanket);
    total += parseInt($((type === undefined) ? '#addFabricSoftener' : '#createAddFabricSoftener').val().trim() || 0) * parseInt(infoSetting.addFbricSoftener);
    total += parseInt($((type === undefined) ? '#smallBear' : '#createSmallBear').val().trim() || 0) * parseInt(infoSetting.smallBear);
    total += parseInt($((type === undefined) ? '#bigBear' : '#createBigBear').val().trim() || 0) * parseInt(infoSetting.bigBear);

    return total;
}

/* Action update or delete order */
$('#actionOrder button[name=updateOrder], #actionOrder button[name=removeOrder]').on('click', function() {
    let typeAction;
    if($(this).attr('name') === 'updateOrder') {
        typeAction = 'updateOrder';
    } else {
        typeAction = 'removeOrder';
    }
    $('#modalWarning button[type=button]').attr('onclick', 'handleActionOrder("'+ typeAction +'")');
});
var handleActionOrder = function(type) {
    $('.waiting-loader').removeClass('d-none');
    let id = $('#modalWarning').find('button[type=button]').attr('order-id');
    let machine;
    $('#washingOrder button').filter(function(index) {
        if ($(this).hasClass('border')) {
            machine = $(this).attr('data-machine');
        }
    });

    if(type === 'updateOrder') {
        var params = {
            "_id": id,
            "name": $('#nameCustomer').val().trim(),
            "birthday": $('#birthdayCustomer').val().trim(),
            "phone": $('#phoneCustomer').val().trim(),
            "address": $('#addressCustomer').val().trim(),
            "wash": $('#serviceWash').val().trim(),
            "drying": $('#serviceDrying').val().trim(),
            "washSpecial": $('#serviceWashSpecial').val().trim(),
            "washBlanket": $('#serviceWashBlanket').val().trim(),
            "addFabricSoftener": $('#addFabricSoftener').val().trim(),
            "smallBear": $('#smallBear').val().trim(),
            "bigBear": $('#bigBear').val().trim(),
            "machine": machine,
            "totalMoney": calculatorTotalMoney(),
            "createdDateTime": $('#createDateTime').val()
        };

        $.ajax({
            url: "/update-order",
            type: "POST",
            data: params,
            success: function (response) {
                if (response.status) {
                    addHistory('update', machine);

                    interval = setInterval(function() {
                        checkUpdateDone(params);
                    }, 800);

                    setTimeout(function() {
                        clearInterval(interval);
                        $('.waiting-loader').addClass('d-none');
                    }, 60000);
                }
            }, error: function (error) {
                console.log(error);
                $('.waiting-loader').addClass('d-none');
            }
        });
    } else if(type === 'removeOrder') {
        $.ajax({
            url: "/delete-order",
            type: "POST",
            data: { 'id': id },
            success: function (response) {
                if (response.status) {
                    addHistory('delete', machine);

                    interval = setInterval(function() {
                        checkDeleteDone(id);
                    }, 500);

                    setTimeout(function() {
                        clearInterval(interval);
                        $('.waiting-loader').addClass('d-none');
                    }, 60000);
                }
            }, error: function (error) {
                console.log(error);
                $('.waiting-loader').addClass('d-none');
            }
        });
    }
}

/* Add history */
var addHistory = function(type, numberMachine) {
    let content = '';
    switch (type) {
        case 'add':
            content += '<h4 class="text-success">Nhân viên <b>' + infoSetting.employee + '</b> đã tạo 1 đơn hàng</h4>';
            break;
        case 'update':
            content += '<h4 class="text-warning">Nhân viên <b>' + infoSetting.employee + '</b> đã chỉnh sửa 1 đơn hàng</h4>';
            content = listInfoUpdateAndDeleteHistory(content, numberMachine);
            break;
        case 'delete':
            content += '<h4 class="text-danger">Nhân viên <b>' + infoSetting.employee + '</b> đã xóa 1 đơn hàng</h4>';
            content = listInfoUpdateAndDeleteHistory(content, numberMachine);
            break;
    }

    $.ajax({
        url: "/add-history",
        type: "POST",
        data: { 'content': content },
        error: function (error) {
            console.log(error);
        }
    });
}
var listInfoUpdateAndDeleteHistory = function(content, numberMachine) {
    content += '<ul>';
    content += '<li><b>Tên: </b> '+ $('#nameCustomer').val() +'</li>';
    content += '<li><b>Ngày sinh: </b> '+ $('#birthdayCustomer').val() +'</li>';
    content += '<li><b>Số điện thoại: </b> '+ $('#phoneCustomer').val() +'</li>';
    content += '<li><b>Địa chỉ: </b> '+ $('#addressCustomer').val() +'</li>';
    content += '<li><b>Máy giặt số: </b> '+ numberMachine +'</li>';
    content += '<li><b>Giặt quần áo (kg): </b> '+ $('#serviceWash').val() +'</li>';
    content += '<li><b>Sấy quần áo (kg): </b> '+ $('#serviceDrying').val() +'</li>';
    content += '<li><b>Giặt và sấy bỏ riêng (kg): </b> '+ $('#serviceWashSpecial').val() +'</li>';
    content += '<li><b>Giặt mền(kg): </b> '+ $('#serviceWashBlanket').val() +'</li>';
    content += '<li><b>Thêm nước giặt hoặc nước xả (nắp): </b> '+ $('#addFabricSoftener').val() +'</li>';
    content += '<li><b>Thú bông nhỏ (con): </b> '+ $('#smallBear').val() +'</li>';
    content += '<li><b>Thú bông con (con): </b> '+ $('#bigBear').val() +'</li>';
    content += '</ul>';
    return content;
}

/* Check done CRUD api */
var checkCreateDone = function(id) {
    $.ajax({
        url: "/check-create-done",
        type: "POST",
        data: { 'id': id, 'type': 'order' },
        success: function (response) {
            if (response.status) {
                clearInterval(interval);
                
                getListDateOrdered();

                $('.waiting-loader').addClass('d-none');

                $('#btnModalNotify').click();
                $('#modalNotify .modal-body').text('Tạo đơn thành công.');
                setTimeout(function() {
                    $('#closeModalNotify').click();
                }, 2000);
            }
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
            $('#btnModalNotify').click();
            $('#modalNotify .modal-body').text('Chương trình bị lỗi. Vui lòng thông báo tới quản lý về vấn đề này');
            setTimeout(function() {
                $('#closeModalNotify').click();
            }, 2000);
        }
    });
}
var checkUpdateDone = function(obj) {
    $.ajax({
        url: "/check-update-done",
        type: "POST",
        data: { 'id': obj._id, 'type': 'order' },
        success: function (response) {
            if (response.status) {
                let order = response.dataObj._source
                console.log(obj.name + '-' + order.name);
                console.log(obj.birthday + '-' + order.birthday);
                console.log(obj.address + '-' + order.address);
                console.log(obj.wash + '-' + order.wash);
                console.log(obj.drying + '-' + order.drying);
                console.log(obj.washSpecial + '-' + order.wash_special);
                console.log(obj.washBlanket + '-' + order.wash_blanket);
                console.log(obj.addFabricSoftener + '-' + order.add_fabric_softener);
                console.log(obj.smallBear + '-' + order.small_bear);
                console.log(obj.bigBear + '-' + order.big_bear);
                console.log(obj.machine + '-' + order.machine);


                if ((obj.name === order.name) && (obj.birthday === order.birthday) && (obj.phone === order.phone) && 
                    (obj.address === order.address) && (obj.wash === order.wash) && (obj.drying === order.drying) &&
                    (obj.washSpecial === order.wash_special) && (obj.washBlanket === order.wash_blanket) &&
                    (obj.addFabricSoftener === order.add_fabric_softener) && (obj.smallBear === order.small_bear) &&
                    (obj.bigBear === order.big_bear) && (obj.machine === order.machine)) {
                    
                    clearInterval(interval);

                    getListCustomerByDate(order.created_date_time.split(' ')[0]);

                    $('.waiting-loader').addClass('d-none');

                    $('#btnModalNotify').click();
                    $('#modalNotify .modal-body').text('Cập nhật đơn thành công.');
                    setTimeout(function() { $('#closeModalNotify').click(); }, 2000);
                }
            }
        }, error: function (error) {
            console.log(error);
            $('.waiting-loader').addClass('d-none');
            $('#modalNotify .modal-body').text('Chương trình bị lỗi. Vui lòng thông báo tới quản lý về vấn đề này');
            setTimeout(function() { $('#closeModalNotify').click(); }, 2000);
        }
    });
}
var checkDeleteDone = function(id) {
    $.ajax({
        url: "/check-delete-done",
        type: "POST",
        data: { 'id': id, 'type': 'order' },
        success: function (response) {
            if (response.status) {
                $(location).attr('href', '/');
                $('.waiting-loader').addClass('d-none');
            }
        }, error: function (error) {
            $('.waiting-loader').addClass('d-none');
            console.log(error);
            $('#modalNotify .modal-body').text('Chương trình bị lỗi. Vui lòng thông báo tới quản lý về vấn đề này');
            setTimeout(function() { $('#closeModalNotify').click(); }, 2000);
        }
    });
}