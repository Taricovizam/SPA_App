// Global Variables:
let payBtn, currentCategory, commissionsObj ={}, allServices = [], clientSources = [], currentClientID, currentClientName, currentStatus= [], staffObj = {};

const statusObj = {
    Occupied: "مشغول",
    "In-Progress": "جاري البدء",
    "Not-Assigned": "غير معين",
    Done: "جاري العمل",
    Finished: "انتهى",

}
// Global URLs:
const staffURL = "/v2/api/entity/staff/list/1?per_page=100000"
const commissionsRateURL = "/v2/api/entity/le_commission_map/1/4"
const servicesUsersURL = "/v2/api/entity/le_employee_service_map/1/4";
const clientSourcesURL = "/v2/api/entity/le_client_source_list/1"
const itemsURL = "/v2/api/entity/le_invoice-items";
// const staffURL = "/v2/api/entity/staff";
const bookingURL = "/v2/api/entity/le_workflow-type-entity-1";
const bookingModule = "/v2/api/entity/le_booking_module";


// ======= HTML Elements =========


function createBookingItem({ ...item }) {
    return `
    <div style="${
      item.key == 2 ? "background:#4d6348 !important" : ""
    }" target="_blank" class="booking-container" href="${
      "/owner/work_orders/workflow_view/" + item.id
    }">
    <div  class="booking-item">
      <div class="list-item-inicator"></div>
    <div class="item-box-1">
      
        <div class="list-item-title">
        اسم العميل: ${item.clientName || "-"}      
        </div>
        
      </div>
      <div class="item-box-2">
    
      <div class="item-box-2">
      تاريخ الحجز: ${item.itemStartDate || "-"}
    </div>
    </div>
      <div class="item-box-3">
      <button class="booking-done-btn">إنشاء فاتورة</button>
  </div>
      </div>
      <div class="smalldesc">
      <button class="expand-btn">المزيد</button>
      
        <p class="">
        <span>اسم الفرع:</sapn>
        <span>${item.itemBranch}</sapn>
        </p>
        <p class="">
        <span>طريقة الدفع:</sapn>
        <span>${item.itemPaymentMethod}</sapn>
        </p>
        <p class="">
        <span>وصف الحجز:</sapn>
        <span>${item.itemDesc}</sapn>
        </p>
        <p class="">
        <span>اسم الخدمات:</sapn>
        <span>${JSON.stringify(item.serviceNames)}</sapn>
        </p>
     
      </div>
  </div>
    `;
  }
  function currentUserBranch(){
    return { staff_id, branch_id } = USER
}

function createListItem(currentStatusThisService, item) {
    return `
    <div class="list-item ${item.item_status}" data-service-id="${
      currentStatusThisService.serviceID
    }" data-item-id="${item.id}">
      <div class="list-item-inicator"></div>
    <div class="item-box-1">
        <div class="list-item-client">اسم العميل: ${item.hidden_client_name}
        </div>
        <div class="list-item-title">
        اسم الخدمة: ${item["le_invoice-items_item_name"].name}
        </div>
        <div class="list-item-title">
        مصدر العميل: ${item.client_source || "-"}
        </div>
      </div>
      <div class="item-box-2">
      <div class="list-item-time">
      وقت البدء: <span>${item.time == null ? "--:--" : timeConvertTo12(item.time)}</span>
    </div>
    </div>
      <div class="item-box-3">
      <div class="select">
      <select id="service-${
        currentStatusThisService.serviceID
      }" " aria-label="Select menu example"  class=" ${
        currentStatusThisService.timeOffeset >= 1
        ? 'disabled-btn'
        : ''
    } user-select listing-select item-list service-${
      currentStatusThisService.serviceID
    }">
    <option></option>
    </select>
  </div>
  <div class="select-spinner">
  </div>
  <div class="status-container">
  <div class="list-item-status ${item.item_status?.split("-")?.join("")?.toLowerCase()}">${
      statusObj[item.item_status]
    } </div>
  <div class="print-btn ${currentStatusThisService.timeOffeset < 1 ? 'disabled-btn': ''}">
  <svg class="print-label" fill="#eee" width="25" viewBox="0 0 24 24"><title>printer-outline</title><path d="M19 8C20.66 8 22 9.34 22 11V17H18V21H6V17H2V11C2 9.34 3.34 8 5 8H6V3H18V8H19M8 5V8H16V5H8M16 19V15H8V19H16M18 15H20V11C20 10.45 19.55 10 19 10H5C4.45 10 4 10.45 4 11V15H6V13H18V15M19 11.5C19 12.05 18.55 12.5 18 12.5C17.45 12.5 17 12.05 17 11.5C17 10.95 17.45 10.5 18 10.5C18.55 10.5 19 10.95 19 11.5Z" /></svg>
  </div>
  <div style="display:none;" class="done-btn ${item.item_status != 'Occupied' ? 'disabled-btn': ''}">
  <svg class="done-label" fill="#eee" width="25" viewBox="0 0 24 24"><title>check-bold</title><path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" /></svg>
  </div>
  <div class="remove-btn ${currentStatusThisService.timeOffeset < 1 ? 'disabled-btn': ''}">
  <svg class="done-label" fill="#eee" width="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close</title><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>
  </div>
      </div>
      
      
      </div>
      </div>
  </div>
    `;
  }
  


// Utils:
const localSorageHandler = {
    set:(prop, val)=>localStorage.setItem(prop, val), 
    get:(prop)=>localStorage.getItem(prop),
    remove:(prop)=>localStorage.removeItem(prop),
}

function itemListingStatusChecker() {
    console.log("================================", currentStatus)
    currentStatus.map(item => {
      const x = timeOffsetFromNow(item.startedAt)
        if (x > 1 && item.status == "Occupied") {
            UPDATErequest(
                "le_invoice-items",
                item.itemID,
                {item_status: "Done"})
                .then(()=>itemListing())
        }else{
            currentStatus = currentStatus.reduce((acc, curr)=>([...acc, {...curr, timeOffeset: x, nowTime: getToday().time24}]),[])
        }
    })
}

function timeOffsetFromNow(startDate) {
    const startTimeHour = startDate ? startDate.split(":")[0] : null;
    const startTimeMinutes = startDate ? startDate.split(":")[1] : null;
    const nowHour = new Date().getHours();
    const nowMinutes = new Date().getMinutes();
    if (!startTimeHour){
        return
    }
    if (nowHour - startTimeHour > 2) {
      return 11;
    } else if (nowHour > startTimeHour) {
      return nowMinutes + 60 - startTimeMinutes;
    } else {
      return nowMinutes - startTimeMinutes;
    }
  }
