/**
 * * Public urls
 */
export const apiUrl = process.env.REACT_APP_SERVER_URL;
export const apiBackendUrl = `${apiUrl}`;
export const backend_raw_materials = `${apiUrl}/raw-materials`;
export const backend_ready_materials = `${apiUrl}/ready-materials`;
export const backend_login = `${apiUrl}/auth/local`;
export const backend_admins = `${apiUrl}/getAllAdmins`;
export const backend_staff = `${apiUrl}/getAllStaff`;
export const backend_sellers = `${apiUrl}/sellers`;
export const backend_departments = `${apiUrl}/departments`;
export const backend_purchases = `${apiUrl}/purchases`;
export const backend_units = `${apiUrl}/units`;
