export enum Power {
  LOGICAL = 'LOGICAL',      // reglas, validaciones
  EXECUTIVE = 'EXECUTIVE',  // acciones (CRUD, jobs)
  OBSERVER = 'OBSERVER',    // lectura, auditoría
  HUMAN = 'HUMAN',          // override manual
}

export enum Role {
  CITIZEN = 'CITIZEN',
  CUSTODIAN = 'CUSTODIAN',
  SYSTEM = 'SYSTEM',
}

export const RolePowers: Record<Role, Power[]> = {
  [Role.CITIZEN]: [Power.EXECUTIVE],
  [Role.CUSTODIAN]: [Power.EXECUTIVE, Power.OBSERVER],
  [Role.SYSTEM]: [Power.LOGICAL, Power.OBSERVER],
};

export function hasRequiredPower(userPowers: Power[], required: Power): boolean {
  return userPowers.includes(required);
}