function addAttr(el, attr, val){
    el.attr(attr, val)
}
function timeConvertTo12(time24){
    const h = time24.split(":")[0].length == 2 ? time24.split(":")[0] : "0"+time24.split(":")[0]
    const m = time24.split(":")[1].length == 2 ? time24.split(":")[1] : "0"+time24.split(":")[1]
    const t = `${h}:${m}`
    return new Date("2023-01-01T"+t)
    .toLocaleTimeString()
    .split(" ")[0]
    .split(":")
    .slice(0, -1)
    .join(":");
}
const getToday = () => {
    const [y, m, d] = new Date()
      .toJSON()
      .slice(0, 10)
      .replace(/-/g, "/")
      .split("/");
    const t = new Date()
      .toLocaleTimeString()
      .split(" ")[0]
      .split(":")
      .slice(0, -1)
      .join(":");
      const t2 = (new Date()).toString().split(" ")[4].split(":").slice(0,-1).join(":")
    return {
      dateWithSlash: d + "/" + m + "/" + y,
      time12: t,
      time24: t2,
      dateWithDash: y + "-" + m + "-" + d,
      yesterdayWithDash: y + "-" + m + "-" + d - 1,
    };
  };
function printLabel(id) {
    let link = `<iframe id="other-temp" style="display:none" src="https://roknrahati.daftra.com/v2/owner/templates/render/entity/view/local/1/${id}.pdf" title="invoice"></iframe>`;
    $("body").append(link);
    setTimeout(() => {
      $("#other-temp").attr("src").replace(".pdf", "/print");
      setTimeout(() => {
        $("#other-temp").get(0).contentWindow.print();
      }, 500);
    }, 1000);
  }


// GET Any Request 
async function GETrequest(url) {
const apikey = "3ebe5a148238b2936077a49dbc506b79f79f26de";
    const apiOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            apikey
        }
    }
    const res = await fetch(url,apiOptions)
    return res
  }
// POST Any Request 
async function POSTrequest(url,data) {
const apikey = "3ebe5a148238b2936077a49dbc506b79f79f26de";
    const apiOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            apikey
        },
        body: JSON.stringify(data)
    }
    const res = await fetch(url,apiOptions)
    return res
  }
// UPDATE Any Data: 
async function UPDATErequest(entity, id,data) {
    const url = "/v2/api/entity/"+entity+"/"+id+"/fields"
const apikey = "3ebe5a148238b2936077a49dbc506b79f79f26de";
    const apiOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            apikey
        },
        body: JSON.stringify(data)
    }
    const res = await fetch(url,apiOptions)
    return res
  }

const appSpinner = {
    addSpinner(id = "dummy", size = "20px", color = "#485563") {
      const spinner = `
      <svg id="spinner-${id}" x="0px" y="0px" width="${size}" viewBox="0 0 50 50" style="fill:${color};" xml:space="preserve">
      <path fill="" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
      <animateTransform attributeType="xml"
      attributeName="transform"
      type="rotate"
      from="0 25 25"
      to="360 25 25"
      dur="0.6s"
      repeatCount="indefinite"/>
      </path>
      </svg>
      `;
      return spinner;
    },
    removeSpinner(el, id = "dummy") {
      el.find("#spinner-" + id).remove();
    },
  };

const addHTMLElements = {
    itemProps: function (currentServiceID) {
      return `
   <hr>
  
   <div class="container-users"> 
   <p style="direction:rtl">اختر موظف/موظفين:</p>
      <div class="select select-user">
   <select id="assignee-${currentServiceID}" aria-label="Select menu example" class="user-select ${currentServiceID}">
   <option selected style="">اختر موظف</option>
   </select>
      </div>
      <div class="select-spinner"></div>
   </div>
   <div class="container-source"> 
  <p style="direction:rtl">اختر المنصة:</p>
  
      <div class="select select-source">
    <select id="source-${currentServiceID}" aria-label="Select menu example" class="source-select ${currentServiceID}">
      <option selected style="">اختر المنصة</option>
    </select>
      </div>
  </div>
      </div>
       <div class="checkbox-group">
        <input id="overtime-${currentServiceID}" class="over-time" type="checkbox"/>
        <label for="overtime-${currentServiceID}">وقت إضافي؟</label>
      </div>
  `;
    },
    searchBox: function () {
      return `
    
    `;
    },
  };
  
function addSelectedItemMetaData($currentProductID) {
      const lastItem = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div.tab-content > div > div > app-invoice-items > ul > li:last-child");
      
      const $currentItemCommissionRate = commissionsObj["otherSerivces"][$currentProductID] ? commissionsObj["otherSerivces"][$currentProductID].commissionRate : commissionsObj["baseCommission"].commissionRate || 0
      const $currentItemOvertimeRate = commissionsObj["otherSerivces"][$currentProductID] ? commissionsObj["otherSerivces"][$currentProductID].overTimeRate : commissionsObj["baseCommission"].overTimeRate || 0
      const $currentServiceObj = allServices.filter(
        (ser) => ser.service == $currentProductID
      )[0];  
      const $assigneeIDs = $currentServiceObj ? $currentServiceObj.assigneeIDs : ""

      !lastItem.attr("data-category") && addAttr(lastItem, "data-category", currentCategory);
      console.log(lastItem, $currentProductID)
      lastItem.find(".container-users").length != 1 &&
        lastItem.append(addHTMLElements.itemProps($currentProductID));
        addAttr(lastItem, "data-commission-rate", $currentItemCommissionRate)
        addAttr(lastItem, "data-overtime-rate", $currentItemOvertimeRate)
        addAttr(lastItem, "data-product-id", $currentProductID)
        addAttr(lastItem, "data-assignee-ids", JSON.stringify($assigneeIDs))

     
      lastItem
        .find(".select-spinner")
        .append(
          appSpinner.addSpinner($currentProductID, "10px", "#eee !important")
        );

        // Add clint Sources <option>
      clientSources.map((s) => {
        lastItem
          .find("div.select-source > select")
          .append(`<option value="${s}">${s}</option>`);
      });
    

    //   if (!$currentServiceObj) {
    //     appSpinner.removeSpinner(lastItem, $currentProductID);
    //     lastItem.find(".checkbox-group > label").addClass("disabled-btn");
    //     lastItem.find("select").eq(0).prop("disabled", true);
    //     lastItem
    //       .find("select")
    //       .eq(0)
    //       .empty()
    //       .append(`<option value="" data-name="">لا يوجد موظفين</option>`);
    //       return;  
    // }
      if (true) {
        Object.entries(staffObj).map(([id, val]) => {
            lastItem
              .find("select")
              .eq(0)
              .append(
                `<option value="${id}" data-name="${val}">${val}</option>`
              );
            
        });
        appSpinner.removeSpinner(lastItem, $currentProductID);

    }
  }

  
