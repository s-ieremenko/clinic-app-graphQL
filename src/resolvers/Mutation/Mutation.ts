import { patientResolvers } from './patient';
import { doctorResolvers } from './doctor';
import { authResolvers } from './auth';
import { assigmentResolvers } from './assigment';

export const Mutation = {
  ...patientResolvers,
  ...doctorResolvers,
  ...authResolvers,
  ...assigmentResolvers

};