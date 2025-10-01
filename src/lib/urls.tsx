import { backendUrl } from "../components/Constants/Constants"


const requests = {
    LoginUser :`${backendUrl}/auth/login/`,
    FetchEmployees :`${backendUrl}/auth/employees/`,
    CreateEmployees :`${backendUrl}/auth/employees/create/`,
    UpdateEmployees :`${backendUrl}/auth/employees/`,
}
export default requests  