// Create Invoice Data
 function currentInvoiceItems() {
    // let invoiceData = [];
  
    const itemsList = $(".order-item");
    return itemsList.map((_, item) => {
      const $thisItemName = $(item).find(".order-item_meta > .product-name > h4").text();
      const $thisItemID = $(item).attr("data-product-id")
      const $thisItemAssigneeID = $(item).find("select > option:selected").val();
      const $thisItemAssigneeName = $(item)
        .find("select.user-select > option:selected")
        .attr("data-name");
      const $thisItemCLientSource = $(item)
        .find("select.source-select > option:selected")
        .val();
      const $thisItemOvertime = $(item).find(".over-time").is(":checked")
        ? "1"
        : "0";
    //   const $thisItemCategory = $(item).attr("data-category");
    //   const $thisItemProductID = $(item).attr("data-product-id");
    //   const $thisItemQty = $(item).find(".order-item_units > em:nth-child(1)").text();
      const $thisItemPrice = +$(item)
      .find(".order-item_meta > .product-name > div.product-name_price").text()
        .replace(",", "")
        .match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0];
      const $thisItemStatus = $thisItemAssigneeName
        ? "In-Progress"
        : "Not-Assigned";
  
      const $thisItemDate = getToday().dateWithSlash;
      const $thisItemTime = getToday().time24;
  
      const $thisItemCommissionRate = $(item).attr("data-commission-rate");
      const $thisItemCommissionAmount =
      ($thisItemCommissionRate / 100) * $thisItemPrice;
      const $thisItemOvertimeCommission = $(item).attr("data-overtime-rate");

    //   const $currentClientName = $("span.customer-name").text().trim()
      
        
      return {
        invoice_id: 22,
        assigned_staff: $thisItemAssigneeID,
        item_price: $thisItemPrice,
        item_status: $thisItemStatus,
        overtime0: $thisItemOvertime,
        commission_out0: 0,
        item_name: $thisItemID,
        hidden_client_name: currentClientName,
        client: currentClientID,
        date: $thisItemDate,
        time: null,
        commission_amout: $thisItemCommissionAmount,
        commission_rate: $thisItemCommissionRate,
        overtime_commission: $thisItemOvertimeCommission,
        client_source: $thisItemCLientSource,
      };
    //   invoiceData.push($thisItem);
    });
    // return invoiceData;
  }

function dispatchEventListeners(){
      // onChange client:
      window.addEventListener("client_selected", (event)=>{
          currentClientName = event.detail.business_name
          currentClientID = event.detail.id
        },false)
        // onChange...:
        $(document).change(e=>{
            const $this = $(e.target)
            
            if ($this.hasClass("listing-select")){
                $this
                .closest(".select")
                .siblings(".select-spinner")
                .append(appSpinner.addSpinner("update-loader", "17px", "#eee"));
                const $thisSelectedAssignee = $this.find("option:selected").val();
                const itemID = $this.closest(".list-item").attr("data-item-id");
                UPDATErequest(
                    "le_invoice-items",
                    itemID,
                    {assigned_staff: $thisSelectedAssignee}).then(()=>itemListing())
            }
        })

    // onClicking.........
    $(document).click(e=>{
      const $this = $(e.target)

      if ($this.hasClass("collapse-list-icon") || $this.closest("span").hasClass("collapse-bttn")) {
        $("div.list-item").css({padding: "17px 6px"})
      }else if( $this.hasClass("expand-list-icon") || $this.closest("span").hasClass("expand-bttn")){
        $("div.list-item").css({padding: "60px 6px"})
      }
      if ($this.hasClass("print-btn") || $this.closest("div").hasClass("print-btn")){
          const itemID = $this.closest(".list-item").attr("data-item-id");
          $this
          .closest(".list-item")
          .find(".select-spinner")
          .append(appSpinner.addSpinner("update-loader", "17px", "#eee"));
          $this
          .closest(".list-item")
          .find(".list-item-time > span")
          .text(getToday().time12);
          UPDATErequest(
              "le_invoice-items",
              itemID,
              {
                  time: getToday().time24,
                  item_status: "Occupied"
                }).then(()=>itemListing())
                printLabel(itemID)
                //   $this.closest(".list-item").find(".done-btn").removeClass("disabled-btn");
            }
            if ($this.hasClass("done-btn") || $this.closest("div").hasClass("done-btn")){
          const itemID = $this.closest(".list-item").attr("data-item-id");
                
                $this
                .closest(".list-item")
                .css({padding: "0px"})
                UPDATErequest(
                    "le_invoice-items",
                    itemID,
                    {item_status: "Done"})
                    .then(()=>itemListing())
            }
            if ($this.hasClass("remove-btn") || $this.closest("div").hasClass("remove-btn")){
          const itemID = $this.closest(".list-item").attr("data-item-id");
                
                $this
                .closest(".list-item")
                .css({padding: "0px"})
                UPDATErequest(
                    "le_invoice-items",
                    itemID,
                    {item_status: "Removed"})
                    .then(()=>itemListing())
            }

      if($this.hasClass("close-order-options") || $this.closest("a").hasClass("close-order-options")){
        getOffersList()
      }
      if($this.hasClass("product") || $this.closest("span").hasClass("product")){
        const productID = $this.attr("data-product") || $this.closest("span").attr("data-product")
        addSelectedItemMetaData(productID)
        }
      if($this.hasClass("product-category") || $this.closest("span").hasClass("product-category")){
        currentCategory =  $this.find("div.product-category-name").text().trim() || $this.text().trim()
        }
        if($this.hasClass(".pay") || $this.closest("div").hasClass("pos-rel")){

            // POST Inovice Items
            const allData = currentInvoiceItems();
            allData.map((_,d)=>{
                console.log(d)
                POSTrequest(itemsURL, {...d})
                .then(res=>res.json())
                .then(data=>{console.log(data),itemListing()})
            })
        }
    })
  }

