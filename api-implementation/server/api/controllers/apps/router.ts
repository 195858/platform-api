import express from 'express';
import controller from './controller';
export default express
  .Router()
  .get('/', controller.all)
  .get('/:name', controller.byName)
  .get('/:app/apis', controller.allApis)
  .get('/:app/apis/:name', controller.apiByName);