// Global Variables
let invID, allServices = [], payBtn, lastItem, invoiceData = [], itemsList = [], commissionsObj = {}, baseCommission, currentClientID, currentClientName, currentListing = [], currentBookings = [], currentStatus = [], allStaff = [], offersArray=[], inOffers = false, timeoutsObj={},   clientSources = [];

const apiKey = "3ebe5a148238b2936077a49dbc506b79f79f26de"
const itemsURL = "/v2/api/entity/le_invoice-items"
const staffURL = "/v2/api/entity/staff"
const bookingURL = "/v2/api/entity/le_workflow-type-entity-1"
const bookingURL2 = "/v2/api/entity/le_workflow-type-entity-2"
const servicesUsersURL = "/v2/api/entity/le_employee_service_map/1/4"
const commissionsRateURL = "/v2/api/entity/le_commission_map/1/4"

// Global Elements/Manipulation

// Create Extra Btn
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
`
    },
    searchBox: function () {
        return `
  
  `
    }
}

function onQueryingClient(bookingURL, apiKey) {
    $(".m-search-box").on("input", function () {
        const query = $(this).val()
        // console.log(query)
        $.ajax({
            url: bookingURL + "/list/1?filter[work_order_client.client_number]=" + query,
            method: "GET",
            contentType: "application/json",
            accept: "application/json",
            headers: { apikey: apiKey }
        }).done(data => {
            currentBookings = []
            currentBookings = data.data
            currentBookings.map(item => {
                const newItem = createBookingItem({ ...item })
                $(".booking-orders > div.list").empty().append(newItem)
            })
        })
    })
}
// Create Drawers 
function createDrawer(pos, btnText, elementFor, title) {
    // <div class="opaque-layer hide-opaque ${pos}"></div>
    const drawer = `
  <div class="drawer hide-drawer ${pos + " " + elementFor}">
  <div class="drawer-title">${title}</div>
  <div class="m-search-wrapper ${elementFor == "booking-orders" ? "" : "m-search-box-hidden"}">
<div id="m-containerr">
<input type="text" name="focus" required class="m-search-box" placeholder="ابحث برقم الجوال..." />
  <button class="close-icon" type="reset">&#215;	
  </button>