// GET Requsts (Prepare Data):
async function FetchData(){
    
    
        // All Staff Names:
        const staffNamesRes = await GETrequest(staffURL)
            const staffNamesData = await staffNamesRes.json()
        staffObj = staffNamesData.data.reduce((acc, s)=>({...acc, [s.id]: s.full_name}),{})
        // Current Client:
        currentClientName = $("span.customer-name").text().trim()
        const clientIdRes = await GETrequest("/v2/api/entity/client/list/1?filter[business_name]="+currentClientName)
        currentClientID = (await clientIdRes.json()).data[0].id
        // Commissions:
            const commissionsRes = await GETrequest(commissionsRateURL)
            const commissionData = await commissionsRes.json()
            commissionsObj["baseCommission"] = {
                commissionRate: commissionData.le_commission_map_le_commission_map_commissions[0].commission,
                overTimeRate: commissionData.le_commission_map_le_commission_map_commissions[0].overtime_commission
            }
            commissionsObj["otherSerivces"] =
                commissionData.le_commission_map_le_commission_map_commissions.reduce(
                (acc, curr) => {
                    curr.services.map((s) => {
                    acc[s] = {commissionRate: curr.commission, overTimeRate: curr.overtime_commission};
                    });
                    return acc;
                },
                {}
                );

        //Services:
            const servicesRes = await GETrequest(servicesUsersURL)
            const servicesData = await servicesRes.json()
            allServices = servicesData[
                "le_employee_service_map_le_employee_service_map_emp_serv_map"
            ].reduce((acc, curr) => {
                const allNames = curr[
                "le_employee_service_map_emp_serv_map_employees_pivot"
                ].reduce((a, c) => {
                return {
                    ...a,
                    [c["le_employee_service_map_emp_serv_map_employees"].id]:
                    c["le_employee_service_map_emp_serv_map_employees"].name,
                };
                }, {});
                return [
                ...acc,
                {
                    service: curr.service,
                    assigneeIDs: curr.employees,
                    assigneeNames: allNames || {},
                },
                ];
            }, []);


        //Client Sources:
            const clientSourcesRes = await GETrequest(clientSourcesURL)
            const clientSourcesData = await clientSourcesRes.json()
            clientSourcesData["le_client_source_list_le_client_source_list_available_sources"].map(
                (source) => {
                clientSources.push(source.client_sources);
                }
            );

    // List Current Bookings:
        //  await bookingListing(bookingURL, key, apiKey) 
    //      bookingListing(bookingURL, 1);
    // bookingListing(bookingModule, 2);     
        // List Current Invoice Items:
        await itemListing()




}
let currentBookings = []
function bookingListing(bookingURL, key, apiKey="3ebe5a148238b2936077a49dbc506b79f79f26de") {
    $(".booking-orders > div.list").empty();
    $("button.drawer-btn.left").append(
      appSpinner.addSpinner(_, "15px", "#eee !important")
    );
    // $(".booking-orders > div.list").append(appSpinner.addSpinner())
    $(".booking-orders > div.list").append(
      appSpinner.addSpinner(_, "50", "#eee !important")
    );
  
    const inputVal = $(".m-search-box").val();
    // if(!inputVal.length){
    $.ajax({
      url: bookingURL + "/list/1?filter[booking_date]=" + getToday().date2,
      method: "GET",
      contentType: "application/json",
      accept: "application/json",
      headers: { apikey: apiKey },
    }).done((data) => {
      // if(key==1)currentBookings = []
      // if(key==2)currentBookings2 = []
      if (!!data.total) {
        data.data
          .map((d) => d.id)
          .map((instance) => {
            $.ajax({
              url: bookingURL + "/" + instance + "/4",
              method: "GET",
              contentType: "application/json",
              accept: "application/json",
              headers: { apikey: apiKey },
            }).done((data) => {
              currentBookings = [...currentBookings, data];
              // if (data.total !== currentBookings.length) {
              // $(".booking-orders > div.list").empty()
              const serviceNames = data[
                "le_booking_module_le_booking_module_booking_service_listing"
              ].map(
                (s) =>
                  s.le_booking_module_booking_service_listing_booking_serivce.name
              );
              const clientName = data.le_booking_module_booking_client
                ? data.le_booking_module_booking_client.business_name
                : "لم يتم اختيار عميل";
              const itemDesc = data.booking_desc || "لا يوجد وصف";
              const itemBudget = data.booking_paid0;
              const itemBranch = data.le_booking_module_booking_branch
                ? data.le_booking_module_booking_branch.name
                : "الفرع الرئيسي";
              const itemPaymentMethod = data.le_booking_module_booking_payment0
                ? data.le_booking_module_booking_payment0.payment_gateway
                : "تحويل بنكي";
              const itemStartDate = data.booking_date.split(" ")[0];
              const id = data.id;
              // const itemAssignee = data.assigned_users[0].employee.full_name
              const itemData = {
                key,
                itemBudget,
                id,
                serviceNames,
                clientName,
                itemDesc,
                itemStartDate,
                itemBranch,
                itemPaymentMethod,
              };
              // const serviceNames = data.data["le_workflow-type-entity-1_custom_data"]["le_custom_data_le_workflow-type-entity-1_services_pivot"].map(s=>s["e_custom_data_le_workflow-type-entity-1_services"].name)
              const newItem = createBookingItem({ ...itemData });
              $(".booking-orders > div.list").append(newItem);
              $("button.drawer-btn.left").text(
                `حجز العملاء (${currentBookings.length})`
              );
              // }
              appSpinner.removeSpinner(
                $("button.drawer-btn.left"),
                "left-spinner"
              );
            });
          });
      } else {
        $("button.drawer-btn.left").text(
          `حجز العملاء (${currentBookings.length})`
        );
        $(".booking-orders > div.list")
          .empty()
          .append("<h1 class='no-result'> لا توجد حجوزات</h1>");
      }
    });
    // }
  }
// async function bookingListing(){
//     const todayBookingsRes = await GETrequest(bookingModule+"/list/1?filter[booking_date]=" + getToday().dateWithDash)
//     const todayBookingsData = await todayBookingsRes.json() 
//     console.log("all bookings", todayBookingsData)
//     currentBookings = [...currentBookings, data];
//     // if (data.total !== currentBookings.length) {
//     // $(".booking-orders > div.list").empty()
//     const serviceNames = data[
//       "le_booking_module_le_booking_module_booking_service_listing"
//     ].map(
//       (s) =>
//         s.le_booking_module_booking_service_listing_booking_serivce.name
//     );
//     const clientName = data.le_booking_module_booking_client
//       ? data.le_booking_module_booking_client.business_name
//       : "لم يتم اختيار عميل";
//     const itemDesc = data.booking_desc || "لا يوجد وصف";
//     const itemBudget = data.booking_paid0;
//     const itemBranch = data.le_booking_module_booking_branch
//       ? data.le_booking_module_booking_branch.name
//       : "الفرع الرئيسي";
//     const itemPaymentMethod = data.le_booking_module_booking_payment0
//       ? data.le_booking_module_booking_payment0.payment_gateway
//       : "تحويل بنكي";
//     const itemStartDate = data.booking_date.split(" ")[0];
//     const id = data.id;
//     // const itemAssignee = data.assigned_users[0].employee.full_name
//     const itemData = {
//       key,
//       itemBudget,
//       id,
//       serviceNames,
//       clientName,
//       itemDesc,
//       itemStartDate,
//       itemBranch,
//       itemPaymentMethod,
//     };
//     let currentBookings = [];
//     $(".booking-orders > div.list").empty()
//     currentBookings = todayBookingsData.data;
//     const newItem = createBookingItem({ ...itemData });
//     $(".booking-orders > div.list").append(newItem);
//     $("button.drawer-btn.left").text(
//       `حجز العملاء (${currentBookings.length})`
//     );
//     appSpinner.removeSpinner(
//       $("button.drawer-btn.left"),
//       "left-spinner"
//     );
// }


