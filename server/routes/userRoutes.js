import express from "express";
import { auth } from "../middlewares/auth.js";
import { getPublishedCreations, getUserCreations, toggleLikeCreation, getJobApplications, createJobApplication, updateJobApplication, deleteJobApplication } from "../controllers/userController.js";
import { validate, jobApplicationSchema } from "../validators/schemas.js";

const userRouter = express.Router();

userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations);
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation);

// Job Application Tracker CRUD
userRouter.get('/job-applications', auth, getJobApplications);
userRouter.post('/job-applications', auth, validate(jobApplicationSchema), createJobApplication);
userRouter.put('/job-applications/:id', auth, validate(jobApplicationSchema), updateJobApplication);
userRouter.delete('/job-applications/:id', auth, deleteJobApplication);

export default userRouter;