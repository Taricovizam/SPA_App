// Global Variables
let allServices = {}, payBtn, lastItem, invoiceData={}, itemsList=[];

let extras = []
let extrasArr = []
let currentItem, currentExtras;
let invObj = []

const extrasCategoryId = 14
const apiKey = "3ebe5a148238b2936077a49dbc506b79f79f26de"
const itemsURL = "/v2/api/entity/le_invoice-items"
const servicesUsersURL = "/v2/api/entity/le_employee_service_map/1/4"
const extrasURL = "/v2/api/entity/item_category/list/1?per_page=1000&filter[category_id]=14"
const orderNumberURL =  "/v2/api/entity/le_order-no/1"
let orderNumber, invID;


// Global Elements/Manipulation

// Create Extra Btn
const extraBtn = `
 <hr>
 <div class="container-users"> 
<p style="direction:rtl">اختر موظف/موظفين:</p>

<div class="select">
  <select aria-label="Select menu example" class="user-select">
    <option selected style="">اختر موظف</option>
  </select>
</div>
<div class="select-spinner">
</div>
    </div>
     <div class="checkbox-group">
      <input id="over-time" type="checkbox"/>
      <label for="over-time">وقت إضافي؟</label>
    </div>
` 
// Create Drawers 
function createDrawer(pos, btnText){

  // <div class="opaque-layer hide-opaque ${pos}"></div>
  const drawer = `
  <div class="drawer hide-drawer ${pos}">
  
  </div>  
  `
  const drawerBtn = `
  <button class="btn drawer-btn ${pos} btn-primary px-4" type="button">${btnText}</button>
  `
  setTimeout(()=>{

    $(".drawer-btn."+pos).click(()=>{
      $(".drawer").not("."+pos).addClass("hide-drawer")
      $(".drawer."+pos).toggleClass("hide-drawer")
      // $(".drawer."+pos).hasClass("hide-drawer") ? $(".drawer."+pos).removeClass("hide-drawer") : $(".drawer."+pos).addClass("hide-drawer")
      // $(".opaque-layer."+pos).toggleClass("hide-opaque")
  })
  $(".opaque-layer."+pos).click(()=>{
    console.log('opaque clicked!', pos)
    $(".drawer."+pos).addClass("hide-drawer")
    $(".opaque-layer."+pos).addClass("hide-opaque")
  })
},1000)
$("body").append(drawer)
$("body").append(drawerBtn)
}
// GET Users per Services
function GETusersPerService(servicesUsersURL, apiKey){
  $.ajax({
    url: servicesUsersURL, 
    method: "GET",
    contentType: "application/json",
    accept: "application/json",
    headers: {apikey: apiKey}
}).done(data=>{
  allServices = data.le_employee_service_map_le_employee_service_map_emp_serv_map.reduce((acc, curr)=>([...acc, {service: curr.service, assignees: curr.employees}]),[])
}).done(()=> console.log(allServices))
}
// Spinners Logic
const appSpinner ={
  addSpinner(id, size="20px"){

    const spinner = `
    <svg id="spinner-${id}" x="0px" y="0px" width="${size}" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
    <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
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
  removeSpinner(el, id){
    el.find("#spinner-"+id).remove()
  }
  }

function onSelectUser(element){
  $(element).change(function(e){
    const $thisChangedElement = $(e.targat)
    if($thisChangedElement.hasClass("user-select")){
      const selectedUser0 =  $thisChangedElement.selected()
      const selectedUser =  $thisChangedElement.find("option:selected").val()
      invoiceData.items.filter(inv=>inv.service)
      console.log("a user has been selected", selectedUser0, selectedUser)
    }
  })
}

function prepPOS(){
  createDrawer("left", "من اليسار")
  createDrawer("top", "من الأعلي")
  accessCustomField()
  // Add input field for testing
  // $(".orders-tabs-wrapper ul").append(
  //   '<li class="px-4"><input _ngcontent-c0="" autocomplete="off" class="form-control ng-untouched ng-pristine ng-valid" id="inv-obj" type="text" placeholder="invoice data..."></li>'
  // );

// Reset the leftovers from previous sessions
  $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > div > a.user-action.del-order.btn.btn-danger > i").trigger("click")
  const keyEvent = new Event( "keyup", { keyCode: 13 } );
  $('window').trigger(keyEvent);
// Disable Discount Field
$("#pos-wrapper > div.pos-content > app-invoice > div > div.calc-wrapper > div > div.subwindow-container-fix.pads > section.content-numpad > button:nth-child(2), #pos-wrapper > div.pos-content > app-invoice > div > div.calc-wrapper > div > div.subwindow-container-fix.pads > section.content-numpad > button:nth-child(3)").attr("disabled", "disabled").css({userSelect: "none", pointerEvents: "none", color: "gray"})






      // Adding styles for Extra Btn And Others
const customStyles = `
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
  z-index:999;
  transition: .4s;
  position:absolute;
  display: flex;
  align-items: center;
  width: 50%;
  background: #108e5b;
  border-radius: 15px;
  padding: 160px 45px 30px;
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

.container-users {
   	 display: flex;
  gap: 5px;
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
$(`<style>${customStyles}</style>`).appendTo( "head" )
}



// Accessing Invoice Custom Fields
function accessCustomField(){
 $("#invoice-details-iframe").attr(
      "src",
      "/owner/invoices/validate_pos_invoice_details/1?new=1"
    );
    }


// Create Notes Field
function CreateNotesField(){
  const notesContainer = `<div class="notes-container" style="display:none;z-index:10;position:absolute;top:50%;left:50%;transform:translateX(-50%) translateY(-50%);border:11px solid #485563;box-shadow:2px 2px 20px 3px #7777773d;border-radius:6px;background:#fff;">  <div style="width:100%;padding:0px;position:relative;z-index:20;"><span style="transform:rotate(45deg);position:absolute;top:0;right:0;padding:3px 10px;font-size:22px;cursor:pointer;" class="extras-close" onclick="document.querySelector('.notes-container').classList.remove('toggle-input')">+</span></div><form class="notes-form">
  <div class="form-group">
  
  <input type="text" class="form-control" id="exampleFormControlInput1" placeholder="Add Notes..."/>
  </div>
  </form>
  </div>`
  $("body").append(notesContainer)

}

 // Handling Notes Input (onClick extraBtn)
 function notesHandling(){
 $(".notes-form").submit(function(e){
   e.preventDefault()
  $('.notes-container').removeClass('toggle-input')
  const inputNotesVal = $(this).find("input").val()
  currentItem.attr("data-notes", inputNotesVal)

  // $(this).find("input").val("")
  //extraNames[inputNotesVal] = "notes"
  currentItem.find("ul > li:not(.meta-info)").remove() 
  //currentItem.find(".meta-list > li.meta-info").after("li")
  console.log("from notes", currentItem.attr("data-notes"))
  const allExtra = currentItem.attr("data-extras") ? JSON.parse(currentItem.attr("data-extras")) : []
  extrasQtyCalc(allExtra)
  const newNoteChip = `<div class="notes-chip">
  <b><span class="extra-chip-content">${currentItem.attr("data-notes")}</span></b>
  <span class="extra-chip-close-btn">&times;</span>
</div>`

currentItem.find(".meta-list > li:last-child").append(newNoteChip)
  // currentItem.find(".meta-list > li.meta-info").after(`<li>${JSON.stringify(Object.keys(extraNames))}<br/> +Notes: ${currentItem.attr("data-notes")}</li>`)
  //$(this).find("input").val("")
  // document.querySelector('.notes-container').classList.remove('toggle-input')
  })
}

// Get Current Item (onClick extraBtn)
function accessCurrentItem(el){
  const $currentItem = $(el).closest("li")
  // current item prep for using
  currentExtras = $currentItem.data("extras") || []
  return $currentItem
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

  // function addCategoryName(){
  //   //onClick categories cards 
  //   $(document).click((e)=>{
  //   e.stopPropagation()
  //     const $clickedItem = $(e.targat)
  //     if($clickedItem.hasClass(".product-pic")){
  
  //   const lastItem = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > app-invoice-items > ul > li.order-item:last-child")
  
  //   let currentCat = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(2) > a").text()
  //   let currentServiceID = $(e.target).closest("span.product-pic").attr("data-product")
  //   // add categoryName + extrasButton to listItem 
  //   !lastItem.attr( "data-cat") && lastItem.attr( "data-cat", currentCat)
  //   lastItem.find(".container-users").length != 1 && lastItem.append(extraBtn)
  //   const selectedService = allServices.filter(ser=>ser.service == currentServiceID)[0]
  //   lastItem.attr("data-assignees", JSON.stringify(selectedService.assignees))
  //   lastItem.find(".select-spinner").append(appSpinner.addSpinner(currentServiceID))
  //   if(!selectedService.assignees.length)return;
  //     console.log("all emps", selectedService.assignees)
  //     selectedService.assignees.map(id=>{
  //     $.get("/api2/staff/"+id, data=>{
  //       const user = data.data.Staff
  //       console.log(lastItem.find(".container-users .select select.select-user"))
  //       lastItem.find(".container-users .select select.select-user").append(`<option value="${user.id}">${user.full_name}</option>`)
  //     })
  //     // appSpinner.removeSpinner(lastItem, currentServiceID)
  //   })
  
  // }
  //   });
  //   accessCustomField()
  // }
function addCategoryName(){
  //onClick categories cards 
  $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > app-products > div > span.product-pic").click((e)=>{
  e.stopPropagation()
  const lastItem = $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > app-invoice-items > ul > li.order-item:last-child")

  let currentCat = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(2) > a").text()
  let currentServiceID = $(e.target).closest("span.product-pic").attr("data-product")
  // add categoryName + extrasButton to listItem 
  !lastItem.attr( "data-cat") && lastItem.attr( "data-cat", currentCat)
  lastItem.find(".container-users").length != 1 && lastItem.append(extraBtn)
  const selectedService = allServices.filter(ser=>ser.service == currentServiceID)[0]
  if(!!lastItem.attr( "data-assignees"))return;
  lastItem.attr("data-assignees", JSON.stringify(selectedService.assignees))
  lastItem.find("select").prop("disabled", true)
  lastItem.find(".select-spinner").append(appSpinner.addSpinner(currentServiceID))
    selectedService.assignees.map(id=>{
    $.get("/api2/staff/"+id, data=>{
      const user = data.data.Staff
      lastItem.find("select").append(`<option value="${user.id}">${user.full_name}</option>`)
      onSelectUser(lastItem.find("select"))
  lastItem.find("select").prop("disabled", true)
    }).done(()=>{
      appSpinner.removeSpinner(lastItem, currentServiceID)
      lastItem.find("select").prop("disabled", false)
    })
  })

  });
  accessCustomField()
}

// POST Invoice Items to the Restaurant App
function POSTitemsToKitchen(itemsURL, apiKey, data){
  data.map((_,item)=>{
  $.ajax({
      url: itemsURL, 
      method: "POST",
      contentType: "application/json",
      accept: "application/json",
      headers: {apikey: apiKey},
  //data: JSON.stringify(data),
      data: JSON.stringify({item_name: $(item).find(".product-name").text(), item_qty: $(item).find("li > span > em:nth-child(1)").text(), item_category: $(item).attr( "data-cat"), itemPrice: $(item).find(".price").text().replace(",", "").match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0], status: "0", order_no: orderNumber, invoice_id: invID})
  }).done(
      ()=>{
  console.log("items have been Created!!!")
  invID = null
  }).fail(err=>console.log(err))
  })
  }

  // Create Invoice Data Obj
