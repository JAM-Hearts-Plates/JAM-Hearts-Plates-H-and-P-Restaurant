import { Router } from "express";
import { getAllTables, getAvailableTables, releaseExpiredTables, releaseTable, reserveTable } from "../controllers/tableCon.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { userRoleCheck } from "../middlewares/roleCheck.js";

const tableRouter = Router();



tableRouter.get('/tables/available',isAuthenticated, userRoleCheck, getAvailableTables);


tableRouter.get('/tables', isAuthenticated,userRoleCheck, getAllTables);

tableRouter.post('/tables/reserve', isAuthenticated, userRoleCheck, reserveTable);

tableRouter.put('/tables/:id/release', isAuthenticated, userRoleCheck, releaseTable);

tableRouter.post('/tables/release-expired', isAuthenticated,userRoleCheck, releaseExpiredTables);

export default tableRouter;