</div>
</div>
  <div class="list ${elementFor}">
  </div>  
  </div>  
  `
    const drawerBtn = `
  <button class="btn drawer-btn ${pos} btn-primary px-4" type="button">${btnText}</button>
  `
    setTimeout(() => {

        $(".drawer-btn." + pos).click(() => {
            $(".drawer").not("." + pos).addClass("hide-drawer")
            $(".drawer." + pos).toggleClass("hide-drawer")
            // $(".drawer."+pos).hasClass("hide-drawer") ? $(".drawer."+pos).removeClass("hide-drawer") : $(".drawer."+pos).addClass("hide-drawer")
            // $(".opaque-layer."+pos).toggleClass("hide-opaque")
        })
        $(".opaque-layer." + pos).click(() => {
            // console.log('opaque clicked!', pos)
            $(".drawer." + pos).addClass("hide-drawer")
            $(".opaque-layer." + pos).addClass("hide-opaque")
        })
    }, 1000)
    $("body").append(drawer)
    $("body").append(drawerBtn)
}

// GET All Users
const GETallUsers = (staffURL, apiKey) => {
    $.ajax({
        url: staffURL + "/list/-1?per_page=1000",
        method: "GET",
        contentType: "application/json",
        accept: "application/json",
        headers: { apikey: apiKey }
    }).done(data => {
        allStaff = data.data
        // console.log("staff", allStaff)
    }).done(() => {
        allServices.map((ser, i) => {
            ser.assignees.reduce((acc, curr) => {
                const data = { ...acc, [curr]: allStaff.filter(s => s.id == curr)[0] }
                allServices[i].assignees0 = { ...allServices[i].assignees0, ...data }
            })
        })

    })
        .done(() => console.log("after-staffing", allServices))
}

// GET Users per Services
function GETusersPerService(servicesUsersURL, apiKey) {
    $.ajax({
        url: servicesUsersURL,
        method: "GET",
        contentType: "application/json",
        accept: "application/json",
        headers: { apikey: apiKey }
    }).done(data => {
        // })
        allServices = data.le_employee_service_map_le_employee_service_map_emp_serv_map.reduce((acc, curr) => ([...acc, { service: curr.service, assignees: curr.employees, assignees0: {} }]), [])
        // allServices = data.le_employee_service_map_le_employee_service_map_emp_serv_map.reduce((acc, curr)=>([...acc, {service: curr.service, assignees: curr.employees.reduce((ac, cur)=>({...ac, [cur]: allStaff.map(s=>s.id == cur)}),{})
        // }]
        //   ),[])

    })
        // .done(()=> console.log("allservices", allServices)
        // )
        .done(() => GETallUsers(staffURL, apiKey))
}
// GET Commissions
function GETcommissionRates(commissionsRateURL, apiKey) {
    $.ajax({
        url: commissionsRateURL,
        method: "GET",
        contentType: "application/json",
        accept: "application/json",
        headers: { apikey: apiKey }
    }).done(data => {
        // console.log(data)
        baseCommission = data.le_commission_map_le_commission_map_commissions[0].commission
        // commissionsObj = data.le_commission_map_le_commission_map_commissions.reduce((acc,curr) =>({...acc, ...curr.services.map(s=>({[s]:curr.commission}))}),{})

        commissionsObj = data.le_commission_map_le_commission_map_commissions.reduce((acc, curr) => {
            curr.services.map(s => {
                acc[s] = curr.commission
            })
            return acc

        }, {})
    })
}
// Spinners Logic
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
    `
        return spinner;
    },
    removeSpinner(el, id = "dummy") {
        el.find("#spinner-" + id).remove()
    }
}

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





 ////////////////////Ayoub OFFERS CODE///////////////////////////////


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

 `



 // Add Short-Cut fro the new windows
 $(document).keydown(function (e) {
   if (e.ctrlKey && e.keyCode == 40) { // 40 is the key code for Arrow Down
     console.log('triggered')
     console.log($('.drawer-btn.top'))
     $('.drawer-btn.top').click();
   }
 });

 $(document).keydown(function (e) {
   if (e.ctrlKey && e.keyCode == 39) { // 39 is the key code for Arrow Right
     $('.drawer-btn.left').click();
   }
 });


 // GET Offers Local Entity and store data in global array
 function getOffersList() {
   $.get(`/v2/api/entity/le_offers/list/3`).done((offers) => {

     if (offers.data.length != 0) {
       offers.data.map((offer) => {
         let newOfferCard = `
             <span _ngcontent-c4="" class="product product-pic offer-item" tabindex="0"
            data-offer="${offer.id}"><app-product _ngcontent-c4="" _nghost-c12="">
              <div _ngcontent-c12="" class="Product-meta"><!----><span _ngcontent-c12=""
                  class="price-tag">SAR&nbsp;${offer.offer_price != null ? offer.offer_price: 0 }</span><!----><span _ngcontent-c12=""
               class="info-tag fa fa-exclamation-circle"></span></div><!---->
                 <div _ngcontent-c12="" class="Product-img"><img _ngcontent-c12="" src="${offer.img_url !=null ? offer.img_url: ''}"></div>
                  <div _ngcontent-c12="" class="product-name">
                <p _ngcontent-c12="">test2</p><!---->
                  </div>
                   </app-product></span> `
                   offersArray.push(newOfferCard)
       })
     }


   })

   
 }

 
// Start Calling items in the offer
function callItems(offer_id) {
   console.log('start here')
   $.get(`/v2/api/entity/le_offers/${offer_id}`).done( (offer)=>{
     console.log(offer)
     let listItems = offer["le_offers_le_offers_offered_services"]
     if(listItems.length != 0){
       console.log(listItems)
      
       loopAwait(listItems)
       // $('.loading-overlay').hide()
       // listItems.map(async(item)=>{
       //   let itemId = item.service_name
       //   let itemBarcode = item.service_barcode_num
       //   onReceiveBarCode(itemBarcode)
       //   await delay(500)
       //   setTest(itemId)
       // })
     } else {
       alert('لا توجد بنود في هذا العرض، الرجاء التحقق من إضافة البنود للعرض أولاً')
     }
   })
 }


 function onReceiveBarCodeAsync(itemBarcode) {
   return new Promise((resolve, reject) => {
       onReceiveBarCode(itemBarcode, resolve);
   });
}



async function setTest(item_id, count) {
   return new Promise((res)=>{
     setTimeout(async() => {
       currentClientName = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > div > button > span").text().trim()

     await  $.get("/v2/api/entity/client/list/-1?filter[business_name][like]=" + currentClientName, data => currentClientID = data.data[0].id)

       const lastItem = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > app-invoice-items > ul > li.order-item:last-child")

       let currentCat = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(2) > a").text()
       let currentServiceID = item_id
       // add categoryName + extrasButton to listItem 
       !lastItem.attr("data-cat") && lastItem.attr("data-cat", currentCat)
       // console.log("currentCat")
       // console.log(currentCat)


       // console.log('HTML TO APPEND')
       // console.log(addHTMLElements.itemProps(currentServiceID))

       lastItem.find(".container-users").length != 1 && lastItem.append(addHTMLElements.itemProps(currentServiceID))
       // console.log("lastItem")

       // console.log(lastItem)
       // console.log("length")
       // console.log(lastItem.find(".container-users").length)


       lastItem.attr("data-commission-rate", commissionsObj[currentServiceID] || baseCommission)
       lastItem.attr("data-product-id", currentServiceID)

       // console.log("allServices")
       // console.log(allServices)

       const selectedService = allServices.filter(ser => ser.service == currentServiceID)[0]

       if (!!lastItem.attr("data-assignees")) return;
       if (!selectedService) {
             console.log('not assigned to staff');
                 return;
             }

       // console.log("assignees")
       // console.log(selectedService)
       // console.log(selectedService.assignees)
       lastItem.attr("data-assignees", JSON.stringify(selectedService.assignees))
       lastItem.find("select").prop("disabled", true)
       lastItem.find(".select-spinner").append(appSpinner.addSpinner(currentServiceID, "10px", "#eee !important"))
       console.log("count in test set before Map" + count)
       selectedService.assignees.map( async (id)=> {

         let staffData = await $.get("/api2/staff/" + id)
         let  user = staffData.data.Staff
         lastItem.find("select").eq(0).append(`<option value="${user.id}" data-name="${user.full_name}">${user.full_name}</option>`)
         lastItem.find("select").prop("disabled", true)
         appSpinner.removeSpinner(lastItem, currentServiceID)
         lastItem.find("select").prop("disabled", false)
         console.log("count in test set " + count)


       //  await $.get("/api2/staff/" + id, data => {
       //     const user = data.data.Staff
       //     lastItem.find("select").eq(0).append(`<option value="${user.id}" data-name="${user.full_name}">${user.full_name}</option>`)
       //     lastItem.find("select").prop("disabled", true)
       //   }).done(() => {
       //     appSpinner.removeSpinner(lastItem, currentServiceID)
       //     lastItem.find("select").prop("disabled", false)
       //     console.log("count in test set " + count)
           
       //   })
         
       })
       
     
     }, 200)

     res(count)
   })

 }




 async function loopAwait(listItems){
   let count = 1
       let uCount = 1
       $('.loading-overlay').show()
   for(const item of listItems){

          let itemId = item.service_name
         let itemBarcode = item.service_barcode_num
         onReceiveBarCode(itemBarcode)
        let response = await setTest(itemId, count)
        console.log("response " + response)
         await delay(1000)
         console.log('uCount ' + uCount)
         // await delay(2000)
         count++
         uCount++
       }
       $('.loading-overlay').hide()

 }

 // Append offers list on item click 
 function appendOffersList(){
   $(document).on('click', 'span.product', ()=>{
     console.log('clicked this')
     let currentCat = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(2) > a").text()
     console.log("currentCat")
     console.log(currentCat)

     if((currentCat == 'العروض' || currentCat.toLowerCase() == 'offers') && !inOffers){
       offersArray.map((offerItem)=>{
         $('div.product-list').append(offerItem)
       })
       inOffers = true

       $('.offer-item').on('click', function(){
           let offerId = $(this).data('offer')
           callItems(offerId)
          }) 
     } 

   })

   $('.breadcrumb-wrapper .breadcrumb li').eq(0).on('click', ()=>{
     inOffers = false
   })

   $('.del-order').on('click', ()=>{
     inOffers = false
   })

 }

//This just a dealy function to await moments between functions

 function delay(ms){
   return new Promise((res)=>{
     setTimeout(()=>{res(true)}, ms)
   })
 }

 getOffersList()
 appendOffersList()
$('body').append(overlay)




// ================================ Ayoub code end 






























function accessCustomField(){
  $("#invoice-details-iframe").attr(
       "src",
       "/owner/invoices/validate_pos_invoice_details/1?new=1"
     );
     let customFelid = $("#invoice-details-iframe")
     console.log(customFelid)

     setTimeout(()=>{


      customFelid.contents()
       .find("div#CustomModelField1 > input")
       if(new Date().getHours() <= 10){
         customFelid.val(JSON.stringify(getToday().yesterday))
        }else{
          customFelid.val(JSON.stringify(getToday().date))
        }
       console.log(customFelid, customFelid.val())
      },800)
     }
 
 

// EventListener Function
function activateEventListener() {
    $(".drawer").click(function (e) {
        const $this = $(e.target)
        if ($this.hasClass("print-btn") || $this.closest("div").hasClass("print-btn")) {
            console.log("print-label", $this)
            const timeIsNow = getToday().time
            $this.closest(".list-item").find(".list-item-time > span").text(timeIsNow)
            // currentStatus.map(item => {
                const data = {
                    time: getToday().time,
                }
                console.log(data)
                const itemID = $this.closest("div.list-item").attr("data-item-id")
                UPDATEitemData(itemsURL, itemID, apiKey, data)
                printLabel(itemID)
                itemStatusChangeSchduler(itemID)
                // window.open(`https://roknrahati.daftra.com/v2/owner/templates/render/entity/view/local/1/${itemID}.pdf`)
            // })
            

        }
        if ($this.hasClass("expand-btn")) {
          console.log(
$this
          )
          $this.closest("div.smalldesc").toggleClass("expand")
        }
    })
}

