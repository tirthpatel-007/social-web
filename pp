const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('http');

const app = express();
const port = 5455;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup HTTP server and WebSocket server
const server = Server(app);

// Routes

const addUser = require('./Routes/BackendFunc/Login&SignUp/AddUser');
const updateUser = require('./Routes/BackendFunc/Login&SignUp/EditUser');
const getUser = require('./Routes/BackendFunc/Login&SignUp/GetUser');
const loginuser = require('./Routes/BackendFunc/Login&SignUp/UserLogin');
const adminlogin = require('./Routes/BackendFunc/Login&SignUp/AdminLogin');

const addDistributor = require('./Routes/BackendFunc/DistributorMaster/AddDistributor');
const updateDistributor = require('./Routes/BackendFunc/DistributorMaster/EditDistributor');
const getDistributor = require('./Routes/BackendFunc/DistributorMaster/GetDistributor');

const addVendor = require('./Routes/BackendFunc/VendorMaster/AddVendor');
const updateVendor = require('./Routes/BackendFunc/VendorMaster/EditVendor');
const getVendor = require('./Routes/BackendFunc/VendorMaster/GetVendor');

const addProduct = require('./Routes/BackendFunc/ProductMaster/AddProduct');
const getProduct = require('./Routes/BackendFunc/ProductMaster/GetProduct');
const updateProduct = require('./Routes/BackendFunc/ProductMaster/EditProduct');

const addArea = require('./Routes/BackendFunc/AreaMaster/AddArea');
const updateArea = require('./Routes/BackendFunc/AreaMaster/UpdateArea');
const getArea = require('./Routes/BackendFunc/AreaMaster/GetArea');

const getState = require('./Routes/BackendFunc/AreaMaster/GetState');
const getCity = require('./Routes/BackendFunc/AreaMaster/GetCity');
const addFlat = require('./Routes/BackendFunc/FlatMaster/AddFlat');
const getFlat = require('./Routes/BackendFunc/FlatMaster/GetFlat');
const updateFlat = require('./Routes/BackendFunc/FlatMaster/UpdateFlat');

const getCustomers = require('./Routes/BackendFunc/CustomerMaster/GetCustomer');
const addCustomers = require('./Routes/BackendFunc/CustomerMaster/AddCustomers');
const updateCustomers = require('./Routes/BackendFunc/CustomerMaster/UpdateCustomer');

//invoices
const addPurchaseInvoices = require('./Routes/BackendFunc/Inventory/Purchase/AddPurchaseInvoice');
const updatePurchaseInvoices = require('./Routes/BackendFunc/Inventory/Purchase/EditPurchaseInvoice');
const getPurchaseInvoices = require('./Routes/BackendFunc/Inventory/Purchase/GetPurchaseInvoice');
const addSalesInvoices = require('./Routes/BackendFunc/Inventory/Sales/AddSalesInvoice');
const updateSalesInvoices = require('./Routes/BackendFunc/Inventory/Sales/EditSaleInvoice');
const getSalesInvoices = require('./Routes/BackendFunc/Inventory/Sales/GetSalesInvoice');
const addPayment = require('./Routes/BackendFunc/Inventory/Payment/AddPayment');
const getStockInOut = require('./Routes/BackendFunc/Inventory/GetItemStock');
const addStockAllot = require('./Routes/BackendFunc/StockAllotment/AddStockAllot');
const updateStockAllot = require('./Routes/BackendFunc/StockAllotment/EditStockAllot');
const getStockAllot = require('./Routes/BackendFunc/StockAllotment/GetStockAllot');

//SQFT Routes
const addProperty = require('./Routes/SQFT_BackEnd/addPropInfo');

app.use('/add', addArea, addFlat, addCustomers, addUser, addDistributor, addVendor, addProduct);
app.use('/add', addProperty);
app.use('/invoice', getStockAllot, updateStockAllot, addStockAllot, addPurchaseInvoices, addPayment, addSalesInvoices, getStockInOut, updatePurchaseInvoices, updateSalesInvoices, getPurchaseInvoices, getSalesInvoices);
app.use('/login&signup', loginuser, adminlogin);
app.use('/update', updateArea, updateFlat, updateCustomers, updateUser, updateDistributor, updateVendor, updateProduct);
app.use('/get', getArea, getFlat, getCustomers, getState, getCity, getUser, getDistributor, getVendor, getProduct);

server.listen(port, () => {
    console.log(server running on port ${port});
});
index.js file