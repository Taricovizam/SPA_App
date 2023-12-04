// Global Variables:
let payBtn, currentCategory, commissionsObj ={}, allServices = [], clientSources = [];

// Global URLs:
const commissionsRateURL = "/v2/api/entity/le_commission_map/1/4"
const servicesUsersURL = "/v2/api/entity/le_employee_service_map/1/4";
const clientSourcesURL = "/v2/api/entity/le_client_source_list/1"
// const itemsURL = "/v2/api/entity/le_invoice-items";
// const staffURL = "/v2/api/entity/staff";
// const bookingURL = "/v2/api/entity/le_workflow-type-entity-1";
// const bookingModule = "/v2/api/entity/le_booking_module";

// Utils:
function addAttr(el, attr, val){
    el.attr(attr, val)
}

// GET Any Request 
async function GETrequest(url) {
const apikey = "3ebe5a148238b2936077a49dbc506b79f79f26de";
    const apiOptions = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        headers: {apikey}
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

      !lastItem.attr("data-cat") && addAttr(lastItem, "data-cat", currentCategory);
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
    
      console.log($currentServiceObj)

      if (!$currentServiceObj) {
        appSpinner.removeSpinner(lastItem, $currentProductID);
        lastItem.find(".checkbox-group > label").addClass("disabled-btn");
        lastItem.find("select").eq(0).prop("disabled", true);
        lastItem
          .find("select")
          .eq(0)
          .empty()
          .append(`<option value="" data-name="">لا يوجد موظفين</option>`);
          return;  
    }
      if ($currentServiceObj) {
        Object.values($currentServiceObj.assigneeNames).map((name,i) => {
            lastItem
              .find("select")
              .eq(0)
              .append(
                `<option value="${$currentServiceObj.assigneeIDs[i]}" data-name="${name}">${name}</option>`
              );
            
        });
        appSpinner.removeSpinner(lastItem, $currentProductID);

    }
  }


function dispatchEventListeners(){
    $(document).click(e=>{
      const $this = $(e.target)
      if($this.hasClass("product") || $this.closest("span").hasClass("product")){
        const productID = $this.attr("data-product") || $this.closest("span").attr("data-product")
        console.log(productID, currentCategory)
        addSelectedItemMetaData(productID)
      }else if($this.hasClass("product-category") || $this.closest("span").hasClass("product-category")){
        currentCategory =  $this.find("div.product-category-name").text().trim() || $this.text().trim()
    }
    })
  }

  
// GET Requsts (Prepare Data):
async function FetchData(){
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
        console.log(clearBtn)
        clearBtn.trigger("click")
        
      dispatchEventListeners()
      appendDrawersAndToggleBtns("left", "حجز العملاء (0)", "booking-orders", "طلبات الحجز");
        appendDrawersAndToggleBtns("top", "طلبات حالية (0)", "item-listing", "الطلبات الحالية");
  
      clearInterval(domInterval)
    }
    },1000)








    function appendDrawersAndToggleBtns(pos, btnText, elementFor, title) {
        // <div class="opaque-layer hide-opaque ${pos}"></div>
        const drawer = `
        <div class="drawer hide-drawer ${pos + " " + elementFor}">
        <div class="drawer-title">${title}</div>
       
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
  .list-item.done{
    background-color: #165f39;
  
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
    `
    $(`<style>${customStyles}</style>`).appendTo("head");