function createListItem(currentStatusThisService, item) {
    return `
  <div class="list-item" data-service-id="${currentStatusThisService.serviceID}" data-item-id="${currentStatusThisService.itemID}">
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
    وقت البدء: <span>${item.time == null ? "--:--" : item.time}</span>
  </div>
  </div>
    <div class="item-box-3">
    <div class="select">
    <select id="service-${currentStatusThisService.serviceID}" " aria-label="Select menu example"  class="user-select listing-select item-list service-${currentStatusThisService.serviceID}">

  </select>
</div>
<div class="select-spinner">
</div>
<div class="status-container">
<div class="list-item-status ${item.item_status.toLowerCase()}">${item.item_status} </div>
<div class="print-btn">
<svg class="print-label" fill="#eee" width="25" viewBox="0 0 24 24"><title>printer-outline</title><path d="M19 8C20.66 8 22 9.34 22 11V17H18V21H6V17H2V11C2 9.34 3.34 8 5 8H6V3H18V8H19M8 5V8H16V5H8M16 19V15H8V19H16M18 15H20V11C20 10.45 19.55 10 19 10H5C4.45 10 4 10.45 4 11V15H6V13H18V15M19 11.5C19 12.05 18.55 12.5 18 12.5C17.45 12.5 17 12.05 17 11.5C17 10.95 17.45 10.5 18 10.5C18.55 10.5 19 10.95 19 11.5Z" /></svg>
</div>
    </div>
    
    
    </div>
    </div>
</div>
  `
}

