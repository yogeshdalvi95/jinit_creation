/**
 * * Public urls
 */
export const apiUrl = process.env.REACT_APP_SERVER_URL;
export const apiBackendUrl = `${apiUrl}`;
export const backend_login = `${apiUrl}/auth/local`;
export const backend_admins = `${apiUrl}/getAllAdmins`;
export const backend_staff = `${apiUrl}/getAllStaff`;
export const backend_departments = `${apiUrl}/departments`;
export const backend_purchases = `${apiUrl}/purchases`;
export const backend_check_seller_duplicate = `${apiUrl}/sellers/check_duplicate_seller`;
export const backend_units = `${apiUrl}/units`;

export const backend_sellers = `${apiUrl}/sellers`;
export const backend_sellers_for_autocomplete = `${apiUrl}/sellers/getSellerNameForAutoComplete`;

export const backend_raw_materials = `${apiUrl}/raw-materials`;
export const backend_raw_materials_for_autocomplete = `${apiUrl}/raw-materials/getRawMaterialNameForAutoComplete`;

export const backend_monthly_sheet = `${apiUrl}/monthly-sheets`;
export const backend_monthly_sheet_get_selected_data = `${apiUrl}/monthly-sheets/get_selected_data`;
export const backend_monthly_sheet_latest_entries = `${apiUrl}/monthly-sheets/get-latest-entries`;
export const backend_monthly_sheet_add_update_entries = `${apiUrl}/monthly-sheets/add-update-entries`;

export const backend_goods_return = `${apiUrl}/goods-returns`;

export const backend_individual_kachha_purchase = `${apiUrl}/individual-kachha-purchases`;

export const backend_ready_materials = `${apiUrl}/ready-materials`;

export const backend_raw_material_and_quantity_for_ready_material = `${apiUrl}/raw-material-and-quantity-for-ready-materials`;
export const backend_raw_material_and_quantity_for_ready_material_for_update_quantity = `${apiUrl}/raw-material-and-quantity-for-ready-materials/update_quantity`;
export const backend_raw_material_and_quantity_for_ready_material_for_add_raw_material = `${apiUrl}/raw-material-and-quantity-for-ready-materials/add-raw-material`;
export const backend_raw_material_and_quantity_for_ready_material_for_delete_raw_materials = `${apiUrl}/raw-material-and-quantity-for-ready-materials/delete-raw-material`;
