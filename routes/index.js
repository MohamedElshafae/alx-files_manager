import { Router } from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';
import authenticateUser from '../middelwares/authenticateUser';

const router = Router();

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);

router.get('/connect', AuthController.getConnect);
router.get(
  '/disconnect',
  authenticateUser,
  AuthController.getDisconnect,
);

router.post('/users', UsersController.postNew);
router.get(
  '/users/me',
  authenticateUser,
  UsersController.getMe,
);

router.post(
  '/files',
  authenticateUser,
  FilesController.postUpload,
);

export default router;