async function itemListing(){
    const currentItemListRes = await GETrequest(itemsURL+ "/list/1?per_page=1000&filter[item_status][not_in][]=Removed&filter[date]=" + getToday().dateWithSlash+"&sort[item_status]=desc")
    const currentListItemsData = await currentItemListRes.json()
    $(".item-listing > div.list").empty();
    let currentListing = [];
  currentStatus = [];
  currentStatus = currentListItemsData.data.reduce((acc, curr) => {
    const ass = allServices.filter(
      (serv) => serv.service == curr.item_name
    )[0];
    return [
      ...acc,
      {
        selectedAssignee: curr.assigned_staff,
        assigneeIDs: ass ? ass.assigneeIDs : [],
        assigneeNames: ass ? ass.assigneeNames : {},
        status: curr.item_status,
        serviceID: curr.item_name,
        itemID: curr.id,
        startedAt0: new Date(
          getToday().dateWithDash.split("-")[0],
          getToday().dateWithDash.split("-")[1] - 1,
          getToday().dateWithDash.split("-")[2],
          curr.time ? curr.time.split(":")[0] : 2,
          curr.time ? curr.time.split(":")[1] : 0
        ),
        startedAt: curr.time,
        nowDate: new Date(),
        nowTime: getToday().time24,
        timeOffeset: timeOffsetFromNow(curr.time)
      },
    ];
  }, []);
  currentListing = currentListItemsData.data
  console.log(currentStatus)
  $("button.drawer-btn.top").text(`طلبات حالية (${currentListing.length})`);

  await currentListing.map((item) => {
    const thisCurrentStatus =
      currentStatus.filter((s) => s.serviceID == item.item_name)[0] || [];
      console.log("started at", thisCurrentStatus.startedAt)
    const newItem = createListItem({ ...thisCurrentStatus }, { ...item });
    $(".item-listing > div.list").append(newItem);
    // thisCurrentStatus.assigneeIDs.length
    //   ? Object.entries(thisCurrentStatus.assigneeNames || {})
      Object.entries(staffObj).map(
          ([id, val]) => {
            $(".item-listing > div.list > div:last-child")
              .find("select")
              .append(
                `<option value="${id}" ${
                  id == thisCurrentStatus.selectedAssignee ? "selected" : ""
                }>${val}</option>`
              );
          }
        )
    //   : $(".item-listing > div.list > div:last-child")
    //       .find("select")
    //       .append(
    //         `<option class="disabled" value="" selected>لا يوجد موظفين معينيين</option>`
    //       );
})
await setTimeout(() => {
    appSpinner.removeSpinner($("button.drawer-btn.top", "top-spinner"));
}, 1000);
    
}







// onLoad DOM

let domInterval = setInterval(() => {
    payBtn = $("#paymentSubmitBtn");
  
    if (payBtn) {
        // Fetch required data onLoad
        FetchData()
        .then(()=> console.log(allServices, commissionsObj))
       
        // Clean Item list onLoad
        const clearBtn = $("#order-options > div:nth-child(1) > div > div:nth-child(1) > a > span");
        clearBtn.trigger("click")
        
      dispatchEventListeners()
      appendDrawersAndToggleBtns("left", "حجز العملاء (0)", "booking-orders", "طلبات الحجز");
        appendDrawersAndToggleBtns("top", "طلبات حالية (0)", "item-listing", "الطلبات الحالية");
  
      clearInterval(domInterval)
      setInterval(() => {
        itemListingStatusChecker()
    }, 10000);
    }
    },1000)








    function appendDrawersAndToggleBtns(pos, btnText, elementFor, title) {
        // <div class="opaque-layer hide-opaque ${pos}"></div>
        const drawer = `
        <div class="drawer hide-drawer ${pos + " " + elementFor}">
        <div class="drawer-title">${title}</div>
       <div class="icons-container">
       <span class="collapse-bttn"><svg class="collapse-list-icon" fill="#eee" width="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-vertical-align-center</title><path d="M8,19H11V23H13V19H16L12,15L8,19M16,5H13V1H11V5H8L12,9L16,5M4,11V13H20V11H4Z" /></svg>
       </span>
       <span class="expand-bttn">
       <svg class="expand-list-icon" fill="#eee" width="25" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>arrow-expand-vertical</title><path d="M13,9V15H16L12,19L8,15H11V9H8L12,5L16,9H13M4,2H20V4H4V2M4,20H20V22H4V20Z" /></svg>
       </span>
       </div>
        <div class="m-search-wrapper ${
          elementFor == "booking-orders" ? "" : "m-search-box-hidden"
        }">
      <div id="m-containerr">
      <input type="text" name="focus" required class="m-search-box" placeholder="ابحث برقم الجوال..." />
        <button class="close-icon" type="reset">&#215;	
        </button>
      </div>
      </div>
        <div class="list ${elementFor}">
        </div>  
        </div>  
        `;
        const drawerBtn = `
        <button class="btn drawer-btn ${pos} btn-primary px-4" type="button">${btnText}</button>
        `;
        setTimeout(() => {
          $(".drawer-btn." + pos).click(() => {
            $(".drawer")
              .not("." + pos)
              .addClass("hide-drawer");
            $(".drawer." + pos).toggleClass("hide-drawer");
            // $(".drawer."+pos).hasClass("hide-drawer") ? $(".drawer."+pos).removeClass("hide-drawer") : $(".drawer."+pos).addClass("hide-drawer")
            // $(".opaque-layer."+pos).toggleClass("hide-opaque")
          });
          $(".opaque-layer." + pos).click(() => {
            $(".drawer." + pos).addClass("hide-drawer");
            $(".opaque-layer." + pos).addClass("hide-opaque");
          });
        }, 1000);
        $("body").append(drawer);
        $("body").append(drawerBtn);
      }





















////////////////////Ayoub OFFERS CODE///////////////////////////////
let offersArray =[], inOffers = false
const overlay = `
 <div class="loading-overlay" style=" display: none;
   background: #b3b3b36b;
   position: fixed;
   width: 100%;
   height: 100%;
   z-index: 1000;
   top: 0;">
   <div class="loading-overlay-image-container" style=" width: 15%;
   color: #fff;
   text-align: center;
   position: fixed;
   z-index: 1001;
   top: 50%;
   left: 50%;
   transform: translate(-50%, -50%);
   padding: 15px;
   height: 80px;
   border-radius: 5px;">
      <img class="loading-overlay-image" style ="width: 20%;" src="https://alhajri-amt.daftara.com/files/a14cf1be/logos/64034d1fe1473_blobid1677937949302.gif">
       </div>
       <div class="loading-overlay-title" style="
       font-size: 2em;
   font-weight: bold;
   margin-bottom: 10px;
   color: #f5feff;
   text-align: center;
   position: relative;
   top: 55%;
   direction: rtl;
       ">
   جاري استدعاء بنود العرض...
   </div>
   </div>

 `;

// Add Short-Cut fro the new windows
$(document).keydown(function (e) {
  if (e.ctrlKey && e.keyCode == 40) {
    // 40 is the key code for Arrow Down
    console.log("triggered");
    console.log($(".drawer-btn.top"));
    $(".drawer-btn.top").click();
  }
});

$(document).keydown(function (e) {
  if (e.ctrlKey && e.keyCode == 39) {
    // 39 is the key code for Arrow Right
    $(".drawer-btn.left").click();
  }
});