// Update items listing
function itemStatusChangeSchduler(id) {
  const timeout = setTimeout(() => {
  const data = {
    item_status: "In-Progress",
    now: getToday().time,
    nowTimeDiff: getTimeDiff(curr.time, new Date()),
}
timeoutsObj[timeout+"_"+id] = timeout
console.log(timeoutsObj)
console.log(data)
UPDATEitemData(itemsURL, id, apiKey, data)

}, 5000);
// currentStatus.map(item => {
//   if (item.nowTimeDiff > 1) {
//   }
    
//     })
}
// function itemListingStatusChecker() {
//     console.log("================================", currentStatus)
//     currentStatus.map(item => {
//         if (item.nowTimeDiff > 1) {
//             const data = {
//                 item_status: "In-Progress",
//                 now: getToday().time,
//                 nowTimeDiff: getTimeDiff(curr.time, new Date()),
//             }
//             console.log(data)
//             UPDATEitemData(itemsURL, item.itemID, apiKey, data)
//         }
//     })
// }


function createBookingItem({ ...item }) {
    return `
  <div target="_blank" class="booking-container" href="${"/owner/work_orders/workflow_view/" + item.id}">
  <div  class="booking-item">
    <div class="list-item-inicator"></div>
  <div class="item-box-1">
    
      <div class="list-item-title">
      اسم العميل: ${item.clientName || "-"}      
      </div>
      
    </div>
    <div class="item-box-2">
  
    <div class="item-box-2">
    تاريخ الحجز: ${item.itemStartDate|| "-"}
  </div>
  </div>
    <div class="item-box-3">
    <div class="list-item-status booking}">المدفوع: ${item.itemBudget} </div>
    <a class="go-toBooking" href="${"/owner/work_orders/workflow_view/" + item.id}">اذهب إلى الحجز</a>
</div>
    </div>
    <div class="smalldesc">
    <button class="expand-btn">المزيد:</button>
      <p class="">
      <span>اسم الموظف</sapn>
      <span>${item.itemAssignee}</sapn>
      </p>
      <p class="">
      <span>وصف الحجز:</sapn>
      <span>${item.itemDesc}</sapn>
      </p>
      <p class="">
      <span>اسم الخدمات</sapn>
      <span>${JSON.stringify(item.serviceNames).slice(1)}</sapn>
      </p>
   
    </div>
</div>
  `
}

function GETclientSources(apiKey){

  $.ajax({
    url: "https://roknrahati.daftra.com/v2/api/entity/le_client_source_list/1",
    method: "GET",
    contentType: "application/json",
    accept: "application/json",
    headers: { apikey: apiKey }
})
    .done(data => {
      data["le_client_source_list_le_client_source_list_available_sources"].map(source=>{
        clientSources.push(source.client_sources)
      })
    })
    }


function getTimeDiff(startTime, currentTime) {
    const starting = new Date()
    starting.setHours(startTime.split(":")[0])
    starting.setMinutes(startTime.split(":")[1])
    const stH = starting.getHours()
    const ctH = currentTime.getHours()
    const hoursDiff = Math.abs(ctH - stH)
    if (!hoursDiff) {
        return currentTime.getMinutes() - starting.getMinutes()
    } else {
        const ctM = (60 * hoursDiff) + currentTime.getMinutes()
        return ctM - starting.getMinutes()
    }
}

