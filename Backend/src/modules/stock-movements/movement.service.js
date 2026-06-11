import * as movementRepo from './movement.repository.js';

export async function getMovements(tenantId, filters) {
  return movementRepo.findMovements(tenantId, filters);
}

export async function getMovement(tenantId, id) {
  return movementRepo.findMovementById(tenantId, id);
}