// GET Offers Local Entity and store data in global array
function getOffersList() {
  $.get(`/v2/api/entity/le_offers/list/3`).done((offers) => {
    if (offers.data.length != 0) {
      offers.data.map((offer) => {
        let newOfferCard =   `<span _ngcontent-c14="" class="product ng-star-inserted offer-item"  data-offer="${offer.id}" tabindex="0" data-product="10"><app-product _ngcontent-c14="" _nghost-c13=""><!----><div _ngcontent-c13="" class="Product-img ng-star-inserted"><img _ngcontent-c13="" loading="lazy" src="${offer.img_url != null ? offer.img_url : "/pos/assets/images/notfound.png"}"></div><div _ngcontent-c13="" class="product-name"><!----><p _ngcontent-c13="" class="ng-star-inserted">${offer.offer_name !=null?offer.offer_name:''}</p><!----></div><div _ngcontent-c13="" class="Product-meta"><!----><span _ngcontent-c13="" class="price-tag ng-star-inserted">SAR&nbsp;${ offer.offer_price != null ? offer.offer_price : 0 }</span><!----><span _ngcontent-c13="" class="info-tag"><mat-icon _ngcontent-c13="" class="mat-icon" matlisticon="" role="img" svgicon="information-variant" aria-hidden="true"><svg viewBox="0 0 24 24" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" focusable="false"><path d="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z"></path></svg></mat-icon></span></div></app-product></span>`
        offersArray.push(newOfferCard);
      });
    }
  });
}

// Start Calling items in the offer
function callItems(offer_id) {
  console.log("start here");
  $.get(`/v2/api/entity/le_offers/${offer_id}`).done((offer) => {
    console.log(offer);
    let listItems = offer["le_offers_le_offers_offered_services"];
    if (listItems.length != 0) {
      console.log(listItems);
      
      loopAwait(listItems);

    } else {
      alert(
        "لا توجد بنود في هذا العرض، الرجاء التحقق من إضافة البنود للعرض أولاً"
      );
    }
  });
}

function onReceiveBarCodeAsync(itemBarcode) {
  return new Promise((resolve, reject) => {
    onReceiveBarCode(itemBarcode, resolve);
  });
}


async function AddAssigendStaff(item_id, count){
  return new Promise((res)=>{
    setTimeout(()=>{
      const lastItem = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div.tab-content > div > div > app-invoice-items > ul > li:last-child");
      let $currentProductID = item_id
    const $currentItemCommissionRate = commissionsObj["otherSerivces"][$currentProductID] ? commissionsObj["otherSerivces"][$currentProductID].commissionRate : commissionsObj["baseCommission"].commissionRate || 0
    const $currentItemOvertimeRate = commissionsObj["otherSerivces"][$currentProductID] ? commissionsObj["otherSerivces"][$currentProductID].overTimeRate : commissionsObj["baseCommission"].overTimeRate || 0
    const $currentServiceObj = allServices.filter(
      (ser) => ser.service == $currentProductID
    )[0];  
    const $assigneeIDs = $currentServiceObj ? $currentServiceObj.assigneeIDs : ""

    !lastItem.attr("data-category") && addAttr(lastItem, "data-category", currentCategory);
    lastItem.find(".container-users").length != 1 &&
      lastItem.append(addHTMLElements.itemProps($currentProductID));
      addAttr(lastItem, "data-commission-rate", $currentItemCommissionRate)
      addAttr(lastItem, "data-overtime-rate", $currentItemOvertimeRate)
      addAttr(lastItem, "data-product-id", $currentProductID)
      addAttr(lastItem, "data-assignee-ids", JSON.stringify($assigneeIDs))

   
    lastItem
      .find(".select-spinner")
      .append(
        appSpinner.addSpinner($currentProductID, "10px", "#eee !important")
      );

      // Add clint Sources <option>
    clientSources.map((s) => {
      lastItem
        .find("div.select-source > select")
        .append(`<option value="${s}">${s}</option>`);
    });
  

//     if (!$currentServiceObj) {
//       appSpinner.removeSpinner(lastItem, $currentProductID);
//       lastItem.find(".checkbox-group > label").addClass("disabled-btn");
//       lastItem.find("select").eq(0).prop("disabled", true);
//       lastItem
//         .find("select")
//         .eq(0)
//         .empty()
//         .append(`<option value="" data-name="">لا يوجد موظفين</option>`);
//         return;  
//   }
    if (true) {
       Object.entries(staffObj).map(
          ([id, val]) => {
          lastItem
            .find("select")
            .eq(0)
            .append(
              `<option value="${id}" data-name="${val}">${val}</option>`
            );
          
      });
      appSpinner.removeSpinner(lastItem, $currentProductID);

  }
    },200)
    res(count)
  })
}

async function loopAwait(listItems) {
  let count = 1;
  let uCount = 1;
  $(".loading-overlay").show();
  for (const item of listItems) {
    let itemId = item.service_name;
    let itemBarcode = item.service_barcode_num;
    onReceiveBarCode(itemBarcode);
    let response = await AddAssigendStaff(itemId, count);
    console.log("response " + response);
    await delay(1000);
    console.log("uCount " + uCount);
    // await delay(2000)
    count++;
    uCount++;
  }
  $(".loading-overlay").hide();
}

// Append offers list on item click
function appendOffersList() {
  $(document).on("click", "span.product-category", () => {
    console.log("clicked this");
    let currentCat = $(' ol > li:nth-child(3) > a').text();
    console.log("currentCat");
    console.log(currentCat);

    if (
      (currentCat == "الباقات" || currentCat.toLowerCase() == "packages") &&
      !inOffers
    ) {
      offersArray.map((offerItem) => {
        $("div.product-list").append(offerItem);
      });
      inOffers = true;

      $(".offer-item").on("click", function () {
        let offerId = $(this).data("offer");
        callItems(offerId);
      });
    }
  });

  $(".breadcrumb-wrapper .breadcrumb li")
    .eq(0)
    .on("click", () => {
      inOffers = false;
    });

  $(".del-order").on("click", () => {
    inOffers = false;
  });
}

//This just a dealy function to await moments between functions

function delay(ms) {
  return new Promise((res) => {
    setTimeout(() => {
      res(true);
    }, ms);
  });
}

getOffersList();
appendOffersList();
$("body").append(overlay);