function itemListing(itemsURL, apiKey) {
    // $("button.drawer-btn.top").append(appSpinner.addSpinner(_, "15px", "#ddd"))
    $.ajax({
        url: itemsURL + "/list/1?filter[date]=" + getToday().date,
        method: "GET",
        contentType: "application/json",
        accept: "application/json",
        headers: { apikey: apiKey }
    })
        .done(data => {
          console.log(data, "from listing")
            // if (data.total !== currentListing.length) {
            $("button.drawer-btn.top").append(appSpinner.addSpinner("top-spinner", "15px", "#eee !important"))
            $(".item-listing > div.list").empty()
            currentListing = []
            currentStatus = []
            currentStatus = data.data.reduce((acc, curr) => {
                return [...acc,
                {
                    selectedAssignee: curr.assigned_staff,
                    assingees: allServices.filter(serv => serv.service == curr.item_name)[0]?.assignees || [],
                    assingees0: allServices.filter(serv => serv.service == curr.item_name)[0]?.assignees0 || {},
                    status: curr.item_status,
                    serviceID: curr.item_name,
                    itemID: curr.id,
                    startedAt0: new Date(getToday().date + "T" + curr.time),
                    startedAt: curr.time,
                    now0: new Date(),
                    now: getToday().time,
                    // nowTimeDiff: getTimeDiff(curr.time, new Date())
                }]

            }, [])
            // console.log("currentStatus: ", currentStatus)
            currentListing = data.data
            $("button.drawer-btn.top").text(`طلبات حالية (${currentListing.length})`)

            currentListing.map(item => {
                const thisCurrentStatus = currentStatus.filter(s => (s.serviceID == item.item_name))[0] || []

                // console.log("select: ", thisCurrentStatus)
                const newItem = createListItem({ ...thisCurrentStatus }, { ...item })
                $(".item-listing > div.list").append(newItem)
            })
            // }
        }).done(() => {
            setTimeout(() => {
                appSpinner.removeSpinner($("button.drawer-btn.top", "top-spinner"))
            }, 1000)

            $(".item-listing > div.list select.item-list").map((_, currentSelect) => {
                const selectID = $(currentSelect).attr("id").split("-")[1]
                const thisCurrentStatus = currentStatus.filter(s => (s.serviceID == selectID))[0] || []
                // console.log("items: ", thisCurrentStatus, selectID)
                // console.log(Object.keys(thisCurrentStatus.assingees0 || {}))
                if ($(currentSelect).find("> option").length != Object.keys(thisCurrentStatus.assingees0 || {}).length) {

                    if (!!Object.keys(thisCurrentStatus.assingees0 || {}).length) {

                        Object.entries(thisCurrentStatus.assingees0 || {}).map(([id, val]) => {
                            $(currentSelect).append(`<option value="${id}" selected="${id == thisCurrentStatus.selectedAssignee}">${val.full_name}</option>`)
                        })
                        clientSources.map(s=>{
                          $("div.select.source-select > select").append(`<option value="${s}">${s}</option>`)
                        })
                        } else { 
                        $(currentSelect).append(`<option value="0" selected>لا يوجد موظفين حاليًا</option>`)
                    }
                    $(currentSelect).val(thisCurrentStatus.selectedAssignee)
                }

            })
        })

}

async function GETthings(arrURLs){
  const requests = arrURLs.map((url) => fetch(url, apiOptions)); 
  const responses = await Promise.all(requests); 
  const promises = await responses.map((response) => response.json());
  return await Promise.all(promises);
}

