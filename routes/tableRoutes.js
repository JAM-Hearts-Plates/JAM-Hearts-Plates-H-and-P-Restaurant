// import { Router } from "express";
// import { getAllTables, getAvailableTables, releaseExpiredTables, releaseTable, reserveTable } from "../controllers/tableCon.js";
// import { isAuthenticated, isAuthorized } from "../middleware/auth.js";

// const tableRouter = Router();



// tableRouter.get('/tables/available',isAuthenticated, isAuthorized, getAvailableTables);


// tableRouter.get('/tables', isAuthenticated,isAuthorized, getAllTables);

// tableRouter.post('/tables/reserve', isAuthenticated, isAuthorized, reserveTable);

// tableRouter.put('/tables/:id/release', isAuthenticated, isAuthorized, releaseTable);

// tableRouter.post('/tables/release-expired', isAuthenticated,isAuthorized, releaseExpiredTables);

// export default tableRouter;