// ================================ Ayoub code end












    //================== Custom styles ====================

    const customStyles = `
    #pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div.tab-content > div > div > app-invoice-items > ul > li {
        display: flex;
        flex-direction: column;
    }
    .booking-done-btn{
        background: rgba(0,0,0,.1);
        padding: 4px 13px;
        outline: none;
        border: none;
        border-radius: 8px;
        box-shadow: 2px 6px 5px 1px rgba(0,0,0,.1);
      }
      .smalldesc > *{
        color: #fff
      }
      .expand-btn{
        padding: 6px 19px;
        border-radius: 5px;
        background: #faebd71f;
        outline: none !important;
        border: none;
        margin: 0 0 10px;
  
      }
      .smalldesc {
        width: 95%;
        max-height: 38px;
        overflow: hidden;
        transition: all .3s ease;
      }
      
      .smalldesc.expand {
        max-height: 200px;
      }
      .disabled{
          pointer-events: none;
          user-select: none;
          cursor: auto;
          background-color: gray;
          opacity: .5;
  
      }
      .disabled-btn{
        pointer-events: none;
        user-select: none;
        cursor: auto;
        color: gray;
        opacity: .5;
  
    }
  .status-container{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    cursor:pointer;
  }
  .status-container svg{
    padding: 2px 3px;
    background: transparent;
    box-shadow: 1px 2px 20px rgba(0,0,0,0.4);
    border-radius: 4px;
  }
  .no-result{
    text-align: center;
    font-weight: bold;
    margin: 10px auto;
  }
  .m-search-box-hidden{
    display:none;
  }
  .m-search-box,.m-search-wrapper {
    position: relative;
    padding: 10px;
  }
  .m-search-wrapper {
    width: 500px;
    margin: 20px auto;
  }
  .m-search-box {
    direction:rtl;
    padding-left: 35px;
    padding-right: 5px;
    text-align:right;
    width: 80%;
    border: 1px solid #ccc;
    outline: 0;
    border-radius: 10px;
    transition: .3s; 
  }
  .m-search-box:focus {
    box-shadow: 0 0 15px 5px rgba(0,0,0,.1);
  }
  .m-search-wrapper .m-containerr{
    position: relative;
  }
  .close-icon {
    box-shadow: 2px 3px 9px 0px rgba(0,0,0,0.1);
    border:1px solid transparent;
    background-color: darkgray;
    display: inline-block;
    outline: 0;
    cursor: pointer;
    display: block;
    position: absolute;
    z-index:1;
    left: 20px;
    top: 18px;
    margin: auto;
    padding: 0px 6px;
    border-radius: 50%;
    text-align: center;
    color: white;
  }
  }
  .search-box:not(:valid) ~ .close-icon {
    display: none;
  }
  
  .drawer-title{
    padding: 4px 20px;
    margin-bottom: 10px;
    margin-inline: auto;
    background: #ddd;
    text-align:center;
    font-size: 30px;
    font-weight: bold; 
    border-radius: 10px;
    box-shadow: 0 10px 40px hsla(0, 0, 0, .1);
  
    
  }
  .list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    height: 100%;
    width: 100%;
  }
  
  .go-toBooking{
    color:#fff;
    text-decoration:underline;
  }
  
  .booking-container{
    display: flex;
    flex-direction: column;
    transform: translate(0px, 0px);
    transition: .3s;
    align-items:center;
    justify-content: space-between;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    padding: 40px 6px;
    background-color: #485563;
    direction: rtl;
    position: relative;
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  
  }
  .booking-item{
    display: flex;
    transform: translate(0px, 0px);
    transition: .3s;
    align-items:center;
    justify-content: space-between;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    padding: 0px 6px 30px;
    background-color: transparent;
    direction: rtl;
    position: relative;
  }
 
  .list-item{
    height: 0px !important;
    display: flex;
    transform: translate(0px, 0px);
    transition: .3s;
    align-items:center;
    justify-content: space-between;
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    padding: 60px 6px;
    background-color: #485563;
    direction: rtl;
    position: relative;
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  
  }
  .list-item:hover{
    transform: translate(0px, -3px)
  }
  .item-box-1{
    display: flex;
    flex-direction: column;
    align-items:start;
    padding: 2px 10px;
    min-width: 30%;
  
  }
  
  .item-box-2, .item-box-3, .list-item-time, .list-item-title, .list-item-client{
    direction: rtl;
    min-width: 20%;
    color:#eee;
    font-size:18px;
    margin: 0 15px;
    gap:5px;
  }
  .item-box-2{
      display: flex;
      justify-content: start;
  }
  .item-box-3{
    flex:1;
    width: 25%;
      display: flex;
      justify-content: space-between;
  }
  
  .list-item-status{
    direction: rtl;
    color:#eee;
    font-size:13px;
    padding: 3px 11px;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
  }
  
  .list-item:hover .list-item-inicator {
    transform: scale(1.04);
  }
  .list-item-status.occupied{
    background-color: #bc3737;  
  }
  .list-item-status.notassigned{
    background-color: #0189de;
  
  }
  .list-item-status.done{
    background-color: #165f39;
  }
  .list-item-status.finished{
    background-color: #1b9f8f;
  }
  .list-item.done{
    background-color: #165f39;
  
  }
  .list-item-status.inprogress{
    background-color: #d6931b;
  }

  .list-item-status.booking{
    background-color: transparent;
  }
  .list-item-inicator {
    height: 60px;
    width: 60px;
    z-index: 1;
    position: absolute;
    top: -30px;
    left: -40px;
    border-radius: 50%;
    -webkit-transition: all .5s ease;
    -o-transition: all .5s ease;
    transition: all .5s ease;
  }
  
  .drawer-btn{
    transition: .4s;
    z-index:1000;
    position:absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px 5px;
    border-radius: 8px;
    box-shadow: 0 10px 40px hsla(0, 0, 0, .1);
    background: #0189de;
    width: 200px;
  }
  .drawer-btn.left{
    left:0;
    top:50%;
    margin: 0 -91px;
    transform: translateY(-50%) rotate(270deg);
  }
  .drawer-btn.top{
    top:0;
    left:50%;
    margin:-6px 0;
    transform: translateX(-50%);
  }
  .opaque-layer{
    z-index: 999;
    position: absolute;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,.4);
    top:0;
    left:0;
    transform: translate(0%, 0%);
    transition: .4s;
  }
  .drawer {
    overflow-x: hidden;
    overflow: scroll;
    display: flex;
    flex-direction: column;
    background-color: #ccc;
    z-index:999;
    transition: .4s;
    position:absolute;
    display: flex;
    align-items: center;
    width: 70%;
    height: 500px;
    border-radius: 15px;
    padding: 15px 30px;
    box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
    transform: translate(-50%, -50%)
  
  }
  .drawer.left{
    top:50%;
    left:50%;
  }
  .drawer.top{
    top:50%;
    left:50%;
  }
  .drawer.left.hide-drawer{
    transform: translate(-320%, -50%);
  }
  .drawer.top.hide-drawer{
    transform: translate(-50%, -350%);
  }
  .opaque-layer.left.hide-opaque{
    transform: translate(-320%, -50%);
  }
  .opaque-layer.top.hide-opaque{
    transform: translate(-50%, -320%);
  }
  
  
  .select-spinner {
    display: flex;
    align-items: center;
    justify-content:center;
  }
  .select {
    position: relative;
    display: inline-block;
    width: 50%;
    color: #555;
  }
  .select select {
    display: inline-block;
    width: 100%;
    margin: 0;
    padding: 0.2rem 2.45rem 0.1rem 1rem;
    line-height: 1.5;
    color: #555;
    background-color: #eee;
    border: 0;
    border: 1px solid #D0D0D0;
    border-radius: .25rem;
    cursor: pointer;
    outline: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  /* Undo the Firefox inner focus ring */
  .select select:focus:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }
  /* Dropdown arrow */
  .select:after {
    position: absolute;
    top: 50%;
    right: 1.25rem;
    display: inline-block;
    content: "";
    width: 0;
    height: 0;
    margin-top: -.15rem;
    pointer-events: none;
    border-top: .35rem solid;
    border-right: .35rem solid transparent;
    border-bottom: .35rem solid transparent;
    border-left: .35rem solid transparent;
  }
  
  /* Hover state */
  /* Uncomment if you need it, but be aware of the sticky iOS states.
  .select select:hover {
    background-color: #ddd;
  }
  */
  
  /* Focus */
  .select select:focus {
    box-shadow: 0 0 0 .075rem #fff, 0 0 0 .2rem #0074d9;
  }
  
  /* Active/open */
  .select select:active {
    color: #fff;
    background-color: #0074d9;
  }
  
  /* Hide the arrow in IE10 and up */
  .select select::-ms-expand {
    display: none;
  }
  
  /* Media query to target Firefox only */
  @-moz-document url-prefix() {
    /* Firefox hack to hide the arrow */
    .select select {
      text-indent: 0.01px;
      text-overflow: '';
      padding-right: 1rem;
    }
  
    /* <option> elements inherit styles from <select>, so reset them. */
    .select option {
      background-color: white;
    }
  }
  
  /* IE9 hack to hide the arrow */
  @media screen and (min-width:0\0) {
    .select select {
      z-index: 1;
      padding: .5rem 1.5rem .5rem 1rem;
    }
    .select:after {
      z-index: 5;
    }
    .select:before {
      position: absolute;
      top: 0;
      right: 1rem;
      bottom: 0;
      z-index: 2;
      content: "";
      display: block;
      width: 1.5rem;
      background-color: #eee;
    }
    .select select:hover,
    .select select:focus,
    .select select:active {
      color: #555;
      background-color: #eee;
    }
  }
  
  
  /* Input part is easier */
  input[type="text"],
  select {
    font-family: sans-serif;
    font-size: 15px;
  }
  .input-wrap {
    margin: 0 0 20px 0;
  }
  input[type="text"] {
    padding: 10px 15px;
    border-radius: 5px;
    border: 1px solid #D0D0D0;
    width: 100%;
    box-sizing: border-box; /* if you already aren't doing universally */
  }
  
  
  select.listing-select{
    text-align:center;
  }
  
  
  
  hr {
      margin: 10px 0;
  }
  
  .container-users, .container-source {
          display: flex;
    gap: 5px;
    margin: 3px 0;
    align-items: center;
  }
   body label {
       padding-left: 25px;
  }
   body .checkbox-group input[type=checkbox] {
       display: none;
  }
   body .checkbox-group input[type=checkbox]:not(:checked) + label::before {
       content: "";
       position: absolute;
       width: 15px;
       height: 15px;
       top: 5px;
       border-radius: 2px;
       border: 2px solid #757575;
       background-color: #fff;
       transition: 0.2s;
       left: 0;
  }
   body .checkbox-group input[type=checkbox]:checked + label::before {
       content: "";
       position: absolute;
       width: 15px;
       height: 15px;
       top: 5px;
       border-radius: 2px;
       border: 2px solid #00bbd6;
       background-color: #00bbd6;
       transition: 0.2s;
       left: 0;
  }
   body .checkbox-group input[type=checkbox]:checked + label::after {
       content: "";
       position: absolute;
       width: 5px;
       height: 9px;
       top: 6px;
       border-radius: 2px;
       transition: 0.2s;
       left: 5px;
       border-top: 2px solid transparent;
       border-left: 2px solid transparent;
       border-right: 2px solid #fff;
       border-bottom: 2px solid #fff;
       -webkit-transform: rotate(36deg);
       -ms-transform: rotate(36deg);
       transform: rotate(36deg);
       animation: fade-in 0.5s;
  }
   body .checkbox-group label {
       cursor: pointer;
       position: relative;
  }
   body .radio-group input[type=radio] {
       display: none;
  }
   body .radio-group input[type=radio]:not(:checked) + label::before {
       content: "";
       position: absolute;
       width: 15px;
       height: 15px;
       left: 0;
       top: 5px;
       border-radius: 50%;
       border: 2px solid #757575;
  }
   body .radio-group input[type=radio]:checked + label::before {
       content: "";
       position: absolute;
       width: 15px;
       height: 15px;
       left: 0;
       top: -1px;
       border-radius: 50%;
       border: 2px solid #00bbd6;
  }
   body .radio-group input[type=radio]:checked + label::after {
       content: "";
       position: absolute;
       width: 15px;
       height: 15px;
       left: 0;
       top: 6px;
       border-radius: 50%;
       border: 2px solid #00bbd6;
       background-color: #00bbd6;
       -webkit-transform: scale(0.4);
       -ms-transform: scale(0.4);
       transform: scale(0.4);
       animation: fade-in 0.5s;
  }
   body .radio-group label {
       cursor: pointer;
       position: relative;
  }
   @keyframes fade-in {
       from {
           opacity: 0;
      }
       to {
           opacity: 1;
      }
  }
   
  
  .notes-chip {
      display: inline-block;
      padding: 0 8px;
      height: 23px;
      font-size: 10px;
      line-height: 23px;
      border-radius: 40px;
      background-color: #5bb733;
      color: #fff;
      cursor: pointer;
  }
  
  .extra-chip {
    display: inline-block;
    padding: 0 8px;
    height: 23px;
    font-size: 10px;
    line-height: 23px;
    border-radius: 40px;
    background-color: #2551da;
    color: #fff;
    cursor: pointer;
  }
  
  .extra-chip-close-btn {
      padding-left: 5px;
      color: #fff;
      /* font-weight: bold; */
      float: right;
      font-size: 15px;
      cursor: pointer;
      transition: .2s;
  }
  
  .extra-chip-close-btn:hover{
    color: #b2b6c2;
  }
  li[data-cat='extra']{
    display:none !important}
    .toggle-input{
      display:block !important
    }
    .notes-form input{
      width: 500px;
      background: azure;
      padding: 32px 10px;
    }
    .form-group {
      margin:0
    }
    .icons-container{
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 22px;
        left: 40px;
        gap:3px;
    }
    .icons-container svg{
        padding: 3px 0 0;
    }
    .icons-container > span{
    cursor:pointer;
        padding: 1px 33px;
    background: #485563;
    box-shadow: 1px 2px 20px rgba(0,0,0,0.4);
    border-radius: 4px;
    }
    div.drawer.left.booking-orders > div.icons-container{display:none}
    `
    $(`<style>${customStyles}</style>`).appendTo("head");