async function bookingListing(bookingURL, apiKey) {
    $(".booking-orders > div.list").empty()
    $("button.drawer-btn.left").append(appSpinner.addSpinner(_, "15px", "#eee !important"))
    // $(".booking-orders > div.list").append(appSpinner.addSpinner())
    $(".booking-orders > div.list").append(appSpinner.addSpinner(_, "50", "#eee !important"))


    const inputVal = $(".m-search-box").val()
    // if(!inputVal.length){
      const bookingURLs = [ bookingURL + "/list/1?filter[start_date]=" + getToday().date2,  bookingURL2 + "/list/1?filter[start_date]=" + getToday().date2]
      GETthings(bookingURLs).then(bookingsResponse=>{
          currentBookings = []
          const allCurrentBookings = [{data: [...bookingsResponse[0].data], url: path.split("list")[0]}]
          allCurrentBookings.map(booking=>{
            booking.map(b=>{
            fetch(``+booking.id, apiOptions)
          })
            data.data.map(d=>d.id).map(instance=>{
              $.ajax({
                url: bookingURL +"/"+ instance+"/4",
                method: "GET",
                contentType: "application/json",
                accept: "application/json",
                headers: { apikey: apiKey }
            }).done(data=>{
              // console.log(data)
              currentBookings = [...currentBookings, data]
              // if (data.total !== currentBookings.length) {
                  $(".booking-orders > div.list").empty()
                  const serviceNames = data["le_workflow-type-entity-1_custom_data"]["le_custom_data_le_workflow-type-entity-1_services_pivot"].map(s=>s["le_custom_data_le_workflow-type-entity-1_services"].name)
              const clientName = data.work_order_client.business_name
              const itemDesc = data.description
              const itemBudget = data.budget
              const itemStartDate = data.start_date
              const id = data.id
              const itemAssignee = data.assigned_users[0].employee.full_name
              const itemData = {itemBudget, id, serviceNames, clientName, itemDesc, itemStartDate,itemAssignee}
                      // const serviceNames = data.data["le_workflow-type-entity-1_custom_data"]["le_custom_data_le_workflow-type-entity-1_services_pivot"].map(s=>s["e_custom_data_le_workflow-type-entity-1_services"].name)
                      const newItem = createBookingItem({ ...itemData })
                      $(".booking-orders > div.list").append(newItem)
                  $("button.drawer-btn.left").text(`حجز العملاء (${currentBookings.length})`)
                  // }                
                appSpinner.removeSpinner($("button.drawer-btn.left"), "left-spinner")
              })
            })

        } else {
          $("button.drawer-btn.left").text(`حجز العملاء (${currentBookings.length})`)
          $(".booking-orders > div.list").empty().append("<h1 class='no-result'> لا توجد حجوزات</h1>")

      }
           
        })
    // }

}


function debouncer(cb, duration = 900) {
    var timer;
    return function () {
        var args = arguments;
        console.log(args)
        clearTimeout(timer);
        timer = setTimeout(function () {
            cb.apply(null, args);
        }, duration);
    };
}


const searchDebounce = debouncer(function () {
    $(".booking-orders > div.list").empty()
    $(".booking-orders > div.list").append(appSpinner.addSpinner("left-spineer", "50", "#eee !important"))

    const q = $(".m-search-box").val()
    console.log(q)
    if (q != "") {
        debouncer(
            $.ajax({
                url: bookingURL + "/list/1?filter[work_order_client.client_number]=" + q,
                method: "GET",
                contentType: "application/json",
                accept: "application/json",
                headers: { apikey: apiKey }
            }).done(data => {
                currentBookings = []
                currentBookings = data.data
                if (!!currentBookings.length) {
                    $(".booking-orders > div.list").empty()
                    currentBookings.map(item => {
                        const newItem = createBookingItem({ ...item })
                        $(".booking-orders > div.list").append(newItem)
                    })
                } else {
                    $(".booking-orders > div.list").empty().append("<h1 class='no-result'> لا توجد حجوزات</h1>")
                }
            })
        )
    } else {
        debouncer(bookingListing(bookingURL, apiKey))
    }
})

function newClientIframe() {
    const $iframe = $("#client-preview")
    $iframe.css({ height: "45vh" })
    $iframe.on("load", function () {
        const $contents = $(this).contents().find("body")
        $contents.find("#ClientForm > div.row.container-box > div:nth-child(1)").attr("class", "col-sm-12")

    })
}


function prepPOS() {

    createDrawer("left", "حجز العملاء (0)", "booking-orders", "طلبات الحجز")
    createDrawer("top", "طلبات حالية (0)", "item-listing", "الطلبات الحالية")
    // Add input field for testing
    // $(".orders-tabs-wrapper ul").append(
    //   '<li class="px-4"><input _ngcontent-c0="" autocomplete="off" class="form-control ng-untouched ng-pristine ng-valid" id="inv-obj" type="text" placeholder="invoice data..."></li>'
    // );

    // Reset the leftovers from previous sessions
    $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > div > a.user-action.del-order.btn.btn-danger > i").trigger("click")
    const keyEvent = new Event("keyup", { keyCode: 13 });
    $('window').trigger(keyEvent);
    // Disable Discount Field
    $("#pos-wrapper > div.pos-content > app-invoice > div > div.calc-wrapper > div > div.subwindow-container-fix.pads > section.content-numpad > button:nth-child(2), #pos-wrapper > div.pos-content > app-invoice > div > div.calc-wrapper > div > div.subwindow-container-fix.pads > section.content-numpad > button:nth-child(3)").attr("disabled", "disabled").css({ userSelect: "none", pointerEvents: "none", color: "gray" })






    // Adding styles for Extra Btn And Others
    const customStyles = `
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
      max-height: 140px;
    }
    .disabled{
        pointer-events: none;
        user-select: none;
        cursor: auto;
        background-color: gray;
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
  padding: 0px 6px;
  background-color: transparent;
  direction: rtl;
  position: relative;
}
.list-item{
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
  background-color: #d6931b;

}
.list-item-status.finished{
  background-color: #0189de;

}
.list-item-status.in-progress{
  background-color: #bc3737;
}
.list-item-status.available{
  background-color: #0a7622;
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
`
    $(`<style>${customStyles}</style>`).appendTo("head")
}


// Product Metadata
// function selectedProductMetadata(){
//   $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > app-products > div > span.product-pic").click((e)=>{
//     e.stopPropagation()
//     const productID = $(e.target).closest("span.product-pic").attr("data-product")
//     const productImage = $(e.target).closest("span.product-pic").find(".Product-img img").attr("src")
//     const productPrice = $(e.target).closest("span.product-pic").find(".Product-meta span.price-tag").text()
//     const productName = $(e.target).closest("span.product-pic").find(".product-name p").text()
//     const productCategory = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(2) > a").text()
//     return {productID, productImage, productPrice, productName, productCategory}
//     });
// }

// Add Category Name to Items

function addCategoryName() {
    //onClick categories cards 
    $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > app-products > div > span.product-pic").click((e) => {
        e.stopPropagation()
        currentClientName = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > div > button > span").text().trim()

        $.get("/v2/api/entity/client/list/-1?filter[business_name][like]=" + currentClientName, data => currentClientID = data.data[0].id)

        const lastItem = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > app-invoice-items > ul > li.order-item:last-child")

        let currentCat = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(2) > a").text()
        let currentServiceID = $(e.target).closest("span.product-pic").attr("data-product")
        // add categoryName + extrasButton to listItem 
        !lastItem.attr("data-cat") && lastItem.attr("data-cat", currentCat)
        lastItem.find(".container-users").length != 1 && lastItem.append(addHTMLElements.itemProps(currentServiceID))
        lastItem.attr("data-commission-rate", commissionsObj[currentServiceID] || baseCommission)
        lastItem.attr("data-product-id", currentServiceID)
        const selectedService = allServices.filter(ser => ser.service == currentServiceID)[0]
        if (!!lastItem.attr("data-assignees")) return;
        lastItem.attr("data-assignees", JSON.stringify(selectedService.assignees))
        lastItem.find("select").prop("disabled", true)
        lastItem.find(".select-spinner").append(appSpinner.addSpinner(currentServiceID, "10px","#eee !important"))
        selectedService.assignees.map(id => {
            $.get("/api2/staff/" + id, data => {
                const user = data.data.Staff
                lastItem.find("select").eq(0).append(`<option value="${user.id}" data-name="${user.full_name}">${user.full_name}</option>`)
                lastItem.find("select").prop("disabled", true)
            }).done(() => {
                appSpinner.removeSpinner(lastItem, currentServiceID)
                lastItem.find("select").prop("disabled", false)
            })
        })

    });
}