function invoiceDataCollector(){
  invoiceData = []
  // accessCustomField()
  // GETorderNumber(orderNumberURL, apiKey)
  const itemsList = $(".order-item")

  itemsList.map((_,item)=>{
  const $thisItemName = $(item).find(".product-name").text()
  const $thisItemAssignee = $(item).find("select").selected()
  const $thisItemOvertime = $(item).find("#over-time").checked()
  const $thisItemCategory = $(item).attr( "data-cat")
  const $thisItemPrice =  $(item).find(".price").text().replace(",", "").match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g)[0]
  const $thisItemQty =  $(item).find("li > span > em:nth-child(1)").text()
  const $thisItemStatus = $thisItemAssignee ? 1 : 2
  
  const $thisItem = {
    itemName: $thisItemName, 
    itemAssignee: $thisItemAssignee, 
    itemQty: $thisItemQty, 
    itemCategory: $thisItemCategory, 
    itemPrice: $thisItemPrice, 
    itemOvertime: $thisItemOvertime, 
    ItemStatus: $thisItemStatus, 
    // invoice_id: invID
  }
  invoiceData.push($thisItem)
  return invoiceData
  })
  // Handling data input
  
        let customFelid = $("#invoice-details-iframe")
          .contents()
          .find("#CustomModelField2")
  customFelid.val(JSON.stringify(invObj))
  console.log(customFelid)
  if(customFelid.val() == "" || customFelid.val() == undefined ) {
  customFelid.val(JSON.stringify(invObj))
  alert("اضغط زر عملية الدفع مرة أخرى")
  
  }
  $("#invoice-details-iframe")
          .contents()
          .find("#InvoiceForm > div.submit-wrap > button")
          .click()
  console.log("This is from invObj...", invObj, customFelid.val())
  // $("#inv-obj").val(JSON.stringify(invObj))
  
  }

  // Update Order Number
  function PUTorderNumber(orderNumberURL, apiKey, data){
console.log(data)
$.ajax({
    url: orderNumberURL, 
   method: "PUT",
    contentType: "application/json",
    accept: "application/json",
    headers: {apikey: apiKey},
    data: JSON.stringify(data)
}).done(()=>console.log("new numbers after posting the new inv items")).fail(err=>console.log(err))
}

  // onCheckout
