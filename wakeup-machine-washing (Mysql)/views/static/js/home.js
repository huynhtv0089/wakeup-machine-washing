var infoSetting = {};
var htmlMachineWashing = '';
var arrDateOrdered = [];
var arrCustomer = [];
let orders = [];
var indexOrder = 0;
var currentDate = '01-01-1970';
var interval

$(document).ready(function () {
    $('.waiting-loader').removeClass('d-none');

    // Calculator and then reset height for area center
    let heightAfter = $(window).height() - $('#header').outerHeight(true);
    $('#center').css('height', heightAfter + 'px');

    updateCurrentDate()
    //Interval update currentDate after 1 hour once
    setInterval(function() { updateCurrentDate(); }, (3600 * 1000));

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
            if (infoSetting.role === 'admin') {
                $('#btnAdminPage').removeClass('d-none');
            }

            //Get Quantity Machine washing and create code html machine washing in "create order"
            htmlMachineWashing = createMachineWashing(infoSetting.total_machine_washing);
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
var createMachineWashing = function (quantity) {
    let html = '';
    for (let i = 1; i <= quantity; i++) {
        html += '<button class="btn btn-link p-0" data-machine="' + i + '">';
        html += '<img src="static/images/machine-washing.svg" width="50px" height="50px" />';
        html += '<p class="mb-0">' + i + '</p>';
        html += '</button>';
    }
    return html;
};
var settingMachineWashing = function(id, htmlMW) {
    $(id).html(htmlMW);

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
                            //$('#searchCustomer').val('');
                        }
                    });
                    $('#btnSearchDate').on('click', function() {
                        handleSearchDate($('#searchDate').val());
                        //Reset value input search customer
                        //$('#searchCustomer').val('');
                    })
                } else {
                    $('.waiting-loader').addClass('d-none');
                }
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
var handleAppendDateOrdered = function(arrCreatedDate) {
    let html = '';
    for (let item of arrCreatedDate) {
        html += '<li class="list-group-item d-flex justify-content-between align-items-center pt-2 pb-2" created-date="'+ item.created_date +'">';
        html += item.created_date;
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
    arrDateOrdered.filter(function(item,index){
        if(item.created_date.match(new RegExp(keyword, 'g'))) {
            tmpArrDateOrdered.push(item);
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
            notifyErrorServer();
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
    let params = {
        'date': date,
        'name': name.trim(),
        'phone': phone
    }

    $.ajax({
        url: "/get-list-order-by-info",
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                indexOrder = 0;
                orders = [];
                
                orders = response.orders;
                let lengthOrder = orders.length 
                // Display data
                if (lengthOrder > 0) {
                    let htmlMW = createMachineWashing(orders[indexOrder].total_machine_washing)
                    settingMachineWashing('#washingOrder', htmlMW);
                    injectInfoOrder(orders[indexOrder]);
                

                    // Set quantity for switch order
                    createPageMoreOrder(lengthOrder, indexOrder);
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
                } else {
                    $('.waiting-loader').addClass('d-none');
                }
            } else {
                $('.waiting-loader').addClass('d-none');
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
};
var createPageMoreOrder = function (lengthOrder) {
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
};
var injectInfoOrder = function(info) {
    // Set infomation personal
    $('#nameCustomer').val(info.name);
    $('#birthdayCustomer').val(info.birthday);
    $("#birthdayCustomer").on("change", function() {
        this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format( this.getAttribute("data-date-format")))
    }).trigger("change");
	$('#phoneCustomer').val(info.phone);
    $('#addressCustomer').val(info.address);
    
    // Set infomation service
	$('#serviceWash').val(info.wash);
    $('#serviceDrying').val(info.drying);   
	$('#serviceWashSpecial').val(info.wash_special);
	$('#serviceWashBlanket').val(info.wash_blanket);
	$('#addFabricSoftener').val(info.add_fabric_softener);
	$('#smallBear').val(info.small_bear);
    $('#bigBear').val(info.big_bear);
    $('#totalMoney').val(info.total_money);
    $('#saleOf').val(info.sale_of);
    $('#descSaleOf').text(info.description_sale_of);

    // Set using machine washing
    $('#washingOrder button').removeClass('border border-success');
    $('#washingOrder').find('button[data-machine=' + info.machine + ']').addClass('border border-success');

    // Set created_date_time
    $('#createDateTime').val(info.created_date_time);

    // Set attribute id for feature update or delete
    $('#modalWarning').find('button[type=button]').attr('order-id', info.id);

    // Set href show receipt
    $('#showReceipt').attr('href', '/receipt?id=' + info.id);

    //Turn off loadding
    $('.waiting-loader').addClass('d-none');
};

/* Create Order */
$('#createOrder').click(function() {
    $('#createBirthdayCustomer').val(currentDate);
    $("#createBirthdayCustomer").on("change", function() {
        this.setAttribute("data-date", moment(this.value, "YYYY-MM-DD").format( this.getAttribute("data-date-format")))
    }).trigger("change");

    settingMachineWashing('#washingCreateOrder', htmlMachineWashing);
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
        "wash": ($('#createServiceWash').val().trim() === '') ? 0 : $('#createServiceWash').val().trim(),
        "drying": ($('#createServiceDrying').val().trim() === '') ? 0 : $('#createServiceDrying').val().trim(),
        "washSpecial": ($('#createServiceWashSpecial').val().trim() === '') ? 0 : $('#createServiceWashSpecial').val().trim(),
        "washBlanket": ($('#createServiceWashBlanket').val().trim() === '') ? 0 : $('#createServiceWashBlanket').val().trim(),
        "addFabricSoftener": ($('#createAddFabricSoftener').val().trim() === '') ? 0 : $('#createAddFabricSoftener').val().trim(),
        "smallBear": ($('#createSmallBear').val().trim() === '') ? 0 : $('#createSmallBear').val().trim(),
        "bigBear": ($('#createBigBear').val().trim() === '') ? 0 : $('#createBigBear').val().trim(),
        "totalMoney": calculatorTotalMoney(infoSetting, 'create'),
        "saleOf" : ($('#createSaleOf').val().trim() === '') ? 0 : $('#createSaleOf').val().trim(),
        "descriptionSaleOf" : $('#createDescSaleOf').val(),
        "machine": (typeof machine === 'undefined')  ? 0 : machine
    };

    if (!checkValidateCRUD(params)) {
        $('.waiting-loader').addClass('d-none');
        
        $('#notifyText').removeClass('text-success').addClass('text-danger');
        $('#modalNotify .modal-body').text('Tạo đơn không thành công.');
        $('#btnModalNotify').click();
        setTimeout(function() {$('#closeModalNotify').click();}, 5000);
        return;
    }

    $.ajax({
        url: "/create-order",
        type: "POST",
        data: params,
        success: function (response) {
            if (response.status) {
                addHistory('add', machine);

                interval = setInterval(function() {
                    checkCreateDone(response.id);
                }, 500);
                setTimeout(function() { clearInterval(interval);}, 60000);
            } else {
                $('.waiting-loader').addClass('d-none');

                $('#notifyText').removeClass('text-success').addClass('text-danger');
                $('#modalNotify .modal-body').text('Tạo đơn không thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() {$('#closeModalNotify').click();}, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
});
var calculatorTotalMoney = function(price, type) {
    var total = 0;
    let serviceWash = parseFloat($((type === undefined) ? '#serviceWash': '#createServiceWash').val().trim() || 0);
    if (serviceWash >= 1 && serviceWash < 3) {
        total += parseFloat(price.price_wash_1_to_3);
    } else if (serviceWash >= 3 && serviceWash < 5) {
        total += parseFloat(price.price_wash_3_to_5);
    } else if (serviceWash >= 5) {
        total += parseFloat(price.price_wash_5_to_7);
    }

    let serviceDrying = parseFloat($((type === undefined) ? '#serviceDrying': '#createServiceDrying').val().trim() || 0);
    if (serviceDrying >= 1 && serviceDrying < 3) {
        total += parseFloat(price.price_drying_1_to_3);
    } else if (serviceDrying >= 3 && serviceDrying < 5) {
        total += parseFloat(price.price_drying_3_to_5);
    } else if (serviceDrying >= 5) {
        total += parseFloat(price.price_drying_5_to_7);
    }

    if (serviceWash > 7 || serviceDrying > 7) {
        let max = Math.max(serviceWash, serviceDrying);
        let coefficient = (parseInt(max) - 7) + 1;
        total += (parseFloat(price.price_wash_more_than_7) * coefficient);
    }

    total += parseFloat($((type === undefined) ? '#serviceWashSpecial' : '#createServiceWashSpecial').val().trim() || 0) * parseFloat(price.price_wash_special);
    total += parseFloat($((type === undefined) ? '#serviceWashBlanket' : '#createServiceWashBlanket').val().trim() || 0) * parseFloat(price.price_wash_blanket);
    total += parseFloat($((type === undefined) ? '#addFabricSoftener' : '#createAddFabricSoftener').val().trim() || 0) * parseFloat(price.price_add_fbric_softener);
    total += parseFloat($((type === undefined) ? '#smallBear' : '#createSmallBear').val().trim() || 0) * parseFloat(price.price_small_bear);
    total += parseFloat($((type === undefined) ? '#bigBear' : '#createBigBear').val().trim() || 0) * parseFloat(price.price_big_bear);
    //Calculator discount
    total = total - (total * (parseFloat($((type === undefined) ? '#saleOf' : '#createSaleOf').val().trim() || 0) / 100));
    return total;
}
var clearModalCreateOrder = function() {
    $('#createNameCustomer').val('');
    $('#createPhoneCustomer').val('');
    $('#createAddressCustomer').val('');
    $('#createServiceWash').val('0');
    $('#createServiceDrying').val('0');
    $('#createServiceWashSpecial').val('0');
    $('#createServiceWashBlanket').val('0');
    $('#createAddFabricSoftener').val('0');
    $('#createSmallBear').val('0');
    $('#createBigBear').val('0');
    $('#createSaleOf').val('0');
    $('#createDescSaleOf').val('');
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
    let orderId = orders[indexOrder].id; //$('#modalWarning').find('button[type=button]').attr('order-id');
    let machine;
    $('#washingOrder button').filter(function(index) {
        if ($(this).hasClass('border')) {
            machine = $(this).attr('data-machine');
        }
    });

    if(type === 'updateOrder') {
        //Check value is empty
        checkParamDTO();

        var params = {
            "id": orderId,
            "name": $('#nameCustomer').val().trim(),
            "birthday": $('#birthdayCustomer').val().trim(),
            "phone": $('#phoneCustomer').val().trim(),
            "address": $('#addressCustomer').val().trim(),
            "wash": ($('#serviceWash').val().trim() === '') ? 0 : $('#serviceWash').val().trim(),
            "drying": ($('#serviceDrying').val().trim() === '') ? 0 : $('#serviceDrying').val().trim(),
            "washSpecial": ($('#serviceWashSpecial').val().trim() === '') ? 0 : $('#serviceWashSpecial').val().trim(),
            "washBlanket": ($('#serviceWashBlanket').val().trim() === '') ? 0 : $('#serviceWashBlanket').val().trim(),
            "addFabricSoftener": ($('#addFabricSoftener').val().trim() === '') ? 0 : $('#addFabricSoftener').val().trim(),
            "smallBear": ($('#smallBear').val().trim() === '') ? 0 : $('#smallBear').val().trim(),
            "bigBear": ($('#bigBear').val().trim() === '') ? 0 : $('#bigBear').val().trim(),
            "machine": (typeof machine === 'undefined')  ? 0 : machine,
            "totalMoney": calculatorTotalMoney(orders[indexOrder]),
            "saleOf" : ($('#saleOf').val().trim() === '') ? 0 : $('#saleOf').val().trim(),
            "descriptionSaleOf" : $('#descSaleOf').val(),
            "createdDateTime": $('#createDateTime').val()
        };

        if (!checkValidateCRUD(params)) {
            $('.waiting-loader').addClass('d-none');
            
            $('#notifyText').removeClass('text-success').addClass('text-danger');
            $('#modalNotify .modal-body').text('Cập nhật đơn không thành công.');
            $('#btnModalNotify').click();
            setTimeout(function() {$('#closeModalNotify').click();}, 5000);
            return;
        }

        $.ajax({
            url: "/update-order",
            type: "POST",
            data: params,
            success: function (response) {
                if (response.status) {
                    addHistory('update', machine);

                    interval = setInterval(function() {
                        checkUpdateDone(params);
                    }, 500);

                    setTimeout(function() { clearInterval(interval); }, 60000);
                } else {
                    $('.waiting-loader').addClass('d-none');

                    $('#notifyText').removeClass('text-success').addClass('text-danger');
                    $('#modalNotify .modal-body').text('Cập nhật đơn không thành công.');
                    $('#btnModalNotify').click();
                    setTimeout(function() {$('#closeModalNotify').click();}, 5000);
                }
            }, error: function (error) {
                console.log(error);
                notifyErrorServer();
            }
        });
    } else if(type === 'removeOrder') {
        let orderSettingId = orders[indexOrder].setting_order_id;
        $.ajax({
            url: "/delete-order",
            type: "POST",
            data: { 'orderSettingId' : orderSettingId, 'orderId': orderId },
            success: function (response) {
                if (response.status) {
                    addHistory('delete', machine);

                    interval = setInterval(function() {
                        checkDeleteDone(orderId);
                    }, 500);

                    setTimeout(function() { clearInterval(interval); }, 60000);
                } else {
                    $('.waiting-loader').addClass('d-none');

                    $('#notifyText').removeClass('text-success').addClass('text-danger');
                    $('#modalNotify .modal-body').text('Xóa đơn không thành công.');
                    $('#btnModalNotify').click();
                    setTimeout(function() {$('#closeModalNotify').click();}, 5000);
                }
            }, error: function (error) {
                console.log(error);
                notifyErrorServer();
            }
        });
    }
};
var checkParamDTO = function() {
    if ($('#serviceWash').val().trim() === '') {
        $('#serviceWash').val('0');
    }
    if ($('#serviceDrying').val().trim() === '')  {
        $('#serviceDrying').val('0');
    }
    if ($('#serviceWashSpecial').val().trim() === '') {
        $('#serviceWashSpecial').val('0');  
    } 
    if ($('#serviceWashBlanket').val().trim() === '') {
        $('#serviceWashBlanket').val('0');   
    }
    if ($('#addFabricSoftener').val().trim() === '') {
        $('#addFabricSoftener').val('0');
    }
    if ($('#smallBear').val().trim() === '') {
        $('#smallBear').val('0');
    }
    if ($('#bigBear').val().trim() === '') {
        $('#bigBear').val('0');
    }
    if ($('#saleOf').val().trim() === '') {
        $('#saleOf').val(0);
    }
};

/* Add history */
var addHistory = function(type, numberMachine) {
    let content = '';
    switch (type) {
        case 'add':
            content += '<h4 class="text-success">Nhân viên <b>' + infoSetting.employee + '</b> đã tạo 1 đơn hàng</h4>';
            content = listInfoUpdateAndDeleteHistory(content, numberMachine, 'create');
            break;
        case 'update':
            content += '<h4 class="text-warning">Nhân viên <b>' + infoSetting.employee + '</b> đã chỉnh sửa 1 đơn hàng</h4>';
            content = listInfoUpdateAndDeleteHistory(content, numberMachine, 'update');
            break;
        case 'delete':
            content += '<h4 class="text-danger">Nhân viên <b>' + infoSetting.employee + '</b> đã xóa 1 đơn hàng</h4>';
            content = listInfoUpdateAndDeleteHistory(content, numberMachine, 'delete');
            break;
    }

    $.ajax({
        url: "/add-history",
        type: "POST",
        data: { 'content': content },
        error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}
var listInfoUpdateAndDeleteHistory = function(content, numberMachine, feature) {
    if (feature === 'create') {
        content += '<ul>';
        content += '<li><b>Tên: </b> '+ $('#createNameCustomer').val() +'</li>';
        content += '<li><b>Ngày sinh: </b> '+ $('#createBirthdayCustomer').val() +'</li>';
        content += '<li><b>Số điện thoại: </b> '+ $('#createPhoneCustomer').val() +'</li>';
        content += '<li><b>Địa chỉ: </b> '+ $('#createAddressCustomer').val() +'</li>';
        content += '<li><b>Máy giặt số: </b> '+ numberMachine +'</li>';
        content += '<li><b>Giặt quần áo (kg): </b> '+ $('#createServiceWash').val() +'</li>';
        content += '<li><b>Sấy quần áo (kg): </b> '+ $('#createServiceDrying').val() +'</li>';
        content += '<li><b>Giặt và sấy bỏ riêng (kg): </b> '+ $('#createServiceWashSpecial').val() +'</li>';
        content += '<li><b>Giặt mền(kg): </b> '+ $('#createServiceWashBlanket').val() +'</li>';
        content += '<li><b>Thêm nước giặt hoặc nước xả (nắp): </b> '+ $('#createAddFabricSoftener').val() +'</li>';
        content += '<li><b>Thú bông nhỏ (con): </b> '+ $('#createSmallBear').val() +'</li>';
        content += '<li><b>Thú bông con (con): </b> '+ $('#createBigBear').val() +'</li>';
        content += '</ul>';
    } else {
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
    }
    return content;
}

/* Check done CRUD api */
var checkCreateDone = function(id) {
    $.ajax({
        url: "/check-create-done",
        type: "POST",
        data: { 'id': id, 'table': 'order' },
        success: function (response) {
            if (response.status) {
                clearInterval(interval);
                
                clearModalCreateOrder();
                getListDateOrdered();

                $('.waiting-loader').addClass('d-none');

                $('#notifyText').removeClass('text-danger').addClass('text-success');
                $('#modalNotify .modal-body').text('Tạo đơn thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() {$('#closeModalNotify').click();}, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}
var checkUpdateDone = function(obj) {
    $.ajax({
        url: "/check-update-done",
        type: "POST",
        data: { 'id': obj.id, 'table': 'order' },
        success: function (response) {
            if (response.status) {
                let order = response.dataObj;
                /*console.log(obj.wash === String(order.wash));
                console.log(obj.drying === String(order.drying));
                console.log(obj.washSpecial === String(order.wash_special));
                console.log(obj.washBlanket === String(order.wash_blanket));
                console.log(obj.addFabricSoftener === String(order.add_fabric_softener)); 
                console.log(obj.smallBear === String(order.small_bear));
                console.log(obj.bigBear ===  String(order.big_bear));
                console.log(obj.machine === String(order.machine));
                console.log(obj.saleOf === String(order.sale_of));
                console.log(obj.descriptionSaleOf === String(order.description_sale_of));*/

                if ((obj.name === String(order.name)) && (obj.birthday === String(order.birthday)) && 
                    (obj.phone === String(order.phone)) && (obj.address === String(order.address)) && 
                    (obj.wash === String(order.wash)) && 
                    (obj.drying === String(order.drying)) &&
                    (obj.washSpecial === String(order.wash_special)) && 
                    (obj.washBlanket === String(order.wash_blanket)) &&
                    (obj.addFabricSoftener === String(order.add_fabric_softener)) && 
                    (obj.smallBear === String(order.small_bear)) &&
                    (obj.bigBear ===  String(order.big_bear)) && 
                    (String(obj.machine) === String(order.machine)) &&
                    (obj.saleOf === String(order.sale_of)) &&
                    (obj.descriptionSaleOf === String(order.description_sale_of))) {

                    clearInterval(interval);

                    getListCustomerByDate(obj.createdDateTime.split(' ')[0]);

                    $('.waiting-loader').addClass('d-none');

                    $('#notifyText').removeClass('text-danger').addClass('text-success');
                    $('#modalNotify .modal-body').text('Cập nhật đơn thành công.');
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
var checkDeleteDone = function(id) {
    $.ajax({
        url: "/check-delete-done",
        type: "POST",
        data: { 'id': id, 'table': 'order' },
        success: function (response) {
            if (response.status) {
                clearInterval(interval);
                
                getListDateOrdered();

                $('.waiting-loader').addClass('d-none');

                $('#notifyText').removeClass('text-danger').addClass('text-success');
                $('#modalNotify .modal-body').text('Xóa đơn thành công.');
                $('#btnModalNotify').click();
                setTimeout(function() { $('#closeModalNotify').click(); }, 5000);
            }
        }, error: function (error) {
            console.log(error);
            notifyErrorServer();
        }
    });
}

/* Validate */ 
var checkValidateCRUD = function(params) {
    /*console.log(validNumber(params.phone) + ' - ' + params.phone);
    console.log(validFloatNumber(params.wash) + ' - ' + params.wash);
    console.log(validFloatNumber(params.drying) + ' - ' + params.drying);
    console.log(validFloatNumber(params.washSpecial) + ' - ' + params.washSpecial);
    console.log(validFloatNumber(params.washBlanket) + ' - ' + params.washBlanket);
    console.log(validFloatNumber(params.addFabricSoftener) + ' - ' + params.addFabricSoftener);
    console.log(validFloatNumber(params.smallBear) + ' - ' + params.smallBear);
    console.log(validFloatNumber(params.bigBear) + ' - ' + params.bigBear);
    console.log(validFloatNumber(params.saleOf) + ' - ' + params.saleOf);*/

    if (validNumber(params.phone) && 
        validFloatNumber(params.wash) &&
        validFloatNumber(params.drying) && 
        validFloatNumber(params.washSpecial) && 
        validFloatNumber(params.washBlanket) && 
        validFloatNumber(params.addFabricSoftener) && 
        validFloatNumber(params.smallBear) && 
        validFloatNumber(params.bigBear) &&
        validFloatNumber(params.saleOf)) {
            return true;
    }
    return false;
};
var validFloatNumber = function(value) {
    return /^([0-9\.]+)$/.test(value);
};
var validNumber = function(value) {
    return /^([0-9]+)$/.test(value);
};

/* Notifi error API */
var notifyErrorServer = function() {
    $('.waiting-loader').addClass('d-none');
    $('#notifyText').removeClass('text-success').addClass('text-danger');
    $('#modalNotify .modal-body').text('Chương trình bị lỗi. Vui lòng thông báo tới quản lý về vấn đề này');
    $('#btnModalNotify').click();
    setTimeout(function() {$('#closeModalNotify').click();}, 10000);
};