// POST Invoice Items
function PostinvoiceItems(itemsURL, apiKey, data) {
    data.map(item => {
        const d = {
            invoice_id: item.itemInvoiceID,
            assigned_staff: Object.keys(item.itemAssignee)[0],
            item_price: item.itemPrice,
            item_status: item.ItemStatus,
            overtime: item.itemOvertime,
            item_name: item.itemProductID,
            hidden_client_name: item.itemClient,
            client: item.itemClientID,
            date: item.itemDate,
            time: null,
            commission_amout: item.itemCommissionAmount,
            commission_rate: item.itemCommissionRate,
            client_source: item.itemClientSource,
        }
        console.log(d)
        $.ajax({
            url: itemsURL,
            method: "POST",
            contentType: "application/json",
            accept: "application/json",
            headers: { apikey: apiKey },
            data: JSON.stringify(d)
        }).done(
            () => {
                console.log("items have been Created!!!")
                invID = null
            }).fail(err => console.log(err))
    })
}

const getToday = () => {
    const [y, m, d] = new Date().toJSON().slice(0, 10).replace(/-/g, '/').split("/")
    const t = new Date().toLocaleTimeString().split(" ")[0].split(":").slice(0, -1).join(":")
    return { date: d + "/" + m + "/" + y, time: t, date2: y + "-" + m + "-" + d, yesterday: d-1 + "/" + m + "/" + y }
}


// Create Invoice Data
function invoiceDataCollector() {
    invoiceData = []

    const itemsList = $(".order-item")
    itemsList.map((_, item) => {
        const $thisItemName = $(item).find(".product-name").text()
        const $thisItemAssigneeID = $(item).find("select > option:selected").val()
        const $thisItemAssigneeName = $(item).find("select.user-select > option:selected").attr("data-name")
        const $thisItemCLientSource = $(item).find("select.source-select > option:selected").attr("data-source")
        const $thisItemOvertime = $(item).find(".over-time").is(":checked") ? 1 : 0
        const $thisItemCategory = $(item).attr("data-cat")
        const $thisItemProductID = $(item).attr("data-product-id")
        const $thisItemQty = $(item).find("li > span > em:nth-child(1)").text()
        const $thisItemPrice = +$(item).find(".price").text().replace(",", "").match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]
        const $thisItemStatus = $thisItemAssigneeName ? "In-Progress" : "Waiting"

        const $thisItemDate = getToday().date
        const $thisItemTime = getToday().time

        const $thisItemCommissionRate = $(item).attr("data-commission-rate")
        const $thisItemCommissionAmount = ($thisItemCommissionRate / 100) * $thisItemPrice

        const $thisItem = {
            itemName: $thisItemName,
            itemAssignee: { [$thisItemAssigneeID]: $thisItemAssigneeName },
            itemQty: $thisItemQty,
            itemCategory: $thisItemCategory,
            itemProductID: $thisItemProductID,
            itemPrice: $thisItemPrice,
            itemOvertime: $thisItemOvertime,
            ItemStatus: $thisItemStatus,
            itemInvoiceID: 999,
            itemCommissionRate: $thisItemCommissionRate,
            itemCommissionAmount: $thisItemCommissionAmount,
            itemClient: currentClientName,
            itemClientID: currentClientID,
            itemDate: $thisItemDate,
            itemTime: $thisItemTime,
            itemClientSource: $thisItemCLientSource
        }
        invoiceData.push($thisItem)

    })
    return invoiceData
}