function onCheckout(payBtn){

  payBtn.click(function(e){
    e.preventDefault()
    // Passing Inv. Data to Custom Field
    const invNumberInterval = setInterval(() => {
    if(!invID){
    console.log("inv is null")
    }else{
    clearInterval(invNumberInterval)
    console.log("InvID: ", invID, "on.", orderNumber)
    let itemsNoData = {
        "id": 1,
        "curr_no": parseInt(orderNumber)+1,
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

// Register Event Listeners
function EventListeners(){
  // Listen to Invoice Submission
  window.addEventListener("message", (event)=>{
    if(event.data) invID = event.data.event_data.invoice_id
      },false)
    

      
  // Listen to Adding New Extra
  $(".orders-list, #pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td").click(function(e){
    const $this = $(e.target)
// console.log($this)
    if($this.hasClass("extra-btn") || $this.hasClass("fa-plus")){
      // console.log("yes item Extra gooo...")
          // logic goes here....
          extraLogic()
          currentItem = accessCurrentItem($this)
    }
    if($this.tagName == "IMG" ||$this.hasClass("product-name")){
      setTimeout(()=>{
        // console.log("yes prod to g yaaaaaaa..")

         
        },200)
    }
  })

}

// onReset or onHome
function onHomeOrReset(){
  const homeBtn =  $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(1)")
  const clearBtn =  $("#pos-wrapper > div.pos-content > app-invoice > div > div.products-sheet > div > div > div > div > a.user-action.del-order.btn.btn-danger")
  // onHome clicking home btn
  homeBtn.click(()=>{
    $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > div > span.product").click(()=>{
      addCategoryName()

    })
  })
  // onReset reseting the current invoice
  clearBtn.click(()=>{
    // homeBtn.trigger("click")
    setTimeout(()=>{
    console.log("cleared")
    $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > div > span.product").click(()=>{
 
addCategoryName()
      })
    },400)
     })

}

function goToExtras(){
  //click home button
  $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-top > td > div > app-breadcrumb > ol > li:nth-child(1)").click()
  const extraInterval = setInterval(()=>{
    const extraCard = $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > div").find(`span.product[data-category= '${extrasCategoryId}']`)
    if(extraCard){
    extraCard.click()
    clearInterval(extraInterval)
  }
  setTimeout(()=>{
 
    $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > app-products > div > span:nth-child(4)").click(()=>{$(".notes-container").toggleClass("toggle-input")})
    addCategoryName()

    $("#pos-wrapper > div.pos-content > div > table > tbody > tr.table-cont > td > app-categories > app-products > div > span.product-pic").one("click", function(e){
      const $this = $(this)
      addNewExtra($this)
    notesHandling()

    })
  
  },200)

  },200)
}
  
// All About Extras
function extraLogic(){
  goToExtras()
    // removeExtra()
}



function addNewExtra($this){
  $this.click(function(){
    console.log("extra clicked")
  const selectedExtraPrice = $this.find("app-product > div.Product-meta > span.price-tag").text()
  const selectedExtraID = $this.data("product")
  const selectedExtraName = $this.find("app-product > div.product-name> p").text().trim()
  // Add Data Attrs to Current Item
  const oldExtras = currentItem.attr("data-extras") && JSON.parse(currentItem.attr("data-extras"))
  console.log("old extras:", oldExtras)
  const newExtras = oldExtras ? [...oldExtras, {name: selectedExtraName, id: selectedExtraID, qty: 1, price: selectedExtraPrice}] : [{name: selectedExtraName, id: selectedExtraID, qty: 1, price: selectedExtraPrice}]
  console.log("new extras:", newExtras)
  currentItem.attr("data-extras", JSON.stringify(newExtras))
  

  extrasQtyCalc(newExtras)
   
  })

}


// function extrasQtyCalc(newExtras){


//   // Extras Calcs
//   const uniqueExtras = [...new Set(newExtras.map(extra => extra.name))];
//   const allExtras = {}
//   uniqueExtras.map((ex,_)=> {
//     allExtras[ex] = newExtras.filter((extra,_)=> extra.name == ex).length
//   })
// currentItem.attr("data-allextras", JSON.stringify(allExtras))
// // DOM manipulation 
// // Add Extra Chip to Current Item
// currentItem.find("ul > li:not(.meta-info)").remove() 
// currentItem.find(".meta-list").append("<li></li>")
// Object.entries(allExtras).map((ex)=>{
//   const newChip = `<div class="extra-chip" data-name="${ex[0]}" data-qty="${ex[1]}">
//     <b><span class="extra-chip-content">${ex[0]}</span></b>
//     <b><span class="extra-chip-qty">${ex[1]}</span></b>
//     <span class="extra-chip-close-btn">&times;</span>
//   </div>`
  
//   currentItem.find(".meta-list > li:last-child").append(newChip)
//   extraRemove()
//   extraDecrease()
// })

// }


// function extraDecrease(){

//   $(".extra-chip").click(function(e){
//     e.stopPropagation()
//     const extraChip = $(e.target)
//     const $thisChipName = extraChip.attr("data-name")

//     // const thisExtraQty = extraChip.attr("data-qty")
//     // const newExtraQty = thisExtraQty-1
//     // extraChip.closest(".extra-chip").attr("data-qty", newExtraQty)

//     const currentExtras = currentItem.attr("data-extras") && JSON.parse(currentItem.attr("data-extras"))
//     const a = currentExtras.filter((ex,_)=>ex.name != $thisChipName)
//     const b = currentExtras.filter((ex,_)=>ex.name == $thisChipName).slice(0,-1)
//     const filteredExtras = [...a, ...b]
//     console.log(a, b, filteredExtras)
//     currentItem.attr("data-extras", JSON.stringify(filteredExtras))
//     extrasQtyCalc(filteredExtras)
//   })


// }

// function extraRemove(){

//   $(".extra-chip-close-btn").click(function(e){
//     const closeBtn = $(e.target)
//     const $thisChipName = closeBtn.closest(".extra-chip").attr("data-name")
//     closeBtn.closest(".extra-chip").remove()
//     const currentExtras = currentItem.attr("data-extras") && JSON.parse(currentItem.attr("data-extras"))
//     const filteredExtras = currentExtras.filter((ex,_)=>ex.name != $thisChipName)
//     currentItem.attr("data-extras", JSON.stringify(filteredExtras))
//     extrasQtyCalc(filteredExtras)
//   })

// }

// function removeExtra(){
// $(".extra-chip-close-btn").click(function(e){
//   const $thisExtra = e.target
//   const $thisExtraQty = $thisExtra.data("qty")
//   const $thisExtraName = $thisExtra.data("name")
//   if($thisExtraQty > 0)$thisExtra.closest(".extra-chip").remove()
//   if($thisExtraQty > 0){
//     const newQty = +$thisExtraQty--
//     $thisExtra.closest(".extra-chip-qty").text(newQty)
//     $thisExtra.attr("data-qty", $thisExtraQty--)

//     // Update the allextra data attr on the Current Item
//     const oldExtras = JSON.parse(currentItem.data("extras"))
//     const $thisSimilars = oldExtras.filter((x,_)=>x["name"] == $thisExtraName)
//     currentItem.attr("data-extras", JSON.stringify([...oldExtras.filter((x,_)=>x["name"] != $thisExtraName), ...$thisSimilars.pop()]))

//     // Update the allextra data attr on the Current Item
//     const oldAllExtras = JSON.parse(currentItem.data("allextras"))
//     currentItem.attr("data-allextras", JSON.stringify({...oldAllExtras, $thisExtraName: newQty}))

//   }

// }) 

// }

const newBtnsForTables = `
<div style="padding:20px" class="new-section">
<button class="btn btn-success" style="width:-webkit-fill-available;height:69px;">أرسل إلى المطبخ</button>
</div>
`


  function tabsAsTables() {
      let tabsNav = $("#pos-wrapper > div.pos-content > app-topbar > div.orders-tabs-wrapper > ul")
      tabsNav.mousedown(e=>{
          const $this = $(e.target)
          console.log($this, e)
          if($this.closest("li").hasClass("action-tabs")){
            }
            // else if($this.closest("li").hasClass("active") && e.which === 3){
            //     console.log("guck npow")
              
                
            //   }
              else if($this.closest("li").hasClass("active")){
            const thisTable = $this.closest("li").find("a > p")
            const thisTableLabel = thisTable.text()
            console.log(thisTableLabel)
            $(".change-table").show()
    
            $(".change-table").one("submit", e=>{
                const $thisForm = $(e.target)
                e.preventDefault()
                $thisForm.hide()
                const newName = $thisForm.find("input").val()
                console.log(thisTable)
                $(thisTable).text(newName)
                $thisForm.find("input").val("")
            })
          }   
         
          
    })

  }


// onLoad DOM
let domInterval = setInterval(()=>{
  payBtn = $("#paymentSubmitBtn")
  
  if(payBtn){
  const checkoutBtn = $(".pay")

    // $(".pay.btn-success").click(()=>invoiceObj())
    clearInterval(domInterval)
    // If user resets POS or goes HOME
    onHomeOrReset()
    //calling functions
    GETusersPerService(servicesUsersURL, apiKey)
    prepPOS()
    onCheckout(payBtn)
    checkoutBtn.click(()=>{
      const allData = invoiceDataCollector()
      console.log(allData)
    })
    // EventListeners()
    // FetchExtrasIDs(extrasURL, apiKey)
    // GETorderNumber(orderNumberURL, apiKey)
    // CreateNotesField()
$("#paymentModal > div.modal-dialog.modal-lg > div > div > div > div.col-sm-5.flex-col.border-left.d-flex.flex-column > div > div.order-details").append(newBtnsForTables)
tabsAsTables()

  }
  
  },1000)
  
