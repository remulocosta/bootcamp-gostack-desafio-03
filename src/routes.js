import { Router } from 'express';
import multer from 'multer';

import CheckinController from './app/controllers/CheckinController';
import FileController from './app/controllers/FileController';
import HelpAnswerController from './app/controllers/HelpAnswerController';
import HelpOrderController from './app/controllers/HelpOrderController';
import PlanController from './app/controllers/PlanController';
import RegistrationController from './app/controllers/RegistrationController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import UserController from './app/controllers/UserController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

routes.get('/students/:id/checkin', CheckinController.index);
routes.post('/students/:id/checkin', CheckinController.store);

routes.use(authMiddleware);

routes.get('/students/:id/help-order', HelpOrderController.index);
routes.post('/students/:id/help-order', HelpOrderController.store);

routes.post('/users', UserController.store);
routes.put('/users', UserController.update);

routes.get('/students', StudentController.index);
routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

routes.get('/registrations', RegistrationController.index);
routes.post('/registrations', RegistrationController.store);
routes.put('/registrations/:id', RegistrationController.update);
routes.delete('/registrations/:id', RegistrationController.delete);

routes.get('/help-orders', HelpAnswerController.index);
routes.post('/help-orders/:id/answer', HelpAnswerController.store);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