//GEt Item Data
function GETitemData(itemsURL, id, apiKey) {
    return $.ajax({
        url: itemsURL + "/" + id,
        method: "GET",
        contentType: "application/json",
        accept: "application/json",
        headers: { apikey: apiKey }
    })
}


// Update Item Data
function UPDATEitemData(itemsURL, id, apiKey, data) {
    console.log(data)
    $.ajax({
        url: itemsURL + "/" + id + "/fields",
        method: "POST",

        headers: {
            contentType: "application/json",
            accept: "application/json",
            apikey: apiKey
        },
        data: JSON.stringify(data)
    }).done(res => {
        console.log(res, `${itemsURL}/${id}/fields`)
        console.log("Item has been updated")
    }).fail(err => console.log(err))
}

// onCheckout
function onCheckout(payBtn) {

    payBtn.click(function (e) {
        e.preventDefault()
        // Passing Inv. Data to Custom Field
        const invNumberInterval = setInterval(() => {
            if (!invID) {
                console.log("inv is null")
            } else {
                clearInterval(invNumberInterval)
                console.log("InvID: ", invID, "on.", orderNumber)
                let itemsNoData = {
                    "id": 1,
                    "curr_no": parseInt(orderNumber) + 1,
                    "last_item": parseInt(lastItem) + itemsList.length,
                    "last_inv": invID
                }

                // Update Order Number
                // PUTorderNumber(orderNumberURL, apiKey, itemsNoData)
                // Create Items to The Restaurant App
                // POSTitemsToKitchen(itemsURL, apiKey, itemsList)
                // Back to Home
                $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(1)").click()
            }
        }, 500)
    })
}


// onReset or onHome
function onHomeOrReset() {
    const homeBtn = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(1)")
    const clearBtn = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > div > a.user-action.del-order.btn.btn-danger")
    // onHome clicking home btn
    homeBtn.click(() => {
        $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > div > span.product").click(() => {
            addCategoryName()

        })
    })
    // onReset reseting the current invoice
    clearBtn.click(() => {
        // homeBtn.trigger("click")
        setTimeout(() => {
            // console.log("cleared")
            $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > div > span.product").click(() => {

                addCategoryName()
            })
        }, 400)
    })

}

function onChangeUserItemListing() {
    $(".drawer.item-listing").change(function (e) {
        const $this = $(e.target)
        $this.closest(".select").siblings(".select-spinner").append(appSpinner.addSpinner("update-loader", "17px", "#eee"))
        console.log($this)
        if ($this.hasClass("listing-select")) {
            const $thisSelectedAssignee = $this.find("option:selected").val()
            const $thisItemID = $this.closest(".list-item").attr("data-item-id")
            console.log($thisItemID)
            // const itemReq = GETitemData(itemsURL, $thisItemID, apiKey)
            // itemReq.done(data => {
            console.log(data)
            const d = {
                // ...data,
                assigned_staff: $thisSelectedAssignee
            }
            UPDATEitemData(itemsURL, $thisItemID, apiKey, d)
           appSpinner.removeSpinner($this.closest(".select").siblings(".select-spinner"),"update-loader")

            // })



        }
    })
}



// onLoad DOM
let domInterval = setInterval(() => {
    payBtn = $("#paymentSubmitBtn")

    if (payBtn) {
        newClientIframe()
        const checkoutBtn = $(".pay")

        setTimeout(() => {

            onChangeUserItemListing()
            activateEventListener()
            $(".m-search-box").on("input", searchDebounce)
            $(".close-icon").click(() => {
                $(".m-search-box").val("")
                bookingListing(bookingURL, apiKey)
            })
        }, 1000);
        bookingListing(bookingURL, apiKey)
        // $(".pay.btn-success").click(()=>invoiceObj())
        clearInterval(domInterval)
        // setInterval(() => {
        //   itemListingStatusChecker()
        // }, 1000)
        itemListing(itemsURL, apiKey)
        // If user resets POS or goes HOME
        onHomeOrReset()
        //calling functions

        GETusersPerService(servicesUsersURL, apiKey)
        GETcommissionRates(commissionsRateURL, apiKey)
        prepPOS()
        onCheckout(payBtn)
        checkoutBtn.click(() => {
            const allData = invoiceDataCollector()
            accessCustomField()
            console.log("allData", allData)
            PostinvoiceItems(itemsURL, apiKey, allData)
            setTimeout(()=>{  
              itemListing(itemsURL, apiKey)
            },1000)  
        })

    }

}, 1000)
