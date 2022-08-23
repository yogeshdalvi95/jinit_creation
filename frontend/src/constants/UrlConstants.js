/**
 * * Public urls
 * webapi
 */
export const apiUrl = process.env.REACT_APP_BACKEND_SERVER_URL;
export const frontendServerUrl = process.env.REACT_APP_SERVER_URL;
export const apiBackendUrl = `${apiUrl}/webapi/private`;
export const backend_login = `${apiUrl}/auth/local`;
export const backend_admins = `${apiBackendUrl}/getAllAdmins`;
export const backend_staff = `${apiBackendUrl}/getAllStaff`;
export const backend_departments = `${apiBackendUrl}/departments`;

export const backend_units = `${apiBackendUrl}/units`;

export const backend_parties = `${apiBackendUrl}/parties`;
export const backend_check_party_duplicate = `${apiBackendUrl}/parties/check_duplicate_party`;

export const backend_sellers = `${apiBackendUrl}/sellers`;
export const backend_sellers_for_autocomplete = `${apiBackendUrl}/sellers/getSellerNameForAutoComplete`;
export const backend_check_seller_duplicate = `${apiBackendUrl}/sellers/check_duplicate_seller`;

export const backend_category = `${apiBackendUrl}/categories`;

export const backend_color = `${apiBackendUrl}/colors`;

export const backend_raw_materials = `${apiBackendUrl}/raw-materials`;
export const backend_raw_materials_for_autocomplete = `${apiBackendUrl}/raw-materials/getRawMaterialNameForAutoComplete`;

export const backend_monthly_sheet = `${apiBackendUrl}/monthly-sheets`;
export const backend_monthly_sheet_add_update_entries = `${apiBackendUrl}/monthly-sheets/add-update-entries`;
export const backend_monthly_sheet_get_monthly_data = `${apiBackendUrl}/monthly-sheets/get-monthly-data`;
export const backend_monthly_sheet_download_monthly_data = `${apiBackendUrl}/monthly-sheet-download`;

export const backend_goods_return = `${apiBackendUrl}/goods-returns`;

export const backend_sales = `${apiBackendUrl}/sales`;
export const backend_sales_export_data = `${apiBackendUrl}/sales/export/downloadExcelData`;

export const backend_sale_return = `${apiBackendUrl}/sale-returns`;

export const backend_individual_kachha_purchase = `${apiBackendUrl}/individual-kachha-purchases`;

export const backend_designs = `${apiBackendUrl}/designs`;
export const backend_view_designs = `${apiBackendUrl}/view-design`;
export const backend_designs_for_parties = `${apiBackendUrl}/designs-for-parties`;
export const backend_duplicate_designs = `${apiBackendUrl}/designs/duplicate-design`;
export const backend_download_designs = `${apiBackendUrl}/designs/download`;

export const backend_designs_and_materials = `${apiBackendUrl}/designs-and-materials`;
export const backend_designs_and_materials_get_material_count = `${apiBackendUrl}/designs-and-materials/get-material-count`;

export const backend_ready_materials = `${apiBackendUrl}/ready-materials`;
export const backend_ready_materials_change_color_dependency = `${apiBackendUrl}/ready-materials/change_color_dependency`;

export const backend_raw_material_and_quantity_for_ready_material = `${apiBackendUrl}/raw-material-and-quantity-for-ready-materials`;
export const backend_raw_material_and_quantity_for_ready_material_for_update_quantity = `${apiBackendUrl}/raw-material-and-quantity-for-ready-materials/update_quantity`;
export const backend_raw_material_and_quantity_for_ready_material_for_add_raw_material = `${apiBackendUrl}/raw-material-and-quantity-for-ready-materials/add-raw-material`;
export const backend_raw_material_and_quantity_for_ready_material_for_delete_raw_materials = `${apiBackendUrl}/raw-material-and-quantity-for-ready-materials/delete-raw-material`;

export const backend_order = `${apiBackendUrl}/orders`;
export const backend_order_to_get_department_sheet = `${apiBackendUrl}/orders/department_sheet`;
export const backend_order_check_raw_material_availibility = `${apiBackendUrl}/orders/check_availibility`;
export const backend_order_check_raw_material_availibility_for_all_order = `${apiBackendUrl}/orders/check_all_order_availibility`;
export const backend_download_all_orders = `${apiBackendUrl}/orders/download-order`;
export const backend_download_orders_sheet = `${apiBackendUrl}/orders/download-order-sheet`;

export const backend_purchases = `${apiBackendUrl}/purchases`;
export const backend_purchase_ledger = `${apiBackendUrl}/purchases/ledger`;
export const backend_download_purchase_ledger = `${apiBackendUrl}/purchases/download-ledger`;

export const backend_purchase_payment = `${apiBackendUrl}/purchase-payments`;
